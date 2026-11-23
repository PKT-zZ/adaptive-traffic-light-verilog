"""Validate provenance and independently recompute the CSV summary."""
import csv
import hashlib
import json
import re

BENCHES = ('tb_units', 'tb_controller', 'tb_top', 'tb_system')
REQUIRED_SOURCES = {
    'rtl/demand_level.v', 'rtl/green_policy.v', 'rtl/second_tick.v',
    'rtl/traffic_controller.v', 'rtl/traffic_top.v', 'sim/queue_model.v',
    'scripts/report.py', 'scripts/run.ps1', 'scripts/run_tests.py',
    'scripts/validate_results.py',
} | {f'sim/{bench}.sv' for bench in BENCHES}
REQUIRED_OUTPUTS = {'trace.csv', 'metrics.csv', 'controller.vcd', 'demo.vcd'} | {
    f'{bench}.log' for bench in BENCHES
}

# For the eight default scenarios recorded by tb_system. State order follows THIET_KE.md.
STATE_OUTPUTS = (
    (4, 4, 0), (1, 4, 0), (2, 4, 0), (4, 4, 0), (4, 1, 0),
    (4, 2, 0), (4, 4, 0), (4, 4, 1), (4, 4, 0),
)
TRACE_FIELDS = set('scenario adaptive second state queue_a queue_b lights_a lights_b '
                   'walk pending remaining arrivals_a arrivals_b'.split())
METRICS_FIELDS = set('scenario adaptive seconds arrived served final_queue queue_area_car_seconds '
                     'peak_total_queue max_red_wait_a max_red_wait_b walk_visits'.split())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def bench_counts(build):
    counts = {}
    for bench in BENCHES:
        log = (build / (bench + '.log')).read_text(encoding='utf-8-sig')
        matches = re.findall(rf'^PASS {bench} checks=(\d+)(?:[ \t]|$)', log, re.MULTILINE)
        if len(matches) != 1 or int(matches[0]) <= 0:
            raise ValueError('Invalid test log: ' + bench)
        if re.search(r'\b(?:FATAL|FAIL|WARNING)\b', log, re.IGNORECASE):
            raise ValueError('Test log contains a failure or warning: ' + bench)
        counts[bench] = int(matches[0])
    return counts


def records(build, name, fields):
    with (build / name).open(encoding='utf-8-sig', newline='') as stream:
        reader = csv.DictReader(stream)
        if not reader.fieldnames or len(reader.fieldnames) != len(fields) or set(reader.fieldnames) != fields:
            raise ValueError('Unexpected columns: ' + name)
        rows = []
        for row in reader:
            if None in row or None in row.values():
                raise ValueError(f'Wrong field count: {name} line {reader.line_num}')
            rows.append({key: int(value) for key, value in row.items()})
    return rows


def validate(root, build):
    manifest = json.loads((build / 'run.json').read_text(encoding='utf-8'))
    if manifest['status'] != 'passed':
        raise ValueError('Run is not complete')
    schema_version = manifest.get('schema_version', 1)
    if schema_version not in (1, 2):
        raise ValueError('Unsupported run manifest version')
    sources, outputs = manifest.get('sources'), manifest.get('outputs')
    source_names = {p.relative_to(root).as_posix() for folder in ('rtl', 'sim', 'scripts')
                    for p in (root / folder).iterdir() if p.is_file()}
    output_names = {p.name for p in build.iterdir() if p.is_file()
                    and (p.suffix in ('.csv', '.vcd', '.log') or p.name == 'KET_QUA.md')}
    required_outputs = REQUIRED_OUTPUTS | ({'KET_QUA.md'} if schema_version == 2 else set())
    if not isinstance(sources, dict) or not REQUIRED_SOURCES <= sources.keys() or sources.keys() != source_names:
        raise ValueError('Incomplete or inconsistent source inventory')
    if not isinstance(outputs, dict) or not required_outputs <= outputs.keys() or outputs.keys() != output_names:
        raise ValueError('Incomplete or inconsistent output inventory')
    for name, expected in sources.items():
        if digest(root / name) != expected:
            raise ValueError('Source changed: ' + name)
    for name, expected in outputs.items():
        if not (build / name).stat().st_size or digest(build / name) != expected:
            raise ValueError('Output changed: ' + name)
    bench_counts(build)
    trace = records(build, 'trace.csv', TRACE_FIELDS)
    metrics = records(build, 'metrics.csv', METRICS_FIELDS)
    if len(trace) != 4800 or len(metrics) != 8:
        raise ValueError('Incomplete CSV data')
    keys = {(r['scenario'], r['adaptive']) for r in metrics}
    if keys != {(s, m) for s in range(4) for m in range(2)}:
        raise ValueError('Missing or duplicate scenarios')
    pairs = {}
    for summary in metrics:
        key = summary['scenario'], summary['adaptive']
        rows = [r for r in trace if (r['scenario'], r['adaptive']) == key]
        if [r['second'] for r in rows] != list(range(600)):
            raise ValueError('Invalid timeline')
        totals = [r['queue_a'] + r['queue_b'] for r in rows]
        arrivals = sum(r['arrivals_a'] + r['arrivals_b'] for r in rows)
        waits, maxima = [0, 0], [0, 0]
        walks, old_state, elapsed = 0, 0, 0
        old_queues = [0, 0]
        limits = (1, 20 if key[1] else 12, 3, 1, 20 if key[1] else 12, 3, 1, 6, 1)
        for r in rows:
            state = r['state']
            where = f'{key} second={r["second"]}'
            if not 0 <= state < len(STATE_OUTPUTS):
                raise ValueError('Invalid state: ' + where)
            if (r['lights_a'], r['lights_b'], r['walk']) != STATE_OUTPUTS[state]:
                raise ValueError('Invalid lamp/walk outputs: ' + where)
            elapsed = elapsed + 1 if state == old_state else 0
            remaining = limits[state] - elapsed
            if remaining <= 0 or r['remaining'] != remaining or r['pending'] not in (0, 1):
                raise ValueError('Invalid remaining/pending: ' + where)
            for i, side in enumerate(('a', 'b')):
                queued, arriving = r['queue_' + side], r['arrivals_' + side]
                if not 0 <= queued <= 255 or not 0 <= arriving <= 15:
                    raise ValueError(f'Invalid queue/arrivals {side}: {where}')
                if old_queues[i] + arriving - queued not in (0, 1):
                    raise ValueError(f'Invalid queue change {side}: {where}')
                old_queues[i] = queued
                waits[i] = waits[i] + 1 if queued > 0 and r['lights_' + side] != 1 else 0
                maxima[i] = max(maxima[i], waits[i])
            walks += int(state == 7 and old_state != 7)
            old_state = state
        if walks != 3:
            raise ValueError(f'Expected three pedestrian services: {key}')
        expected = dict(seconds=600, arrived=arrivals, served=arrivals-totals[-1],
                        final_queue=totals[-1], queue_area_car_seconds=sum(totals),
                        peak_total_queue=max(totals), max_red_wait_a=maxima[0],
                        max_red_wait_b=maxima[1], walk_visits=walks)
        for name, value in expected.items():
            if summary[name] != value:
                raise ValueError(f'Metrics mismatch {key}: {name}')
        pairs[key] = [(r['arrivals_a'], r['arrivals_b']) for r in rows]
    for scenario in range(4):
        if pairs[scenario, 0] != pairs[scenario, 1]:
            raise ValueError('Modes received different arrivals')
    return manifest
