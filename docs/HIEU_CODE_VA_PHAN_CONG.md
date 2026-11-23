# Hiểu code và phân công nhóm 5 người

## Cách đọc mà không bị ngợp

Đọc thiết kế trước, sau đó lần theo một chu trình A xanh, A vàng, đỏ toàn phần, B xanh. Khi hiểu chu trình thường, đọc cách chèn người đi bộ. Cuối cùng đọc testbench để biết đầu vào đến từ đâu và kết quả đúng được xác định thế nào.

### Thành viên 1 phụ trách FSM

Đọc `rtl/traffic_controller.v`: các mã trạng thái, `next_state`, `state` và `resume_b`. Khối tổ hợp `always @*` tính trạng thái sẽ tới; khối `always @(posedge clk)` chỉ ghi lại ở cạnh clock. Mỗi lần đổi trạng thái, elapsed về 0.

Cần giải thích được vì sao có AFTER_A và AFTER_B dù cùng bật hai đèn đỏ: chúng ghi nhớ hướng vừa chạy, nên biết hướng tiếp theo và nơi trở lại sau đi bộ. Đầu ra mặc định cho hai hướng đỏ ở các trạng thái còn lại.

Bàn giao: sơ đồ FSM, bảng chuyển trạng thái và giải thích reset. Hỗ trợ thành viên 3 kiểm tra lệch một tick; cùng thành viên 5 duyệt các ca chuyển pha.

### Thành viên 2 phụ trách dữ liệu xe và chính sách

Đọc `rtl/green_policy.v`, `rtl/demand_level.v`, `sim/queue_model.v`. Quyết định hết xanh dựa trên chế độ, thời gian đã qua và hai hàng đợi. Phân loại ít/vừa/nhiều chỉ để quan sát; điều khiển dùng số xe chính xác.

Ví dụ ở giây thứ 6 của A: A còn 2 xe, B có 7 xe thì chuyển sang A vàng; nếu A có 7, B có 2 thì giữ xanh. Hết 20 giây vẫn chuyển, kể cả A đông xe hơn.

Bàn giao: bảng quyết định, giả định xe đến/đi, giới hạn 255 xe và giải thích kết quả so sánh. Hỗ trợ thành viên 4 nối dữ liệu; hỗ trợ thành viên 5 chuẩn bị lưu lượng cân bằng, lệch A/B và đổi hướng.

### Thành viên 3 phụ trách thời gian

Đọc `rtl/second_tick.v` và phần elapsed/remaining trong bộ điều khiển. Tick là tín hiệu cho phép đếm giây; toàn bộ logic vẫn chạy trên một clock. Elapsed tăng sau mỗi tick giữ pha, và trở về 0 ngay lúc đổi pha.

Vì elapsed bắt đầu từ 0, điều kiện `elapsed >= duration-1` có nghĩa là cạnh clock hiện tại hoàn tất đủ duration tick. Bài thử kiểm tra chính xác 12 tick xanh, 3 tick vàng và 1 tick đỏ.

Bàn giao: bảng thời gian, giải thích bộ chia nhịp và ảnh dạng sóng đo thời lượng. Hỗ trợ thành viên 1 thống nhất thời điểm nạp lại bộ đếm.

### Thành viên 4 phụ trách tích hợp đèn và người đi bộ

Đọc `rtl/traffic_top.v` và phần nút bấm, ped_pending, resume_b, lights trong bộ điều khiển. Nút bấm được bắt cạnh lên bằng cách so trạng thái hiện tại với button_prev. Giữ nút không được coi là nhiều lần bấm.

Khi bắt đầu WALK, yêu cầu được xóa và hướng tiếp theo được lưu. Mọi hướng xe đỏ trong WALK và CLEAR. Nhóm chọn một khoảng đi bộ chung; không mô hình hóa riêng từng vạch qua đường.

Bàn giao: sơ đồ khối và bảng tín hiệu, ví dụ chèn đi bộ sau A và sau B. Phối hợp người sở hữu từng khối khi tìm lỗi; không nhận trách nhiệm tự sửa mọi lỗi của cả nhóm.

### Thành viên 5 phụ trách kiểm thử và demo

Đọc các file `sim/tb_*.sv`, chạy `scripts/run.ps1`, xem log và CSV. `$fatal` làm mô phỏng thất bại; không chỉ quan sát hình rồi kết luận đúng. Seed cố định giúp chạy lại cùng một chuỗi ngẫu nhiên.

Bàn giao: ma trận ca thử, kết quả đạt/trượt, dạng sóng, bảng so sánh và kịch bản thuyết trình. Mỗi thành viên vẫn phải tự kiểm tra phần mình; người 5 tổng hợp kiểm thử toàn hệ thống.

## Sáu điều ai cũng cần hiểu

1. Đèn A/B có cùng xanh được không và điều gì ngăn việc đó?
2. Chế độ thích ứng quyết định kết thúc xanh dựa trên gì?
3. Bộ đếm có bị lệch một giây không? Bằng chứng nằm ở bài thử nào?
4. Nút bấm được lưu và xóa khi nào? Sau đi bộ hướng nào xanh?
5. Hàng đợi là mô hình mô phỏng, không phải dữ liệu cảm biến thật.
6. Vì sao kết quả thích ứng không tốt hơn trong mọi kịch bản?

## Việc nhóm cần tự xác nhận

- Chạy lại trên máy của ít nhất một thành viên khác.
- Điền tên thật vào phân công và yêu cầu cụ thể của giảng viên.
- Mỗi người tự trình bày được file mình phụ trách và một ca kiểm thử liên quan.
- Không báo rằng đã chạy FPGA hoặc đã đo thời gian chờ từng xe khi chưa thực hiện.
