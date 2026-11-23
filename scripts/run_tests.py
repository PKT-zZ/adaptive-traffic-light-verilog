"""Run a source snapshot and publish a complete, validated build."""
from contextlib import contextmanager
import datetime
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import uuid

from report import render_report
from validate_results import digest, validate

BENCHES = ('tb_units', 'tb_controller', 'tb_top', 'tb_system')
COMMAND_TIMEOUT_SECONDS = 60


@contextmanager
def run_lock(path):
    # Keep the lock file in place. The OS releases the lock when the process exits.
    with path.open('a+b') as lock:
        try:
            if os.name == 'nt':
                import msvcrt
                lock.seek(0)
                msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as exc:
            raise RuntimeError(f'Cannot lock {path}; check whether another run is active') from exc
        yield


def run_command(args, cwd, log, *, show_output=True):
    with log.open('wb') as output:
        try:
            result = subprocess.run(args, cwd=cwd, stdout=output,
                                    stderr=subprocess.STDOUT, timeout=COMMAND_TIMEOUT_SECONDS)
        except subprocess.TimeoutExpired as exc:
            raise RuntimeError(f'Timed out after {COMMAND_TIMEOUT_SECONDS}s; see {log}') from exc
    content = log.read_text(encoding='utf-8', errors='replace')
    if content and (show_output or result.returncode):
        print(content, end='' if content.endswith('\n') else '\n')
    if result.returncode:
        raise RuntimeError(f'Command failed (exit {result.returncode}); see {log}')
    return content


def publish(stage, published, recovery):
    # The old build is always preserved at a known path during the rename window.
    try:
        if published.exists():
            published.rename(recovery)
        stage.rename(published)
    except BaseException:
        if not published.exists() and recovery.exists():
            try:
                recovery.rename(published)
            except OSError as exc:
                raise RuntimeError(f'Could not restore build; previous results are at {recovery}') from exc
        raise


def run_tests(root, runs):
    published = root / 'build'
    recovery = runs / '.previous-build'
    if not published.exists() and recovery.exists():
        recovery.rename(published)
        print('Recovered the previous published build.')

    run_id = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '-' + uuid.uuid4().hex[:8]
    run = runs / run_id
    build = run / 'build'
    build.mkdir(parents=True)
    manifest = dict(schema_version=2, run_id=run_id, status='running', sources={})

    def save_manifest():
        (build / 'run.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')

    try:
        for folder in ('rtl', 'sim', 'scripts'):
            for source in sorted((root / folder).iterdir()):
                if source.is_file():
                    name = source.relative_to(root).as_posix()
                    target = run / name
                    target.parent.mkdir(exist_ok=True)
                    shutil.copy2(source, target)
                    manifest['sources'][name] = digest(target)

        tools = {name: shutil.which(name) for name in ('iverilog', 'vvp')}
        if not all(tools.values()):
            raise RuntimeError('Install Icarus Verilog and add iverilog/vvp to PATH')
        manifest['tools'] = tools
        manifest['compiler_version'] = run_command([tools['iverilog'], '-V'], run,
                                                  run / 'iverilog-version.log', show_output=False)
        save_manifest()

        rtl = [str(p.relative_to(run)) for p in sorted((run / 'rtl').glob('*.v'))] + ['sim/queue_model.v']
        for bench in BENCHES:
            run_command([tools['iverilog'], '-g2012', '-Wall', '-s', bench, '-o',
                         f'build/{bench}.vvp', *rtl, f'sim/{bench}.sv'], run, run / f'{bench}.compile.log')
            run_command([tools['vvp'], f'build/{bench}.vvp'], run, build / f'{bench}.log')

        markdown, total = render_report(build, run_id)
        (build / 'KET_QUA.md').write_text(markdown, encoding='utf-8')
        manifest['status'] = 'passed'
        manifest['outputs'] = {p.name: digest(p) for p in sorted(build.iterdir())
                               if p.suffix in ('.csv', '.vcd', '.log', '.md')}
        save_manifest()

        # Stage a complete, portable build before touching the published directory.
        stage = run / 'publish'
        shutil.copytree(build, stage, ignore=shutil.ignore_patterns('*.vvp'))
        validate(root, stage)
        if recovery.exists():
            recovery.rename(run / 'older_build')
        publish(stage, published, recovery)
    except BaseException:
        manifest['status'] = 'failed'
        try:
            save_manifest()
        except OSError as exc:
            print(f'Could not record failed run at {build}: {exc}', file=sys.stderr)
        raise
    print('Validated run published: ' + run_id)
    print(f'Report written; {total} successful check evaluations')


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    runs = root / 'runs'
    runs.mkdir(exist_ok=True)
    with run_lock(runs / '.run.lock'):
        run_tests(root, runs)
