# Nguồn dữ liệu RTL trong KTMT Studio

Các bảng so sánh, bài luyện dạng sóng và tệp tải xuống của KTMT Studio dùng lượt mô phỏng Icarus `20261123T143101Z-d50ee175`. [Bảng kết quả đi kèm báo cáo cuối kỳ](../docs/KET_QUA.md) ghi lượt tham chiếu riêng `20261121T091158Z-945dda53`. Hai lượt cho cùng nội dung CSV, còn log xuất bản, thời điểm tạo VCD và manifest thuộc từng lượt riêng.

## Xem và kiểm tra bộ mẫu

| Tệp | Dùng để làm gì |
|---|---|
| [Bảng kết quả](rtl-run/KET_QUA.md), [metrics.csv](rtl-run/metrics.csv), [trace.csv](rtl-run/trace.csv) | Đọc tám lượt của bốn kịch bản, truy theo từng tick hoặc đối chiếu số tổng hợp. |
| [controller.vcd](rtl-run/controller.vcd), [demo.vcd](rtl-run/demo.vcd) | Mở bằng GTKWave. Tệp controller dùng nhóm `tb_controller`; tệp demo dùng nhóm `tb_system`. |
| [Log units](rtl-run/tb_units.log), [controller](rtl-run/tb_controller.log), [top](rtl-run/tb_top.log), [system](rtl-run/tb_system.log) | Xem kết quả bốn bench của cùng lượt. |
| [Manifest chia sẻ](rtl-run/run.json) | Tra mã lượt, phiên bản công cụ và SHA-256. Đường dẫn máy của hai công cụ được rút gọn thành tên executable. Các giá trị hash và byte của chín tệp đầu ra được giữ nguyên. |

Bộ kết quả này ghi 13.056 lượt đánh giá ở `tb_units`, 2.268 ở `tb_controller`, 182 ở `tb_top` và 80.480 ở `tb_system`. Tổng 95.986 là các giá trị `checks` trong log. Nhiều phép kiểm lặp ở các cạnh clock. Các bộ đếm `remaining_checks` chạy riêng và không được cộng vào tổng đó.

Git giữ nguyên byte của bộ mẫu. Hash nguồn trong manifest thuộc checkout ở thời điểm chạy. Chuyển đổi LF/CRLF ở các tệp mã có thể làm hash nguồn thay đổi dù hành vi không đổi. Khi kiểm tra một bản clone mới, hãy tạo lượt chạy và manifest mới tại gốc repo.

## Đọc kết quả theo đúng thời điểm lấy mẫu

- CSV ghi trạng thái và số xe **sau cạnh**. Ở ca cân bằng, đếm mẫu xanh sau cạnh cho 435 và 363. Khi tính số tick mà mô hình xe thấy xanh **trước cạnh để phục vụ**, dùng trạng thái ban đầu BOOT và mẫu sau cạnh của tick trước, được 434 và 362. Chênh lệch đều là 72 tick. Dùng 434/362 khi giải thích cơ hội phục vụ trong phần bảo vệ.
- Số xe đi theo từng hướng trong học liệu được suy ra bằng tổng xe đến trừ tồn cuối với hàng đợi ban đầu rỗng và không tràn. Chỉ số `max_red_wait_a/b` đo khoảng liên tiếp có xe chờ và hướng chưa xanh, gồm cả vàng. Mô hình chưa theo dõi thời gian chờ từng xe.
- Trong `tb_system`, trục VCD có 10 ns giữa hai cạnh lên, ứng với một tick mô hình. Cột `second` khởi động lại theo từng kịch bản, còn trục thời gian VCD chạy xuyên suốt. Tìm mẫu qua `scenario`, `adaptive` và `second`.
- Các bài dạng sóng trên website dùng điểm trích từ `controller.vcd`. Công cụ bước FSM trên web là mô hình JavaScript. `tb_top` kiểm wrapper có bộ chia, còn `tb_system` cấp tick trực tiếp cho controller.

## Chạy lại trên máy thành viên

Từ gốc repo, chạy lệnh trong [README chính](../README.md) rồi lấy log, CSV, VCD và manifest mới trong `build/`. Tùy chọn `-Wave` mở `demo.vcd` với `demo.gtkw`. Mở `controller.vcd` thủ công khi cần các mốc trong [kịch bản bảo vệ](../docs/KICH_BAN_THUYET_TRINH.md). Hai lượt có thể có mã và thời điểm tạo khác nhau. So sánh nội dung đầu vào, cấu hình và số liệu trước khi dùng thay nhau.
