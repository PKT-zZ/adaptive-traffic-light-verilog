(() => {
  const data = window.KTMT ??= {};

  data.defenseLessons = [{
    id: 'bao-ve',
    title: 'Bảo vệ và phản biện',
    summary: 'Tập trình bày thiết kế, chọn bằng chứng trong RTL và trả lời câu hỏi theo vai trò.',
    html: String.raw`
      <h2>Mở đúng đoạn mã khi được hỏi</h2>
      <p>Chọn câu hỏi, chỉ tín hiệu hoặc điều kiện trong mã, rồi nói điều gì xảy ra ở cạnh clock. Dùng testbench để chỉ kết quả quan sát.</p>
      <div class="table-scroll"><table>
        <caption>Đi thẳng tới mã và phép kiểm trong trình đọc offline</caption>
        <thead><tr><th scope="col">Câu hỏi</th><th scope="col">RTL hoặc mô hình</th><th scope="col">Đối chiếu</th></tr></thead>
        <tbody>
          <tr><th scope="row">Vì sao hai hướng không cùng xanh?</th><td><a href="#code/rtl%2Ftraffic_controller.v/62">Giải mã đèn từ state</a></td><td><a href="#code/sim%2Ftb_top.sv/13">So đúng cặp đèn A/B</a></td></tr>
          <tr><th scope="row">Khi nào được kết thúc xanh?</th><td><a href="#code/rtl%2Fgreen_policy.v/11">Điều kiện cố định và thích ứng</a></td><td><a href="#code/sim%2Ftb_controller.sv/69">Kiểm cận dưới và trên</a></td></tr>
          <tr><th scope="row">Một tick được tạo ở đâu?</th><td><a href="#code/rtl%2Fsecond_tick.v/7">Điều kiện tạo tick tại bộ chia</a></td><td><a href="#code/sim%2Ftb_top.sv/27">Kiểm thời lượng với bộ chia 4</a></td></tr>
          <tr><th scope="row">Bấm giữa hai tick có mất yêu cầu không?</th><td><a href="#code/rtl%2Ftraffic_controller.v/49">Chốt nút ở mỗi clock</a></td><td><a href="#code/sim%2Ftb_controller.sv/62">Ca giữ thời gian khi tick bằng 0</a></td></tr>
          <tr><th scope="row">Sau đi bộ, hướng nào nhận lượt?</th><td><a href="#code/rtl%2Ftraffic_controller.v/55">Lưu resume_b</a> và <a href="#code/rtl%2Ftraffic_controller.v/39">chọn khi rời CLEAR</a></td><td><a href="#code/sim%2Ftb_controller.sv/75">Kiểm đi bộ và trở lại đúng hướng</a></td></tr>
          <tr><th scope="row">Xe rời hàng đợi vào lúc nào?</th><td><a href="#code/sim%2Fqueue_model.v/12">Điều kiện departed</a></td><td><a href="#code/sim%2Ftb_system.sv/32">Mô hình tham chiếu trong test</a></td></tr>
        </tbody>
      </table></div>

      <h2>Mở đầu khoảng 2 phút</h2>
      <p><strong>0:00–0:30 · Bài toán.</strong> Nhóm em mô phỏng một nút giao hai hướng đi thẳng. Bộ điều khiển Verilog nhận số xe chờ cho từng hướng và yêu cầu đi bộ, rồi điều khiển đèn đỏ, vàng, xanh. Mục tiêu là so sánh hai chế độ trên cùng lưu lượng và giữ đúng thứ tự chuyển pha.</p>
      <p><strong>0:30–1:05 · Thiết kế.</strong> Bộ chia tạo tín hiệu tick trên clock chung. FSM có chín trạng thái. Khi chuyển hướng, xe đi qua pha vàng và đỏ toàn phần. Chế độ cố định dùng 12 tick xanh. Chế độ thích ứng cho phép kết thúc từ tick thứ sáu khi hàng đối diện đông hơn và bắt buộc kết thúc ở tick thứ 20.</p>
      <p><strong>1:05–1:35 · Người đi bộ.</strong> Một cạnh lên của nút đã được lấy mẫu có thể được giữ trong <code>ped_pending</code> giữa hai tick. FSM xét yêu cầu ở cuối đỏ toàn phần sau pha xe. Xe hai hướng đều đỏ trong WALK và CLEAR. <code>resume_b</code> ghi hướng sẽ đi tiếp.</p>
      <p><strong>1:35–2:00 · Bằng chứng.</strong> Nhóm em sẽ đo một chu trình trên dạng sóng và đối chiếu một ca trong testbench. Bảng kết quả của lượt nộp cho thấy ở ca A đông, chế độ thích ứng phục vụ 219 xe so với 167 xe. Ở ca cân bằng, đổi pha thường xuyên làm giảm thời gian xanh. Các kết quả thuộc mô hình học tập trong cửa sổ 600 tick mỗi lượt.</p>
      <p class="source-line">Đối chiếu <code>rtl/traffic_controller.v</code>, khối chuyển trạng thái và chốt, dòng 16–64 · <code>rtl/green_policy.v</code>, khối quyết định, dòng 3–14 · <code>docs/KET_QUA.md</code>, dòng 3–16 và 25–32.</p>

      <h2>Ba lượt luyện rút gọn</h2>
      <div class="table-scroll"><table>
        <caption>Thời lượng gồm trình bày và trình diễn</caption>
        <thead><tr><th scope="col">Thời lượng</th><th scope="col">Thứ tự</th><th scope="col">Bằng chứng cần mở</th></tr></thead>
        <tbody>
          <tr><th scope="row">3 phút</th><td>0:00–0:40 phạm vi và sơ đồ. 0:40–1:40 chu trình A sang B và thời lượng. 1:40–2:25 quy tắc xanh và một tình huống nút. 2:25–3:00 đọc hai cặp số liệu, chốt giới hạn.</td><td>Sơ đồ khối → một đoạn controller.vcd → bảng ca cân bằng và A đông.</td></tr>
          <tr><th scope="row">5 phút</th><td>0:00–1:00 thiết kế. 1:00–2:15 đo pha và chỉ <code>elapsed</code>. 2:15–3:00 chốt nút và xem một phép kiểm ở wrapper. 3:00–4:00 so sánh hai ca. 4:00–5:00 giới hạn và hướng kiểm thử phần cứng.</td><td>controller.vcd → tb_top.sv dòng 9–24, 28–40 và log tương ứng → bảng kết quả.</td></tr>
          <tr><th scope="row">10 phút</th><td>0:00–2:00 mở đầu. 2:00–3:30 luồng dữ liệu và thứ tự cập nhật. 3:30–5:00 đo FSM. 5:00–6:30 cạnh nút, WALK và CLEAR. 6:30–8:00 phân tích hai chế độ. 8:00–9:00 ma trận kiểm thử. 9:00–10:00 phạm vi và phần cứng.</td><td>RTL → controller.vcd → demo.vcd và trace.csv → metrics.csv → log và run.json.</td></tr>
        </tbody>
      </table></div>
      <p class="source-line">Kịch bản biên soạn cho bài học, dựa trên <code>docs/DEMO_VA_TIEN_DO.md</code>, dòng 21–39.</p>

      <h2>Thứ tự demo và phương án dự phòng</h2>
      <ol>
        <li>Đứng ở gốc checkout <code>adaptive-traffic-light-verilog</code>. Chạy <code>.\scripts\run.ps1</code> và kiểm tra <code>Validated run published</code>, <code>build/run.json</code>, bốn log và <code>build/KET_QUA.md</code> cùng lượt chạy. README gọi thư mục gốc là <code>traffic_project</code> ở dòng 7 và 19. Trên workspace này, dùng thư mục checkout thực tế. Script tự chuyển về gốc theo vị trí của nó.</li>
        <li>Mở <code>build/controller.vcd</code> với tín hiệu trong <code>tb_controller</code>. Đặt hai con trỏ ở biên pha và đo hiệu thời gian. Theo dõi <code>state</code>, <code>lights_a/b</code>, <code>elapsed</code> và <code>tick</code>. Tìm A xanh → A vàng → hai đỏ → B xanh, sau đó tìm một đoạn có <code>ped_pending</code> và <code>walk</code>.</li>
        <li><code>.\scripts\run.ps1 -Wave</code> chạy lại rồi mở <code>build/demo.vcd</code> với <code>demo.gtkw</code>. Giữ cùng run ID khi trình bày. Cột <code>scenario</code>, <code>adaptive</code>, <code>second</code> trong <code>trace.csv</code> xác định lượt và hàng cần xem. Trên <code>tb_system</code>, 10 ns giữa hai cạnh lên biểu diễn 1 tick của mô hình. Mốc <code>second</code> bắt đầu lại từ 0 ở mỗi lượt.</li>
        <li>Nếu GTKWave có sẵn nhưng cửa sổ chưa mở, mở VCD thủ công. Dùng <code>demo.gtkw</code> cho <code>demo.vcd</code>, và tự thêm nhóm <code>tb_controller</code> cho <code>controller.vcd</code>. Nếu thiếu GTKWave, trình bày các dòng <code>trace.csv</code> quanh một lần đổi pha, bảng <code>metrics.csv</code> và log của chính lượt đó. Có thể tập trước bằng <a href="#wave">bài dạng sóng</a> và <a href="#fsm">mô hình FSM trên web</a>. Khi trình bày mô hình web, gọi đúng nhãn JavaScript hoặc timeline minh họa.</li>
        <li>Khi máy trình bày thiếu Icarus, ghi lượt chạy tại chỗ là <strong>NOT RUN</strong>. Với bằng chứng lưu sẵn, đọc đường dẫn và run ID của chính tệp. Số 95.986 thuộc lượt nộp <code>20261121T091158Z-945dda53</code> và đếm số lượt đánh giá điều kiện.</li>
      </ol>
      <p class="source-line">Đối chiếu <code>scripts/run.ps1</code>, dòng 1–14 · <code>README.md</code>, dòng 7–27 và 76–78 · <code>demo.gtkw</code>, dòng 5 và 17–30 · <code>sim/tb_system.sv</code>, dòng 1–4 và 93–131 · <code>docs/KET_QUA.md</code>, dòng 34–44.</p>

      <h2>Luyện riêng theo vai trò</h2>
      <div class="table-scroll"><table>
        <caption>Phân công trình bày theo tài liệu nhóm</caption>
        <thead><tr><th scope="col">Người trình bày</th><th scope="col">Việc cần làm thử</th><th scope="col">Ca làm bằng chứng</th></tr></thead>
        <tbody>
          <tr><th scope="row">Thành viên 1 · FSM</th><td>Tự vẽ chu trình qua AFTER_A/B. Chỉ <code>state</code>, <code>next_state</code>, <code>resume_b</code> và giải mã hai bộ đèn. Nói miệng đường đi nếu có WALK.</td><td>Reset từ chín trạng thái, <code>sim/tb_controller.sv</code> dòng 88–95.</td></tr>
          <tr><th scope="row">Thành viên 2 · Dữ liệu xe và chính sách</th><td>Giải quyết ba trường hợp min, bằng nhau, max. Truy vết xe đến/đi cùng cạnh. So sánh ca cân bằng và A đông.</td><td>Điều kiện xanh, <code>sim/tb_controller.sv</code> dòng 68–74. Tiến trình hàng đợi, <code>sim/tb_system.sv</code> dòng 137–148.</td></tr>
          <tr><th scope="row">Thành viên 3 · Thời gian</th><td>Tính 4 clock/tick và 48 clock xanh cố định. Đo trên dạng sóng và giải thích mốc <code>elapsed = 11</code> trước cạnh cuối.</td><td>Kiểm chính xác biên chu kỳ, <code>sim/tb_top.sv</code> dòng 28–34.</td></tr>
          <tr><th scope="row">Thành viên 4 · Tích hợp đèn và đi bộ</th><td>Chỉ cổng wrapper, chỗ bắt cạnh nút và nhánh ưu tiên vào WALK. Diễn hai ca tiếp tục sau A và B.</td><td>Xung giữa hai tick, <code>sim/tb_top.sv</code> dòng 35–40. WALK/CLEAR, <code>sim/tb_controller.sv</code> dòng 75–87.</td></tr>
          <tr><th scope="row">Thành viên 5 · Kiểm thử và demo</th><td>Mở log theo run ID, nói nhiệm vụ của bốn bench và diễn giải một cặp số liệu. Thực hành dự phòng bằng CSV.</td><td>Bốn cặp đối đầu và seed cố định, <code>sim/tb_system.sv</code> dòng 150–161.</td></tr>
        </tbody>
      </table></div>
      <p class="source-line">Đối chiếu <code>docs/HIEU_CODE_VA_PHAN_CONG.md</code>, dòng 7–43.</p>

      <h2>Trả lời theo bốn bước</h2>
      <ol>
        <li><strong>Quy tắc.</strong> Nói kết quả trong một câu. Ví dụ, một trạng thái hợp lệ chỉ cho phép tối đa một hướng xanh.</li>
        <li><strong>Module và tín hiệu.</strong> Chỉ <code>traffic_controller</code>, <code>state</code>, <code>lights_a[0]</code> và <code>lights_b[0]</code>. Hai bit xanh đòi hỏi hai giá trị <code>state</code> khác nhau.</li>
        <li><strong>Ca thử.</strong> Chỉ phép kiểm hai hướng xanh ở <code>sim/tb_system.sv</code> dòng 64, sau cạnh clock và thời gian chờ cập nhật ở dòng 61.</li>
        <li><strong>Giới hạn.</strong> Bằng chứng bao gồm cấu trúc RTL và mẫu quan sát trong mô phỏng. Phạm vi phần cứng cần kiểm chứng timing, đầu vào vật lý và công cụ xác minh riêng.</li>
      </ol>
      <div class="callout"><p>Phạm vi hiện tại là mô phỏng học tập với hai hướng đi thẳng. Các bước mở rộng gồm cảm biến thật, đồng bộ và lọc dội, tổng hợp và kiểm tra timing FPGA, kiểm chứng hình thức, xe ưu tiên và rẽ trái. Với FPGA, xác định bo mạch và tần số, cấu hình bộ chia, ràng buộc chân và clock, tổng hợp, triển khai, kiểm tra timing và xác nhận trên phần cứng.</p></div>
      <p class="source-line">Đối chiếu <code>rtl/traffic_controller.v</code>, giải mã đầu ra, dòng 62–64 · <code>sim/tb_system.sv</code>, task step, dòng 61–67 · <code>README.md</code>, dòng 70–74.</p>
      <p><a href="#defense">Bắt đầu bảo vệ thử</a> · <a href="#compare">Mở bảng so sánh</a> · <a href="#lesson/kiem-thu">Ôn bằng chứng kiểm thử</a></p>
    `
  }];

  data.roles = [
    { id: 1, name: 'Thành viên 1', title: 'FSM', scope: 'Trạng thái, giải mã đèn, hướng tiếp theo và reset.' },
    { id: 2, name: 'Thành viên 2', title: 'Dữ liệu xe và chính sách', scope: 'Hàng đợi, điều kiện kết thúc xanh và đánh giá hai chế độ.' },
    { id: 3, name: 'Thành viên 3', title: 'Thời gian', scope: 'Bộ chia, tick, elapsed, remaining và đo dạng sóng.' },
    { id: 4, name: 'Thành viên 4', title: 'Tích hợp đèn và đi bộ', scope: 'Wrapper, lấy mẫu nút, WALK/CLEAR và chuẩn bị tích hợp.' },
    { id: 5, name: 'Thành viên 5', title: 'Kiểm thử và demo', scope: 'Testbench, log, CSV, bằng chứng và kịch bản trình bày.' }
  ];

  data.defenseQuiz = [
    {
      id: 'bv-dem-check', lesson: 'bao-ve',
      prompt: 'Một người nói dự án có 95.986 kịch bản thử độc lập. Bạn sửa câu đó thế nào?',
      options: ['Đó là số clock của mọi mô phỏng.', 'Đó là tổng lượt đánh giá điều kiện trong bốn bench của lượt nộp.', 'Đó là số cặp chạy cố định và thích ứng.', 'Đó là số lượt hệ thống đã chạy trên FPGA.'],
      correct: 1,
      hint: 'Xem tên cột trong bảng kiểm thử và dòng giải thích ngay dưới bảng.',
      explanation: '95.986 là tổng các bộ đếm checks được báo trong bốn nhóm của lượt nộp 20261121T091158Z-945dda53. Kịch bản là một đơn vị đầu vào và có thể kích hoạt nhiều phép kiểm.',
      evidence: 'docs/KET_QUA.md, dòng 3 và 34–50.'
    },
    {
      id: 'bv-phuong-an', lesson: 'bao-ve',
      prompt: 'Máy demo đọc được CSV nhưng thiếu GTKWave. Bạn trình bày thế nào?',
      options: ['Sử dụng hình của một lượt bất kỳ và đọc run ID mới nhất.', 'Chạy FSM web và gọi đó là dạng sóng VCD.', 'Chọn các dòng trace.csv quanh cạnh cần nói, đối chiếu RTL và log của cùng lượt chạy.', 'Kết luận tất cả bench thất bại.'],
      correct: 2,
      hint: 'Phân biệt công cụ hiển thị với dữ liệu mô phỏng.',
      explanation: 'Các cột scenario, adaptive và second giúp khoanh đoạn. state, lights và pending giúp giải thích hành vi. Ghép run.json và log đúng lượt để kết luận về mô phỏng.',
      evidence: 'docs/DEMO_VA_TIEN_DO.md, dòng 5–19 · sim/tb_system.sv, task scenario, dòng 106–121.'
    },
    {
      id: 'bv-pham-vi', lesson: 'bao-ve',
      prompt: 'Phát biểu nào đúng với bằng chứng hiện có?',
      options: ['Mọi phần cứng sẽ hết dội vì có button_prev.', 'Đã chạy sóng VCD nên timing FPGA đã đạt.', 'Kết quả test cho thấy thuật toán tối ưu với mọi phân bố xe.', 'Testbench kiểm các ca đã chạy. Đồng bộ vật lý và timing FPGA cần kiểm riêng.'],
      correct: 3,
      hint: 'Xác định loại công cụ tạo VCD và giả định tín hiệu đầu vào.',
      explanation: 'VCD ghi thay đổi tín hiệu mô phỏng. Trên bo mạch, clock, chân, đồng bộ đầu vào và chống dội vẫn cần thiết kế, ràng buộc và xác nhận.',
      evidence: 'README.md, phần giới hạn, dòng 70–74.'
    }
  ];

  data.oral = [
    {
      id: 'oral-hai-xanh', topic: 'FSM', roles: [1, 4, 5], lesson: 'clock-fsm',
      prompt: 'Nếu giảng viên hỏi hai hướng có thể cùng xanh không, bạn sẽ chỉ tín hiệu và phép kiểm nào?',
      criteria: ['Ở trạng thái ổn định, mỗi bit xanh chỉ bật ở trạng thái xanh dành cho một hướng.', 'Chỉ hai phép gán lights_a/lights_b giải mã cùng một thanh ghi state.', 'Nêu phép kiểm sau cạnh clock ở tb_system, rồi giới hạn kết luận ở mô hình RTL và các mẫu đã kiểm.'],
      pitfalls: ['Dựa vào màu hiển thị mà bỏ mã 001, 010, 100.', 'Dùng kết quả mô phỏng như chứng minh hình thức hoặc như bằng chứng timing phần cứng.'],
      evidence: 'rtl/traffic_controller.v, giải mã, dòng 62–64 · sim/tb_system.sv, task step, dòng 61–67.',
      followup: 'Cặp đèn có giá trị nào trong PED_WALK và PED_CLEAR?'
    },
    {
      id: 'oral-after', topic: 'FSM', roles: [1, 4], lesson: 'clock-fsm',
      prompt: 'AFTER_A và AFTER_B cùng đỏ cả hai hướng. Vì sao FSM vẫn dành hai mã riêng?',
      criteria: ['AFTER_A là đỏ sau A và hướng thường kế tiếp là B. AFTER_B có quy tắc ngược lại.', 'Khi vào WALK, FSM lấy state cũ để ghi resume_b cho đường ra CLEAR.', 'Nêu ca kiểm tiếp tục sau cả A và B.'],
      pitfalls: ['Đoán resume_b theo hướng vừa chạy.', 'Gộp hai trạng thái mà bỏ thông tin cần cho đường đi sau CLEAR.'],
      evidence: 'rtl/traffic_controller.v, khối chuyển và chốt, dòng 29–39, 52–56 · sim/tb_controller.sv, dòng 75–82.',
      followup: 'Nếu thiết kế dùng một trạng thái đỏ chung, cần lưu thêm thông tin gì?'
    },
    {
      id: 'oral-next-state', topic: 'FSM', roles: [1, 3], lesson: 'clock-fsm',
      prompt: 'A đang xanh thích ứng và hàng B vừa lớn hơn. Khi nào state thực sự đổi?',
      criteria: ['Khi đủ ngưỡng min, end_a và next_state có thể đổi qua logic tổ hợp ngay khi đầu vào ổn định.', 'State chỉ nhận next_state tại cạnh lên có tick=1 và rst=0.', 'Nếu queue thay đổi trước cạnh kế tiếp thì điều kiện được tính lại trước cạnh đó.'],
      pitfalls: ['Dùng cạnh của tick làm clock.', 'Đồng nhất next_state với state và đèn đầu ra.'],
      evidence: 'rtl/traffic_controller.v, dòng 20–31 và 43–64 · sim/tb_controller.sv, dòng 62–74.',
      followup: 'Với elapsed=5 và qa=2, qb=7, dự đoán đèn trước và sau cạnh tick.'
    },
    {
      id: 'oral-boot', topic: 'FSM', roles: [1, 4], lesson: 'nguoi-di-bo',
      prompt: 'Người đi bộ bấm lần đầu khi FSM ở BOOT. Có thể nhìn thấy WALK ngay sau BOOT không?',
      criteria: ['Khi rst=0, cạnh nút được bắt trong BOOT.', 'Nhánh BOOT đi A_GREEN sau đủ đỏ, yêu cầu vẫn chờ.', 'Yêu cầu được phục vụ sau A xanh, A vàng và AFTER_A.'],
      pitfalls: ['Dùng cùng quy tắc AFTER_A cho BOOT.', 'Nói yêu cầu trong BOOT bị bỏ qua.'],
      evidence: 'rtl/traffic_controller.v, dòng 18–19, 29–33 và 43–56 · sim/tb_controller.sv, dòng 83–87 và 96–101.',
      followup: 'Với nút còn cao ở cạnh đầu tiên sau reset và tick=0, state và ped_pending bằng gì?'
    },
    {
      id: 'oral-reset-state', topic: 'FSM', roles: [1, 3, 4], lesson: 'nguoi-di-bo',
      prompt: 'Đang WALK thì rst lên 1 giữa hai cạnh clock. Khi nào đổi trạng thái và các đầu ra chính là gì?',
      criteria: ['Reset đồng bộ, nhánh reset được thực hiện tại cạnh lên khi rst=1 và có ưu tiên trước tick.', 'Sau cạnh đó: BOOT, elapsed=0, hai đèn đỏ, walk=0, pending=0 và mode_active lấy mode_select.', 'Chỉ vòng kiểm reset từ mọi trạng thái trong tb_controller.'],
      pitfalls: ['Cho WALK tắt ngay khi rst đổi giữa hai cạnh.', 'Chờ một cạnh tick mới reset.'],
      evidence: 'rtl/traffic_controller.v, dòng 43–64 · sim/tb_controller.sv, dòng 88–95.',
      followup: 'Mode_select đổi trong khi giữ rst qua ba cạnh. Giá trị cuối cùng được chọn ở đâu?'
    },
    {
      id: 'oral-min-max', topic: 'Chính sách và hàng đợi', roles: [2], lesson: 'thich-ung',
      prompt: 'A đang xanh thích ứng, queue_a=3 và queue_b=8. Dự đoán sau các điểm elapsed=4, 5 và 19 ở ba ca độc lập.',
      criteria: ['elapsed=4: cạnh đang hoàn tất tick thứ năm, giữ xanh.', 'elapsed=5: tick thứ sáu và B đông hơn, chuyển A_YELLOW.', 'elapsed=19: tick thứ 20 phải kết thúc, kể cả khi A đông hơn hoặc hai bên bằng nhau.'],
      pitfalls: ['Đổi ở elapsed=6 mới xét đủ sáu tick.', 'Dùng >= để so hai hàng đợi trong nhánh so tải.'],
      evidence: 'rtl/green_policy.v, khối assign, dòng 11–14 · sim/tb_controller.sv, dòng 68–74.',
      followup: 'Nếu cả hai hàng đợi cùng bằng 0 từ tick thứ sáu đến hết pha, pha xanh kết thúc ở tick thứ mấy?'
    },
    {
      id: 'oral-level', topic: 'Chính sách và hàng đợi', roles: [2, 4], lesson: 'so-do',
      prompt: 'A có 4, B có 9 xe. Hai level đều là 2. Ở tick thứ sáu của A xanh thích ứng, có chuyển pha không?',
      criteria: ['Có, vì 9 > 4 và đã chạm min.', 'demand_level phục vụ quan sát tại testbench.', 'Hai instance pa và pb nhận mode_active, elapsed và số xe 8 bit. Thứ tự hai hàng đợi được đảo theo hướng đang xét.'],
      pitfalls: ['So hai level để kết luận hòa tải.', 'Gán demand_level vào đường điều khiển của wrapper.'],
      evidence: 'rtl/demand_level.v, dòng 3–4 · rtl/green_policy.v, dòng 8–14 · rtl/traffic_controller.v, dòng 21–24 · sim/tb_system.sv, dòng 9–13.',
      followup: 'Tại sao instance pb lại nhận queue_b trước queue_a?'
    },
    {
      id: 'oral-queue-edge', topic: 'Chính sách và hàng đợi', roles: [2, 3, 5], lesson: 'thich-ung',
      prompt: 'Tại cạnh cuối A xanh, A có 2 xe và đủ thời gian phục vụ, đồng thời có 3 xe đến A. Mô hình cập nhật gì?',
      criteria: ['Phục vụ dựa vào đèn A xanh và queue trước cạnh. Có một xe rời.', 'Sau cạnh queue A bằng 2+3−1=4. Chính sách đã ra quyết định với số xe cũ.', 'Chỉ mô hình tham chiếu lấy mẫu trước cạnh và kiểm lại sau cạnh.'],
      pitfalls: ['Dùng màu vàng vừa xuất hiện sau cạnh để hủy xe rời ở cạnh đó.', 'Đưa ngay queue=4 vào quyết định FSM ở chính cạnh cập nhật.'],
      evidence: 'sim/queue_model.v, dòng 10–20 · rtl/green_policy.v, dòng 6–14 · sim/tb_system.sv, dòng 54–64 và 141–148.',
      followup: 'Nếu trước cạnh queue=0 mà có 3 xe tới, queue và departed ở cạnh đó là gì?'
    },
    {
      id: 'oral-overflow', topic: 'Chính sách và hàng đợi', roles: [2, 5], lesson: 'thich-ung',
      prompt: 'Nếu queue=254, có 3 xe đến và một xe đi, số xe mô hình lưu và tín hiệu overflow là gì?',
      criteria: ['Tính bằng biến trung gian: 254+3−1=256.', 'Sau cạnh tick, queue=255 và overflow=1 vì kết quả vượt giới hạn 8 bit.', 'So sánh trong bốn kịch bản kiểm điều kiện hàng không bão hòa.'],
      pitfalls: ['Để giá trị quay vòng về 0.', 'Coi overflow là cờ dính mãi qua các tick.'],
      evidence: 'sim/queue_model.v, dòng 11–20 · sim/tb_system.sv, dòng 69–70 và 137–143.',
      followup: 'Nếu tick tiếp theo phép tính `updated` cho 255 thì overflow thay đổi thế nào?'
    },
    {
      id: 'oral-credit-loss', topic: 'Chính sách và hàng đợi', roles: [2, 5], lesson: 'thich-ung',
      prompt: 'A có xe, vừa tích lũy một tick phục vụ thì chuyển vàng. Khi A được xanh lại, cần bao nhiêu tick đủ điều kiện để xe đầu tiên rời?',
      criteria: ['Một tick không xanh xóa service_elapsed. Giả định hàng luôn có ít nhất một xe trước mỗi cạnh đang xét.', 'A cần hai tick xanh đủ điều kiện mới có xe rời. Tick xanh đầu tích lũy, tick xanh thứ hai cho departed=1.', 'Nêu ca ngắt giữa chừng trong tb_system và lý do nhiều lần đổi pha làm giảm cơ hội phục vụ.'],
      pitfalls: ['Mang một tick phục vụ dở qua pha vàng và đỏ.', 'Tính thời gian phục vụ theo số clock thay vì tick.'],
      evidence: 'sim/queue_model.v, dòng 10–17 · sim/tb_system.sv, dòng 144–148.',
      followup: 'Nếu A mới nhận xe khi queue trước cạnh bằng 0, cạnh đó có được tính là tick phục vụ đầu tiên không?'
    },
    {
      id: 'oral-fairness', topic: 'Đánh giá', roles: [1, 2, 5], lesson: 'kiem-thu',
      prompt: 'A luôn có hàng dài hơn B. Giả sử tick vẫn đều và reset giữ ở 0. B có thể bị bỏ qua vô hạn không? Bạn sẽ nói gì về công bằng?',
      criteria: ['A xanh thích ứng bị chặn ở 20 tick. FSM vẫn luân phiên A và B, kể cả khi chèn WALK/CLEAR.', 'Chỉ nhánh AFTER_A và resume_b rồi phân biệt được lượt xanh với được phục vụ từng xe.', 'Nêu max_red_wait_a/b đo khoảng có xe chờ và chưa xanh trong cửa sổ, và ngưỡng kiểm ≤40 chỉ áp dụng các ca so sánh.'],
      pitfalls: ['Suy ra mỗi xe chờ tối đa 40 giây từ ca thử.', 'Coi thời lượng xanh của hai hướng luôn bằng nhau.'],
      evidence: 'rtl/green_policy.v, dòng 11–14 · rtl/traffic_controller.v, dòng 29–39 và 54–56 · sim/tb_system.sv, dòng 111–120.',
      followup: 'Khi xe vẫn chờ trong một tick đèn xanh, max_red_wait còn tăng không?'
    },
    {
      id: 'oral-balance', topic: 'Đánh giá', roles: [2, 5], lesson: 'kiem-thu',
      prompt: 'Tại sao ca cân bằng của lượt nộp có 240 xe đến ở cả hai chế độ nhưng chế độ thích ứng phục vụ ít hơn?',
      criteria: ['Trong lượt nộp, cố định phục vụ 213, thích ứng 161; còn chờ lần lượt 27 và 79.', 'Hai dòng đến cân bằng về tổng vẫn có thể lệch tức thời. So sánh queue tạo thêm lần kết thúc xanh sớm, mỗi lần đổi pha cần vàng và đỏ.', 'Đánh giá trong cửa sổ 600 tick, với cùng lịch xe, lịch nút và mô hình phục vụ.'],
      pitfalls: ['Coi cân bằng là hai queue bằng nhau tại mọi tick.', 'Dùng kết quả này để xếp hạng mọi kiểu lưu lượng.'],
      evidence: 'docs/KET_QUA.md, dòng 3–12 và 25–32 · docs/DEMO_VA_TIEN_DO.md, dòng 35 · sim/tb_system.sv, dòng 99–106.',
      followup: 'Ca A đông cho kết quả khác thế nào, và bạn đọc thêm cột nào ngoài số xe đi?'
    },
    {
      id: 'oral-shift-scenario', topic: 'Đánh giá', roles: [2, 5], lesson: 'kiem-thu',
      prompt: 'Ca đổi hướng của lượt nộp ghi thích ứng có 0 xe còn chờ nhưng area=22.009. Hai số có phù hợp với nhau không?',
      criteria: ['Có. Final queue là mẫu cuối, còn area cộng hàng đợi ở mọi mẫu, kể cả thời gian trước khi hàng được phục vụ hết.', 'Lịch kịch bản có xe đến A ở 200 tick đầu, B ở 200 tick tiếp theo và không thêm xe ở 200 tick cuối.', 'Đối chiếu chế độ cố định: còn 27 xe, area=33.264, cùng 200 xe đến trong 600 tick.'],
      pitfalls: ['Đọc final queue=0 như mọi tick đều rỗng.', 'Đọc 22.009 như hàng đợi tại một thời điểm hoặc thời gian chờ của một xe.'],
      evidence: 'sim/tb_system.sv, task scenario, dòng 93–121 · docs/KET_QUA.md, dòng 15–23.',
      followup: 'Nếu thay đổi độ dài phần đuôi không xe đến, chỉ số cuối cửa sổ có thể đổi ra sao?'
    },
    {
      id: 'oral-duration', topic: 'Thời gian', roles: [1, 3, 5], lesson: 'clock-fsm',
      prompt: 'Tại sao xanh cố định so elapsed với 11 để có đúng 12 tick xanh?',
      criteria: ['Cạnh vào pha đặt elapsed=0. Sau 11 cạnh tick giữ pha, elapsed=11.', 'Cạnh tick kế tiếp hoàn tất khoảng xanh thứ 12 và chốt pha vàng với elapsed=0.', 'Đối chiếu hold_phase hoặc kiểm 48 clock khi tick chia 4.'],
      pitfalls: ['Tính cạnh vào pha là tick đầu tiên đã hoàn tất trong pha.', 'Tăng elapsed lên 12 ở cạnh chuyển vàng.'],
      evidence: 'rtl/green_policy.v, dòng 11–14 · rtl/traffic_controller.v, dòng 51–58 · sim/tb_controller.sv, dòng 45–60 · sim/tb_top.sv, dòng 28–34.',
      followup: 'Nếu dùng elapsed >= 12, màu đèn đổi muộn bao nhiêu?'
    },
    {
      id: 'oral-divider', topic: 'Thời gian', roles: [3, 4, 5], lesson: 'clock-fsm',
      prompt: 'Bộ chia đặt CYCLES_PER_SECOND=4. Sau reset, cạnh lên nào cho tick hợp lệ đầu tiên?',
      criteria: ['Counter trước bốn cạnh ngoài reset lần lượt là 0, 1, 2, 3.', 'Tick ở mức 1 khi counter=3 và rst=0; cạnh thứ tư tiêu thụ tick rồi nạp lại counter=0.', 'Tick là tín hiệu cho phép tiến FSM trên clock chung.'],
      pitfalls: ['Đọc tick sau cạnh rồi kết luận cạnh đó chưa tiêu thụ tick.', 'Dùng tick làm clock thứ hai.'],
      evidence: 'rtl/second_tick.v, dòng 2–11 · sim/tb_top.sv, dòng 28–34 · sim/tb_system.sv, dòng 132–135.',
      followup: 'Nếu CYCLES_PER_SECOND=1 và rst=0, tick có giá trị ra sao qua các cạnh?'
    },
    {
      id: 'oral-clock-real', topic: 'Thời gian', roles: [3, 4], lesson: 'clock-fsm',
      prompt: 'Tham số mặc định 50.000.000 tương ứng đúng 1 giây ở clock nào? Nếu dùng clock 100 MHz thì sao?',
      criteria: ['Chu kỳ tick tính bằng CYCLES_PER_SECOND / f_clk.', '50 MHz cho 1 s; giữ tham số mặc định với 100 MHz cho 0,5 s.', 'Có thể cấu hình 100.000.000 clock/tick tại wrapper cho clock 100 MHz.'],
      pitfalls: ['Đọc timescale VCD như tham số clock phần cứng.', 'Nhầm giá trị 50.000.000 là số nanosecond của tick.'],
      evidence: 'rtl/second_tick.v, dòng 1–9 · rtl/traffic_top.v, dòng 3 và 11–15 · sim/tb_system.sv, dòng 1–4.',
      followup: 'Vì sao 10 ns trên demo.vcd lại được quy ước thành 1 giây mô hình?'
    },
    {
      id: 'oral-remaining', topic: 'Thời gian', roles: [2, 3], lesson: 'clock-fsm',
      prompt: 'Ở xanh thích ứng, elapsed=5 và remaining=15. Có thể sang vàng tại tick kế tiếp không?',
      criteria: ['Có nếu queue đối diện lớn hơn và tick=1 tại cạnh.', 'Remaining hiển thị giới hạn max 20 trừ elapsed khi đang xanh thích ứng.', 'Khi chốt vàng, elapsed về 0 và remaining theo giới hạn vàng mặc định 3.'],
      pitfalls: ['Đợi remaining về 0 như điều kiện kết thúc duy nhất.', 'Gọi remaining là thời gian xanh chắc chắn còn lại.'],
      evidence: 'rtl/green_policy.v, dòng 11–14 · rtl/traffic_controller.v, dòng 51–58 và 65–76 · sim/tb_controller.sv, dòng 106–120.',
      followup: 'Tại sao ở mốc trước cạnh xanh thứ 20, remaining vẫn hiển thị 1?'
    },
    {
      id: 'oral-counter-width', topic: 'Thời gian', roles: [3], lesson: 'clock-fsm',
      prompt: 'Cấu hình 4 clock/tick cần mấy bit counter? Vì sao cấu hình 1 clock/tick vẫn dùng một bit?',
      criteria: ['Với 4, bộ đếm chứa 0 đến 3, hai bit đủ và $clog2(4)=2.', 'Với 1, ngưỡng là 0. RTL đặt WIDTH=1 để có độ rộng hợp lệ, counter liên tục được đưa về 0.', 'Tick có mức 1 khi ngoài reset ở cấu hình 1, vì mọi cạnh lên đều được phép tiến một tick.'],
      pitfalls: ['Tính thêm một bit để chứa số 4 dù trạng thái bộ đếm quay vòng ở 3.', 'Coi tick luôn phải có một cạnh xuống giữa hai lần được dùng.'],
      evidence: 'rtl/second_tick.v, khai báo WIDTH và khối cập nhật, dòng 5–10.',
      followup: 'Với 5 clock/tick thì cần mấy bit và tick được tiêu thụ khi counter bằng mấy?'
    },
    {
      id: 'oral-observe-edge', topic: 'Kiểm thử và bằng chứng', roles: [3, 5], lesson: 'nen-tang',
      prompt: 'Trong testbench, tại sao có @(posedge clk) rồi #1 mới so state và đèn?',
      criteria: ['RTL dùng nonblocking để chốt state tại cạnh lên.', 'Đợi #1 theo timescale 1ns/1ps để đọc kết quả đã cập nhật, kể cả logic giải mã đèn.', 'Phân biệt giá trị trước cạnh dùng cho quyết định với giá trị sau cạnh dùng để so đáp án.'],
      pitfalls: ['Coi #1 là thêm một clock hoặc thêm một tick.', 'Coi phép gán nonblocking đã hoàn tất ngay trong cùng vùng lấy mẫu tại cạnh.'],
      evidence: 'rtl/traffic_controller.v, dòng 43–64 · sim/tb_system.sv, dòng 1 và 54–67.',
      followup: 'Testbench lấy departed trước cạnh hay sau cạnh? Giải thích bằng điều kiện trên green và queue.'
    },
    {
      id: 'oral-between-ticks', topic: 'Người đi bộ và tích hợp', roles: [3, 4, 5], lesson: 'nguoi-di-bo',
      prompt: 'Xung nút cao đúng một clock nằm giữa hai tick. Nó được giữ bằng gì?',
      criteria: ['So ped_button hiện tại với button_prev để phát hiện cạnh lên tại cạnh clock.', 'Khi state ngoài WALK, ped_pending được đặt dù tick=0. Chuyển pha vẫn đợi tick.', 'Chỉ xung một clock trong tb_top với 4 clock/tick.'],
      pitfalls: ['Đồng nhất giữa hai tick với giữa hai cạnh clock.', 'Khẳng định bắt được mọi xung hẹp hơn chu kỳ clock.'],
      evidence: 'rtl/traffic_controller.v, dòng 18–19 và 43–56 · sim/tb_top.sv, dòng 7 và 35–40.',
      followup: 'Xung xảy ra hoàn toàn giữa hai cạnh lên clock có được lấy mẫu không?'
    },
    {
      id: 'oral-boundary', topic: 'Người đi bộ và tích hợp', roles: [1, 4, 5], lesson: 'nguoi-di-bo',
      prompt: 'Ngay tick cuối AFTER_B, pending=0 và nút vừa lên 1. Dự đoán state, pending, resume_b và walk sau cạnh.',
      criteria: ['Với button_prev=0, new_request=1 trước cạnh, nên đi PED_WALK dù pending cũ bằng 0.', 'Sau cạnh: pending=0, resume_b=0, walk=1. Phép xóa pending khi vào WALK có thứ tự sau phép chốt.', 'Biến thể ranh giới AFTER_A được kiểm trực tiếp; nhánh AFTER_B trong RTL cho dự đoán trên.'],
      pitfalls: ['Chỉ nhìn pending mà bỏ new_request.', 'Gắn kết quả đối xứng AFTER_B với ca thử ranh giới AFTER_A.'],
      evidence: 'rtl/traffic_controller.v, dòng 18–19, 32–39 và 48–64 · sim/tb_controller.sv, dòng 75–82.',
      followup: 'Nếu cạnh nút xảy ra tại tick cuối A_YELLOW, yêu cầu được phục vụ cùng cạnh hay đợi qua AFTER_A?'
    },
    {
      id: 'oral-walk-clear', topic: 'Người đi bộ và tích hợp', roles: [1, 4], lesson: 'nguoi-di-bo',
      prompt: 'So sánh cạnh lên ở tick cuối WALK và cạnh lên ở tick cuối CLEAR. Yêu cầu nào còn chờ?',
      criteria: ['Nhánh chốt xét state trước cạnh. Cạnh nút trong WALK bị bỏ qua, kể cả cạnh chuyển CLEAR.', 'Trong CLEAR, cạnh nút được chốt. FSM vẫn tiếp tục hướng resume_b tại tick cuối CLEAR.', 'Yêu cầu mới có thể được phục vụ tại ranh giới AFTER của hướng xe vừa được nối tiếp.'],
      pitfalls: ['Cho cạnh ở cuối WALK được chốt vì nhìn state sau cạnh.', 'Quay về WALK ngay từ CLEAR khi có yêu cầu.'],
      evidence: 'rtl/traffic_controller.v, dòng 32–39, 48–58 · sim/tb_controller.sv, dòng 83–87.',
      followup: 'Nếu giữ nút cao từ WALK sang CLEAR, CLEAR có thấy thêm cạnh lên không?'
    },
    {
      id: 'oral-hold-reset', topic: 'Người đi bộ và tích hợp', roles: [3, 4], lesson: 'nguoi-di-bo',
      prompt: 'Nút luôn cao, đi qua hai cạnh reset và cạnh đầu sau khi nhả reset. Vì sao có một yêu cầu mới?',
      criteria: ['Mỗi cạnh còn rst=1 xóa button_prev và ped_pending.', 'Ở cạnh đầu rst=0, nút cao và button_prev cũ bằng 0 nên new_request được chốt.', 'Sau cạnh, button_prev=1. Nếu giữ nguyên mức cao, lần lấy mẫu sau không có cạnh lên mới.'],
      pitfalls: ['Tính yêu cầu ngay trong nhánh reset.', 'Coi mức 1 là một lượt bấm ở mỗi cạnh.'],
      evidence: 'rtl/traffic_controller.v, dòng 18–19, 43–50 · sim/tb_controller.sv, dòng 96–101.',
      followup: 'Nếu tick=0 ở cạnh nhả reset, BOOT có tiến pha không?'
    },
    {
      id: 'oral-bounce', topic: 'Người đi bộ và tích hợp', roles: [1, 4, 5], lesson: 'nguoi-di-bo',
      prompt: 'button_prev xử lý giữ nút. Khi nối nút cơ khí thật, cần làm gì với dội và đầu vào lệch clock?',
      criteria: ['Tách hai vấn đề: đầu vào bất đồng bộ có rủi ro metastability; dội tạo nhiều lần thay đổi mức.', 'Ở thiết kế mở rộng, đồng bộ nút một bit vào clock đích, lọc dội rồi bắt cạnh.', 'Với bus queue nhiều bit từ miền khác, dùng một giao thức đưa dữ liệu ổn định qua miền clock.'],
      pitfalls: ['Xem bắt cạnh là lọc dội.', 'Đồng bộ từng bit của bus độc lập rồi mặc định cả từ vẫn đồng nhất.'],
      evidence: 'rtl/traffic_controller.v, dòng 18–19 và 43–50 · rtl/traffic_top.v, dòng 3–7 · README.md, dòng 70–72.',
      followup: 'Nếu các cạnh clock lần lượt lấy mẫu nút 0, 1, 0 rồi 1 do dội, RTL nhận ra mấy cạnh lên của nút?'
    },
    {
      id: 'oral-fpga', topic: 'Người đi bộ và tích hợp', roles: [3, 4, 5], lesson: 'so-do',
      prompt: 'Nếu được yêu cầu chuyển demo lên FPGA, nhóm cần chuẩn bị phần nào và bằng chứng gì?',
      criteria: ['Chọn bo mạch, đo hoặc xác định clock thực, cài CYCLES_PER_SECOND và thêm ràng buộc chân, clock.', 'Bổ sung đồng bộ, chống dội, nguồn dữ liệu queue và phần kết nối đầu ra phù hợp.', 'Tổng hợp, triển khai, kiểm timing, chạy và quan sát trên bo. Trình bày đây là công việc phần cứng cần làm.'],
      pitfalls: ['Nhúng queue_model vào đường cảm biến như dữ liệu thật.', 'Dùng log Icarus để kết luận timing phần cứng.'],
      evidence: 'rtl/traffic_top.v, dòng 2–15 · sim/queue_model.v, dòng 1–8 · README.md, dòng 70–74.',
      followup: 'Với clock bo mạch 100 MHz, cấu hình mặc định hiện tại cho tick dài bao lâu?'
    },
    {
      id: 'oral-four-benches', topic: 'Kiểm thử và bằng chứng', roles: [5], lesson: 'kiem-thu',
      prompt: 'Phân biệt bốn bench và chỉ một dấu hiệu thất bại có thể quan sát.',
      criteria: ['tb_units kiểm policy và level. tb_controller kiểm FSM, nút, reset và thời lượng ở mức controller.', 'tb_top kiểm wrapper với 4 clock/tick. tb_system kiểm vòng hàng đợi, ca so sánh và kích thích giả ngẫu nhiên.', '$fatal làm lượt mô phỏng thất bại. Chỉ một phép kiểm cụ thể và log cùng run ID.'],
      pitfalls: ['Gọi bốn bench là bốn kịch bản lưu lượng.', 'Dùng log hoặc ảnh của lượt khác nhau trong cùng kết luận.'],
      evidence: 'sim/tb_units.sv, dòng 5–27 · sim/tb_controller.sv, dòng 11–24 và 45–67 · sim/tb_top.sv, dòng 7–44 · sim/tb_system.sv, dòng 93–161.',
      followup: 'Phép kiểm ở bench nào sẽ bắt lỗi wrapper bỏ lỡ xung nút một clock giữa hai tick?'
    },
    {
      id: 'oral-independent-reference', topic: 'Kiểm thử và bằng chứng', roles: [2, 5], lesson: 'kiem-thu',
      prompt: 'Nếu queue_model phát sai departed, làm sao biết mô hình tham chiếu có thể phát hiện sai lệch?',
      criteria: ['Task advance_queue tự tính lượt đi bằng queue và credit tham chiếu, với đèn và lịch xe đã lấy mẫu.', 'Bench so `da/db` với lượt đi kỳ vọng trước cạnh, rồi so queue và overflow sau cạnh.', 'Cả hai kiểm giúp phân biệt lỗi lịch phục vụ và lỗi cập nhật tồn kho.'],
      pitfalls: ['Dùng departed của DUT để tự tạo departed kỳ vọng.', 'So queue trước khi nonblocking update được quan sát.'],
      evidence: 'sim/tb_system.sv, task advance_queue và step, dòng 30–63.',
      followup: 'Nếu DUT xuất departed đúng nhưng quên trừ một xe, phép kiểm nào có thể thất bại?'
    },
    {
      id: 'oral-seeded', topic: 'Kiểm thử và bằng chứng', roles: [5], lesson: 'kiem-thu',
      prompt: 'Kiểm thử dùng seed 0x12345678 và 3.000 bước giả ngẫu nhiên. Khi truy lỗi, seed giúp gì và giới hạn ra sao?',
      criteria: ['Cùng seed và phép cập nhật số giả ngẫu nhiên cho lại lịch xe, nút và mode tương ứng với cùng chuỗi bước.', 'Ghi run ID, seed và mốc n xảy ra lỗi để lặp lại và thu hẹp đoạn dạng sóng.', 'Bao phủ cả chín trạng thái trong lượt đã kiểm là một tiêu chí quan sát. Đánh giá mọi chuỗi sự kiện cần phạm vi xác minh rộng hơn.'],
      pitfalls: ['Coi mỗi seed bảo đảm kiểm được mọi chuỗi nút và reset.', 'Lấy toàn bộ phần thử giả ngẫu nhiên từ trace.csv của bốn cặp so sánh.'],
      evidence: 'sim/tb_system.sv, dòng 25, 116 và 150–161 · docs/DEMO_VA_TIEN_DO.md, dòng 18–19.',
      followup: 'Nếu CSV chỉ chứa bốn cặp kịch bản, tệp nào quan sát được tín hiệu trong lượt ngẫu nhiên?'
    },
    {
      id: 'oral-comparison', topic: 'Đánh giá', roles: [2, 5], lesson: 'kiem-thu',
      prompt: 'Làm thế nào biết hai chế độ được so sánh trên cùng điều kiện?',
      criteria: ['Cùng kind, cùng vòng 600 tick, cùng lịch đến A/B và ba mốc nút.', 'Mỗi lượt reset hàng đợi trước khi chạy và dùng cùng quy tắc phục vụ; mode khác nhau được chốt lúc reset.', 'Đọc arrived, served và final_queue cùng diện tích hàng đợi trong một cặp.'],
      pitfalls: ['Đem ca A đông thích ứng so với ca cân bằng cố định.', 'Bỏ qua số xe còn chờ ở cuối cửa sổ.'],
      evidence: 'sim/tb_system.sv, dòng 93–121 và 150 · docs/KET_QUA.md, dòng 3–16.',
      followup: 'Từ arrived=260 và served=219 của ca A đông thích ứng, tính final_queue.'
    },
    {
      id: 'oral-metrics', topic: 'Đánh giá', roles: [2, 5], lesson: 'kiem-thu',
      prompt: 'Giải thích queue_area_car_seconds, peak_total_queue và max_red_wait_a/b cho người chưa xem testbench.',
      criteria: ['Area cộng queue_a+queue_b sau từng tick, mỗi mẫu ứng với một giây mô hình. Peak lấy tổng lớn nhất trong các mẫu.', 'max_red_wait đếm chuỗi liên tiếp có hàng chờ và đèn hướng đó chưa xanh, gồm cả vàng.', 'Mô hình đếm số xe. Cần định danh và mốc đến/đi riêng nếu muốn đo thời gian chờ của từng xe.'],
      pitfalls: ['Chia area cho served rồi gọi đó là thời gian chờ đo trực tiếp.', 'Đồng nhất max_red_wait với thời gian đợi xe lâu nhất.'],
      evidence: 'sim/tb_system.sv, task scenario, dòng 106–121 · docs/KET_QUA.md, dòng 18–23.',
      followup: 'Nếu la xanh và qa vẫn lớn hơn 0, biến wait_a được đặt về mấy?'
    },
    {
      id: 'oral-provenance', topic: 'Kiểm thử và bằng chứng', roles: [5], lesson: 'kiem-thu',
      prompt: 'Bạn chạy lại và có run ID mới. Bạn sẽ trình bày số 95.986 như thế nào?',
      criteria: ['Gắn 95.986 với run ID 20261121T091158Z-945dda53 trong docs/KET_QUA.md.', 'Ở lượt mới, ghi run ID mới, lấy số từ bốn log và lấy metrics từ đúng lượt đó.', 'Các số checks đếm lượt đánh giá điều kiện. Chỉ trình bày ca hoặc biên độ thử khi đọc được nguồn tương ứng.'],
      pitfalls: ['Mang số cũ gắn với lượt mới vì cùng checkout.', 'Coi số checks là số kịch bản độc lập.'],
      evidence: 'docs/KET_QUA.md, dòng 3 và 34–50 · README.md, mục xác thực, dòng 76–80.',
      followup: 'Nếu GTKWave lỗi sau khi runner đã publish thành công, tệp nào là bằng chứng có thể mở ngay?'
    }
  ];

  data.cards = [
    { front: 'Tiến pha ở cạnh nào?', back: 'Cạnh lên clk với tick=1 và rst=0. tick là clock enable.', lesson: 'clock-fsm' },
    { front: 'Đếm xanh cố định 12 tick, so elapsed với mấy?', back: '11 trước cạnh tick cuối. Khi đổi pha, elapsed về 0.', lesson: 'clock-fsm' },
    { front: 'Mã đèn 001, 010, 100 là gì?', back: 'Xanh, vàng, đỏ theo thứ tự bit {đỏ,vàng,xanh}.', lesson: 'clock-fsm' },
    { front: 'Min, max và so tải của xanh thích ứng?', back: 'Từ tick 6, thử điều kiện đối diện đông hơn. Tick 20 bắt buộc kết thúc.', lesson: 'thich-ung' },
    { front: 'Hai hàng đợi bằng nhau ở tick thứ sáu thì sao?', back: 'Tiếp tục xanh. Điều kiện so hàng đợi là lớn hơn nghiêm ngặt.', lesson: 'thich-ung' },
    { front: 'Xe vừa đến một hàng đang rỗng có đi ngay cùng cạnh được không?', back: 'Departed xét queue trước cạnh, nên ở cạnh đó chỉ cập nhật lượng xe tới.', lesson: 'thich-ung' },
    { front: 'Xung nút giữa hai tick có thể được chốt ở đâu?', back: 'Tại cạnh lên clock có new_request, rst=0 và state khác PED_WALK.', lesson: 'nguoi-di-bo' },
    { front: 'Cạnh nút cuối AFTER_A, pending cũ = 0, sẽ đi đâu?', back: 'Vào WALK nhờ new_request. Pending sau cạnh bằng 0 và resume_b=1.', lesson: 'nguoi-di-bo' },
    { front: 'Mode_select được lấy khi nào?', back: 'Tại mọi cạnh lên clock có rst=1. Các cạnh ngoài reset giữ mode_active.', lesson: 'nguoi-di-bo' },
    { front: 'Queue area và peak khác nhau thế nào?', back: 'Area cộng hàng đợi qua mỗi tick. Peak lấy tổng hàng đợi lớn nhất tại một mẫu.', lesson: 'kiem-thu' },
    { front: '95.986 đếm gì?', back: 'Lượt đánh giá điều kiện được báo của bốn bench trong lượt nộp 20261121T091158Z-945dda53.', lesson: 'kiem-thu' },
    { front: 'Bốn bước trả lời vấn đáp?', back: 'Quy tắc → module và tín hiệu → ca thử → giới hạn.', lesson: 'bao-ve' }
  ];
})();
