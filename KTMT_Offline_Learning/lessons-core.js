(function () {
  "use strict";

  const course = window.KTMT = window.KTMT || {};
  const escapeCode = (code) => code.replace(/[&<>]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;"
  }[character]));
  const extract = (path, block, lines, code) => `<figure class="code-extract"
    data-file="${path}" data-lines="${lines}"><figcaption class="source-line">
    Trích nguyên văn · <code>${path}</code> · ${block} · dòng ${lines}</figcaption>
    <pre><code>${escapeCode(code)}</code></pre></figure>`;

  course.coreLessons = [
    {
      id: "nen-tang",
      title: "Nền tảng Verilog qua mạch đèn",
      summary: "Đọc cổng, tham số và hai loại logic. Dự đoán điều xảy ra trước và sau một cạnh clock.",
      html: `
        <h2>Từ cổng đến thanh ghi</h2>
        <p><code>module</code> đặt tên cho một khối có cổng <code>input</code> và <code>output</code>.
        Mỗi instance có các kết nối và trạng thái riêng. Trong <code>traffic_top</code>, <code>[7:0]</code>
        cho hàng đợi 8 bit (0–255), <code>[2:0]</code> cho mã đèn 3 bit, <code>[3:0]</code> cho mã pha
        và <code>[15:0]</code> cho thời gian. Cổng không ghi dải bit có độ rộng 1.</p>
        <dl>
          <dt><code>parameter</code> và <code>localparam</code></dt>
          <dd>Tham số cấu hình được ấn định khi tạo instance. <code>tb_top</code> cấp <code>#(4)</code>
          để thay giá trị mặc định 50.000.000. Hằng nội bộ <code>WIDTH</code> tính độ rộng bộ đếm
          từ cấu hình, còn hằng <code>BOOT</code> đến <code>PED_CLEAR</code> đặt mã pha.</dd>
          <dt><code>wire</code> và <code>assign</code></dt>
          <dd><code>wire</code> là đường nối do biểu thức liên tục hoặc cổng module điều khiển.
          <code>assign walk=(state==PED_WALK)</code> bám theo <code>state</code> sau khi tín hiệu ổn định.</dd>
          <dt><code>reg</code> và khối tổ hợp</dt>
          <dd><code>reg</code> cho phép gán trong một khối thủ tục. <code>next_state</code> là <code>reg</code>
          được tính tổ hợp với <code>always @*</code>. Lệnh mặc định <code>next_state=state</code>
          bảo đảm có giá trị trên mọi nhánh. Phép <code>=</code> cập nhật ngay trong trình tự khối.</dd>
          <dt>Khối tuần tự và <code>&lt;=</code></dt>
          <dd><code>always @(posedge clk)</code> chạy tại cạnh 0→1. Biểu thức vế phải dùng giá trị lúc
          thực thi khối và phép gán không chặn <code>&lt;=</code> cập nhật thanh ghi ở vùng cập nhật NBA
          của cùng mốc thời gian. <code>if(rst)</code> được kiểm tra trong khối cạnh lên nên reset đồng bộ
          mức cao. Bộ đếm giữ một số qua các cạnh và tăng hoặc xóa theo điều kiện.</dd>
        </dl>
        ${extract("rtl/second_tick.v", "second_tick, bộ đếm và tín hiệu tick", "5–11", `    localparam integer WIDTH=(CYCLES_PER_SECOND<=1) ? 1 : $clog2(CYCLES_PER_SECOND);
    reg [WIDTH-1:0] counter;
    assign tick=!rst && (counter==CYCLES_PER_SECOND-1);
    always @(posedge clk) begin
        if(rst || tick) counter<=0;
        else counter<=counter+1'b1;
    end`)}
        <h3>Dự đoán hai phép gán</h3>
        <figure><figcaption>Ví dụ tự viết · hai thanh ghi 4 bit vừa được khởi tạo, <code>a=2</code> và <code>b=9</code></figcaption>
        <pre><code>always @(posedge clk) begin
    a &lt;= a + 1;
    b &lt;= a;
end</code></pre></figure>
        <details class="self-check"><summary>Sau một cạnh, a và b bằng bao nhiêu?</summary>
        <p><code>a=3</code> và <code>b=2</code>. Cả hai vế phải được tính trước khi cặp thanh ghi
        nhận giá trị mới. Nếu đổi cả hai phép thành <code>=</code> trong cùng khối theo đúng thứ tự
        trên, phép đọc thứ hai sẽ thấy <code>a=3</code> và cho <code>b=3</code>. Hãy giữ kiểu gán
        không chặn cho thanh ghi RTL để mô tả cách hai thanh ghi lấy mẫu ở cùng cạnh.</p></details>
        <h2>Đọc từ phía testbench</h2>
        <p><code>&#96;timescale 1ns/1ps</code> đặt đơn vị trễ 1 ns và độ chính xác 1 ps.
        <code>reg clk=0;always #5 clk=~clk;</code> trong <code>tb_top</code> tạo clock chu kỳ 10 ns
        trong mô phỏng. Task <code>cycle</code> chờ cạnh lên rồi đợi <code>#1</code> (1 ns) để đọc
        trạng thái, đèn và cờ đã ổn định. Cùng task chờ cạnh xuống trước khi trả về để đầu vào có
        thể đổi trước cạnh lên tiếp theo.</p>
        ${extract("sim/tb_top.sv", "tb_top.cycle, kiểm cặp đèn", "21–24", `            if({la,lb} !== expected_lamps)
                $fatal(1,"Top lamps state=%0d A=%0d B=%0d expected=%0d/%0d",
                       state,la,lb,expected_lamps[5:3],expected_lamps[2:0]);
            @(negedge clk);`)}
        <p><code>{la,lb}</code> ghép 2 bus 3 bit thành bus 6 bit. <code>!==</code> phát hiện cả
        sai lệch do X/Z khi so với cặp đèn đã biết. <code>$fatal</code> dừng lần mô phỏng với lỗi,
        in trạng thái và giá trị đối chiếu để khoanh vùng sự cố. Runner kiểm tra mã thoát của tiến trình.</p>
        <p><a href="#code/rtl%2Fsecond_tick.v/5">Đọc bộ đếm trong trình đọc mã</a>.</p>
        <p class="source-line">Đọc tiếp <code>rtl/traffic_top.v:3–15</code>,
        <code>rtl/traffic_controller.v:15–19,25–27,43–64</code>, <code>sim/tb_top.sv:1–25</code>,
        <code>scripts/run_tests.py:36–47,100–104</code>.</p>`
    },
    {
      id: "so-do",
      title: "Sơ đồ khối và luồng dữ liệu",
      summary: "Theo dấu clock, số xe, quyết định hết xanh và vòng phản hồi của testbench.",
      html: `
        <h2>Một clock, hai cổng hàng đợi</h2>
        <figure class="flow-diagram">
          <figcaption>Sơ đồ dựng từ các kết nối trong RTL và testbench</figcaption>
          <div class="table-scroll diagram-scroll" tabindex="0" aria-label="Sơ đồ kết nối hai khối của traffic_top và vòng phản hồi mô phỏng">
          <svg class="block-diagram" viewBox="0 0 780 296" role="img" aria-label="Trong traffic_top, second_tick cấp tick cho traffic_controller. Trong tb_system, đèn xanh điều khiển queue_model và số xe truyền trở lại controller.">
            <defs><marker id="flow-tip" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L7 3L0 6Z" class="flow-tip"/></marker></defs>
            <rect class="flow-frame" x="6" y="7" width="768" height="142" rx="12"/>
            <text class="flow-title" x="23" y="34">traffic_top</text>
            <text class="flow-meta" x="165" y="34">clk và rst dùng chung</text>
            <rect class="flow-box" x="23" y="61" width="155" height="62" rx="8"/>
            <text x="46" y="98">second_tick</text>
            <path class="flow-edge" d="M178 92H287" marker-end="url(#flow-tip)"/>
            <text class="flow-meta" x="210" y="81">tick</text>
            <rect class="flow-box" x="291" y="61" width="250" height="62" rx="8"/>
            <text x="309" y="88">traffic_controller</text>
            <text class="flow-meta" x="309" y="110">green_policy: pa, pb</text>
            <path class="flow-edge" d="M754 92H545" marker-end="url(#flow-tip)"/>
            <text class="flow-meta" x="562" y="81">queue_a/b bên ngoài</text>
            <rect class="flow-frame" x="6" y="157" width="768" height="132" rx="12"/>
            <text class="flow-title" x="23" y="184">tb_system</text>
            <text class="flow-meta" x="165" y="184">tick=1 tại cổng controller</text>
            <rect class="flow-box" x="23" y="198" width="250" height="67" rx="8"/>
            <text x="39" y="236">traffic_controller</text>
            <rect class="flow-box" x="536" y="198" width="220" height="67" rx="8"/>
            <text x="554" y="236">queue_model × 2</text>
            <path class="flow-edge" d="M273 220H532" marker-end="url(#flow-tip)"/>
            <path class="flow-edge" d="M536 248H277" marker-end="url(#flow-tip)"/>
            <text class="flow-meta" x="339" y="212">la[0], lb[0]</text>
            <text class="flow-meta" x="339" y="272">qa, qb</text>
          </svg></div>
          <div class="table-scroll"><table>
            <thead><tr><th>Phạm vi</th><th>Nguồn</th><th>Tín hiệu</th><th>Đích</th></tr></thead>
            <tbody>
              <tr><td><code>traffic_top</code></td><td><code>second_tick</code></td><td><code>tick</code> →</td><td><code>traffic_controller</code></td></tr>
              <tr><td><code>traffic_top</code></td><td>Cổng đầu vào</td><td><code>queue_a/b</code>, <code>mode_select</code>, <code>ped_button</code> →</td><td><code>traffic_controller</code></td></tr>
              <tr><td>Trong controller</td><td>Hai instance <code>green_policy</code></td><td><code>end_a/end_b</code> →</td><td>Logic <code>next_state</code></td></tr>
              <tr><td><code>tb_system</code></td><td><code>traffic_controller</code></td><td><code>la[0]/lb[0]</code> →</td><td>Hai <code>queue_model</code></td></tr>
              <tr><td><code>tb_system</code></td><td>Hai <code>queue_model</code></td><td><code>qa/qb</code> →</td><td>Controller và <code>demand_level</code></td></tr>
            </tbody>
          </table></div>
        </figure>
        <p><code>traffic_top</code> đưa cùng <code>clk</code> và <code>rst</code> vào bộ chia và bộ
        điều khiển. Hai đầu vào hàng đợi 8 bit nằm tại ranh giới RTL với nơi cung cấp dữ liệu.
        Trong <code>tb_system</code>, lịch <code>arrivals_a/b</code> cấp xe đến cho các
        <code>queue_model</code>. Bench nối controller trực tiếp với <code>tick=1</code> để chạy nhanh.
        <code>tb_top</code> đi qua wrapper và dùng bộ chia 4 clock/tick.</p>
        ${extract("rtl/traffic_top.v", "traffic_top, kết nối hai instance", "11–15", `    wire tick;
    second_tick #(CYCLES_PER_SECOND) clock_divider(clk,rst,tick);
    traffic_controller controller(clk,rst,tick,mode_select,ped_button,
        queue_a,queue_b,state,elapsed,mode_active,ped_pending,
        lights_a,lights_b,walk,remaining);`)}
        <h3>Theo cổng theo thứ tự</h3>
        ${extract("rtl/traffic_controller.v", "traffic_controller, hai instance chính sách", "20–24", `    wire end_a, end_b;
    green_policy #(FIXED_GREEN,MIN_GREEN,MAX_GREEN) pa
        (mode_active,elapsed,queue_a,queue_b,end_a);
    green_policy #(FIXED_GREEN,MIN_GREEN,MAX_GREEN) pb
        (mode_active,elapsed,queue_b,queue_a,end_b);`)}
        <p>Cổng thứ ba của <code>green_policy</code> là <code>own_queue</code>, cổng thứ tư là
        <code>other_queue</code>. Với <code>pa</code>, A là phía đang được xét. Với <code>pb</code>,
        B là phía đang được xét. Khi ở <code>A_GREEN</code> hoặc <code>B_GREEN</code>, FSM dùng
        kết quả tương ứng. Cả hai instance luôn có thể tính kết quả tổ hợp.</p>
        <p><code>demand_level</code> phân lớp <code>0 → 0</code>, <code>1–3 → 1</code>,
        <code>4–9 → 2</code> và <code>10–255 → 3</code>. Các mức được đưa lên dạng sóng quan sát.
        Chính sách so trực tiếp hai bus 8 bit. Ví dụ A có 4 xe và B có 9 xe, cả hai cùng mức 2
        nhưng <code>9 &gt; 4</code> vẫn đúng.</p>
        <h3>Hai đèn trở lại mô hình xe</h3>
        <p><code>la[0]</code> và <code>lb[0]</code> là bit xanh. Mô hình phục vụ theo bit xanh và
        số xe ổn định <strong>trước</strong> cạnh clock. Tại cạnh tick, controller và hai bộ đếm xe
        cùng đọc giá trị cũ. Số xe mới sau cập nhật lại truyền về controller để tính quyết định
        cho lần lấy mẫu tiếp theo. Trên phần cứng, phương thức cấp ước lượng xe cần một thiết kế riêng.</p>
        <details class="self-check"><summary>Nối cùng thứ tự A, B cho cả pa và pb sẽ gây lỗi gì?</summary>
        <p>Trong <code>B_GREEN</code>, <code>pb</code> sẽ xử lý A là hướng đang xanh. Với A=9,
        B=4 và <code>elapsed=5</code>, ghép đúng cho <code>other_queue=9</code> và kết thúc xanh B ở
        tick đó. Ghép sai cho <code>other_queue=4</code>, nên B giữ xanh thêm.</p></details>
        <p><a href="#code/rtl%2Ftraffic_top.v/11">Mở kết nối trong traffic_top</a>.</p>
        <p class="source-line">Nguồn <code>rtl/green_policy.v:5–14</code>,
        <code>rtl/demand_level.v:1–5</code>, <code>sim/tb_system.sv:4–13,54–63,99–107</code>,
        <code>sim/tb_top.sv:7</code>, <code>demo.gtkw:17–30</code>.</p>`
    },
    {
      id: "clock-fsm",
      title: "Clock, tick và máy trạng thái",
      summary: "Tính chu kỳ tick, truy vết đủ chín pha và giải thích vì sao so với duration − 1.",
      html: `
        <h2>Từ chu kỳ clock đến một tick</h2>
        <p>Bộ chia cho một cạnh hiệu lực mỗi <code>CYCLES_PER_SECOND</code> clock. <code>tick</code>
        làm clock enable trong khối cạnh lên <code>clk</code>; mọi thanh ghi dùng chung clock.
        Với N=4, ở bốn cạnh đầu sau reset, giá trị <code>counter</code> trước cạnh lần lượt là
        0, 1, 2, 3. <code>tick</code> trước các cạnh là 0, 0, 0, 1. Cạnh thứ tư đồng thời đưa
        <code>counter</code> về 0 và cho FSM tiến một tick.</p>
        <p>Khoảng cách giữa các tick là <strong>N / f<sub>clk</sub></strong>. Mặc định N=50.000.000
        cho một giây thực khi clock thực là 50 MHz. Nếu clock là 100 MHz, giữ N đó cho 0,5 giây,
        hoặc đặt N=100.000.000 để có một giây. Trong <code>tb_top</code>, N=4 và clock 10 ns
        nên mỗi tick cách nhau 40 ns mô phỏng. Trong <code>tb_system</code>, controller nhận
        <code>tick=1</code> mỗi clock, tương ứng 10 ns mô phỏng cho một giây của mô hình.</p>
        <details class="self-check"><summary>Clock 25 MHz cần N bằng bao nhiêu cho một tick mỗi giây?</summary>
        <p>Đặt <code>CYCLES_PER_SECOND=25_000_000</code>. Clock 25 MHz có 25.000.000 cạnh lên mỗi giây.
        Nếu giữ N mặc định 50.000.000, mỗi tick cách nhau hai giây.</p></details>
        <div class="callout"><strong>Phân biệt hai quan sát reset.</strong> <code>rst=1</code>
        khóa <code>tick</code> qua biểu thức tổ hợp ngay khi tín hiệu ổn định. Giá trị
        <code>counter</code> và <code>state</code> được reset ở cạnh lên có <code>rst=1</code>.</div>
        <h2>Chín trạng thái từ thanh ghi đến đèn</h2>
        <p><code>next_state</code> là đề xuất tổ hợp, có thể đổi giữa các cạnh. <code>state</code> là
        pha đang bật đèn. Ngoài reset, FSM chỉ ghi <code>state</code> và cập nhật <code>elapsed</code>
        ở cạnh có <code>tick=1</code>. Giữ pha thì <code>elapsed</code> tăng đến mức bão hòa
        65.535. Đổi pha thì <code>elapsed=0</code>. Đèn mã hóa theo <code>{đỏ,vàng,xanh}</code>
        với <code>100=4</code>, <code>010=2</code> và <code>001=1</code>.</p>
        <div class="table-scroll"><table>
          <thead><tr><th>Mã</th><th>Pha</th><th>A / B</th><th>Tick trong pha</th><th>Sau pha</th></tr></thead>
          <tbody>
            <tr><td>0</td><td><code>BOOT</code></td><td>Đỏ / Đỏ</td><td>1</td><td><code>A_GREEN</code></td></tr>
            <tr><td>1</td><td><code>A_GREEN</code></td><td>Xanh / Đỏ</td><td>12 hoặc 6–20</td><td><code>A_YELLOW</code></td></tr>
            <tr><td>2</td><td><code>A_YELLOW</code></td><td>Vàng / Đỏ</td><td>3</td><td><code>AFTER_A</code></td></tr>
            <tr><td>3</td><td><code>AFTER_A</code></td><td>Đỏ / Đỏ</td><td>1</td><td><code>B_GREEN</code> hoặc <code>PED_WALK</code></td></tr>
            <tr><td>4</td><td><code>B_GREEN</code></td><td>Đỏ / Xanh</td><td>12 hoặc 6–20</td><td><code>B_YELLOW</code></td></tr>
            <tr><td>5</td><td><code>B_YELLOW</code></td><td>Đỏ / Vàng</td><td>3</td><td><code>AFTER_B</code></td></tr>
            <tr><td>6</td><td><code>AFTER_B</code></td><td>Đỏ / Đỏ</td><td>1</td><td><code>A_GREEN</code> hoặc <code>PED_WALK</code></td></tr>
            <tr><td>7</td><td><code>PED_WALK</code></td><td>Đỏ / Đỏ</td><td>6</td><td><code>PED_CLEAR</code></td></tr>
            <tr><td>8</td><td><code>PED_CLEAR</code></td><td>Đỏ / Đỏ</td><td>1</td><td><code>B_GREEN</code> sau A, <code>A_GREEN</code> sau B</td></tr>
          </tbody>
        </table></div>
        <p>Cùng sáng đỏ nhưng <code>AFTER_A</code> và <code>AFTER_B</code> phân biệt hướng vừa chạy.
        Cả hai bit xanh đồng thời bằng 1 sẽ đòi hỏi <code>state</code> vừa bằng <code>A_GREEN</code>
        vừa bằng <code>B_GREEN</code>. Mã trạng thái tách biệt khiến điều đó không xảy ra với
        <code>state</code> hợp lệ, và testbench kiểm tra điều kiện ở các cạnh đã chạy.</p>
        <h3>Vì sao pha vàng kiểm tra elapsed ≥ 3 − 1?</h3>
        <figure class="timing-model">
          <figcaption>Timeline minh họa · giá trị tương đối từ cạnh vừa vào <code>A_YELLOW</code>,
          mỗi cột tiếp theo cách nhau một tick</figcaption>
          <div class="table-scroll"><table>
            <thead><tr><th>Mốc</th><th>Vào pha</th><th>Tick 1</th><th>Tick 2</th><th>Tick 3</th></tr></thead>
            <tbody>
              <tr><th scope="row">Elapsed trước cạnh</th><td>—</td><td>0</td><td>1</td><td>2</td></tr>
              <tr><th scope="row">Elapsed ≥ 2?</th><td>—</td><td>Chưa</td><td>Chưa</td><td>Có</td></tr>
              <tr><th scope="row">Pha sau cạnh</th><td>A vàng</td><td>A vàng</td><td>A vàng</td><td>Đỏ toàn phần</td></tr>
              <tr><th scope="row">Elapsed sau cạnh</th><td>0</td><td>1</td><td>2</td><td>0</td></tr>
            </tbody>
          </table></div>
        </figure>
        <p>Khoảng từ cạnh vào vàng đến cạnh vào đỏ chứa đúng ba tick. Ngay trước cạnh kết thúc,
        đã ghi nhận hai tick hoàn tất; cạnh đang xét hoàn tất tick thứ ba. Nếu so
        <code>elapsed &gt;= 3</code>, sẽ giữ vàng qua cạnh thứ ba và chỉ đổi ở cạnh thứ tư.
        Với xanh cố định, áp dụng cùng cách đếm cho ngưỡng 11 và thời lượng 12 tick.</p>
        <p><code>remaining</code> là <code>max(limit − elapsed, 0)</code> của pha đang hiển thị.
        Trong xanh thích ứng, <code>limit=20</code> nên số hiển thị là cận trên. Tại
        <code>elapsed=5</code>, màn hình có thể hiện 15, nhưng FSM sẽ chuyển ngay ở cạnh tick kế
        nếu phía đối diện đông hơn. Khi đổi pha, <code>remaining</code> chuyển sang giới hạn của pha mới.</p>
        <p><a href="#fsm">Mở mô phỏng FSM để kiểm tra cạnh chuyển vàng</a>.
        <a href="#wave">Luyện đo độ dài pha từ dạng sóng</a>.</p>
        <p class="source-line">Nguồn <code>rtl/second_tick.v:2–11</code>,
        <code>rtl/traffic_controller.v:2–4,15–17,25–42,43–75</code>,
        <code>sim/tb_controller.sv:16–30,45–59,106–120</code>, <code>sim/tb_top.sv:27–34</code>,
        <code>sim/tb_system.sv:3–4,11</code>.</p>`
    },
    {
      id: "thich-ung",
      title: "Chính sách thích ứng và hàng đợi",
      summary: "Tính cạnh hết xanh bằng số xe trước cạnh. Kiểm tra lịch phục vụ, xe đến/đi và bão hòa.",
      html: `
        <h2>Tính cạnh kết thúc xanh</h2>
        ${extract("rtl/green_policy.v", "green_policy, biểu thức finish_green", "11–14", `    assign finish_green = adaptive
        ? ((elapsed >= MAX_GREEN-1) ||
           ((elapsed >= MIN_GREEN-1) && (other_queue > own_queue)))
        : (elapsed >= FIXED_GREEN-1);`)}
        <p>Cố định kết thúc xanh ở tick thứ 12. Thích ứng kết thúc sớm nhất ở tick thứ 6 và buộc
        kết thúc ở tick thứ 20. Xét <code>elapsed</code> và số xe <strong>trước</strong> cạnh
        clock có tick, kể cả khi xe cũng đến hoặc đi tại chính cạnh đó.</p>
        <div class="table-scroll"><table>
          <thead><tr><th>Chế độ</th><th>Elapsed</th><th>Đang xanh / đối diện</th><th>Kết quả sau tick</th></tr></thead>
          <tbody>
            <tr><td>Thích ứng</td><td>4</td><td>0 / 10</td><td>Giữ xanh, tick này mới hoàn tất tick thứ 5.</td></tr>
            <tr><td>Thích ứng</td><td>5</td><td>2 / 7</td><td>Sang vàng, đủ 6 tick và đối diện đông hơn.</td></tr>
            <tr><td>Thích ứng</td><td>5</td><td>7 / 7</td><td>Giữ xanh vì so sánh dùng dấu lớn hơn nghiêm ngặt.</td></tr>
            <tr><td>Thích ứng</td><td>19</td><td>30 / 0</td><td>Sang vàng ở giới hạn 20 tick.</td></tr>
            <tr><td>Cố định</td><td>11</td><td>30 / 0</td><td>Sang vàng ở tick thứ 12, bất kể số xe.</td></tr>
          </tbody>
        </table></div>
        <p>Hai lượt xanh vẫn luân phiên, kể cả khi một phía trống. Giới hạn 20 tick làm mỗi lượt
        xanh hữu hạn. Thời gian chờ của từng xe còn phụ thuộc số xe đến và khả năng phục vụ.</p>
        <div class="callout"><strong>Đối chiếu cách diễn đạt.</strong>
        <code>docs/THIET_KE.md:37–40</code> mô tả điều kiện thời lượng sau khi hoàn tất tick.
        Khi truy vết, dùng <code>elapsed</code> và số xe trước cạnh theo <code>rtl/green_policy.v:11–14</code>
        và <code>rtl/traffic_controller.v:21–24,51–58</code>. <code>docs/THIET_KE.md:85</code>
        xác nhận thứ tự cập nhật xe này.</div>
        <h2>Một tick trong mô hình xe</h2>
        ${extract("sim/queue_model.v", "queue_model, phục vụ và cập nhật hàng đợi", "12–21", `    assign departed=!rst && tick && green && queue!=0 && service_elapsed==SERVICE_SECONDS-1;
    always @(posedge clk) begin
        if(rst) begin queue<=0; service_elapsed<=0; overflow<=0; end
        else if(tick) begin
            if(!green || queue==0 || service_elapsed==SERVICE_SECONDS-1) service_elapsed<=0;
            else service_elapsed<=service_elapsed+1'b1;
            updated=queue+arrivals-(departed ? 1 : 0);
            overflow<=(updated>255);
            queue<=(updated>255) ? 255 : updated;
        end`)}
        <p>Mỗi xe cần hai tick liên tiếp đủ điều kiện xanh và có xe chờ. Tick đầu tăng
        <code>service_elapsed</code> lên 1. Tick thứ hai có <code>departed=1</code> trước cạnh
        và đưa bộ đếm phục vụ về 0. Một tick thấy đèn hết xanh (vàng hoặc đỏ) hoặc hàng đợi
        bằng 0 làm mất phần phục vụ dở.</p>
        <div class="table-scroll"><table>
          <thead><tr><th>Tình huống tại tick</th><th>Phép tính theo số liệu trước cạnh</th><th>Sau cạnh</th></tr></thead>
          <tbody>
            <tr><td>Xe đến/đi đồng thời khi đang xanh</td><td><code>queue=2</code>,
              <code>arrivals=3</code>, đã có một tick phục vụ → <code>2+3−1</code></td><td>4 xe chờ.</td></tr>
            <tr><td>Xe đến lúc hàng đợi rỗng</td><td><code>queue=0</code>,
              <code>arrivals=1</code> → <code>departed=0</code></td><td>1 xe chờ, bộ đếm phục vụ vẫn 0.</td></tr>
            <tr><td>Bão hòa khi đèn đỏ</td><td><code>queue=250</code>,
              <code>arrivals=15</code> → <code>updated=265</code></td><td>255 xe chờ, <code>overflow=1</code>.</td></tr>
          </tbody>
        </table></div>
        <p><code>arrivals[3:0]</code> nhận 0–15 xe mỗi tick. Biến trung gian <code>updated</code>
        có kiểu <code>integer</code> để so 255 trước khi ghi bus 8 bit. Hàng đợi rỗng không thể trừ
        thành số âm vì <code>departed</code> yêu cầu <code>queue!=0</code>. <code>overflow</code>
        phản ánh lần cập nhật tick gần nhất, được tính lại ở tick sau và xóa tại reset.</p>
        <details class="self-check"><summary>Nếu phía đối diện tăng từ 2 lên 7 xe tại cạnh đủ 6 tick?</summary>
        <p>Giả sử A đang xanh với A=2, B=2 trước cạnh và B nhận thêm 5 xe. FSM thấy bằng nhau
        nên giữ A xanh ở cạnh đó. Sau cạnh, B=7. Nếu A vẫn ít hơn B tại cạnh tick kế tiếp, A sang vàng
        ở tick thứ 7. Theo dõi <code>state</code> sau cạnh và phân biệt với <code>next_state</code>
        có thể đổi ngay khi hàng đợi mới xuất hiện.</p></details>
        <p><a href="#compare">So sánh hai chế độ với cùng đầu vào</a>.</p>
        <p class="source-line">Ca thử <code>sim/tb_units.sv:8–26</code>,
        <code>sim/tb_controller.sv:68–74</code>, <code>sim/tb_system.sv:30–63,137–148</code>.</p>`
    },
    {
      id: "nguoi-di-bo",
      title: "Người đi bộ và reset",
      summary: "Theo dõi cạnh nút, cờ chờ, hướng trở lại và cách reset chốt chế độ.",
      html: `
        <h2>Bắt nút theo clock, tiến pha theo tick</h2>
        <p><code>new_request = ped_button &amp;&amp; !button_prev</code> so mức nút hiện tại với
        thanh ghi mức nút ở cạnh trước. Các ca dưới đây cấp mức nút ổn định trước cạnh lấy mẫu.
        Khi nhả reset, controller cập nhật <code>button_prev</code>
        ở mọi cạnh lên. Một cạnh thấy nút mới trong pha khác <code>PED_WALK</code> đặt cờ
        <code>ped_pending</code>, kể cả khi <code>tick=0</code>. Nhiều lượt bấm trong lúc cờ đã 1
        cùng được biểu diễn bởi một bit chờ.</p>
        ${extract("rtl/traffic_controller.v", "traffic_controller, khối tuần tự", "43–61", `    always @(posedge clk) begin
        if(rst) begin
            state<=BOOT; elapsed<=0; mode_active<=mode_select;
            ped_pending<=0; button_prev<=0; resume_b<=0;
        end else begin
            button_prev<=ped_button;
            // A rising edge during WALK is ignored; holding the button never repeats.
            if(new_request && state!=PED_WALK) ped_pending<=1;
            if(tick) begin
                if(next_state!=state) begin
                    state<=next_state; elapsed<=0;
                    if(next_state==PED_WALK) begin
                        ped_pending<=0;
                        resume_b<=(state==AFTER_A);
                    end
                end else if(elapsed != 16'hffff) elapsed<=elapsed+1'b1;
            end
        end
    end`)}
        <h3>Tám tình huống tại cạnh lên</h3>
        <div class="table-scroll"><table>
          <thead><tr><th>Trước cạnh</th><th>Sau cạnh</th><th>Bằng chứng</th></tr></thead>
          <tbody>
            <tr><td>Có xung nút giữa hai tick và cao tại một cạnh</td>
              <td><code>new_request</code> trước cạnh bằng 1, <code>ped_pending</code> được đặt.
              Pha và <code>elapsed</code> giữ nguyên.</td><td><code>sim/tb_top.sv:35–38</code></td></tr>
            <tr><td>Giữ nút qua một lượt đi bộ</td>
              <td><code>button_prev</code> đã bằng 1 từ lần lấy mẫu đầu, nên giữ mức cao không sinh cạnh mới.</td>
              <td><code>sim/tb_controller.sv:76–82</code></td></tr>
            <tr><td><code>new_request=1</code> trước cạnh tick cuối của <code>AFTER_A</code> hoặc <code>AFTER_B</code></td>
              <td><code>ped_pending || new_request</code> chọn <code>PED_WALK</code> ngay.
              <code>walk=1</code>, <code>ped_pending=0</code> vì lệnh xóa khi vào WALK thắng lệnh đặt
              trước đó trong cùng khối. <code>resume_b=1</code> sau A, bằng 0 sau B.</td>
              <td><code>rtl/traffic_controller.v:32–39,50–56</code>. Bench trực tiếp thử ranh giới A ở
              <code>sim/tb_controller.sv:75–78</code>.</td></tr>
            <tr><td>Bấm ở <code>PED_WALK</code>, kể cả cạnh rời WALK</td>
              <td>Lấy mẫu mức nút nhưng bỏ yêu cầu vì <code>state</code> trước cạnh là WALK.
              Sau 6 tick, vào CLEAR và <code>walk=0</code>.</td><td><code>sim/tb_controller.sv:83–85</code>,
              <code>rtl/traffic_controller.v:38,48–50,64</code></td></tr>
            <tr><td>Bấm ở <code>PED_CLEAR</code>, kể cả cạnh rời CLEAR</td>
              <td>Lưu <code>ped_pending=1</code>, tiếp tục hướng đã lưu, và xử lý yêu cầu mới ở cuối
              lượt xe kế tiếp.</td><td><code>sim/tb_controller.sv:86–87</code></td></tr>
            <tr><td>Nút cao trong reset và vẫn cao ở cạnh đầu sau nhả reset</td>
              <td>Reset ghi <code>button_prev=0</code> và xóa cờ. Cạnh đầu ngoài reset nhận
              <code>new_request=1</code> và đặt cờ dù chưa có tick.</td><td><code>sim/tb_controller.sv:96–101</code></td></tr>
            <tr><td>Yêu cầu đến trong <code>BOOT</code></td>
              <td>Giữ yêu cầu. BOOT vẫn đi đến <code>A_GREEN</code> khi đủ đỏ toàn phần.
              Lượt đi bộ sớm nhất bắt đầu ở cuối <code>AFTER_A</code>.</td>
              <td><code>rtl/traffic_controller.v:29–33,48–56</code>, <code>sim/tb_controller.sv:83–85</code></td></tr>
            <tr><td>Kết thúc <code>PED_CLEAR</code></td>
              <td><code>resume_b=1</code> chọn <code>B_GREEN</code>. Nếu bằng 0 thì chọn
              <code>A_GREEN</code>. WALK và CLEAR đều giữ hai hướng xe đỏ.</td>
              <td><code>rtl/traffic_controller.v:39,54–56,62–64</code>,
              <code>sim/tb_controller.sv:76–82</code></td></tr>
          </tbody>
        </table></div>
        <h3>Chọn chế độ tại cạnh reset</h3>
        <p><code>mode_select=0</code> chọn cố định, <code>mode_select=1</code> chọn thích ứng.
        Mỗi cạnh lên có <code>rst=1</code> lấy lại giá trị này vào <code>mode_active</code>,
        đồng thời đưa xe về BOOT (đỏ cả hai hướng), <code>elapsed=0</code> và xóa cờ chờ.
        Ngoài reset, <code>mode_active</code> giữ giá trị đã chốt. Nếu mode đổi trong lúc đang giữ reset,
        cần xét giá trị ở cạnh lên reset cuối cùng. Nhả reset tự nó không chốt mode mới.</p>
        <details class="self-check"><summary>Xung nút nằm trọn giữa hai cạnh clock thì sao?</summary>
        <p>Mạch có thể bỏ lỡ xung vì không cạnh nào thấy mức cao. Giữ nút và chống dội là hai vấn đề
        khác nhau. Nút vật lý có thể dội tạo nhiều lần 0→1, đồng thời có thể đổi gần cạnh lấy mẫu.
        Bản mô phỏng cấp tín hiệu theo clock. Thử FPGA cần đồng bộ đầu vào và lọc dội, rồi kiểm tra
        ràng buộc clock, chân I/O, kết quả tổng hợp và timing trên thiết bị đã chọn.</p></details>
        <p><a href="#fsm">Tái hiện nút giữ qua reset trong mô phỏng FSM</a>.</p>
        <p class="source-line">Nguồn bổ sung <code>sim/tb_controller.sv:33–37,61–67,88–101</code>,
        <code>docs/THIET_KE.md:60–69,89</code>, <code>README.md:70–72</code>,
        báo cáo nguồn <code>bao_cao/Nguon_chinh_sua_mau_Tech.zip → main.tex:194–201,443–456,483</code>.</p>`
    }
  ];

  course.coreQuiz = [
    {
      id: "nba-two-registers", lesson: "nen-tang",
      prompt: "Ví dụ tự viết: trước cạnh a=2, b=9. Trong cùng always @(posedge clk) có a <= a+1; rồi b <= a;. Sau khi tín hiệu ổn định, (a,b) bằng gì?",
      options: ["(3, 3)", "(3, 2)", "(2, 9)", "(2, 3)"],
      correct: 1,
      hint: "Xác định vế phải của b trước khi thanh ghi a nhận giá trị mới.",
      explanation: "Hai vế phải dùng a=2. Cuối bước cập nhật, a nhận 3 và b nhận 2.",
      evidence: "Ví dụ tự viết. Cùng cơ chế gán không chặn được dùng tại rtl/traffic_controller.v:43–58."
    },
    {
      id: "read-after-edge", lesson: "nen-tang",
      prompt: "Vì sao tb_top.cycle dùng @(posedge clk); #1; trước khi so cặp đèn?",
      options: ["Để tạo một clock riêng cho đèn", "Để giữ reset thêm một tick", "Để đọc trạng thái, đèn sau cập nhật tại cạnh lên", "Để đổi độ rộng bus"],
      correct: 2,
      hint: "Với timescale 1ns/1ps, #1 chờ bao nhiêu trong mô phỏng?",
      explanation: "Task chờ thêm 1 ns sau cạnh lên. Lúc đó các thanh ghi cập nhật bằng <= và giải mã tổ hợp đèn đã ổn định, nên phép so kiểm tra đúng mẫu sau cạnh.",
      evidence: "sim/tb_top.sv:1,9–24; rtl/traffic_controller.v:43–64."
    },
    {
      id: "exact-vs-level", lesson: "so-do",
      prompt: "Thích ứng, B đang xanh và elapsed=5. A có 9 xe, B có 4 xe, cả hai cùng mức demand_level=2. Ngay sau cạnh có tick tiếp theo là pha gì?",
      options: ["B_GREEN vì cùng mức 2", "A_GREEN vì A đông hơn", "AFTER_B vì B vừa xanh", "B_YELLOW vì chính sách B thấy đối diện đông hơn"],
      correct: 3,
      hint: "Đọc cổng own_queue và other_queue của instance pb.",
      explanation: "Với B đang xanh, own_queue=4 và other_queue=9. Cạnh này hoàn tất tick thứ 6. Chính sách dùng số xe chính xác, cho next_state=B_YELLOW.",
      evidence: "rtl/traffic_controller.v:23–24,34; rtl/demand_level.v:3–4; rtl/green_policy.v:6–14."
    },
    {
      id: "trace-divider", lesson: "clock-fsm",
      prompt: "Cấu hình 4 clock/tick, chu kỳ clock 10 ns. Ở cạnh lên thứ ba sau cạnh reset cuối cùng, counter trước/sau cạnh và tick trước cạnh là gì?",
      options: ["counter 2→3, tick=0", "counter 3→0, tick=1", "counter 2→0, tick=1", "counter 3→4, tick=0"],
      correct: 0,
      hint: "Bắt đầu đếm từ counter=0 sau cạnh reset. Kiểm tra bộ chia đọc counter ở phía nào của cạnh.",
      explanation: "Ba cạnh đầu lần lượt nạp 1, 2, 3. Sau cạnh thứ ba, tick có thể lên 1 khi counter ổn định ở 3, sẵn để được lấy mẫu ở cạnh thứ tư.",
      evidence: "rtl/second_tick.v:5–10; sim/tb_top.sv:27–30."
    },
    {
      id: "yellow-off-by-one", lesson: "clock-fsm",
      prompt: "Nếu đổi điều kiện rời A_YELLOW thành elapsed >= YELLOW, với YELLOW=3, pha vàng sẽ dài bao nhiêu tick?",
      options: ["2", "3", "4", "5"],
      correct: 2,
      hint: "Tại ba cạnh tick đầu, giá trị trước cạnh là 0, 1 rồi 2.",
      explanation: "Cạnh thứ ba còn giữ vàng và đưa elapsed lên 3. Cạnh thứ tư mới thấy elapsed >= 3 trước cạnh và đổi pha.",
      evidence: "Biến thể tự viết. So với rtl/traffic_controller.v:29–33,51–58 và sim/tb_controller.sv:45–59."
    },
    {
      id: "remaining-bound", lesson: "clock-fsm",
      prompt: "Thích ứng, A xanh với elapsed=5, A=2 và B=7 ngay trước cạnh có tick. remaining cũ bằng 15. Sau cạnh, (state, remaining) là gì?",
      options: ["(A_GREEN, 14)", "(A_YELLOW, 3)", "(A_YELLOW, 15)", "(B_GREEN, 20)"],
      correct: 1,
      hint: "Số 15 là cận trên. Pha kế tiếp có giới hạn riêng và elapsed khởi tạo lại.",
      explanation: "Cạnh thứ 6 kết thúc xanh theo so sánh hàng đợi. A_YELLOW bắt đầu với elapsed=0, limit=3, nên remaining=3.",
      evidence: "rtl/green_policy.v:11–14; rtl/traffic_controller.v:30,51–58,65–75."
    },
    {
      id: "policy-preedge", lesson: "thich-ung",
      prompt: "A xanh thích ứng và elapsed=5. Trước cạnh tick, qa=qb=2. Tại chính cạnh đó B nhận thêm 5 xe. A đổi sang vàng tại cạnh này hay giữ xanh?",
      options: ["Đổi vàng vì ngay sau cạnh qb=7", "Giữ xanh vì cả hai hàng đợi có mức 1 mãi", "Bật B xanh ngay", "Giữ xanh vì quyết định dùng qa=qb=2 trước cạnh"],
      correct: 3,
      hint: "Đặt số xe trước cạnh và số xe sau cạnh thành hai cột rồi xem FSM lấy mẫu cột nào.",
      explanation: "Cả bộ điều khiển và mô hình xe cùng lấy mẫu tại cạnh. So sánh 2 > 2 sai, nên A giữ xanh. B=7 sau cạnh có thể tác động quyết định ở tick kế tiếp.",
      evidence: "rtl/green_policy.v:11–14; rtl/traffic_controller.v:21–24,30,51–58; sim/queue_model.v:13–20."
    },
    {
      id: "queue-arrive-leave", lesson: "thich-ung",
      prompt: "Đèn xanh, queue=2 và service_elapsed=1, SERVICE_SECONDS=2. Cạnh có tick nhận arrivals=3 khi rst=0. (departed trước cạnh, queue sau cạnh) là gì?",
      options: ["(1, 4)", "(0, 5)", "(1, 5)", "(1, 1)"],
      correct: 0,
      hint: "Điều kiện departed dùng hàng đợi cũ. Tính cả hai sự kiện trong một biểu thức.",
      explanation: "Tick xanh thứ hai đủ điều kiện phục vụ một xe. Hàng đợi update thành 2+3−1=4.",
      evidence: "sim/queue_model.v:12–20; sim/tb_system.sv:140–143."
    },
    {
      id: "queue-empty-arrival", lesson: "thich-ung",
      prompt: "Hàng đợi rỗng, đèn xanh và service_elapsed=0. Cạnh có tick nhận một xe. Sau cạnh, số xe và bộ đếm phục vụ bằng bao nhiêu?",
      options: ["0 xe, bộ đếm 0", "1 xe, bộ đếm 1", "1 xe, bộ đếm 0", "0 xe, bộ đếm 1"],
      correct: 2,
      hint: "Điều kiện giữ/xóa bộ đếm phục vụ đọc queue cũ hay queue đã cộng arrivals?",
      explanation: "Trước cạnh queue=0 nên departed=0 và service_elapsed trở về 0. Xe mới chỉ xuất hiện trong queue sau cập nhật.",
      evidence: "sim/queue_model.v:12–20; docs/THIET_KE.md:85–87."
    },
    {
      id: "ped-boundary-b", lesson: "nguoi-di-bo",
      prompt: "Trước cạnh tick cuối AFTER_B, rst=0, ped_pending=0, ped_button=1 đã ổn định và button_prev=0. Sau cạnh, (state, pending, resume_b, walk) là gì?",
      options: ["(A_GREEN, 1, 0, 0)", "(PED_WALK, 0, 0, 1)", "(PED_WALK, 1, 1, 1)", "(PED_CLEAR, 0, 1, 0)"],
      correct: 1,
      hint: "Nhánh rời AFTER_B xét cả ped_pending và new_request. Xem lệnh gán cờ cuối cùng khi vào WALK.",
      explanation: "new_request đủ để chọn PED_WALK ngay. Vào WALK xóa pending và ghi resume_b=0 do pha cũ là AFTER_B. walk đi theo pha mới.",
      evidence: "rtl/traffic_controller.v:18–19,36–39,48–56,64."
    },
    {
      id: "ped-last-walk-edge", lesson: "nguoi-di-bo",
      prompt: "Trước cạnh tick cuối WALK, rst=0, ped_pending=0, ped_button=1 đã ổn định và button_prev=0. Điều gì xảy ra sau cạnh?",
      options: ["Vào CLEAR, lưu yêu cầu mới vì sau cạnh đã ở CLEAR", "Kéo dài WALK thêm một tick", "Chuyển thẳng sang hướng xe kế tiếp", "Vào CLEAR, cờ chờ vẫn bằng 0"],
      correct: 3,
      hint: "Điều kiện chốt nút nhìn state trước hay sau cạnh?",
      explanation: "Pha cũ tại cạnh là PED_WALK nên không đặt pending. Cạnh đủ thời lượng vẫn đưa FSM sang PED_CLEAR; button_prev lấy mức cao.",
      evidence: "rtl/traffic_controller.v:38,48–56; sim/tb_controller.sv:83–87."
    },
    {
      id: "mode-reset-button", lesson: "nguoi-di-bo",
      prompt: "Giữ nút cao qua reset. Ở cạnh reset cuối, mode_select=1. Sau đó hạ rst và đổi mode_select=0 trước cạnh đầu, tick=0. Sau cạnh đầu ngoài reset, (state, mode_active, pending) là gì?",
      options: ["(BOOT, 1, 1)", "(BOOT, 0, 1)", "(A_GREEN, 1, 0)", "(PED_WALK, 1, 0)"],
      correct: 0,
      hint: "Trace button_prev và mode_active ngay sau cạnh reset cuối, rồi đọc các nhánh khi rst=0 và tick=0.",
      explanation: "Cạnh reset trước nạp mode_active=1 và xóa button_prev. Cạnh đầu khi nhả reset giữ mode và BOOT vì tick=0, đồng thời chốt yêu cầu mới từ nút còn cao.",
      evidence: "rtl/traffic_controller.v:18–19,43–58; sim/tb_controller.sv:61–64,96–101."
    }
  ];
})();
