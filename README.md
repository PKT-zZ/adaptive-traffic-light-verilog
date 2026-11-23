# Dự án đèn giao thông thông minh bằng Verilog

Bản mô phỏng theo phạm vi **1A – 2B – 3B – 4A – 5A – 7B – 8A**: hai hướng đi thẳng, hàng đợi xe mô phỏng, điều khiển thích ứng, người đi bộ, đổi chế độ khi reset, kiểm thử tự động và dạng sóng GTKWave.

## Chạy ngay trên máy hiện tại

Mở thư mục `traffic_project` trong VS Code. Trong terminal PowerShell chạy:

```powershell
.\scripts\run.ps1
```

Để chạy kiểm thử và mở dạng sóng:

```powershell
.\scripts\run.ps1 -Wave
```

Nếu terminal đang ở thư mục cha, dùng `cd .\traffic_project` trước. Khi Windows chặn script do execution policy, dùng lệnh dưới đây để áp dụng chính sách riêng cho tiến trình PowerShell mới:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\run.ps1 -Wave
```

Cần Python 3 và Icarus Verilog (`iverilog`, `vvp`) trong PATH. Script dùng thêm `C:\msys64\ucrt64\bin` nếu có. Nếu công cụ ở vị trí khác, thêm thư mục chứa Icarus vào PATH của terminal, hoặc truyền `-Python` với đường dẫn Python. Chỉ cần GTKWave khi chọn `-Wave`. Dùng `-GtkWave` để chỉ định chương trình xem sóng.

Khi thành công, terminal in `Validated run published: <run-id>`. Xem `build/run.json`, bốn log, `controller.vcd`, `demo.vcd`, `trace.csv`, `metrics.csv` và `build/KET_QUA.md` của cùng lượt chạy.

## Các phần đã thực hiện

- Bộ điều khiển 9 trạng thái, reset đồng bộ mức cao; đèn dùng mã `{đỏ,vàng,xanh}`.
- Chế độ cố định và thích ứng; chỉ lấy chế độ mới khi reset.
- Thời gian xanh tối thiểu/tối đa; chuyển hướng qua vàng và đỏ toàn phần.
- Chốt yêu cầu đi bộ, chống lặp do giữ nút, khoảng đi bộ và khoảng chờ sau đi bộ.
- Mô hình hàng đợi hai hướng, xe đến/đi đồng thời, chống tràn và hụt số đếm.
- Phân loại hàng đợi để quan sát: 0 không xe; 1 ít (1–3); 2 vừa (4–9); 3 nhiều (từ 10). Điều khiển so sánh **số xe chính xác**, không chỉ so sánh mức.
- Kiểm thử đơn vị, kiểm thử bộ điều khiển, tích hợp bộ chia nhịp và mô phỏng toàn hệ thống.

## Đọc theo thứ tự

1. [Thiết kế và quy tắc chính xác](docs/THIET_KE.md).
2. [Hướng dẫn hiểu code và phân công 5 người](docs/HIEU_CODE_VA_PHAN_CONG.md).
3. [Cách demo và nội dung báo cáo tiến độ](docs/DEMO_VA_TIEN_DO.md).
4. [Kết quả kiểm thử đi kèm bộ nộp](docs/KET_QUA.md). Sau khi chạy lại, xem bảng mới trong `build/KET_QUA.md`.

## Cấu trúc

```text
rtl/green_policy.v         Điều kiện kết thúc đèn xanh
rtl/traffic_controller.v   FSM, bộ đếm pha, yêu cầu đi bộ và đèn
rtl/second_tick.v          Tạo nhịp giây từ xung clock
rtl/traffic_top.v          Ghép bộ chia nhịp và bộ điều khiển
rtl/demand_level.v         Phân loại hàng đợi để quan sát
sim/queue_model.v         Mô hình xe mô phỏng
sim/tb_units.sv           Kiểm thử chính sách và phân loại
sim/tb_controller.sv      Kiểm thử tình huống điều khiển
sim/tb_top.sv             Kiểm thử wrapper và nhịp clock
sim/tb_system.sv          Mô phỏng xe, so sánh hai chế độ, thử ngẫu nhiên
scripts/run.ps1           Chạy toàn bộ bài kiểm thử
scripts/report.py         Tạo lại bảng kết quả bằng Python tiêu chuẩn
demo.gtkw                 Danh sách tín hiệu GTKWave
```

## Giới hạn của bản này

Đây là sản phẩm **mô phỏng học tập**, chưa nạp hoặc kiểm tra trên FPGA, chưa tổng hợp hay kiểm tra timing phần cứng. Nút bấm và số xe được giả định đồng bộ với clock; phần cứng thật cần đồng bộ đầu vào, chống dội nút và ràng buộc chân/tần số. Chưa có xe ưu tiên, rẽ trái hay giao diện ngã tư vì không nằm trong lựa chọn của nhóm. Các kết quả test chứng minh những tình huống đã chạy, không phải chứng minh hình thức cho mọi đầu vào.

Giữ báo cáo trung thực: bản code được hỗ trợ xây dựng bằng AI; mỗi thành viên cần đọc, chạy lại và giải thích phần của mình theo yêu cầu môn học.

## Xác thực kết quả

Mỗi lần chạy lưu trong `runs/<run_id>/`, cùng bản sao nguồn, phiên bản compiler và manifest `run.json`. Script kiểm tra hash của nguồn đã sao chép, danh mục đầu ra, log và dữ liệu CSV. Bảng kết quả được tạo trong cùng bộ dữ liệu trước khi công bố vào `build/`. Xem số lượt kiểm tra theo từng bench trong log hoặc bảng vừa sinh. Con số này đếm các điều kiện được đánh giá trong mô phỏng.

Nếu runner báo đang có lượt chạy, chờ lượt đó kết thúc rồi chạy lại. Sau một lần ngắt giữa lúc thay kết quả, runner sẽ phục hồi bản công bố trước nếu còn bản dự phòng.
