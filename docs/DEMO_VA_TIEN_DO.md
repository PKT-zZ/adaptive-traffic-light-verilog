# Demo và báo cáo tiến độ

## Chuẩn bị trước buổi báo cáo

1. Chạy `.\scripts\run.ps1` theo README. Khi lệnh thành công, đối chiếu mã lượt chạy trong `build/run.json`, bốn log `PASS` và bảng mới trong `build/KET_QUA.md`.
2. Chạy `scripts/run.ps1 -Wave` để mở dạng sóng với bố cục tín hiệu sẵn.
3. Nếu GTKWave không tự mở, mở `build/controller.vcd` hoặc `build/demo.vcd` thủ công. Bố cục `demo.gtkw` dành cho demo.vcd; controller.vcd dùng tín hiệu dưới tb_controller.
4. Giữ bảng so sánh và log trong máy để trình bày. Bảng tại `docs/KET_QUA.md` lưu kết quả đi kèm bộ nộp.

## Cách xem GTKWave

- `state`: mã pha theo bảng thiết kế; `la/lb`: 1 xanh, 2 vàng, 4 đỏ.
- `button`, `pending`, `walk`: nút bấm, yêu cầu được lưu và lúc được phục vụ.
- `qa/qb`: xe chờ; `active`: 0 cố định, 1 thích ứng.
- `elapsed`: thời gian đã qua; `remaining`: ở xanh thích ứng là thời gian còn lại tối đa.
- Chọn tín hiệu bus và chuyển sang biểu diễn Decimal nếu đang ở Hex/Binary. Dùng menu Time → Zoom → Zoom Best Fit (Shift + Alt + F) để xem toàn bộ rồi phóng vào đoạn cần giải thích. Có thể dùng Ctrl + 0 cho Zoom Full.
- Mô phỏng hệ thống dùng một clock cho một giây: 10 ns trên dạng sóng tương ứng một giây mô hình. Đây là tăng tốc mô phỏng, không phải clock phần cứng thực.
- demo.vcd chứa toàn bộ tám lượt so sánh và thử ngẫu nhiên; các lượt so sánh xuất hiện theo thứ tự cân bằng cố định/thích ứng, A đông cố định/thích ứng, B đông cố định/thích ứng, đổi hướng cố định/thích ứng.
- Để tìm chính xác một tình huống, xem các cột scenario, adaptive, second trong trace.csv rồi đối chiếu với state, active, button trên dạng sóng. File controller.vcd ngắn hơn, phù hợp minh họa chuyển pha và reset.

## Nội dung trình bày khoảng 5 phút

### Phạm vi và thiết kế khoảng 1 phút

Nhóm chọn hai hướng xe đi thẳng, hàng đợi xe mô phỏng, hai chế độ cố định/thích ứng và yêu cầu đi bộ. Hai hướng xe luôn chuyển qua vàng và đỏ toàn phần. Chế độ chỉ thay đổi khi reset. Giới thiệu sơ đồ khối và phân công theo thiết kế.

### Kết quả thực hiện khoảng 2 phút

1. Trên `controller.vcd`, lần theo A xanh → A vàng → hai hướng đỏ → B xanh. Đọc cặp đèn để xác nhận đúng hướng và đo 12 tick xanh cố định, 3 tick vàng, 1 tick đỏ toàn phần. Giải thích tại sao phải so `elapsed` với `duration - 1` khi bộ đếm bắt đầu từ 0.
2. Chỉ ra lần bấm được lưu vào `pending`. FSM lấy mẫu nút mỗi clock, còn thời gian pha chỉ tiến khi `tick=1`. Chỉ ra hai hướng đỏ trong WALK và CLEAR, rồi hướng xe kế tiếp được khôi phục như thế nào.
3. Giải thích vòng phản hồi trong mô phỏng. Đèn trước cạnh tick quyết định hướng nào được phục vụ. FSM dùng số xe chờ trước cạnh để quyết định hết xanh. Hàng đợi mới xuất hiện sau cạnh và được dùng ở tick sau. Mở `tb_top.sv` để chỉ một phép so sánh trực tiếp hai cổng đèn, rồi tìm dòng PASS trong log tương ứng.

### Đánh giá khoảng 1 phút

Cho xem hai cặp dòng trong bảng kết quả. Ca A đông, cùng 260 xe đến nhưng thích ứng phục vụ 219 xe so với 167 ở cố định. Ca cân bằng, cùng 240 xe đến nhưng thích ứng chỉ phục vụ 161 xe so với 213 ở cố định. Trong ca cân bằng, pha xanh kết thúc 54 lần thay vì 36 lần. Mỗi lần chuyển bổ sung tốn 3 tick vàng và 1 tick đỏ toàn phần, tổng cộng mất 72 tick có thể dành cho xanh. Chỉ rõ đây là kết quả trong cửa sổ 600 tick của mô hình và giải thích vì sao tổng hàng đợi tích lũy khác thời gian chờ trung bình từng xe.

### Công việc tiếp theo khoảng 1 phút

Nhóm đọc và rà soát code, chạy lại trên máy khác, mở rộng kịch bản theo góp ý của giảng viên, cải tiến thuật toán rồi so sánh lại. Nếu môn yêu cầu FPGA, cần bổ sung một giai đoạn phần cứng riêng.

## Những gì sản phẩm đã minh họa

- Có mô phỏng hai hướng xe, hai chế độ điều khiển, yêu cầu đi bộ và script chạy kiểm thử.
- Đã kiểm tra chu trình, thời lượng, reset, nút đi bộ, hàng đợi và tích hợp nhịp giây.
- Đã chạy tám lượt so sánh theo cặp và thêm 3.000 giây ngẫu nhiên có thể tái lập.
- Có log, dạng sóng và dữ liệu kết quả để kiểm tra lại.

Chỉ nên nói nhóm đã hiểu và kiểm tra độc lập sau khi các thành viên thực sự làm việc đó. Chưa có thử nghiệm FPGA, giao diện ngã tư hay kiểm chứng hình thức.

## Câu hỏi có thể gặp

**Thông minh ở đâu?** Thời điểm kết thúc xanh thay đổi theo hàng đợi sau khi thỏa thời gian xanh tối thiểu, có giới hạn tối đa.

**Tại sao không chuyển ngay khi người đi bộ bấm?** Hệ thống ghi nhớ và phục vụ ở ranh giới an toàn sau vàng và đỏ toàn phần; không phá chu trình bằng một chuyển màu đột ngột.

**Reset khi nào có tác dụng?** Đây là reset đồng bộ; có hiệu lực tại cạnh lên clock khi rst=1.

**Số xe từ đâu?** Từ mô hình lưu lượng trong testbench, chưa có cảm biến thật.

**Bằng chứng hai hướng không cùng xanh?** Các kiểm thử kiểm tra điều kiện này tại các cạnh clock đã chạy, cùng với bảng ánh xạ đèn trong RTL. Chưa thay thế một chứng minh hình thức cho mọi trường hợp.
