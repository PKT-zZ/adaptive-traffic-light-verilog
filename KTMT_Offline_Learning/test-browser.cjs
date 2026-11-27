// QA website bằng Chrome DevTools Protocol với profile và thư mục tải tạm.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { spawn } = require('node:child_process');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { setTimeout: delay } = require('node:timers/promises');

const exe = process.env.KTMT_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const output = process.argv[2] ? path.resolve(process.argv[2]) : null;
const index = pathToFileURL(path.join(__dirname, 'index.html')).href;

async function eventually(fn, message) {
  for (let tries = 0; tries < 125; tries++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await delay(80);
  }
  throw new Error(message);
}

async function test() {
  const temp = await fs.mkdtemp(path.join(tmpdir(), 'ktmt-chrome-test-'));
  const downloads = path.join(temp, 'downloads');
  const profile = path.join(temp, 'profile');
  await fs.mkdir(downloads);
  if (output) await fs.mkdir(output, { recursive: true });
  const child = spawn(exe, ['--headless', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
  let failure;
  let ws;
  child.on('error', (error) => { failure = error; });
  try {
    const port = (await eventually(async () => {
      if (failure || child.exitCode !== null) throw failure || new Error(`Chrome thoát với mã ${child.exitCode}.`);
      return fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8');
    }, 'Chrome không mở cổng điều khiển kiểm thử.')).split('\n')[0].trim();
    const endpoint = `http://127.0.0.1:${port}`;
    const info = await (await fetch(`${endpoint}/json/version`)).json();
    const targets = await (await fetch(`${endpoint}/json/list`)).json();
    ws = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
    const pending = new Map();
    const exceptions = [];
    const resourceErrors = [];
    const remoteRequests = [];
    let id = 0;
    ws.addEventListener('message', ({ data }) => {
      const event = JSON.parse(data);
      if (event.id) {
        const handler = pending.get(event.id);
        pending.delete(event.id);
        if (event.error) handler?.reject(new Error(event.error.message));
        else handler?.resolve(event.result);
      }
      if (event.method === 'Runtime.exceptionThrown') exceptions.push(event.params.exceptionDetails);
      if (event.method === 'Network.requestWillBeSent' && /^https?:/.test(event.params.request.url)) remoteRequests.push(event.params.request.url);
      if (event.method === 'Network.loadingFailed' && !event.params.canceled) resourceErrors.push(event.params.errorText);
    });
    const cdp = (method, params = {}) => new Promise((resolve, reject) => {
      const nextId = ++id;
      pending.set(nextId, { resolve, reject });
      ws.send(JSON.stringify({ id: nextId, method, params }));
    });
    const evaluate = async (expression) => {
      const value = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (value.exceptionDetails) throw new Error(value.exceptionDetails.exception?.description || value.exceptionDetails.text);
      return value.result.value;
    };
    const click = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    const field = (selector, value, event = 'input') => evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); el.value=${JSON.stringify(value)}; el.dispatchEvent(new Event(${JSON.stringify(event)}, {bubbles:true})); })()`);
    const wait = (expr) => eventually(() => evaluate(expr), `Không đạt điều kiện ${expr}`);
    const route = async (hash) => {
      const encoded = JSON.stringify(`#${hash}`);
      await evaluate(`location.hash === ${encoded} ? true : new Promise((done) => {
        addEventListener('hashchange', () => done(true), {once:true});
        location.hash = ${encoded};
      })`);
      await wait(`location.hash === ${encoded} && !!document.querySelector('main h1')`);
    };
    const title = () => evaluate('document.querySelector("main h1").textContent');
    const size = (width, height, mobile = false) => cdp('Emulation.setDeviceMetricsOverride', { width, height, mobile, deviceScaleFactor: 1 });
    const capture = async (name) => {
      if (!output) return;
      const { data } = await cdp('Page.captureScreenshot', { format: 'png', fromSurface: true });
      await fs.writeFile(path.join(output, `${name}.png`), Buffer.from(data, 'base64'));
    };
    const userFile = async (file) => {
      const { root } = await cdp('DOM.getDocument');
      const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '#import' });
      await cdp('DOM.setFileInputFiles', { nodeId, files: [file] });
    };
    await cdp('Page.enable');
    await cdp('Runtime.enable');
    await cdp('Network.enable');
    await cdp('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    await cdp('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
    await size(1440, 900);
    await cdp('Page.navigate', { url: index });
    await wait('location.protocol === "file:" && !!document.querySelector(".hero")');
    assert.equal(await evaluate('navigator.onLine'), false);
    console.log(`${info.Browser} Windows · file:// · chế độ Offline đã xác nhận.`);
    await capture('desktop');

    const lessons = await evaluate('document.querySelectorAll(".lesson-row").length');
    assert.equal(lessons, 7);
    const lessonIds = await evaluate('[...document.querySelectorAll(".lesson-row")].map(a => a.hash.slice(1))');
    await click('.hero .primary');
    for (const [i, id] of lessonIds.entries()) {
      await wait(`document.querySelector('.sidebar a[aria-current="page"]').hash === ${JSON.stringify(`#${id}`)}`);
      assert.ok(await evaluate('document.querySelector("article.prose").textContent.trim().length > 1000 && !!document.querySelector("#complete")'));
      if (i < lessonIds.length - 1) await click('.lesson-bottom .primary');
    }
    await click('.lesson-bottom a');
    await wait(`document.querySelector('.sidebar a[aria-current="page"]').hash === ${JSON.stringify(`#${lessonIds.at(-2)}`)}`);
    console.log(`PASS ${lessons} bài học qua nút bắt đầu, bài tiếp và bài trước.`);

    const getSearch = async (query) => {
      await field('#search', query);
      return evaluate('[...document.querySelectorAll("#search-results a")].map(a=>a.hash)');
    };
    const accented = await getSearch('người đi bộ');
    assert.deepEqual(await getSearch('nguoi di bo'), accented);
    assert.ok(accented.includes('#lesson/nguoi-di-bo'));
    const d = await getSearch('đổi hướng');
    assert.ok(d.length);
    assert.deepEqual(await getSearch('doi huong'), d);
    assert.ok((await getSearch('ped_pending')).length);
    assert.equal((await getSearch('zz_no_match_zz')).length, 0);
    assert.match(await evaluate('document.querySelector("#search-results").textContent'), /Không tìm thấy/);
    await field('#search', 'nguoi di bo');
    await click('#search-results a[href="#lesson/nguoi-di-bo"]');
    await wait('location.hash === "#lesson/nguoi-di-bo" && document.querySelector("#complete")');
    assert.equal(await evaluate('document.getElementById("search-results").hidden'), true);
    console.log('PASS tìm có dấu/không dấu, đ/d, tín hiệu, không khớp và mở kết quả.');

    await click('#complete');
    await click('#theme');
    assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light');
    await cdp('Page.reload');
    await wait('document.querySelector("#complete")?.getAttribute("aria-pressed") === "true"');
    assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light');
    await route('progress');
    await click('#export');
    const backup = path.join(downloads, 'ktmt-studio-tien-do.json');
    const content = await eventually(() => fs.readFile(backup, 'utf8'), 'Chrome không tải tệp JSON.');
    assert.deepEqual(JSON.parse(content), { version: 1, theme: 'light', completed: ['nguoi-di-bo'], lastLesson: 'nguoi-di-bo' });
    if (output) await fs.writeFile(path.join(output, 'tien-do-xuat-trong-chrome.json'), content);
    await route('lesson/nguoi-di-bo'); await click('#complete'); await click('#theme'); await route('progress');
    await userFile(backup);
    await wait('document.querySelector("#import-status").textContent.includes("Đã nhập và lưu")');
    assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light');
    assert.match(await evaluate('document.querySelector("main .panel h2").textContent'), /1\/7/);
    for (const [name, val, expected] of [['hong.json', '{ghi sai', 'Không đọc được JSON'], ['sai-ma-bai.json', '{"version":1,"theme":"dark","completed":["khong-ton-tai"],"lastLesson":null}', 'mã bài học không hợp lệ']]) {
      const file = path.join(temp, name);
      await fs.writeFile(file, val);
      await userFile(file);
      await wait(`document.querySelector('#import-status').textContent.includes(${JSON.stringify(expected)})`);
      assert.equal(await evaluate('document.documentElement.dataset.theme'), 'light');
      assert.match(await evaluate('document.querySelector("main .panel h2").textContent'), /1\/7/);
    }
    await click('#export');
    const exportHasErrorStyle = await evaluate('document.querySelector("#import-status").classList.contains("error")');
    await cdp('Page.reload');
    await wait('document.querySelector("main .panel h2")?.textContent.includes("1/7")');
    console.log('PASS sáng/tối, lưu sau reload, tải tệp JSON thật, nhập lại và từ chối 2 tệp lỗi.');

    await route('code/rtl%2Ftraffic_controller.v/55');
    assert.match(await evaluate('document.querySelector(".selected-line").textContent'), /55\s+ped_pending<=0/);
    assert.equal(await evaluate('document.querySelectorAll("#code-file option").length'), 15);
    assert.ok(await evaluate('document.querySelector("#code-scroll").scrollTop > 0'));
    await field('#code-file', 'sim/tb_system.sv', 'change');
    await wait('location.hash.includes("tb_system.sv")');
    await field('#code-line', '61');
    await click('#line-form button');
    await wait('document.querySelector(".selected-line").id === "src-line-61"');
    assert.match(await evaluate('document.querySelector(".selected-line").textContent'), /\@\(posedge clk\);#1/);
    await evaluate('document.getElementById("code-scroll").scrollTop = 0');
    await click('#line-form button');
    assert.deepEqual({ exportHasErrorStyle, returnedToLine: await evaluate('document.getElementById("code-scroll").scrollTop > 0') }, { exportHasErrorStyle: false, returnedToLine: true });
    await click('.read-task summary');
    assert.ok(await evaluate('document.querySelector(".read-task details").open'));
    console.log('PASS xuất JSON sau nhập lỗi và trình đọc 15 tệp, kể cả nhảy lại dòng đang chọn.');

    await route('fsm');
    await click('#pulse');
    assert.match(await evaluate('document.querySelector(".readout").textContent'), /tick=0.*ped_pending/);
    assert.equal(await evaluate('document.querySelector("#pulse").disabled'), true);
    await field('#sim-mode', '1'); await click('#edge'); await click('#tick-step');
    assert.match(await evaluate('document.querySelector("#lab-live h2").textContent'), /A_GREEN/);
    assert.equal(await evaluate('document.querySelector("#lab-live .tag").textContent'), 'Cố định');
    await click('#reset-edge');
    assert.equal(await evaluate('document.querySelector("#lab-live .tag").textContent'), 'Thích ứng');
    await field('#qa', '7'); await field('#qb', '12');
    await click('#tick-step');
    for (let i = 0; i < 5; i++) await click('#tick-step');
    assert.match(await evaluate('document.querySelector("#lab-live h2").textContent'), /A_GREEN/);
    await click('#tick-step');
    assert.match(await evaluate('document.querySelector("#lab-live h2").textContent'), /A_YELLOW/);
    await click('#ped'); await click('#edge');
    assert.equal(await evaluate('document.querySelector("#pulse").disabled'), true);
    await click('#rst');
    assert.equal(await evaluate('document.querySelector("#tick-step").disabled'), true);
    await click('#edge');
    assert.match(await evaluate('document.querySelector("#lab-live h2").textContent'), /BOOT/);
    await click('#rst');
    await click('#edge');
    assert.match(await evaluate('document.querySelector(".readout").textContent'), /Chốt yêu cầu/);
    await field('#cycles', '1', 'change');
    assert.match(await evaluate('document.querySelector("#cycles").selectedOptions[0].textContent'), /Bộ chia/);
    await click('#rst');
    await click('#edge');
    const tickCells = await evaluate(`[...document.querySelectorAll('.lab-table tbody tr')].find(row => row.querySelector('th').textContent === 'tick').textContent`);
    assert.match(tickCells, /^tick000$/);
    await click('#rst');
    await click('#tick-step');
    assert.match(await evaluate('document.querySelector("#lab-live h2").textContent'), /A_GREEN/);
    await click('#clear-log');
    assert.equal(await evaluate('!!document.querySelector("#edge-log table")'), false);
    console.log('PASS FSM: cạnh và tick, 1/4 clock, ngưỡng xanh, giữ nút và reset, chốt mode, nhật ký.');

    await route('wave');
    const waveIds = await evaluate('[...document.querySelectorAll("#wave-select option")].map(o=>o.value)');
    assert.equal(waveIds.length, 4);
    for (const waveId of waveIds) {
      await field('#wave-select', waveId, 'change');
      const expectedTitle = await evaluate(`KTMT.waveExercises.find(item => item.id === ${JSON.stringify(waveId)}).title`);
      await wait(`document.querySelector('main .panel h2').textContent === ${JSON.stringify(expectedTitle)}`);
      assert.ok(await evaluate('!!document.querySelector(".wave-plot svg") && !!document.querySelector(".panel table tbody tr")'));
      assert.deepEqual(
        await evaluate('[...document.querySelectorAll(".wave-time")].map(node => Number(node.textContent))'),
        await evaluate(`KTMT.waveExercises.find(item => item.id === ${JSON.stringify(waveId)}).times`)
      );
      await click('.answer');
      await click('.solution summary');
      assert.ok(await evaluate('document.querySelector(".solution").open'));
    }
    await capture('dang-song');
    await route('compare');
    const scenarios = await evaluate('[...document.querySelectorAll("#scenario option")].map(o=>o.value)');
    assert.equal(scenarios.length, 4);
    for (const scenarioId of scenarios) {
      await field('#scenario', scenarioId, 'change');
      await wait(`location.hash === ${JSON.stringify(`#compare/${scenarioId}`)}`);
      assert.equal(await evaluate('document.querySelectorAll("main tbody tr").length'), 6);
      assert.equal(await evaluate('document.querySelectorAll(".bar").length'), 2);
      assert.match(await evaluate('document.querySelector(".source-line").textContent'), /20261123T143101Z-d50ee175/);
    }
    console.log('PASS 4 bài dạng sóng, 4 cặp kịch bản và dữ liệu run ID.');

    await route('quiz/nguoi-di-bo');
    const questionFirst = await evaluate('document.querySelector("[data-question]").dataset.question');
    const correct = await evaluate(`[...KTMT.coreQuiz, ...KTMT.evidenceQuiz, ...KTMT.defenseQuiz].find(item => item.id === ${JSON.stringify(questionFirst)}).correct`);
    await click(`[data-question] [data-answer="${(correct + 1) % 3}"]`);
    assert.match(await evaluate('document.querySelector(".feedback").textContent'), /Gợi ý/);
    assert.equal(await evaluate('document.querySelector(".solution").open'), false);
    await click('.solution summary');
    await click(`[data-question] [data-answer="${correct}"]`);
    assert.match(await evaluate('document.querySelector(".feedback").textContent'), /Chính xác/);
    await field('#quiz-filter', 'kiem-thu', 'change');
    await wait('location.hash === "#quiz/kiem-thu"');
    await route('defense');
    const counts = await evaluate('[...document.querySelector("#oral-scope").options].map(o=>o.value)');
    for (const scope of counts) {
      await field('#oral-scope', scope, 'change');
      assert.equal(await evaluate('document.querySelector("#defense-form [type=submit]").disabled'), false, scope);
    }
    await field('#oral-scope', 'role:1', 'change');
    await field('#oral-time', '3', 'change');
    await click('#defense-form [type=submit]');
    await wait('location.hash === "#defense/practice" && !!document.querySelector("#oral-answer")');
    assert.match(await evaluate('document.querySelector("#oral-clock").textContent'), /Còn 0[23]:/);
    await field('#oral-answer', 'Quy tắc → tín hiệu → kiểm thử → giới hạn.');
    for (let q = 0; q < 5; q++) {
      assert.match(await title(), new RegExp(`Câu ${q + 1} / 5`));
      await click('#oral-rubric summary');
      await click(q < 3 ? '#oral-ok' : '#oral-review');
    }
    assert.match(await title(), /Tổng kết/);
    assert.match(await evaluate('document.querySelector(".page-head p").textContent'), /3\/5/);
    assert.ok(await evaluate(`!!document.querySelector('.panel a[href^="#lesson/"]')`));
    await route('cards');
    await click('.flashcard summary');
    assert.match(await evaluate('document.querySelector(".flashcard .tag").textContent'), /1 \/ 12/);
    await click('#card-next');
    assert.match(await evaluate('document.querySelector(".flashcard .tag").textContent'), /2 \/ 12/);
    await click('#card-back');
    console.log('PASS quiz sai/đúng, gợi ý, lời giải, vai trò/chủ đề, đồng hồ, tổng kết 5 câu và 12 flashcard.');

    await click('#theme');
    for (const [width, height] of [[390, 844], [320, 640]]) {
      await size(width, height, true);
      for (const hash of ['home', ...lessonIds, 'fsm', 'code/rtl%2Ftraffic_controller.v/55', 'wave', 'compare', 'quiz', 'defense', 'cards', 'progress']) {
        await route(hash);
        const viewport = await evaluate('document.documentElement.clientWidth');
        const docWidth = await evaluate('document.documentElement.scrollWidth');
        assert.equal(viewport, width);
        assert.ok(docWidth <= viewport + 1, `${hash} tràn ngang ${docWidth}px tại ${viewport}px`);
      }
    }
    await route('home');
    await click('.hero a[href="#lesson/bao-ve"]');
    await wait('location.hash === "#lesson/bao-ve" && !!document.querySelector(\'main a[href="#code/rtl%2Fgreen_policy.v/11"]\')');
    await click('main a[href="#code/rtl%2Fgreen_policy.v/11"]');
    await wait('location.hash === "#code/rtl%2Fgreen_policy.v/11" && document.querySelector(".code-row.selected-line")?.id === "src-line-11"');
    console.log('PASS lối tắt từ trang chủ đến câu hỏi và đúng dòng green_policy.');
    await route('home');
    const ax = await cdp('Accessibility.getFullAXTree');
    assert.ok(ax.nodes.some((node) => node.role?.value === 'link' && node.name?.value === 'KTMT Studio, Tổng quan'));
    await size(390, 844, true);
    await capture('mobile');
    await click('#menu');
    assert.equal(await evaluate('document.querySelector("#menu").getAttribute("aria-expanded")'), 'true');
    await click('.sidebar a[href="#lesson/clock-fsm"]');
    await wait('location.hash === "#lesson/clock-fsm"');
    assert.equal(await evaluate('document.querySelector("#menu").getAttribute("aria-expanded")'), 'false');
    console.log('PASS bố cục 1440×900, 390×844 và 320×640, mục lục mobile và liên kết Tổng quan có tên truy cập.');
    assert.deepEqual(remoteRequests, []);
    assert.deepEqual(resourceErrors, []);
    assert.deepEqual(exceptions, []);
    console.log('PASS 0 request HTTP(S), 0 tài nguyên tải lỗi, 0 ngoại lệ JavaScript.');
  } finally {
    ws?.close();
    if (child.exitCode === null) {
      child.kill();
      await Promise.race([new Promise((resolve) => child.once('exit', resolve)), delay(2000)]);
    }
    await fs.rm(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 }).catch(() => {});
  }
}

test().catch((error) => { console.error(error); process.exitCode = 1; });
