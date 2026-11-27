window.KTMT = window.KTMT || {};

window.KTMT.evidenceLessons = [{
  id: 'kiem-thu',
  title: 'Kiểm thử và đọc kết quả',
  summary: 'Đọc bốn testbench, đo pha từ VCD và giải thích kết quả của hai chế độ trên cùng đầu vào.',
  html: String.raw`
    <h2>Bốn testbench trả lời bốn câu hỏi</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Bench</th><th>Phạm vi</th><th>Ca để tự truy vết</th></tr></thead>
      <tbody>
        <tr><td><code>tb_units</code></td><td>Tính hết xanh của <code>green_policy</code> trên 12.800 tổ hợp và phân loại đủ 256 mức đếm.</td><td>Dùng <code>e+1</code> làm số tick vừa hoàn tất. Với mode thích ứng, <code>e=5</code>, hàng đợi mình 2 và phía kia 7, kỳ vọng <code>done=1</code>. <small>sim/tb_units.sv · tb_units · dòng 9–25.</small></td></tr>
        <tr><td><code>tb_controller</code></td><td>Thời lượng pha, màu theo trạng thái, đổi chế độ, nút đi bộ và reset. Kiểm tra <code>remaining</code> mỗi clock.</td><td>Đặt <code>tick=0</code> rồi bấm. Kiểm tra thời gian pha đứng yên và yêu cầu vẫn được chốt. <small>sim/tb_controller.sv · step và initial · dòng 14–32, 55–67, 106–121.</small></td></tr>
        <tr><td><code>tb_top</code></td><td>Tích hợp bộ chia nhịp vào wrapper. Kiểm tra hai màu đèn, thời lượng và chốt yêu cầu giữa các tick.</td><td>Chia 4 clock/tick. BOOT rời sau 4 clock và A xanh cố định đúng 48 clock. <small>sim/tb_top.sv · cycle và initial · dòng 1–34.</small></td></tr>
        <tr><td><code>tb_system</code></td><td>Chạy controller với hai hàng đợi, đối chiếu lượt xe đi bằng mô hình độc lập, kiểm tra tám lượt so sánh và 3.000 bước giả ngẫu nhiên.</td><td>Hàng đợi có 2 xe, tick hợp lệ thứ hai cho 1 xe đi trong lúc 3 xe đến. Kỳ vọng 4 xe. <small>sim/tb_system.sv · advance_queue, step và initial · dòng 30–68, 137–161.</small></td></tr>
      </tbody>
    </table></div>
    <p>Trong <code>tb_system</code>, trước cạnh testbench lấy màu cũ và số xe đi. Sau <code>@(posedge clk); #1;</code> nó đọc hàng đợi, màu và trạng thái mới. Với <code>timescale 1ns/1ps</code>, <code>#1</code> là 1 ns. Khoảng chờ đó cho phép cập nhật <code>&lt;=</code> và tín hiệu tổ hợp ổn định trong mô phỏng. Khi điều kiện trượt, <code>$fatal(1, ...)</code> kết thúc bench với lỗi. <small>sim/tb_system.sv · tb_system và step · dòng 1–4, 27–29, 50–68.</small></p>
    <div class="callout"><strong>Đọc con số cùng mã lượt chạy.</strong> <code>docs/KET_QUA.md</code> ghi 95.986 lượt đánh giá điều kiện được báo bởi bốn bench của lượt <code>20261121T091158Z-945dda53</code>. Lượt chạy lại <code>20261123T143101Z-d50ee175</code> cũng báo 95.986 qua bốn log riêng. Trong <code>tb_top</code>, <code>checks</code> tăng một lần mỗi lệnh <code>cycle</code>. Các bộ đếm phụ <code>remaining_checks</code> chạy riêng và nằm ngoài tổng in ở dòng PASS. Tám lượt 600 tick và 3.000 bước giả ngẫu nhiên là các kích thích của bench hệ thống.</div>

    <h2>Đi từ lệnh chạy đến kết luận</h2>
    <p>Mở PowerShell tại gốc <code>adaptive-traffic-light-verilog</code>. Thêm thư mục Icarus vào PATH của phiên hiện tại nếu cần. Chạy <code>.\scripts\run.ps1</code>, thêm <code>-Wave</code> để mở GTKWave. Script chụp nguồn, biên dịch từng bench bằng Icarus, chạy <code>vvp</code>, xác thực manifest, log và CSV rồi công bố <code>build/</code>. <small>scripts/run.ps1 · dòng 1–14. scripts/run_tests.py · run_tests · dòng 66–130. scripts/validate_results.py · validate · dòng 58–136.</small></p>
    <ol>
      <li>Ghi mã từ <code>Validated run published</code>. Đối chiếu với <code>build/run.json</code>, <code>build/KET_QUA.md</code> và bốn log trong cùng thư mục.</li>
      <li>Mở <code>controller.vcd</code> cho một chu trình ngắn. Trong scope <code>tb_controller</code>, xem <code>clk</code>, <code>tick</code>, <code>state</code>, <code>elapsed</code>, <code>ped_button</code> và <code>ped_pending</code>. Xem thêm <code>dut.resume_b</code> cho ca đi bộ.</li>
      <li>Mở <code>demo.vcd</code> cùng <code>demo.gtkw</code> cho các kịch bản dài. Bố cục chọn tín hiệu dưới <code>tb_system</code>. Chọn số thập phân cho các bus cần đọc. Trong <code>tb_system</code>, hai cạnh lên cách nhau 10 ns và mỗi cạnh lên ngoài reset hoàn tất một tick vì <code>tick=1</code>. <code>tb_controller</code> cũng dùng clock 10 ns và có đoạn chủ động hạ <code>tick</code>. <small>demo.gtkw · dòng 5, 16–30. sim/tb_system.sv · dòng 1–4. sim/tb_controller.sv · dòng 1–4, 61–67.</small></li>
      <li>Mở <code>trace.csv</code>, lọc theo <code>scenario</code>, <code>adaptive</code> và <code>second</code>. Trong VCD, thêm <code>kind</code>, <code>adaptive</code> và <code>t</code> dưới <code>tb_system.scenario</code> để khớp ba cột. <code>second</code> đếm từ 0 đến 599 trong mỗi lượt, còn VCD có trục thời gian chung. Ví dụ ở lượt đóng gói, ca A đông cố định (<code>scenario=1, adaptive=0</code>) có mẫu <code>second=35</code> tại cạnh lên 12.815 ns. Đọc trạng thái, đèn và hàng đợi sau cạnh. <small>sim/tb_system.sv · scenario · dòng 93–123. rtl-run/demo.vcd · 20261123T143101Z-d50ee175.</small></li>
    </ol>
    <p>Khi GTKWave chưa mở được, trình bày bằng <a href="#wave">dạng sóng trích từ VCD của lượt chạy lại</a>, rồi mở <a href="rtl-run/tb_controller.log">log controller</a>, <a href="rtl-run/trace.csv" download>trace.csv</a> và <a href="rtl-run/run.json">run.json</a>. Có thể tải <a href="rtl-run/controller.vcd" download>controller.vcd</a> hoặc <a href="rtl-run/demo.vcd" download>demo.vcd</a> để xem sau.</p>

    <h2>So sánh đầu vào ghép cặp</h2>
    <p>Mỗi lượt kéo dài 600 tick, reset về cùng hàng đợi rỗng. Cặp cố định và thích ứng nhận cùng xe đến ở từng tick, cùng ba lần bấm (chỉ số 35, 170, 310) và cùng quy tắc phục vụ. Cả tám lượt phục vụ đủ ba yêu cầu đi bộ. Mỗi cặp khác nhau ở chế độ chốt qua reset. <small>sim/tb_system.sv · scenario và initial · dòng 93–123, 150. scripts/validate_results.py · validate · dòng 83–136.</small></p>
    <div class="table-wrap"><table>
      <thead><tr><th>Kịch bản</th><th>Mẫu xe đến trong 600 tick</th><th>Cách đọc lượt chạy lại</th></tr></thead>
      <tbody>
        <tr><td>Cân bằng</td><td>A đến khi t chia 5 dư 0, B khi dư 2. Mỗi hướng 120 xe.</td><td>Số xe đi giảm từ 213 xuống 161; tích lũy tăng từ 10.252 lên 24.792 xe·giây. Trace có 36 lần xanh → vàng ở cố định và 54 lần ở thích ứng. Số tick vàng + đỏ toàn phần tăng 72, số mẫu xanh giảm từ 435 còn 363.</td></tr>
        <tr><td>A đông hơn B</td><td>A đến mỗi 3 tick, B mỗi 10 tick. 200 xe A và 60 xe B.</td><td>Thích ứng phục vụ 219 xe, cố định 167. Tích lũy giảm 49,1%. Trong thích ứng A có 341 mẫu xanh, B có 102. Đo thêm khoảng chờ chưa xanh của B để thấy đánh đổi.</td></tr>
        <tr><td>B đông hơn A</td><td>Đảo hai chuỗi của ca A đông. 60 xe A và 200 xe B.</td><td>Thích ứng phục vụ 218 xe, cố định 167. Tích lũy giảm 49,9%. Chu trình vẫn khởi đầu A, và cửa sổ hữu hạn dẫn đến kết quả hai ca lệch không đối xứng hoàn toàn.</td></tr>
        <tr><td>Lưu lượng đổi hướng</td><td>A đến mỗi 2 tick từ t=0–199. B đến mỗi 2 tick từ t=200–399. Đo đến t=599.</td><td>Thích ứng giải tỏa cả 200 xe trong cửa sổ. Cố định còn 27 xe. Tích lũy giảm 33,8%.</td></tr>
      </tbody>
    </table></div>
    <p>Ở tải cân bằng, hai hàng đợi có thể lệch nhau dù tổng xe đến bằng nhau. Khi phía đối diện vượt phía đang xanh sau ngưỡng tối thiểu, thích ứng có thể đổi sớm. Mỗi lượt đổi dùng 3 tick vàng và 1 tick đỏ toàn phần, cắt thời gian phục vụ. Khi tải lệch, phần xanh chuyển về hướng đông góp phần phục vụ thêm xe. <small>rtl/green_policy.v · finish_green · dòng 10–14. docs/DEMO_VA_TIEN_DO.md · dòng 35. rtl-run/metrics.csv và trace.csv · 20261123T143101Z-d50ee175.</small></p>
    <dl>
      <dt>Xe còn chờ cuối cửa sổ</dt><dd>Queue A và B ở mẫu cuối. Với lượt không tràn, số xe đầu kỳ bằng 0 nên xe đến trừ xe đi bằng số còn chờ. Xe còn chờ vẫn đóng góp vào tích lũy trong thời gian quan sát.</dd>
      <dt><code>queue_area_car_seconds</code></dt><dd>Tổng (qa + qb) sau từng tick nhân 1 giây mô hình, đơn vị xe·giây. Chia cho 600 giây cho độ dài hàng đợi trung bình trong cửa sổ, đơn vị xe.</dd>
      <dt><code>peak_total_queue</code></dt><dd>Giá trị lớn nhất của qa + qb tại cùng một mẫu. Hai đỉnh riêng của A và B có thể xảy ra ở hai thời điểm.</dd>
      <dt><code>max_red_wait_a/b</code></dt><dd>Số tick liên tiếp dài nhất mà hướng đó có xe chờ và đèn của hướng đó chưa xanh tại mẫu sau cạnh. Gồm cả vàng nếu còn xe. Chỉ số đo một chuỗi mẫu của hướng. Dữ liệu chỉ giữ số lượng xe, nên chưa đo được độ chờ từng xe hoặc xe đợi lâu nhất.</dd>
    </dl>
    <p>Đọc cách tính trong <code>sim/tb_system.sv</code> (task <code>scenario</code>, dòng 107–121), sau đó tự kiểm bằng <code>scripts/validate_results.py</code> (hàm <code>validate</code>, dòng 89–136). Thử mở <a href="#compare">bảng so sánh tương tác</a> và giải thích cả lợi ích lẫn giới hạn theo từng cặp.</p>

    <h2>Phạm vi của bằng chứng</h2>
    <p>Đây là mô phỏng học tập hai hướng đi thẳng và một khoảng dành cho người đi bộ. Checkout khảo sát chưa có bằng chứng về cảm biến thật, tổng hợp, timing FPGA, chạy trên bo, kiểm chứng hình thức, xe ưu tiên hoặc rẽ trái. Để phát biểu về an toàn, đưa cả bảng ánh xạ hai đèn trong RTL và ca bench đã chạy. <small>README.md · dòng 70–74. rtl/traffic_controller.v · ánh xạ đèn · dòng 62–64. sim/tb_controller.sv · step · dòng 14–32.</small></p>
  `
}];

window.KTMT.evidenceQuiz = [
  {
    id: 'bench-thoi-diem', lesson: 'kiem-thu',
    prompt: 'Muốn kiểm tra trạng thái mới vừa được gán bằng <= ở cạnh lên, cách lấy mẫu nào phù hợp với bench?',
    options: ['Đọc ngay cùng vùng hoạt động tại @(posedge clk)', 'Đợi @(posedge clk); #1; rồi đọc', 'Đọc trước cạnh rồi xem đó là trạng thái mới', 'Chờ thêm 1.000 clock rồi đọc'],
    correct: 1,
    hint: 'Tìm thời điểm task step đọc kết quả khi phép gán không chặn đã áp dụng.',
    explanation: 'Giữ cạnh lên làm mốc, rồi lùi thời điểm quan sát 1 ns sau cạnh để đọc thanh ghi mới và đầu ra tổ hợp đã ổn định trong bench.',
    evidence: 'sim/tb_controller.sv · step · dòng 14–31; sim/tb_system.sv · step · dòng 50–68.'
  },
  {
    id: 'tich-luy-tung-xe', lesson: 'kiem-thu',
    prompt: 'Một lượt 600 giây mô hình có 10.252 xe·giây tích lũy. 10.252 chia 600 cho đại lượng nào?',
    options: ['Thời gian chờ tối đa của một xe', 'Số xe rời nút giao mỗi giây', 'Độ dài hàng đợi trung bình theo thời gian, khoảng 17,09 xe', 'Thời gian chờ trung bình của 213 xe đã đi'],
    correct: 2,
    hint: 'Thử rút gọn đơn vị xe·giây chia giây.',
    explanation: 'Sau từng tick bench cộng qa + qb. Chia tổng đó cho 600 giây cho độ dài hàng đợi trung bình của cửa sổ. Mô hình lưu tổng số xe mỗi hướng và không theo dõi từng xe.',
    evidence: 'sim/tb_system.sv · scenario · dòng 105–121; rtl-run/metrics.csv · run 20261123T143101Z-d50ee175, scenario=0 adaptive=0.'
  },
  {
    id: 'dieu-kien-doc-lap', lesson: 'kiem-thu',
    prompt: 'Số 95.986 ở docs/KET_QUA.md được lấy làm bằng chứng cho điều gì?',
    options: ['Tổng từ các bộ đếm checks trên bốn dòng PASS của lượt nộp', '95.986 kịch bản có đầu vào độc lập', 'Số lần chạy kiểm thử trên FPGA', '95.986 lượt xe đã đi'],
    correct: 0,
    hint: 'Xem script lấy số ở đâu rồi xem các vòng lặp của từng bench.',
    explanation: 'Script cộng số kiểm tra được báo qua bốn dòng PASS. Nhiều lần kiểm tra xảy ra trong các cạnh và các điều kiện của cùng một kịch bản.',
    evidence: 'docs/KET_QUA.md · dòng 3, 34–44; scripts/validate_results.py · bench_counts · dòng 32–43.'
  },
  {
    id: 'cong-bang-doi-chieu', lesson: 'kiem-thu',
    prompt: 'Chạy chế độ thích ứng với A đông rồi so với cố định trong ca cân bằng có xác định được ảnh hưởng của chính sách không?',
    options: ['Có, nếu hai cửa sổ đều 600 giây', 'Có, nếu cả hai cùng PASS', 'Có, nếu hai bench cùng seed', 'Cần ghép cặp cùng kịch bản, cùng xe đến từng tick và cùng lịch nút bấm'],
    correct: 3,
    hint: 'Khi đầu vào thay đổi, kết quả có thể lệch do đầu vào, chính sách hoặc cả hai.',
    explanation: 'Testbench chạy hai mode trên cùng chuỗi xe đến, hàng đợi ban đầu và yêu cầu đi bộ. Validator đối chiếu chuỗi xe đến giữa hai mode. Mỗi cặp vì vậy cho một so sánh trong phạm vi mô hình.',
    evidence: 'sim/tb_system.sv · scenario và initial · dòng 93–123, 150. scripts/validate_results.py · validate · dòng 133–136.'
  },
  {
    id: 'can-bang-vang', lesson: 'kiem-thu',
    prompt: 'Trong ca cân bằng, xanh → vàng xảy ra 54 lần ở thích ứng và 36 lần ở cố định. Chi phí vàng và đỏ toàn phần tăng bao nhiêu tick?',
    options: ['18 tick', '54 tick', '72 tick', '90 tick'],
    correct: 2,
    hint: 'Mỗi lượt chuyển kèm 3 tick vàng và 1 tick đỏ toàn phần.',
    explanation: 'Có thêm 18 lần kết thúc xanh, mỗi lần kèm 4 tick vàng/đỏ toàn phần. Trong trace của ca này, tổng mẫu vàng/đỏ toàn phần thực tế tăng từ 144 lên 216.',
    evidence: 'docs/DEMO_VA_TIEN_DO.md · dòng 35; rtl-run/trace.csv · run 20261123T143101Z-d50ee175, scenario=0.'
  }
];

window.KTMT.results = {
  "source": "Dữ liệu kết quả lưu sẵn · rtl-run/metrics.csv và rtl-run/trace.csv",
  "runId": "20261123T143101Z-d50ee175",
  "scenarios": [
    {
      "id": "can-bang",
      "name": "Cân bằng",
      "note": "Mỗi hướng có 120 xe đến. Thích ứng kết thúc xanh 54 lần so với 36 ở cố định, thêm 72 tick vàng và đỏ toàn phần. Xe đi giảm 52 và tích lũy tăng 141,8%.",
      "modes": [
        {
          "mode": 0,
          "label": "Cố định",
          "arrived": [
            120,
            120
          ],
          "departed": [
            106,
            107
          ],
          "waiting": [
            14,
            13
          ],
          "area": 10252,
          "peak": 28,
          "maxRed": [
            27,
            27
          ],
          "walks": 3,
          "seconds": 600
        },
        {
          "mode": 1,
          "label": "Thích ứng",
          "arrived": [
            120,
            120
          ],
          "departed": [
            80,
            81
          ],
          "waiting": [
            40,
            39
          ],
          "area": 24792,
          "peak": 79,
          "maxRed": [
            22,
            22
          ],
          "walks": 3,
          "seconds": 600
        }
      ]
    },
    {
      "id": "lech-a",
      "name": "A đông hơn B",
      "note": "A nhận 200 xe và B nhận 60. Thích ứng tăng thời gian xanh cho A, phục vụ thêm 52 xe tổng cộng và giảm tích lũy 49,1%. Đoạn B có xe nhưng chưa xanh dài nhất tăng từ 25 lên 35 tick.",
      "modes": [
        {
          "mode": 0,
          "label": "Cố định",
          "arrived": [
            200,
            60
          ],
          "departed": [
            107,
            60
          ],
          "waiting": [
            93,
            0
          ],
          "area": 29008,
          "peak": 94,
          "maxRed": [
            27,
            25
          ],
          "walks": 3,
          "seconds": 600
        },
        {
          "mode": 1,
          "label": "Thích ứng",
          "arrived": [
            200,
            60
          ],
          "departed": [
            169,
            50
          ],
          "waiting": [
            31,
            10
          ],
          "area": 14754,
          "peak": 43,
          "maxRed": [
            21,
            35
          ],
          "walks": 3,
          "seconds": 600
        }
      ]
    },
    {
      "id": "lech-b",
      "name": "B đông hơn A",
      "note": "A nhận 60 xe và B nhận 200. Thích ứng phục vụ thêm 51 xe và giảm tích lũy 49,9%. Đoạn A có xe nhưng chưa xanh dài nhất tăng từ 26 lên 35 tick.",
      "modes": [
        {
          "mode": 0,
          "label": "Cố định",
          "arrived": [
            60,
            200
          ],
          "departed": [
            59,
            108
          ],
          "waiting": [
            1,
            92
          ],
          "area": 29621,
          "peak": 94,
          "maxRed": [
            26,
            27
          ],
          "walks": 3,
          "seconds": 600
        },
        {
          "mode": 1,
          "label": "Thích ứng",
          "arrived": [
            60,
            200
          ],
          "departed": [
            50,
            168
          ],
          "waiting": [
            10,
            32
          ],
          "area": 14847,
          "peak": 43,
          "maxRed": [
            35,
            21
          ],
          "walks": 3,
          "seconds": 600
        }
      ]
    },
    {
      "id": "doi-huong",
      "name": "Lưu lượng đổi hướng",
      "note": "A đông ở 200 tick đầu, B đông ở 200 tick kế. Thích ứng phục vụ cả 200 xe trong cửa sổ 600 tick và giảm tích lũy 33,8%. Cố định vẫn còn 27 xe cuối cửa sổ.",
      "modes": [
        {
          "mode": 0,
          "label": "Cố định",
          "arrived": [
            100,
            100
          ],
          "departed": [
            100,
            73
          ],
          "waiting": [
            0,
            27
          ],
          "area": 33264,
          "peak": 93,
          "maxRed": [
            27,
            27
          ],
          "walks": 3,
          "seconds": 600
        },
        {
          "mode": 1,
          "label": "Thích ứng",
          "arrived": [
            100,
            100
          ],
          "departed": [
            100,
            100
          ],
          "waiting": [
            0,
            0
          ],
          "area": 22009,
          "peak": 70,
          "maxRed": [
            35,
            28
          ],
          "walks": 3,
          "seconds": 600
        }
      ]
    }
  ]
};

window.KTMT.waveExercises = [
  {
    "id": "canh-het-xanh",
    "title": "Dự đoán cạnh hết xanh",
    "note": "Dữ liệu lưu sẵn · controller.vcd · 20261123T143101Z-d50ee175. Cố định. Trục ns mô phỏng, 10 ns giữa hai cạnh lên. Tick luôn bằng 1 trong đoạn này; bảng đọc sau khi tín hiệu ổn định tại mỗi mốc.",
    "times": [
      115,
      120,
      125,
      130,
      135,
      140
    ],
    "signals": [
      {
        "label": "clk",
        "values": [
          1,
          0,
          1,
          0,
          1,
          0
        ]
      },
      {
        "label": "tick",
        "values": [
          1,
          1,
          1,
          1,
          1,
          1
        ]
      }
    ],
    "columns": [
      "Thời gian (ns)",
      "clk",
      "tick",
      "state",
      "elapsed",
      "lights_a"
    ],
    "rows": [
      [
        115,
        1,
        1,
        1,
        10,
        1
      ],
      [
        125,
        1,
        1,
        1,
        11,
        1
      ],
      [
        130,
        0,
        1,
        1,
        11,
        1
      ],
      [
        135,
        1,
        1,
        "?",
        "?",
        "?"
      ]
    ],
    "prompt": "Tại 135 ns, state, elapsed và đèn A lần lượt bằng bao nhiêu?",
    "options": [
      "1, 12, 1",
      "2, 0, 2",
      "3, 0, 4",
      "1, 11, 1"
    ],
    "correct": 1,
    "hint": "Trước cạnh, elapsed=11. Hãy xét tick sắp hoàn tất là tick số mấy của pha cố định.",
    "explanation": "Cạnh lên 135 ns hoàn tất tick thứ 12. Pha mới là A_YELLOW (2), elapsed về 0 và lights_a=2. VCD xác nhận ba giá trị sau cập nhật tại 135 ns.",
    "evidence": "controller.vcd · tb_controller · 115–140 ns. sim/tb_controller.sv · hold_phase · dòng 45–60."
  },
  {
    "id": "do-thoi-luong",
    "title": "Đo xanh và vàng",
    "note": "Dữ liệu lưu sẵn · controller.vcd · 20261123T143101Z-d50ee175. Trục ns mô phỏng. Tín hiệu pha suy trực tiếp từ state ghi trong VCD. Tick = 1; mỗi 10 ns ứng với một tick ở đoạn này.",
    "times": [
      5,
      15,
      135,
      165,
      175,
      185
    ],
    "signals": [
      {
        "label": "A xanh",
        "values": [
          0,
          1,
          0,
          0,
          0,
          0
        ]
      },
      {
        "label": "A vàng",
        "values": [
          0,
          0,
          1,
          0,
          0,
          0
        ]
      },
      {
        "label": "AFTER_A",
        "values": [
          0,
          0,
          0,
          1,
          0,
          0
        ]
      },
      {
        "label": "B xanh",
        "values": [
          0,
          0,
          0,
          0,
          1,
          1
        ]
      }
    ],
    "columns": [
      "Thời gian (ns)",
      "state",
      "elapsed",
      "lights_a",
      "lights_b"
    ],
    "rows": [
      [
        5,
        0,
        0,
        4,
        4
      ],
      [
        15,
        1,
        0,
        1,
        4
      ],
      [
        135,
        2,
        0,
        2,
        4
      ],
      [
        165,
        3,
        0,
        4,
        4
      ],
      [
        175,
        4,
        0,
        4,
        1
      ]
    ],
    "prompt": "A xanh, A vàng và AFTER_A kéo dài lần lượt bao nhiêu tick?",
    "options": [
      "11, 2, 0",
      "13, 4, 2",
      "12, 3, 1",
      "120, 30, 10"
    ],
    "correct": 2,
    "hint": "Lấy mốc vào pha sau trừ mốc vào pha hiện tại, rồi chia 10 ns/tick.",
    "explanation": "A xanh từ 15 đến 135 ns, A vàng từ 135 đến 165 ns, AFTER_A từ 165 đến 175 ns. Các khoảng 120, 30 và 10 ns tương ứng 12, 3 và 1 tick.",
    "evidence": "controller.vcd · tb_controller · 5–185 ns. sim/tb_controller.sv · initial · dòng 55–60."
  },
  {
    "id": "chot-pending",
    "title": "Xác định cạnh chốt nút",
    "note": "Dữ liệu lưu sẵn · controller.vcd · 20261123T143101Z-d50ee175. Trục ns mô phỏng. Clock vẫn có cạnh lên mỗi 10 ns; tick bị giữ ở 0 cho đến 440 ns. Một cạnh lên chỉ tính là tick nếu tick=1 trước cạnh.",
    "times": [
      425,
      430,
      435,
      440,
      445,
      450
    ],
    "signals": [
      {
        "label": "clk",
        "values": [
          1,
          0,
          1,
          0,
          1,
          0
        ]
      },
      {
        "label": "tick",
        "values": [
          0,
          0,
          0,
          1,
          1,
          1
        ]
      },
      {
        "label": "ped_button",
        "values": [
          0,
          1,
          1,
          0,
          0,
          0
        ]
      }
    ],
    "columns": [
      "Thời gian (ns)",
      "clk",
      "tick",
      "ped_button",
      "ped_pending",
      "elapsed"
    ],
    "rows": [
      [
        425,
        1,
        0,
        0,
        0,
        4
      ],
      [
        430,
        0,
        0,
        1,
        0,
        4
      ],
      [
        435,
        1,
        0,
        1,
        "?",
        4
      ],
      [
        440,
        0,
        1,
        0,
        "?",
        4
      ],
      [
        445,
        1,
        1,
        0,
        "?",
        5
      ]
    ],
    "prompt": "ped_pending bắt đầu bằng 1 tại mốc nào?",
    "options": [
      "425 ns",
      "430 ns",
      "435 ns",
      "445 ns"
    ],
    "correct": 2,
    "hint": "Nút lên tại 430 ns khi clk xuống. Thanh ghi lấy mẫu nút ở cạnh lên, kể cả khi tick=0.",
    "explanation": "Nút lên tại 430 ns, cạnh lên kế tiếp 435 ns chốt yêu cầu trong khi elapsed vẫn bằng 4. Tick trở lại 1 tại 440 ns và elapsed chỉ tăng ở 445 ns.",
    "evidence": "controller.vcd · tb_controller · 425–450 ns. sim/tb_controller.sv · initial · dòng 61–67. rtl/traffic_controller.v · thanh ghi · dòng 43–60."
  },
  {
    "id": "bien-after-a",
    "title": "Đọc yêu cầu đúng ranh giới AFTER_A",
    "note": "Dữ liệu lưu sẵn · controller.vcd · 20261123T143101Z-d50ee175. Trục ns mô phỏng; tick=1 và 10 ns giữa hai cạnh lên. new_request là tín hiệu tổ hợp; giá trị sau cạnh có thể khác giá trị được dùng trước cạnh.",
    "times": [
      1420,
      1425,
      1430,
      1435,
      1440
    ],
    "signals": [
      {
        "label": "clk",
        "values": [
          0,
          1,
          0,
          1,
          0
        ]
      },
      {
        "label": "ped_button",
        "values": [
          0,
          0,
          1,
          1,
          1
        ]
      },
      {
        "label": "new_request",
        "values": [
          0,
          0,
          1,
          0,
          0
        ]
      }
    ],
    "columns": [
      "Thời gian (ns)",
      "state",
      "new_request",
      "ped_pending",
      "walk",
      "resume_b"
    ],
    "rows": [
      [
        1425,
        3,
        0,
        0,
        0,
        0
      ],
      [
        1430,
        3,
        1,
        0,
        0,
        0
      ],
      [
        1435,
        "?",
        0,
        "?",
        "?",
        "?"
      ]
    ],
    "prompt": "Sau 1435 ns, bộ điều khiển đi tới pha nào và resume_b lưu gì?",
    "options": [
      "B_GREEN, resume_b=0",
      "PED_WALK, resume_b=0",
      "AFTER_A, resume_b=1",
      "PED_WALK, resume_b=1"
    ],
    "correct": 3,
    "hint": "Tại 1430 ns, new_request=1 trong AFTER_A dù ped_pending vẫn 0. Điều kiện chọn pha xem cả hai tín hiệu.",
    "explanation": "FSM lấy new_request trước cạnh nên vào PED_WALK, xóa pending và chốt resume_b=1 vì vừa hết AFTER_A. Khi hết CLEAR sẽ quay sang B xanh.",
    "evidence": "controller.vcd · tb_controller.dut · 1425–1435 ns. sim/tb_controller.sv · initial · dòng 75–79. rtl/traffic_controller.v · next_state và thanh ghi · dòng 32–33, 50–57."
  }
];
