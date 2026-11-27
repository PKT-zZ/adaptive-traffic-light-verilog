/* Exercise the JavaScript trainer and replay the same inputs through the real traffic_top RTL. */
'use strict';

const assert = require('node:assert/strict');
const { copyFileSync, mkdtempSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const model = require('./model.js');

const cyclesPerTick = 4;
const vectors = [];
let inputs = { rst: 0, mode: 0, ped: 0, qa: 0, qb: 0 };
let checks = 0;

function clocks(count, change = {}, expectation = null) {
  inputs = { ...inputs, ...change };
  for (let i = 1; i <= count; i += 1) {
    vectors.push({
      input: inputs,
      expectation: i === count ? expectation : null
    });
  }
}

function expect(label, after, before = {}) {
  return { label, after, before };
}

function reset(change = {}, expectation = null) {
  clocks(1, { rst: 1, mode: 0, ped: 0, qa: 0, qb: 0, ...change }, expectation);
}

// Fixed durations and the pre/post distinction for the clock enable.
reset({}, expect('synchronous reset', { state: 'BOOT', counter: 0, modeActive: 0, pending: 0 }));
clocks(3, { rst: 0, qa: 0, qb: 200, mode: 1 },
  expect('divider before fourth clock', { state: 'BOOT', counter: 3, tick: 1, modeActive: 0 }, { tick: 0 }));
clocks(1, {}, expect('divider fourth clock', { state: 'A_GREEN', tick: 0, elapsed: 0, remaining: 12 }, { tick: 1 }));
clocks(47, {}, expect('fixed A last interval', { state: 'A_GREEN', elapsed: 11, remaining: 1 }));
clocks(1, {}, expect('fixed A ends after 12 ticks', { state: 'A_YELLOW', remaining: 3 }));
clocks(11, {}, expect('yellow A last interval', { state: 'A_YELLOW', elapsed: 2 }));
clocks(1, {}, expect('yellow A ends after 3 ticks', { state: 'AFTER_A', lightsA: 4, lightsB: 4 }));
clocks(4, {}, expect('red after A lasts one tick', { state: 'B_GREEN', lightsB: 1 }));
clocks(48, {}, expect('fixed B ends after 12 ticks', { state: 'B_YELLOW' }));
clocks(12, {}, expect('yellow B ends after 3 ticks', { state: 'AFTER_B' }));
clocks(4, {}, expect('fixed cycle resumes A', { state: 'A_GREEN' }));

// Adaptive decisions use old elapsed, directional queues and a strict inequality.
reset({ mode: 1 });
clocks(4, { rst: 0, qa: 0, qb: 10 });
clocks(20, {}, expect('adaptive never ends on fifth tick', { state: 'A_GREEN', elapsed: 5, remaining: 15 }));
clocks(4, { qa: 7, qb: 7 }, expect('equal queues keep green', { state: 'A_GREEN', elapsed: 6 }));
clocks(4, { qa: 2, qb: 7 }, expect('opposing demand ends green', { state: 'A_YELLOW', elapsed: 0 }));
clocks(16, {}, expect('B enters green', { state: 'B_GREEN' }));
clocks(24, { qa: 9, qb: 2 }, expect('B uses A as its opposing queue', { state: 'B_YELLOW' }, { elapsed: 5 }));
reset({ mode: 1 });
clocks(4, { rst: 0, qa: 255, qb: 0 });
clocks(79, {}, expect('adaptive max neither early nor skipped', { state: 'A_GREEN', elapsed: 19 }));
clocks(1, {}, expect('adaptive max ends on twentieth tick', { state: 'A_YELLOW' }));

// A new press at the A boundary is accepted. A press at WALK exit is ignored.
reset();
clocks(67, { rst: 0 }, expect('last clock before AFTER_A exit', { state: 'AFTER_A', tick: 1, pending: 0 }));
clocks(1, { ped: 1 },
  expect('boundary A immediate service', { state: 'PED_WALK', walk: 1, resumeB: 1, pending: 0 }, { request: 1 }));
clocks(8, {}, expect('held button during WALK', { state: 'PED_WALK', elapsed: 2, pending: 0 }, { request: 0 }));
clocks(15, { ped: 0 });
clocks(1, { ped: 1 },
  expect('press at WALK exit ignored', { state: 'PED_CLEAR', walk: 0, pending: 0 }, { request: 1 }));
clocks(3, { ped: 0 });
clocks(1, { ped: 1 },
  expect('press at CLEAR exit saved', { state: 'B_GREEN', pending: 1 }, { request: 1 }));
clocks(64, {}, expect('CLEAR press served after B', { state: 'PED_WALK', resumeB: 0, pending: 0 }));
clocks(28, {}, expect('resume A after B', { state: 'A_GREEN', pending: 0, walk: 0 }));
clocks(64, {}, expect('held button does not repeat', { state: 'B_GREEN', pending: 0 }));

// Same-edge guard must work on B too, without a pending request from earlier.
reset();
clocks(131, { rst: 0 }, expect('last clock before AFTER_B exit', { state: 'AFTER_B', tick: 1, pending: 0 }));
clocks(1, { ped: 1 }, expect('boundary B immediate service', { state: 'PED_WALK', walk: 1, resumeB: 0, pending: 0 }));
clocks(28, {}, expect('B boundary returns to A', { state: 'A_GREEN', walk: 0, pending: 0 }));

// Reset samples mode at every active edge. A held button through reset becomes a new request.
reset({ ped: 1 }, expect('first reset edge samples fixed', { modeActive: 0, pending: 0, buttonPrev: 0 }));
clocks(1, { mode: 1 }, expect('second reset edge samples adaptive', { modeActive: 1, pending: 0, buttonPrev: 0 }));
clocks(1, { rst: 0, mode: 0, qa: 0, qb: 10 },
  expect('held button captured in BOOT without tick', { state: 'BOOT', modeActive: 1, pending: 1 }, { tick: 0, request: 1 }));
clocks(3, { ped: 0 }, expect('BOOT still exits into A', { state: 'A_GREEN', pending: 1 }));
clocks(40, {}, expect('BOOT press served after first A', { state: 'PED_WALK', resumeB: 1 }));

// A one-clock pulse after reset and between ticks, without a held button.
reset();
clocks(1, { rst: 0, ped: 1 }, expect('one-clock pulse between ticks', { state: 'BOOT', pending: 1 }));
clocks(1, { ped: 0 }, expect('short pulse retained once low', { buttonPrev: 0, pending: 1 }));

const stateCodes = ['BOOT', 'A_GREEN', 'A_YELLOW', 'AFTER_A', 'B_GREEN', 'B_YELLOW', 'AFTER_B', 'PED_WALK', 'PED_CLEAR'];
assert.deepEqual(model.states, stateCodes);
const phaseEntries = [0, 4, 52, 64, 68, 116, 128, 68, 92];
for (const [index, state] of stateCodes.entries()) {
  reset();
  if (phaseEntries[index]) {
    clocks(phaseEntries[index], { rst: 0, ped: Number(index >= 7) }, expect(`enter ${state}`, { state }));
  }
  reset({ mode: 1, ped: 1 },
    expect(`reset from ${state}`, { state: 'BOOT', elapsed: 0, modeActive: 1, tick: 0, pending: 0,
      buttonPrev: 0, resumeB: 0, walk: 0, lightsA: 4, lightsB: 4 }, { state }));
}

const signalColumns = [
  ['counter', 'top.clock_divider.counter'],
  ['state', 'state'],
  ['nextState', 'top.controller.next_state'],
  ['elapsed', 'elapsed'],
  ['modeActive', 'active'],
  ['pending', 'pending'],
  ['buttonPrev', 'top.controller.button_prev'],
  ['resumeB', 'top.controller.resume_b'],
  ['tick', 'top.tick'],
  ['request', 'top.controller.new_request'],
  ['remaining', 'remaining'],
  ['lightsA', 'la'],
  ['lightsB', 'lb'],
  ['walk', 'walk']
];

function values(view) {
  return signalColumns.map(([key]) => key === 'state' || key === 'nextState'
    ? stateCodes.indexOf(view[key])
    : view[key]);
}

let modelState = model.create(cyclesPerTick);
const expectedSamples = new Map();
for (const [index, { input, expectation }] of vectors.entries()) {
  const snapshot = model.step(modelState, input);
  modelState = snapshot.reg;
  if (expectation) {
    for (const side of ['before', 'after']) {
      for (const [key, value] of Object.entries(expectation[side])) {
        assert.equal(snapshot[side][key], value, `${expectation.label}, edge ${index} ${side} ${key}`);
        checks += 1;
      }
    }
  }
  // The first pre-edge RTL sample is uninitialized and is outside the trainer's reset start.
  if (index > 0) expectedSamples.set(`${index},0`, values(snapshot.before));
  expectedSamples.set(`${index},1`, values(snapshot.after));
}
console.log(`PASS JavaScript: ${checks} explicit expectation checks across ${vectors.length} rising edges.`);

if (process.argv.includes('--js-only')) {
  console.log('NOT RUN RTL cross-check (--js-only).');
  process.exit(0);
}

function run(command, args, cwd) {
  const processResult = spawnSync(command, args, { cwd, encoding: 'utf8', windowsHide: true, timeout: 60_000 });
  if (processResult.error) throw processResult.error;
  if (processResult.status !== 0) {
    throw new Error(`${command} exited with ${processResult.status}\n${processResult.stdout}\n${processResult.stderr}`);
  }
  return processResult.stdout;
}

function bench() {
  const formatting = ['EDGE', '%0d', '%0d', ...signalColumns.map(() => '%0d')].join(',');
  const signals = signalColumns.map(([, signal]) => signal).join(', ');
  const calls = vectors.map(({ input }, index) =>
    `    advance(${index}, ${input.rst}, ${input.mode}, ${input.ped}, ${input.qa}, ${input.qb});`
  ).join('\n');
  return `\`timescale 1ns/1ps
module tb_web_model;
  reg clk=0, rst=1, mode=0, ped=0;
  reg [7:0] qa=0, qb=0;
  wire [2:0] la, lb;
  wire walk, active, pending;
  wire [3:0] state;
  wire [15:0] elapsed, remaining;
  traffic_top #(${cyclesPerTick}) top(clk,rst,mode,ped,qa,qb,la,lb,walk,active,pending,state,elapsed,remaining);
  task advance(input integer edge_index, input bit r, m, p, input [7:0] a, b);
    begin
      rst=r; mode=m; ped=p; qa=a; qb=b;
      #1;
      if (edge_index>0) $display("${formatting}", edge_index, 0, ${signals});
      #1; clk=1;
      #1; $display("${formatting}", edge_index, 1, ${signals});
      #1; clk=0;
    end
  endtask
  initial begin
${calls}
    $finish;
  end
endmodule
`;
}

const temporary = mkdtempSync(path.join(tmpdir(), 'ktmt-rtl-model-'));
try {
  const rtlFiles = ['green_policy.v', 'second_tick.v', 'traffic_controller.v', 'traffic_top.v'];
  for (const filename of rtlFiles) {
    copyFileSync(path.join(__dirname, '..', 'rtl', filename), path.join(temporary, filename));
  }
  writeFileSync(path.join(temporary, 'tb_web_model.sv'), bench());
  run('iverilog', ['-g2012', '-Wall', '-s', 'tb_web_model', '-o', 'tb_web_model.vvp', ...rtlFiles, 'tb_web_model.sv'], temporary);
  const rtlOutput = run('vvp', ['tb_web_model.vvp'], temporary);
  let rtlChecks = 0;
  for (const line of rtlOutput.split(/\r?\n/).filter((item) => item.startsWith('EDGE,'))) {
    const [, index, side, ...signals] = line.split(',');
    const key = `${index},${side}`;
    const expected = expectedSamples.get(key);
    assert.ok(expected, `Unexpected or duplicate RTL sample ${key}`);
    assert.equal(signals.length, expected.length, `Signal count at RTL sample ${key}`);
    for (const [column, reading] of signals.entries()) {
      assert.equal(Number(reading), expected[column],
        `RTL sample ${key} (${side === '0' ? 'before' : 'after'}), ${signalColumns[column][0]}`);
      rtlChecks += 1;
    }
    expectedSamples.delete(key);
  }
  assert.equal(expectedSamples.size, 0, 'Every expected sample appeared in the RTL output.');
  console.log(`PASS JS ↔ Icarus RTL: ${rtlChecks} signal comparisons across ${vectors.length * 2 - 1} pre/post samples, ${cyclesPerTick} clocks/tick.`);
} catch (error) {
  if (error.code !== 'ENOENT' || !['spawnSync iverilog', 'spawnSync vvp'].includes(error.syscall)) throw error;
  console.log(`NOT RUN RTL cross-check: ${error.path} not found on PATH.`);
} finally {
  for (const filename of readdirSync(temporary)) unlinkSync(path.join(temporary, filename));
  rmdirSync(temporary);
}
