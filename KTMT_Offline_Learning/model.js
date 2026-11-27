/* Mô hình JavaScript, đối chiếu trực tiếp rtl/second_tick.v và rtl/traffic_controller.v. */
(() => {
  const states = Object.freeze(['BOOT', 'A_GREEN', 'A_YELLOW', 'AFTER_A', 'B_GREEN', 'B_YELLOW', 'AFTER_B', 'PED_WALK', 'PED_CLEAR']);
  const duration = Object.freeze({ BOOT: 1, A_GREEN: 12, A_YELLOW: 3, AFTER_A: 1, B_GREEN: 12, B_YELLOW: 3, AFTER_B: 1, PED_WALK: 6, PED_CLEAR: 1 });
  const following = Object.freeze({ BOOT: 'A_GREEN', A_GREEN: 'A_YELLOW', A_YELLOW: 'AFTER_A', B_GREEN: 'B_YELLOW', B_YELLOW: 'AFTER_B', PED_WALK: 'PED_CLEAR' });

  function create(cyclesPerTick = 4) {
    if (!Number.isSafeInteger(cyclesPerTick) || cyclesPerTick < 1) throw new RangeError('Số clock mỗi tick phải là số nguyên dương.');
    return { cyclesPerTick, counter: 0, state: 'BOOT', elapsed: 0, modeActive: 0, pending: 0, buttonPrev: 0, resumeB: 0, clock: 0, ticks: 0 };
  }

  function view(reg, input) {
    const { state, elapsed, modeActive, pending, resumeB } = reg;
    const green = state === 'A_GREEN' || state === 'B_GREEN';
    const limit = green && modeActive ? 20 : duration[state];
    const tick = Number(!input.rst && reg.counter === reg.cyclesPerTick - 1);
    const request = Number(input.ped && !reg.buttonPrev);
    let nextState = state;
    let reason = `elapsed=${elapsed} chưa tới ${limit - 1}.`;
    if (green && modeActive) {
      const [own, other] = state === 'A_GREEN' ? [input.qa, input.qb] : [input.qb, input.qa];
      if (elapsed >= 19) {
        nextState = following[state];
        reason = 'Đủ 20 tick xanh ở cạnh này.';
      } else if (elapsed >= 5 && other > own) {
        nextState = following[state];
        reason = `Đủ tối thiểu 6 tick ở cạnh này. Hàng đợi đối diện ${other} lớn hơn ${own}.`;
      } else {
        reason = elapsed < 5 ? 'Cạnh này chưa đủ 6 tick xanh.' : `Hàng đợi đối diện ${other} ≤ ${own}. Giữ xanh tới khi đủ điều kiện hoặc tới trần.`;
      }
    } else if (elapsed >= limit - 1) {
      switch (state) {
        case 'AFTER_A':
        case 'AFTER_B':
          nextState = pending || request ? 'PED_WALK' : state === 'AFTER_A' ? 'B_GREEN' : 'A_GREEN';
          reason = pending || request ? `Hết đỏ toàn phần, có ${pending ? 'ped_pending' : 'new_request'}.` : 'Hết đỏ toàn phần, chưa có yêu cầu đi bộ.';
          break;
        case 'PED_CLEAR':
          nextState = resumeB ? 'B_GREEN' : 'A_GREEN';
          reason = `Hết CLEAR. resume_b=${resumeB} chọn hướng tiếp theo.`;
          break;
        default:
          nextState = following[state];
          reason = `elapsed=${elapsed} đạt ${limit} − 1. Cạnh này hoàn tất pha.`;
      }
    }
    return {
      ...reg, nextState, tick, request, reason, limit, remaining: Math.max(0, limit - elapsed),
      lightsA: state === 'A_GREEN' ? 1 : state === 'A_YELLOW' ? 2 : 4,
      lightsB: state === 'B_GREEN' ? 1 : state === 'B_YELLOW' ? 2 : 4,
      walk: Number(state === 'PED_WALK')
    };
  }

  function step(reg, input) {
    const before = view(reg, input);
    let result = { ...reg, clock: reg.clock + 1 };
    let reason = before.reason;
    if (input.rst) {
      result = { ...create(reg.cyclesPerTick), clock: result.clock, ticks: reg.ticks, modeActive: Number(input.mode) };
      reason = `Reset tại cạnh lên. mode_active lấy mode_select=${result.modeActive}.`;
    } else {
      result.counter = before.tick ? 0 : reg.counter + 1;
      result.buttonPrev = Number(input.ped);
      if (before.request && reg.state !== 'PED_WALK') result.pending = 1;
      if (before.tick) {
        result.ticks += 1;
        if (before.nextState !== reg.state) {
          result.state = before.nextState;
          result.elapsed = 0;
          if (result.state === 'PED_WALK') {
            result.pending = 0;
            result.resumeB = Number(reg.state === 'AFTER_A');
          }
        } else {
          result.elapsed = Math.min(reg.elapsed + 1, 65535);
        }
      } else {
        reason = 'tick=0 ở cạnh này, giữ state và elapsed.';
      }
      if (before.request && reg.state === 'PED_WALK') reason += ' Cạnh nút trong WALK được bỏ qua.';
      else if (before.request && result.state !== 'PED_WALK') reason += ' Chốt yêu cầu vào ped_pending.';
    }
    return { before, after: view(result, input), reg: result, reason };
  }

  const model = { states, create, view, step };
  if (typeof module !== 'undefined') module.exports = model;
  else window.KTMTModel = model;
})();
