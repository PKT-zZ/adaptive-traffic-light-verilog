(() => {
  'use strict';
  const data = window.KTMT;
  const mod = window.KTMTModel;
  const lessons = [...(data.coreLessons || []), ...(data.evidenceLessons || []), ...(data.defenseLessons || [])];
  const quiz = [...(data.coreQuiz || []), ...(data.evidenceQuiz || []), ...(data.defenseQuiz || [])];
  const oral = data.oral || [];
  const roles = data.roles || [];
  const sources = data.sources || [];
  const waves = data.waveExercises || [];
  const tools = [
    ['code', 'Đọc mã RTL', '⌘', 'Lần theo tín hiệu trong mã nguồn thực.'],
    ['fsm', 'Mô phỏng FSM', '◉', 'Bước từng cạnh clock và theo dõi chuyển pha.'],
    ['wave', 'Đọc dạng sóng', '∿', 'Đo độ dài pha và dự đoán giá trị tại cạnh.'],
    ['compare', 'So sánh chế độ', '▥', 'Đọc kết quả cùng đầu vào trên bốn kịch bản.'],
    ['quiz', 'Quiz truy vết', '✓', 'Thử đáp án, nhận gợi ý và đối chiếu mã.'],
    ['defense', 'Bảo vệ thử', '◈', 'Luyện trả lời theo chủ đề hoặc vai trò.'],
    ['cards', 'Flashcard', '▤', 'Ôn nhanh các khái niệm dễ nhầm.']
  ];
  const $ = (id) => document.getElementById(id);
  const main = $('main');
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const norm = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');
  const format = new Intl.NumberFormat('vi-VN');
  const number = (x) => x == null ? '—' : format.format(x);
  const pad = (n) => String(n).padStart(2, '0');
  const titleOf = (id) => lessons.find((item) => item.id === id)?.title || id;
  const lessonLink = (id) => `#lesson/${id}`;
  const toolLink = (id, label, cls = 'button') => `<a class="${cls}" href="#${id}">${escape(label)}</a>`;
  const key = 'ktmt-studio-progress-v1';
  const defaults = () => ({ version: 1, theme: 'dark', completed: [], lastLesson: null });
  let stored = true;
  let progress = defaults();

  function validateProgress(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1 || !['light', 'dark'].includes(value.theme) || !Array.isArray(value.completed)) {
      throw new Error('Tệp phải là bản sao lưu tiến độ KTMT Studio phiên bản 1.');
    }
    const valid = (id) => lessons.some((lesson) => lesson.id === id);
    if (value.completed.some((id) => !valid(id)) || (value.lastLesson !== null && !valid(value.lastLesson))) {
      throw new Error('Tệp có mã bài học không hợp lệ.');
    }
    return { version: 1, theme: value.theme, completed: [...new Set(value.completed)], lastLesson: value.lastLesson };
  }

  try {
    const saved = localStorage.getItem(key);
    if (saved) progress = validateProgress(JSON.parse(saved));
  } catch (error) {
    stored = false;
  }

  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(progress));
      stored = true;
    } catch (error) {
      stored = false;
    }
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.dataset.theme = progress.theme;
    const dark = progress.theme === 'dark';
    $('theme').textContent = dark ? '☼' : '☾';
    $('theme').setAttribute('aria-label', dark ? 'Dùng giao diện sáng' : 'Dùng giao diện tối');
  }

  function sidebar(route) {
    const active = (target) => route === target || route.startsWith(`${target}/`) ? ' aria-current="page"' : '';
    const total = lessons.length;
    $('sidebar').innerHTML = `
      <nav><a class="nav-link nav-home" href="#home"${active('home')}><span aria-hidden="true">⌂</span>Tổng quan</a>
      <h2>Lộ trình học</h2>
      ${lessons.map((item, i) => `<a class="nav-link" href="${lessonLink(item.id)}"${active(`lesson/${item.id}`)}><span class="nav-number">${pad(i + 1)}</span><span>${escape(item.title)}</span>${progress.completed.includes(item.id) ? '<span class="nav-done" aria-label="Đã học">✓</span>' : ''}</a>`).join('')}
      <h2>Phòng thực hành</h2>
      ${tools.map(([id, label, glyph]) => `<a class="nav-link" href="#${id}"${active(id)}><span aria-hidden="true">${glyph}</span>${label}</a>`).join('')}
      <a class="nav-link nav-progress" href="#progress"${active('progress')}><span aria-hidden="true">◷</span>Tiến độ và dữ liệu</a></nav>
      <div class="side-progress"><span>Đã học <b>${progress.completed.length}/${total}</b> bài</span><progress value="${progress.completed.length}" max="${total || 1}" aria-label="Số bài đã học"></progress></div>`;
  }

  function page(label, title, description) {
    return `<header class="page-head"><div class="eyebrow">${escape(label)}</div><h1>${escape(title)}</h1><p>${escape(description)}</p></header>`;
  }

  function lamp(value, label) {
    const names = { 1: 'Xanh', 2: 'Vàng', 4: 'Đỏ' };
    return `<div class="signal"><div class="lamp" aria-hidden="true"><i class="red ${value === 4 ? 'lit' : ''}"></i><i class="yellow ${value === 2 ? 'lit' : ''}"></i><i class="green ${value === 1 ? 'lit' : ''}"></i></div><span>${escape(label)} <b>${names[value]}</b></span></div>`;
  }

  function home() {
    const resume = progress.lastLesson || lessons[0]?.id;
    return `<div class="hero"><div class="hero-copy"><div class="eyebrow">Kiến trúc máy tính · Verilog</div>
      <h1>Đèn giao thông<br><em>thích ứng</em></h1>
      <p>Lần từ một cạnh clock đến quyết định đổi pha. Đọc RTL, thử tình huống và luyện bảo vệ bài tập lớn về bộ điều khiển hai hướng.</p>
      <div class="actions"><a class="button primary" href="${lessonLink(resume)}">${progress.lastLesson ? 'Học tiếp' : 'Bắt đầu học'}</a>${toolLink('fsm', 'Mở mô phỏng')}${toolLink('lesson/bao-ve', 'Tra mã khi bảo vệ')}</div></div>
      <figure class="hero-diagram" aria-label="Minh họa A đang xanh, B đang đỏ">
        <figcaption><span>TRẠNG THÁI</span><code>A_GREEN</code></figcaption>
        <div class="hero-signals">${lamp(1, 'Hướng A')}${lamp(4, 'Hướng B')}</div>
        <div class="hero-trace"><div class="pulse-line" aria-hidden="true"></div><div><code>clk</code><span>Minh họa</span></div></div>
      </figure></div>
      <section class="section"><div class="section-head"><h2>Phòng thực hành</h2></div>
      <div class="practice-grid">${tools.slice(0, 6).map(([id, label, glyph, detail]) => `<a class="practice-card" href="#${id}"><span class="tool-icon" aria-hidden="true">${glyph}</span><h3>${label}</h3><p>${detail}</p></a>`).join('')}</div></section>
      <section class="section"><div class="section-head"><h2>Lộ trình học</h2><span>${progress.completed.length}/${lessons.length} bài đã học</span></div><div class="lesson-list">
        ${lessons.map((item, i) => `<a href="${lessonLink(item.id)}" class="lesson-row"><span class="lesson-index">${pad(i + 1)}</span><div><h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p></div>${progress.completed.includes(item.id) ? '<span class="tag success">Đã học</span>' : ''}</a>`).join('')}
      </div></section><footer>Chạy offline · Học liệu theo checkout adaptive-traffic-light-verilog</footer>`;
  }

  function lesson(id) {
    const index = lessons.findIndex((item) => item.id === id);
    if (index < 0) return missing();
    const item = lessons[index];
    if (progress.lastLesson !== id) {
      progress.lastLesson = id;
      save();
    }
    const checked = progress.completed.includes(id);
    return `${page(`Bài ${pad(index + 1)} / ${pad(lessons.length)}`, item.title, item.summary)}
      <div class="actions lesson-actions"><button id="complete" class="button ${checked ? '' : 'primary'}" type="button" aria-pressed="${checked}">${checked ? '✓ Đã học · Bỏ đánh dấu' : 'Đánh dấu đã học'}</button>${toolLink(`quiz/${id}`, 'Luyện quiz bài này')}</div>
      <article class="prose">${item.html}</article>
      <div class="actions lesson-bottom">${lessons[index - 1] ? toolLink(`lesson/${lessons[index - 1].id}`, 'Bài trước') : ''}${lessons[index + 1] ? toolLink(`lesson/${lessons[index + 1].id}`, `Bài tiếp · ${lessons[index + 1].title}`, 'button primary') : toolLink('defense', 'Bắt đầu bảo vệ thử', 'button primary')}</div>`;
  }

  function missing() {
    return `${page('Điều hướng', 'Không tìm thấy mục này', 'Hãy mở mục lục hoặc tìm lại học liệu.')}${toolLink('home', 'Về tổng quan')}`;
  }

  function question(item, prefix) {
    return `<section class="panel question" id="${prefix}-${escape(item.id)}" data-question="${escape(item.id)}">
      <h3>${escape(item.prompt)}</h3>
      <div class="answers">${item.options.map((option, i) => `<button class="answer" data-answer="${i}" type="button"><span>${String.fromCharCode(65 + i)}</span>${escape(option)}</button>`).join('')}</div>
      <div class="feedback" role="status" hidden></div>
      <details class="solution" hidden><summary>Mở lời giải</summary><p>${escape(item.explanation)}</p><p class="muted evidence">${escape(item.evidence)}</p></details>
    </section>`;
  }

  function bindQuestions(items) {
    const byId = new Map(items.map((item) => [item.id, item]));
    for (const panel of main.querySelectorAll('[data-question]')) {
      const item = byId.get(panel.dataset.question);
      for (const button of panel.querySelectorAll('[data-answer]')) {
        button.addEventListener('click', () => {
          const correct = Number(button.dataset.answer) === item.correct;
          for (const answer of panel.querySelectorAll('button.answer')) answer.classList.remove('right', 'wrong');
          button.classList.add(correct ? 'right' : 'wrong');
          const feedback = panel.querySelector('.feedback');
          feedback.hidden = false;
          feedback.textContent = correct ? 'Chính xác. Bạn có thể mở lời giải để đối chiếu bằng chứng.' : `Gợi ý · ${item.hint}`;
          panel.querySelector('.solution').hidden = false;
        });
      }
    }
  }

  function quizPage(filter) {
    const only = quiz.find((item) => item.id === filter);
    const selection = only ? only.lesson : filter || '';
    const items = only ? [only] : quiz.filter((item) => !selection || item.lesson === selection);
    return `${page('Phòng thực hành', 'Quiz truy vết', 'Chọn một đáp án. Khi cần, dùng gợi ý để thử lại rồi mở lời giải có dẫn chứng.')}
      <div class="toolbar"><label>Chủ đề <select id="quiz-filter"><option value="">Tất cả các bài</option>${lessons.map((item) => `<option value="${item.id}" ${selection === item.id ? 'selected' : ''}>${escape(item.title)}</option>`).join('')}</select></label><span class="muted">${items.length} câu</span>${only ? toolLink(`quiz/${selection}`, 'Xem cả chủ đề') : ''}</div>
      <div class="stack">${items.map((item) => question(item, 'quiz')).join('') || '<p>Chủ đề này chưa có câu hỏi.</p>'}</div>`;
  }

  function colorLine(line) {
    const tokens = /(\/\/.*$|"(?:\\.|[^"\\])*"|`\w+|\$\w+|\b\d+(?:'[bBoOdDhH][\da-fA-FxXzZ_]+)?\b|\b(?:module|endmodule|input|output|wire|reg|assign|always|posedge|begin|end|if|else|case|endcase|default|integer|localparam|parameter|initial|task|endtask|for|repeat|function|endfunction)\b)/g;
    let html = '';
    let last = 0;
    for (const match of line.matchAll(tokens)) {
      html += escape(line.slice(last, match.index));
      html += `<span class="tok-${match[0].startsWith('//') ? 'comment' : /^\d|^"/.test(match[0]) ? 'literal' : 'keyword'}">${escape(match[0])}</span>`;
      last = match.index + match[0].length;
    }
    return html + escape(line.slice(last));
  }

  const readTasks = {
    'rtl/traffic_controller.v': ['Tìm hai phép gán tới ped_pending có thể xảy ra ở cùng một cạnh. Giá trị nào được giữ khi cạnh vào WALK?', 'Dòng 50 đặt ped_pending, dòng 55 xóa khi vào WALK. Hai phép gán không chặn nằm trong cùng khối tuần tự và phép gán sau quyết định giá trị cuối.'],
    'rtl/second_tick.v': ['Với CYCLES_PER_SECOND=4, counter bằng bao nhiêu ngay trước cạnh có tick?', 'counter=3 trước cạnh đó. Sau cạnh, counter=0 và tick xuống 0 khi cấu hình là 4.'],
    'rtl/green_policy.v': ['elapsed=5, own_queue=6, other_queue=6, adaptive=1. finish_green bằng bao nhiêu?', 'Bằng 0. Đã chạm ngưỡng tối thiểu nhưng so sánh dùng > và chưa chạm trần.'],
    'rtl/traffic_top.v': ['Bộ chia nhịp nối vào cổng nào? Khối nào dùng clock gốc?', 'Cổng tick của traffic_controller nhận tick từ second_tick. Cả hai khối đều lấy clk gốc.'],
    'rtl/demand_level.v': ['queue=9 và queue=10 cho level nào? Kết quả nối vào green_policy ở đâu?', '9 cho level=2, 10 cho level=3. traffic_top và traffic_controller không dùng level để quyết định.'],
    'sim/queue_model.v': ['Trong tick xanh, queue=0 và arrivals=1. Có xe đi ngay ở cạnh đó không?', 'departed bằng 0 do queue cũ bằng 0. queue cập nhật thành 1 sau cạnh.'],
    'sim/tb_top.sv': ['Tìm hai chỗ kiểm tra mốc 4 clock/tick và cặp đèn có đúng thứ tự A/B.', 'Các dòng 28–34 đếm số lần gọi cycle để kiểm tra mốc đổi pha. Trong cycle, dòng 11 chờ #1 sau cạnh lên rồi các dòng 13–23 kiểm tra cặp {la,lb} theo state.'],
    'sim/tb_controller.sv': ['Tìm ca đặt cạnh nút đúng lúc hết AFTER_A. Tín hiệu nào cho phép vào WALK ngay?', 'new_request đi thẳng vào tổ hợp next_state cùng ped_pending, nên không phải đợi cờ pending lưu trước.'],
    'sim/tb_units.sv': ['Tìm đường phân biệt kiểm thử phân loại với kiểm thử chính sách. Vì sao đủ 256 ca ở demand_level?', 'Cổng queue 8 bit nhận 256 giá trị. Chính sách lấy hai hàng đợi và elapsed nên có vòng lặp khác.'],
    'sim/tb_system.sv': ['Tìm vị trí chụp số xe đi trước cạnh và số xe chờ sau cạnh.', 'Bench ổn định đầu vào rồi chụp da/db trước posedge ở dòng 54–56. Sau posedge và #1 bench đọc hàng đợi đã cập nhật để tích lũy ở dòng 107–112.']
  };

  function codePage(path, line) {
    const file = sources.find((item) => item.path === path) || sources.find((item) => item.path === 'rtl/traffic_controller.v') || sources[0];
    if (!file) return missing();
    const lines = file.text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
    const go = Math.max(1, Math.min(lines.length, Number.parseInt(line, 10) || 1));
    const task = readTasks[file.path];
    return `${page('Phòng thực hành', 'Đọc mã RTL', 'Chọn tệp, đi tới một dòng và truy vết từ đầu vào đến giá trị sau cạnh.')}
      <div class="toolbar"><label>Tệp nguồn <select id="code-file">${sources.map((item) => `<option value="${escape(item.path)}" ${item === file ? 'selected' : ''}>${escape(item.path)}</option>`).join('')}</select></label>
      <form id="line-form" class="inline-form"><label>Dòng <input type="number" id="code-line" min="1" max="${lines.length}" value="${go}" required></label><button class="button">Đi tới</button></form></div>
      <p class="source-line">Mã nguyên văn · <code>${escape(file.path)}</code> · Dòng 1–${lines.length}${file.description ? ` · ${escape(file.description)}` : ''}</p>
      <div id="code-scroll" class="code-scroll" tabindex="0" aria-label="Mã nguồn ${escape(file.path)}"><pre><code>${lines.map((value, i) => `<span class="code-row ${go === i + 1 ? 'selected-line' : ''}" id="src-line-${i + 1}"><a href="#code/${encodeURIComponent(file.path)}/${i + 1}" class="line-number" aria-label="Dòng ${i + 1}">${i + 1}</a><span>${colorLine(value)}</span></span>`).join('')}</code></pre></div>
      ${task ? `<section class="panel read-task"><h2>Tự truy vết</h2><p>${escape(task[0])}</p><details><summary>Mở đối chiếu</summary><p>${escape(task[1])}</p></details></section>` : ''}`;
  }

  let regs = mod.create();
  let labInput = { rst: 0, mode: 0, ped: 0, qa: 0, qb: 0 };
  let history = [];
  let lastEdge = null;
  const stateLabels = { BOOT: 'Khởi động', A_GREEN: 'A xanh', A_YELLOW: 'A vàng', AFTER_A: 'Đỏ sau A', B_GREEN: 'B xanh', B_YELLOW: 'B vàng', AFTER_B: 'Đỏ sau B', PED_WALK: 'Người đi bộ', PED_CLEAR: 'Dọn pha đi bộ' };

  function ins(value) { return value ? ' checked' : ''; }

  function lab() {
    return `${page('Mô hình JavaScript', 'Mô phỏng FSM', 'Đổi đầu vào, tiến một cạnh hoặc cả nhịp và đọc giá trị trước và sau cập nhật.')}
    <div class="lab-grid"><section class="panel lab-controls"><h2>Đầu vào</h2>
      <label>Clock mỗi tick <select id="cycles"><option value="1" ${regs.cyclesPerTick === 1 ? 'selected' : ''}>1 · Bộ chia chạy nhanh</option><option value="4" ${regs.cyclesPerTick === 4 ? 'selected' : ''}>4 · Như tb_top</option></select></label>
      <label>mode_select <select id="sim-mode"><option value="0">0 · Cố định</option><option value="1" ${labInput.mode ? 'selected' : ''}>1 · Thích ứng</option></select></label>
      <div class="input-pair"><label>queue_a <input id="qa" type="number" value="${labInput.qa}" min="0" max="255" step="1"></label><label>queue_b <input id="qb" type="number" value="${labInput.qb}" min="0" max="255" step="1"></label></div>
      <label class="check"><input id="ped" type="checkbox"${ins(labInput.ped)}> Giữ ped_button=1</label>
      <label class="check"><input id="rst" type="checkbox"${ins(labInput.rst)}> Giữ rst=1</label>
      <div class="actions"><button class="button primary" id="edge" type="button">+1 cạnh clock</button><button class="button" id="tick-step" type="button">Đến tick kế tiếp</button></div>
      <div class="actions"><button class="button" id="pulse" type="button">Bấm 1 cạnh</button><button class="button" id="reset-edge" type="button">Reset 1 cạnh</button></div>
      <p class="muted">Mô hình bắt đầu sau một cạnh reset. Thay đổi số clock/tick sẽ khởi tạo lại. Sau khi bấm 1 cạnh, tiến thêm một cạnh thả nút trước lần bấm tiếp.</p>
      <p class="muted">Cả hai cấu hình dùng bộ chia của <code>traffic_top</code>, với <code>tick=0</code> lúc giữ reset. <code>tb_system</code> nối thẳng <code>tick=1</code> vào controller, kể cả lúc reset.</p>
      </section><section id="lab-live" class="panel lab-live" aria-label="Kết quả mô phỏng"></section></div>
      <section class="panel log-panel"><div class="section-head"><h2>Nhật ký cạnh</h2><button id="clear-log" class="button" type="button">Xóa nhật ký</button></div><div id="edge-log"></div></section>
      <section class="panel"><h2>Thử một tình huống</h2><ol>
      <li>Chọn 4 clock/tick. Bấm 1 cạnh ngay sau reset. Xem <code>ped_pending</code> dù <code>tick=0</code>.</li>
      <li>Chọn thích ứng rồi tiến cạnh. Đọc <code>mode_active</code>, sau đó reset một cạnh và đối chiếu.</li>
      <li>Thử hai hàng đợi bằng nhau rồi tăng hàng đợi đối diện. Quan sát <code>next_state</code> trước và sau ngưỡng <code>elapsed=5</code>.</li>
      </ol><div class="actions">${toolLink('lesson/nguoi-di-bo', 'Ôn quy tắc nút và reset')}${toolLink('code/rtl%2Ftraffic_controller.v/43', 'Đọc khối tuần tự')}</div></section>`;
  }

  function labUpdate() {
    $('pulse').disabled = Boolean(labInput.ped || labInput.rst || regs.buttonPrev);
    const current = mod.view(regs, labInput);
    const signals = [
      ['state', 'state'], ['next_state', 'nextState'], ['counter', 'counter'], ['tick', 'tick'], ['elapsed', 'elapsed'], ['remaining', 'remaining'],
      ['new_request', 'request'], ['button_prev', 'buttonPrev'], ['ped_pending', 'pending'], ['resume_b', 'resumeB'], ['walk', 'walk'], ['mode_active', 'modeActive'], ['lights_a', 'lightsA'], ['lights_b', 'lightsB']
    ];
    $('lab-live').innerHTML = `<div class="section-head"><div><div class="eyebrow">Clock ${regs.clock} · Tick đã nhận ${regs.ticks}</div><h2>${stateLabels[regs.state]} <code>${regs.state}</code></h2></div><span class="tag">${regs.modeActive ? 'Thích ứng' : 'Cố định'}</span></div>
      <div class="lab-signals">${lamp(current.lightsA, 'Hướng A')}${lamp(current.lightsB, 'Hướng B')}<div class="walk-indicator ${current.walk ? 'walk-on' : ''}">WALK <b>${current.walk}</b></div></div>
      <p class="readout">${lastEdge ? escape(lastEdge.reason) : 'Chưa tiến cạnh. Thử thay đổi đầu vào và dự đoán cạnh kế tiếp.'}</p>
      <div class="table-scroll"><table class="compact lab-table"><thead><tr><th>Tín hiệu</th><th>Trước cạnh</th><th>Sau cạnh</th><th>Hiện tại</th></tr></thead><tbody>
      ${signals.map(([label, name]) => `<tr><th scope="row"><code>${label}</code></th><td>${lastEdge?.before[name] ?? '—'}</td><td class="${lastEdge && lastEdge.before[name] !== lastEdge.after[name] ? 'changed' : ''}">${lastEdge?.after[name] ?? '—'}</td><td>${current[name]}</td></tr>`).join('')}
      </tbody></table></div><p class="muted">FSM dùng <code>tick</code> trước cạnh. Cột hiện tại tính lại tín hiệu tổ hợp khi đầu vào đổi. Đèn hiển thị mã thập phân 1, 2, 4.</p>`;
    $('edge-log').innerHTML = history.length ? `<div class="table-scroll"><table class="compact"><thead><tr><th>Clock</th><th>Tick / reset</th><th>Trước</th><th>Sau</th><th>Lý do</th></tr></thead><tbody>${history.map(({ before, after, reason, input }) => `<tr><td>${after.clock}</td><td>${input.rst ? 'reset' : before.tick}</td><td><code>${before.state}</code> (${before.elapsed})</td><td><code>${after.state}</code> (${after.elapsed})</td><td>${escape(reason)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Các cạnh gần nhất sẽ xuất hiện ở đây.</p>';
  }

  function labBind() {
    const bounded = (input) => Math.min(255, Math.max(0, Math.trunc(input.valueAsNumber || 0)));
    function readInputs() {
      labInput = { rst: Number($('rst').checked), mode: Number($('sim-mode').value), ped: Number($('ped').checked), qa: bounded($('qa')), qb: bounded($('qb')) };
      $('tick-step').disabled = Boolean(labInput.rst);
    }
    function advance(inputs) {
      lastEdge = { ...mod.step(regs, inputs), input: inputs };
      regs = lastEdge.reg;
      history = [lastEdge, ...history].slice(0, 20);
    }
    for (const id of ['qa', 'qb', 'sim-mode', 'ped', 'rst']) {
      $(id).addEventListener('input', () => { readInputs(); labUpdate(); });
    }
    for (const id of ['qa', 'qb']) $(id).addEventListener('change', () => { $(id).value = bounded($(id)); });
    $('cycles').addEventListener('change', () => {
      regs = { ...mod.create(Number($('cycles').value)), modeActive: labInput.mode };
      lastEdge = null;
      history = [];
      labUpdate();
    });
    $('edge').addEventListener('click', () => { advance(labInput); labUpdate(); });
    $('tick-step').addEventListener('click', () => {
      const count = regs.cyclesPerTick - regs.counter;
      for (let i = 0; i < count; i++) advance(labInput);
      labUpdate();
    });
    $('pulse').addEventListener('click', () => {
      advance({ ...labInput, ped: 1 });
      labUpdate();
    });
    $('reset-edge').addEventListener('click', () => { advance({ ...labInput, rst: 1 }); labUpdate(); });
    $('clear-log').addEventListener('click', () => { history = []; labUpdate(); });
    readInputs();
    labUpdate();
  }

  function wavePlot(wave) {
    if (!wave.signals?.length || !wave.times?.length) return '';
    const { signals, times } = wave;
    const start = times[0];
    const length = times.at(-1) - start;
    const left = 140;
    const width = 605;
    const x = (t) => left + width * (t - start) / (length || 1);
    const h = signals.length * 42 + 41;
    return `<div class="wave-plot" tabindex="0" aria-label="Đồ thị dạng sóng"><svg viewBox="0 0 800 ${h}" aria-label="Dạng sóng theo trục thời gian ns" role="img">
      ${times.map((time) => `<path class="wave-grid" d="M${x(time)} 8V${h - 31}"/><text class="wave-time" x="${x(time)}" y="${h - 10}" text-anchor="middle">${Number(time.toFixed(3))}</text>`).join('')}
      <text x="787" y="${h - 10}" text-anchor="end">ns</text>
      ${signals.map(({ label, values }, i) => {
        const high = i * 42 + 12;
        const y = (value) => high + (Number(value) ? 0 : 16);
        const path = values.reduce((d, value, j) => j ? `${d} H${x(times[j])} V${y(value)}` : `M${left} ${y(value)}`, '');
        return `<text x="6" y="${high + 14}">${escape(label)}</text><path class="wave-path" d="${path}"/>`;
      }).join('')}</svg></div>`;
  }

  function wavePage(id) {
    const wave = waves.find((item) => item.id === id) || waves[0];
    if (!wave) return missing();
    return `${page('Phòng thực hành', 'Đọc dạng sóng', 'So sánh mẫu trước và sau cạnh. Đếm số khoảng giữa các cạnh để đo thời lượng pha.')}
      <div class="toolbar"><label>Bài tập <select id="wave-select">${waves.map((item) => `<option value="${escape(item.id)}" ${item === wave ? 'selected' : ''}>${escape(item.title)}</option>`).join('')}</select></label></div>
      <section class="panel"><h2>${escape(wave.title)}</h2><p class="source-line">${escape(wave.note)}</p>${wavePlot(wave)}
      <div class="table-scroll"><table class="compact"><thead><tr>${wave.columns.map((text) => `<th scope="col">${escape(text)}</th>`).join('')}</tr></thead><tbody>${wave.rows.map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
      ${question(wave, 'wave')}`;
  }

  function comparePage(id) {
    const results = data.results;
    if (!results?.scenarios?.length) return missing();
    const scenario = results.scenarios.find((item) => item.id === id) || results.scenarios[0];
    const labels = scenario.modes.map((mode) => mode.label || mode.mode);
    const metric = (arr) => Array.isArray(arr) ? `${number(arr[0])} / ${number(arr[1])} · ${number(arr[0] + arr[1])}` : number(arr);
    const rows = [
      ['Xe đến · A / B · Tổng', (m) => metric(m.arrived)], ['Xe đi · A / B · Tổng', (m) => metric(m.departed)], ['Xe còn chờ · A / B · Tổng', (m) => metric(m.waiting)],
      ['Hàng đợi tích lũy · xe·giây', (m) => number(m.area)], ['Hàng đợi tổng cực đại · xe', (m) => number(m.peak)],
      ['Khoảng có xe chờ và chưa xanh dài nhất · A / B · giây', (m) => m.maxRed?.map(number).join(' / ') || '—']
    ];
    const areaScale = Math.max(1, ...scenario.modes.map((m) => m.area));
    return `${page('Dữ liệu kết quả lưu sẵn', 'So sánh hai chế độ', 'Mỗi cặp dùng cùng chuỗi xe đến, lịch nút đi bộ và mô hình phục vụ trong 600 tick.')}
      <div class="toolbar"><label>Kịch bản <select id="scenario">${results.scenarios.map((item) => `<option value="${escape(item.id)}" ${item === scenario ? 'selected' : ''}>${escape(item.name)}</option>`).join('')}</select></label></div>
      <section class="panel"><div class="section-head"><h2>${escape(scenario.name)}</h2><span class="tag">600 tick / chế độ</span></div>
      <div class="table-scroll"><table><thead><tr><th>Chỉ số</th>${labels.map((label) => `<th>${escape(label)}</th>`).join('')}</tr></thead><tbody>${rows.map(([label, getter]) => `<tr><th scope="row">${label}</th>${scenario.modes.map((mode) => `<td>${escape(getter(mode))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <h3>Hàng đợi tích lũy</h3><div class="bars">${scenario.modes.map((mode, i) => `<div class="bar-row"><span>${escape(labels[i])}</span><div class="bar-track"><div class="bar bar-${i}" style="width:${100 * mode.area / areaScale}%"></div></div><strong>${number(mode.area)} xe·giây</strong></div>`).join('')}</div>
      <p>${escape(scenario.note)}</p><p class="source-line">${escape(results.source)} · Run <code>${escape(results.runId)}</code></p></section>
      <section class="panel prose"><h2>Đọc kết quả trong cửa sổ đo</h2><p>Số còn chờ là lượng xe cuối tick 600. Hàng đợi tích lũy cộng tổng số xe chờ sau từng tick. Hàng đợi cực đại lấy giá trị lớn nhất trong cùng dãy mẫu. <code>max_red_wait_a/b</code> đếm số tick liên tiếp có xe chờ và hướng đó chưa xanh, với cả hai giá trị được đọc sau cạnh. Mô hình đếm xe theo từng hướng, vì thế các chỉ số này không cho biết thời gian chờ của từng xe.</p><div class="actions">${toolLink('lesson/kiem-thu', 'Đọc phương pháp kiểm thử')}<a class="button" href="rtl-run/metrics.csv" download>Tải metrics.csv</a></div></section>`;
  }

  let attempt = null;
  let timerId = null;
  const oralTopics = [...new Set(oral.map((item) => item.topic))];

  function oralRubric(item) {
    return `<div class="rubric"><h4>Ý cần đạt</h4><ul>${item.criteria.map((text) => `<li>${escape(text)}</li>`).join('')}</ul><h4>Lỗi thường gặp</h4><ul>${item.pitfalls.map((text) => `<li>${escape(text)}</li>`).join('')}</ul>
      <p class="source-line">${escape(item.evidence)}</p><p><strong>Câu hỏi phụ</strong> ${escape(item.followup)}</p><a href="${lessonLink(item.lesson)}">Ôn ${escape(titleOf(item.lesson))}</a></div>`;
  }

  function defensePage(id) {
    const focus = oral.find((item) => item.id === id);
    return `${page('Phòng thực hành', 'Bảo vệ thử', 'Trả lời theo trình tự quy tắc, module hoặc tín hiệu, ca thử, rồi giới hạn kết luận.')}
      <section class="panel"><h2>Tạo lượt luyện</h2>
      <form id="defense-form"><div class="form-grid"><label>Phạm vi <select id="oral-scope"><option value="all">Toàn bộ ngân hàng</option><optgroup label="Theo chủ đề">${oralTopics.map((topic) => `<option value="topic:${escape(topic)}">${escape(topic)}</option>`).join('')}</optgroup><optgroup label="Theo vai trò">${roles.map((role) => `<option value="role:${role.id}">${escape(role.name)} · ${escape(role.title)}</option>`).join('')}</optgroup></select></label>
      <label>Số câu <select id="oral-count"><option>5</option><option>7</option><option>10</option></select></label><label>Đồng hồ <select id="oral-time"><option value="0">Tắt</option><option value="3">3 phút</option><option value="5">5 phút</option><option value="10">10 phút</option></select></label></div>
      <div class="actions"><button class="button primary" type="submit">Bắt đầu lượt luyện</button>${attempt && !attempt.finished ? '<button class="button" type="button" id="resume-oral">Tiếp tục lượt hiện tại</button>' : ''}</div><p id="oral-status" class="muted" role="status"></p></form></section>
      <section class="section"><div class="section-head"><h2>Ngân hàng vấn đáp</h2><span>${focus ? 'Câu tìm thấy' : `${oral.length} câu`}</span></div>
      <div class="stack">${(focus ? [focus, ...oral.filter((item) => item !== focus)] : oral).map((item) => `<details class="panel oral-bank" ${item === focus ? 'open' : ''}><summary><span class="tag">${escape(item.topic)}</span> ${escape(item.prompt)}</summary>${oralRubric(item)}</details>`).join('')}</div></section>`;
  }

  function bindDefenseStart() {
    const select = $('oral-scope');
    const count = $('oral-count');
    function available() {
      const choice = select.value;
      if (choice.startsWith('topic:')) return oral.filter((item) => item.topic === choice.slice(6));
      if (choice.startsWith('role:')) return oral.filter((item) => item.roles.includes(Number(choice.slice(5))));
      return oral;
    }
    function scopeChanged() {
      const total = available().length;
      for (const option of count.options) option.disabled = Number(option.value) > total;
      if (count.selectedOptions[0]?.disabled) count.value = '5';
      $('defense-form').querySelector('[type="submit"]').disabled = total < 5;
      $('oral-status').textContent = `${total} câu trong phạm vi này.`;
    }
    select.addEventListener('change', scopeChanged);
    scopeChanged();
    $('resume-oral')?.addEventListener('click', () => { location.hash = 'defense/practice'; });
    $('defense-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const chosen = available();
      const desired = Number(count.value);
      function shuffled(items) {
        const clone = [...items];
        for (let i = clone.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [clone[i], clone[j]] = [clone[j], clone[i]];
        }
        return clone;
      }
      const items = shuffled(chosen).slice(0, desired);
      const minutes = Number($('oral-time').value);
      attempt = { items, index: 0, ratings: [], answer: '', finished: false, end: minutes ? Date.now() + minutes * 60_000 : 0 };
      location.hash = 'defense/practice';
    });
  }

  function readRoute() {
    try { return (location.hash.slice(1) || 'home').split('/').map(decodeURIComponent); }
    catch { return ['missing']; }
  }

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    $('menu').setAttribute('aria-expanded', String(open));
    $('menu').setAttribute('aria-label', open ? 'Đóng mục lục' : 'Mở mục lục');
  }

  function render(focus = false) {
    clearInterval(timerId);
    const [route, id, line] = readRoute();
    const pages = {
      home, lesson: () => lesson(id), code: () => codePage(id, line), fsm: lab,
      wave: () => wavePage(id), compare: () => comparePage(id), quiz: () => quizPage(id),
      defense: () => id === 'practice' ? practicePage() : defensePage(id), cards: cardPage, progress: progressPage
    };
    main.innerHTML = (Object.hasOwn(pages, route) ? pages[route] : missing)();
    sidebar(id ? `${route}/${id}` : route);
    if (route === 'lesson' && $('complete')) {
      $('complete').addEventListener('click', () => {
        const checked = !progress.completed.includes(id);
        progress.completed = checked ? [...progress.completed, id] : progress.completed.filter((item) => item !== id);
        save();
        render();
        $('complete').focus();
        $('announce').textContent = checked ? 'Đã đánh dấu bài học.' : 'Đã bỏ đánh dấu.';
      });
    }
    if (route === 'quiz') {
      bindQuestions(quiz);
      $('quiz-filter').addEventListener('change', (event) => { location.hash = event.target.value ? `quiz/${event.target.value}` : 'quiz'; });
    }
    if (route === 'code' && $('code-file')) {
      const jumpToSelectedLine = () => {
        const current = main.querySelector('.selected-line');
        $('code-scroll').scrollTop = Math.max(0, current.offsetTop - 48);
      };
      const go = (value) => {
        const target = `#code/${encodeURIComponent($('code-file').value)}/${value}`;
        if (location.hash === target) jumpToSelectedLine();
        else location.hash = target;
      };
      $('code-file').addEventListener('change', () => go(1));
      $('line-form').addEventListener('submit', (event) => { event.preventDefault(); go($('code-line').value); });
      jumpToSelectedLine();
    }
    if (route === 'fsm') labBind();
    if (route === 'wave' && $('wave-select')) {
      bindQuestions(waves);
      $('wave-select').addEventListener('change', (event) => { location.hash = `wave/${event.target.value}`; });
    }
    if (route === 'compare' && $('scenario')) $('scenario').addEventListener('change', (event) => { location.hash = `compare/${event.target.value}`; });
    if (route === 'defense') id === 'practice' ? bindPractice() : bindDefenseStart();
    if (route === 'cards' && $('card-back')) {
      $('card-back').addEventListener('click', () => { cardIndex = (cardIndex + data.cards.length - 1) % data.cards.length; render(); $('card-back').focus(); });
      $('card-next').addEventListener('click', () => { cardIndex = (cardIndex + 1) % data.cards.length; render(); $('card-next').focus(); });
    }
    if (route === 'progress') progressBind();
    if (focus) {
      main.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
    document.title = `${main.querySelector('h1')?.innerText.trim().replace(/\s+/g, ' ') || 'Học Verilog'} · KTMT Studio`;
  }

  function textOnly(html) {
    const template = document.createElement('template');
    template.innerHTML = html.replace(/<[^>]+>/g, ' ');
    return template.content.textContent;
  }

  const searchIndex = [
    ...lessons.map((item) => [item.title, 'Bài học', lessonLink(item.id), `${item.summary} ${textOnly(item.html)}`]),
    ...tools.map(([id, label, symbol, detail]) => [label, 'Thực hành', `#${id}`, detail]),
    ...sources.map((item) => [item.path, 'Mã nguồn', `#code/${encodeURIComponent(item.path)}/1`, item.description]),
    ...quiz.map((item) => [item.prompt, 'Quiz', `#quiz/${item.id}`, `${item.evidence} ${item.hint}`]),
    ...oral.map((item) => [item.prompt, 'Vấn đáp', `#defense/${item.id}`, `${item.topic} ${item.evidence}`])
  ].map(([label, group, href, body]) => ({ label, group, href, title: norm(label), index: norm(`${label} ${group} ${body}`) }));

  const search = $('search');
  const results = $('search-results');
  function closeSearch() { results.hidden = true; }
  function showSearch() {
    const query = norm(search.value).trim();
    if (!query) { closeSearch(); return; }
    const words = query.split(/\s+/);
    const matches = searchIndex.filter((item) => words.every((word) => item.index.includes(word)));
    matches.sort((a, b) => Number(words.every((word) => b.title.includes(word))) - Number(words.every((word) => a.title.includes(word))));
    results.innerHTML = matches.length ? matches.slice(0, 12).map(({ label, group, href }) => `<a href="${href}"><span>${escape(label)}</span><small>${group}</small></a>`).join('') : '<p>Không tìm thấy học liệu phù hợp.</p>';
    results.hidden = false;
  }

  search.addEventListener('input', showSearch);
  search.addEventListener('focus', showSearch);
  search.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'Enter'].includes(event.key) && !results.hidden) {
      const first = results.querySelector('a');
      if (first) {
        event.preventDefault();
        if (event.key === 'Enter') first.click();
        else first.focus();
      }
    }
  });
  results.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    search.value = '';
    closeSearch();
    main.focus({ preventScroll: true });
  });
  document.addEventListener('click', (event) => { if (!event.target.closest('.search-wrap')) closeSearch(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeSearch(); setMenu(false); }
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.target.matches('input, textarea, select, [contenteditable]')) {
      event.preventDefault();
      search.focus();
    }
  });
  $('menu').addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $('sidebar').addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  $('theme').addEventListener('click', () => { progress.theme = progress.theme === 'dark' ? 'light' : 'dark'; save(); });
  document.querySelector('.skip').addEventListener('click', (event) => { event.preventDefault(); main.focus(); });
  window.addEventListener('hashchange', () => { closeSearch(); setMenu(false); render(true); });

  function practicePage() {
    if (!attempt) return `${page('Bảo vệ thử', 'Chưa có lượt luyện', 'Chọn phạm vi, số câu và đồng hồ để bắt đầu.')}${toolLink('defense', 'Tạo lượt luyện', 'button primary')}`;
    if (attempt.finished) {
      const good = attempt.ratings.filter(Boolean).length;
      const reviewIds = [...new Set(attempt.items.filter((item, i) => !attempt.ratings[i]).map((item) => item.lesson))];
      return `${page('Bảo vệ thử', 'Tổng kết lượt luyện', `Bạn tự đánh giá đạt ${good}/${attempt.items.length} câu.`)}<div class="panel"><h2>${reviewIds.length ? 'Phần cần ôn' : 'Đối chiếu bài học'}</h2><div class="actions">${(reviewIds.length ? reviewIds : [...new Set(attempt.items.map((item) => item.lesson))]).map((lessonId) => toolLink(`lesson/${lessonId}`, titleOf(lessonId))).join('')}</div></div><div class="actions">${toolLink('defense', 'Tạo lượt luyện mới', 'button primary')}</div>`;
    }
    const item = attempt.items[attempt.index];
    return `${page('Bảo vệ thử', `Câu ${attempt.index + 1} / ${attempt.items.length}`, item.topic)}
      <section class="panel"><div id="oral-clock" class="tag clock" ${attempt.end ? '' : 'hidden'}></div><h2>${escape(item.prompt)}</h2>
      <label>Ghi ý trả lời nếu muốn<textarea id="oral-answer" rows="5" placeholder="Quy tắc · Tín hiệu · Ca thử · Giới hạn">${escape(attempt.answer)}</textarea></label>
      <details id="oral-rubric"><summary>Mở tiêu chí đối chiếu</summary>${oralRubric(item)}<div class="actions"><button id="oral-ok" type="button" class="button primary">Tự đánh giá đạt</button><button id="oral-review" type="button" class="button">Cần ôn lại</button></div></details></section>`;
  }

  function bindPractice() {
    if (!$('oral-answer')) return;
    $('oral-answer').addEventListener('input', () => { attempt.answer = $('oral-answer').value; });
    function rate(passed) {
      attempt.ratings.push(passed);
      attempt.answer = '';
      attempt.index += 1;
      if (attempt.index >= attempt.items.length) attempt.finished = true;
      render(true);
    }
    function clock() {
      if (!attempt.end) return;
      const seconds = Math.max(0, Math.ceil((attempt.end - Date.now()) / 1000));
      $('oral-clock').textContent = seconds ? `Còn ${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}` : 'Hết giờ · Bạn vẫn có thể tự đánh giá';
      if (!seconds) clearInterval(timerId);
    }
    $('oral-ok').addEventListener('click', () => rate(true));
    $('oral-review').addEventListener('click', () => rate(false));
    if (attempt.end) timerId = setInterval(clock, 250);
    clock();
  }

  let cardIndex = 0;
  function cardPage() {
    const cards = data.cards || [];
    const item = cards[cardIndex];
    if (!item) return missing();
    return `${page('Ôn nhanh', 'Flashcard', 'Tự nói câu trả lời trước khi lật thẻ.')}
      <section class="panel flashcard"><span class="tag">Thẻ ${cardIndex + 1} / ${cards.length}</span><h2>${escape(item.front)}</h2><details><summary>Lật thẻ</summary><p>${escape(item.back)}</p><a href="${lessonLink(item.lesson)}">Ôn ${escape(titleOf(item.lesson))}</a></details>
      <div class="actions"><button type="button" class="button" id="card-back">Thẻ trước</button><button type="button" class="button primary" id="card-next">Thẻ tiếp</button></div></section>`;
  }

  let importMessage = '';
  let importError = false;
  function progressPage() {
    return `${page('Tiến độ và dữ liệu', 'Tiến độ học của bạn', 'Sao lưu dấu đã học, bài gần nhất và giao diện vào một tệp JSON.')}
      <section class="panel"><h2>${progress.completed.length}/${lessons.length} bài đã học</h2><progress value="${progress.completed.length}" max="${lessons.length || 1}" aria-label="Số bài đã học"></progress>
      <ul class="progress-lessons">${lessons.map((item) => `<li><a href="${lessonLink(item.id)}">${escape(item.title)}</a><span class="tag ${progress.completed.includes(item.id) ? 'success' : ''}">${progress.completed.includes(item.id) ? 'Đã học' : 'Chưa đánh dấu'}</span></li>`).join('')}</ul></section>
      <section class="panel"><h2>Bản sao lưu</h2><p>Nhập một bản hợp lệ sẽ thay thế tiến độ trên trang. Xuất bản sao trước nếu muốn giữ tiến độ hiện tại.</p><div class="actions"><button id="export" class="button primary" type="button">Xuất JSON</button><label for="import" class="button file-button">Nhập JSON<input id="import" type="file" accept=".json,application/json"></label></div>
      <p id="import-status" class="${importError ? 'error' : 'muted'}" role="status">${escape(importMessage || (stored ? 'Tiến độ được lưu trong trình duyệt trên đường dẫn này.' : 'Trình duyệt chưa lưu được tiến độ. Hãy xuất JSON trước khi đóng trang.'))}</p></section>`;
  }

  function progressBind() {
    $('export').addEventListener('click', () => {
      const blob = new Blob([`${JSON.stringify(progress, null, 2)}\n`], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'ktmt-studio-tien-do.json';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      importError = false;
      importMessage = 'Đã gửi tệp JSON tới trình tải xuống.';
      $('import-status').className = 'muted';
      $('import-status').textContent = importMessage;
    });
    $('import').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        if (file.size > 256_000) throw new Error('Tệp tiến độ lớn hơn 256 KB.');
        let parsed;
        try { parsed = JSON.parse(await file.text()); } catch { throw new Error('Không đọc được JSON trong tệp.'); }
        progress = validateProgress(parsed);
        save();
        importError = false;
        importMessage = stored ? 'Đã nhập và lưu tiến độ.' : 'Đã nhập cho phiên này. Trình duyệt chưa lưu được tiến độ.';
      } catch (error) {
        importError = true;
        importMessage = `${error.message} Tiến độ hiện tại được giữ nguyên.`;
      }
      if (location.hash === '#progress') render();
      $('announce').textContent = importMessage;
    });
  }

  applyTheme();
  render();
})();
