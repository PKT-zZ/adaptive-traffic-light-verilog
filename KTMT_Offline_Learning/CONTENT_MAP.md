# Bản đồ nội dung KTMT Studio

Mở `index.html` và dùng các đường dẫn trong ứng dụng để học hoặc thực hành. Các đường dẫn đến RTL, testbench và tài liệu trong các bảng dưới đây tính từ gốc checkout `adaptive-traffic-light-verilog`.

## Bảy bài học

| Bài | Đích học và thực hành | Nguồn kiểm tra chính |
| --- | --- | --- |
| [`01 · Nền tảng Verilog qua mạch đèn`](index.html#lesson/nen-tang) | Phân biệt mạch tổ hợp và tuần tự, cổng và độ rộng, `parameter`/`localparam`, `wire`/`reg`, `assign`, `always`, `=`/`<=`, cạnh clock và reset đồng bộ. Dự đoán giá trị trước/sau cạnh, đọc `timescale`, `#1`, `$fatal`. | `rtl/second_tick.v` dòng 1–11 · `rtl/traffic_controller.v` dòng 25–64 · `sim/tb_controller.sv` dòng 1–31 và 106–120. |
| [`02 · Sơ đồ khối và luồng dữ liệu`](index.html#lesson/so-do) | Lần theo hai module dưới `traffic_top`, hai policy với thứ tự hàng đợi đảo, vòng phản hồi từ đèn đến mô hình xe. Dùng cùng `level` nhưng số xe khác để suy luận điều kiện xanh. | `rtl/traffic_top.v` dòng 2–16 · `rtl/traffic_controller.v` dòng 18–24 · `rtl/demand_level.v` dòng 1–5 · `sim/tb_system.sv` dòng 5–19. |
| [`03 · Clock, tick và máy trạng thái`](index.html#lesson/clock-fsm) | Tính clock/tick, đọc 9 trạng thái và mã đèn. Theo vết `state`, `next_state`, `elapsed`, `remaining`; đo số khoảng giữa các cạnh và giải thích `duration-1`. | `rtl/second_tick.v` dòng 2–12 · `rtl/traffic_controller.v` dòng 15–77 · `sim/tb_controller.sv` dòng 45–60 · `sim/tb_top.sv` dòng 28–43. |
| [`04 · Chính sách thích ứng và hàng đợi`](index.html#lesson/thich-ung) | So sánh xanh cố định 12 tick với min/max 6/20. Truy vết lượt xe đi trên dữ liệu trước cạnh, cập nhật xe đến/đi đồng thời, hàng rỗng, phục vụ mỗi hai tick đủ điều kiện và bão hòa. | `rtl/green_policy.v` dòng 3–14 · `sim/queue_model.v` dòng 2–22 · `sim/tb_controller.sv` dòng 68–74 · `sim/tb_system.sv` dòng 30–67 và 137–148. |
| [`05 · Người đi bộ và reset`](index.html#lesson/nguoi-di-bo) | Dự đoán nút giữa hai tick và lúc đổi pha, giữ nút, BOOT, WALK/CLEAR, giữ qua reset, hướng tiếp tục; tách `mode_select` và `mode_active`. | `rtl/traffic_controller.v` dòng 18–19 và 29–64 · `sim/tb_controller.sv` dòng 61–67 và 75–102 · `sim/tb_top.sv` dòng 35–43. |
| [`06 · Kiểm thử và đọc kết quả`](index.html#lesson/kiem-thu) | Ghép bốn bench với mục tiêu và một ca, truy vết chuyển pha trên VCD/CSV, đọc số liệu bốn kịch bản cùng đầu vào và giải thích giới hạn của các chỉ số. | `sim/tb_*.sv` · `scripts/run.ps1`, `scripts/run_tests.py`, `scripts/validate_results.py`, `scripts/report.py` · `demo.gtkw` dòng 5 và 17–30 · `docs/DEMO_VA_TIEN_DO.md` dòng 5–19 · `docs/KET_QUA.md` dòng 3–52. |
| [`07 · Bảo vệ và phản biện`](index.html#lesson/bao-ve) | Mở đầu 2 phút, ba lịch trình 3/5/10 phút, thứ tự demo, dự phòng bằng CSV, luyện riêng theo vai trò, trả lời quy tắc → module/tín hiệu → ca thử → giới hạn. | `docs/HIEU_CODE_VA_PHAN_CONG.md` dòng 7–59 · `docs/DEMO_VA_TIEN_DO.md` dòng 21–60 · `README.md` dòng 70–78. |

## Phòng thực hành và điều hướng

| Màn hình | Bạn có thể làm gì | Dữ liệu sử dụng |
| --- | --- | --- |
| [Tổng quan](index.html#home), [tiến độ](index.html#progress) | Vào bài, học tiếp, đánh dấu đã học, đổi sáng/tối, tìm có dấu hoặc không dấu, xuất và nhập JSON. | Lưu trữ cục bộ của Chrome và tệp JSON bạn tải hoặc chọn. |
| [Đọc mã RTL](index.html#code) | Chọn tệp, đến dòng, đọc mã đánh số dòng và mở đối chiếu sau khi tự truy vết. | Mã nguyên văn đóng gói cục bộ. Bài học ghi thêm tên module hoặc khối khi trích đoạn. |
| [Mô phỏng FSM](index.html#fsm) | Bước một cạnh hoặc đến tick kế tiếp, đổi mode, đổi hai hàng đợi, bấm/giữ nút và reset. Đọc trạng thái và lý do trước/sau cạnh. | Mô hình JavaScript của `second_tick`, `green_policy` và `traffic_controller` theo tham số mặc định; lựa chọn 1 hoặc 4 clock/tick. Số xe do người học nhập. |
| [Đọc dạng sóng](index.html#wave) | Chọn bài, nhìn trục ns và quy đổi sang tick, dự đoán tín hiệu, đo pha hoặc tìm cạnh chốt yêu cầu. | Bốn bài dùng `controller.vcd` từ `rtl-run/`. Nhãn trên từng hình và bảng xác định run ID, quy ước thời gian và mẫu trước/sau cạnh. |
| [So sánh chế độ](index.html#compare) | Chọn cân bằng, A đông, B đông hoặc đổi hướng. Đọc xe đến/đi/còn chờ, diện tích, cực đại và khoảng dài nhất theo hướng có xe chờ trong khi đèn chưa xanh. | Bảng số liệu lưu sẵn của lượt chạy Icarus `20261123T143101Z-d50ee175` trong `rtl-run/`. |
| [Quiz truy vết](index.html#quiz) | Lọc theo bài, dự đoán đầu ra hoặc phát hiện lỗi; thử lại sau gợi ý và mở lời giải có dẫn chứng. | Câu hỏi tự biên soạn từ RTL và các phép kiểm đã chỉ rõ. |
| [Bảo vệ thử](index.html#defense) | Chọn chủ đề hoặc vai trò, lên bộ 5–10 câu theo số câu phù hợp, dùng đồng hồ tùy chọn và tự đánh giá. Mở ý cần đạt, lỗi thường gặp, dẫn chứng, câu hỏi phụ và bài cần ôn. | 31 câu vấn đáp và 5 vai trò ghi trong tài liệu phân công. |
| [Flashcard](index.html#cards) | Lật thẻ và chuyển bài liên quan. | 12 thẻ chọn lọc về FSM, chính sách, nút và bằng chứng. |

## Bằng chứng và cách đọc nhãn

- **Mã nguyên văn** giữ dòng của tệp gốc. Ví dụ tự viết trong bài có mục đích dự đoán và luyện đọc cú pháp.
- **Mô hình JavaScript** tái hiện hành vi dự kiến tại cạnh lấy mẫu. Xem `TEST_REPORT.md` để phân biệt phép kiểm mô hình web và phép kiểm RTL bằng Icarus.
- **Dữ liệu kết quả lưu sẵn** gồm `rtl-run/run.json`, bốn log, `metrics.csv`, `trace.csv`, `controller.vcd`, `demo.vcd` và bảng `rtl-run/KET_QUA.md`. Mọi tệp này thuộc run `20261123T143101Z-d50ee175`. Xem `RTL_EVIDENCE.md` để đối chiếu với nguồn và báo cáo.
- **Lượt nộp** `20261121T091158Z-945dda53` nằm trong `docs/KET_QUA.md` của checkout. Số 95.986 tại đó đếm lượt đánh giá điều kiện. Lượt kiểm lại có run ID riêng và cũng báo cùng tổng số trong bộ log của nó.
- **Phạm vi** hai hướng đi thẳng, hàng đợi mô phỏng, hai chế độ và một pha đi bộ chung. Cảm biến thật, tổng hợp/timing FPGA, kiểm chứng hình thức, xe ưu tiên và rẽ trái nằm ngoài những phần có bằng chứng triển khai.

Xem hướng dẫn [demo và kiểm tra thủ công](HUONG_DAN_KIEM_TRA_THU_CONG.md) để lặp lại các tình huống.
