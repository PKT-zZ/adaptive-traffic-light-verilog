# Báo cáo kiểm thử KTMT Studio

## Kiểm tra sau khi bổ sung lối tra mã

Ngày 27/11/2026, bộ kiểm tự động chạy lại qua Edge trên Windows, mở `index.html` bằng `file://` trong chế độ Offline. Nút **Tra mã khi bảo vệ** mở đúng bài, rồi liên kết từ câu hỏi về thời điểm hết xanh chọn đúng dòng 11 của `green_policy.v`. Các bài học, mô phỏng, tải/nhập tiến độ, dạng sóng, quiz và bố cục 320–1440 px đều qua phép kiểm. Lượt này ghi nhận 0 yêu cầu HTTP(S), 0 tài nguyên tải lỗi và 0 ngoại lệ JavaScript.

## Bằng chứng của các lượt trước

Kiểm tra trên Windows ngày 23/11/2026 và rà soát lại ngày 24/11/2026. Các phần dưới đây ghi lại kiểm thử website, đối chiếu mô hình và kết quả các bench RTL. Có thể tái tạo ảnh, log và JSON kiểm thử bằng các lệnh trong tài liệu này.

## Rà soát ngày 24/11/2026

| Phát hiện | Sửa và xác minh lại |
| --- | --- |
| **Đi tới** bỏ qua thao tác nếu dòng đích trùng với dòng đang chọn sau khi người học cuộn đi. | Cuộn về dòng đang chọn dù URL giữ nguyên. Ca Chrome nhảy dòng 61, cuộn lên đầu và bấm lại đã đạt. |
| Sau khi nhập tệp lỗi, **Xuất JSON** hiện thông báo mới trong màu lỗi còn sót. | Xóa trạng thái lỗi khi xuất. Ca Chrome nhập tệp lỗi rồi xuất liên tiếp đã đạt. |
| Cấu hình 1 clock/tick trên web mang nhãn `tb_system`, dễ khiến người học mong thấy `tick=1` trong reset. | Ghi đúng đây là cấu hình của bộ chia `traffic_top`. Cả 1 và 4 đều cho `tick=0` trong reset. `tb_system` đưa `tick=1` trực tiếp vào controller. Ca Chrome kiểm lại giá trị tick trước và sau cạnh reset ở cấu hình 1. |
| Một số câu về nút và công bằng thiếu điều kiện ở trước cạnh hoặc chưa nói rõ điều kiện các tick kế tiếp. | Bổ sung điều kiện lấy mẫu và giả thiết ở câu quiz, câu vấn đáp liên quan. Đọc lại theo RTL và giữ các đáp án tương ứng. |
| Trục dạng sóng thiếu mốc cạnh cần đo. Liên kết Tổng quan mất tên truy cập khi logo thu gọn. | Ghi đủ mốc thời gian đã lấy mẫu và tên truy cập. Chrome kiểm đủ bốn đồ thị và cây trợ năng ở 320 px. |

Trong lượt rà soát này, nhóm dùng `node .\test-browser.cjs qa`. Có thể chạy lại bằng `node .\test-browser.cjs`; thêm `qa` để lưu ảnh và dữ liệu QA ở máy đang chạy. Kiểm theo nút thật từ Bài 1 đến Bài 7 rồi quay về bài trước. Cả 390×844 và 320×640 đều không tràn ngang toàn trang. Chạy lại `node .\test-model.cjs` và nhận cùng 38.178 đối chiếu tín hiệu đạt. Kiểm lại SHA-256 của 14 nguồn và 9 đầu ra cho từng run gốc, tính lại 8 hàng chỉ số từ CSV, đối chiếu 4.800 mẫu trace với `demo.vcd` và kiểm cả đáp án cùng điểm mẫu của bốn đồ thị.

## Website trên Chrome · PASS

Đã chạy `node .\test-browser.cjs qa` từ thư mục website với Node.js 24.19.0 và Chrome 157.0.8103.79, dùng profile Chrome tạm. Chrome mở `index.html` qua `file:///` và xác nhận `navigator.onLine === false` sau khi bật chế độ Offline. Màn hình desktop đo 1440×900 px, màn hình mobile mô phỏng đo 390×844 px.

| Mục | Kết quả |
| --- | --- |
| Điều hướng học liệu | Mở đủ 7 bài có nội dung, đánh dấu đã học và chuyển bài. Kiểm tra bố cục ở cả 7 bài và các màn hình thực hành. |
| Tìm kiếm | `người đi bộ` và `nguoi di bo` cho cùng kết quả. Kiểm tương tự với `đổi hướng` và `doi huong`. Tìm được `ped_pending`, xử lý chuỗi không khớp và mở đúng mục từ kết quả. |
| Giao diện và lưu tiến độ | Đổi sáng/tối và giữ trạng thái sau reload. Chrome tải một tệp JSON thực tế sau khi đánh dấu bài. Đã thay đổi tiến độ và giao diện, nhập lại tệp tải xuống, rồi reload để xác nhận. Hai tệp lỗi gồm JSON sai cú pháp và JSON chứa mã bài lạ. Cả hai bị từ chối, tiến độ đang lưu được giữ. |
| Trình đọc mã | Có 15 tệp, đổi được tệp và nhảy đúng dòng 55 trong `traffic_controller.v`, dòng 61 trong `tb_system.sv`. Lời giải tự truy vết mở được. |
| Mô phỏng FSM | Bước cạnh, bước tick, cấu hình 1/4 clock mỗi tick, thay đổi hàng đợi, chuyển tại min khi B đông hơn. Đã thử xung giữa tick, giữ nút, giữ reset, chốt lại chế độ, nhả reset khi nút còn giữ và xóa nhật ký. |
| Dạng sóng và kết quả | Bốn bài hiển thị đồ thị, bảng mẫu và lời giải. Bốn cặp kịch bản hiển thị sáu dòng chỉ số, thanh so sánh và mã run đúng. |
| Quiz và bảo vệ thử | Chọn sai hiện gợi ý, lời giải mở riêng và chọn đúng được xác nhận. Kiểm tất cả bộ lọc vai trò/chủ đề. Hoàn tất lượt 5 câu có đồng hồ, chấm 3 đạt và 2 cần ôn, mở được liên kết học lại. Kiểm lật thẻ và chuyển thẻ trong bộ 12 thẻ. |
| Mobile và tải tài nguyên | Mở và đóng mục lục mobile khi chọn bài. Không tràn ngang toàn trang tại 390 px. Chrome ghi 0 yêu cầu HTTP(S), 0 tài nguyên tải lỗi và 0 ngoại lệ JavaScript. |

Lỗi đã sửa trong quá trình chạy Chrome gồm trang Tiến độ, Flashcard và lượt bảo vệ không truy cập được hàm nội bộ do phạm vi khởi tạo. Đã đưa chúng vào cùng phạm vi và dời render đầu đến cuối khâu khởi tạo. Đã sửa tiêu đề tab bị dính chữ tại ngắt dòng ở trang Tổng quan, điều chỉnh nhãn trục dạng sóng sát mép và bọc bảng dài để cuộn riêng trên màn hình nhỏ. Bộ kiểm chuyển trang hiện chờ `hashchange` trước khi đọc hoặc bấm phần giao diện mới.

## Học liệu và mô hình JavaScript · PASS

- Rà đủ 183 tham chiếu điều hướng và bài liên quan, 15 tệp mã được đóng gói và 7 đoạn trích nguyên văn. Nội dung các tệp và trích đoạn khớp checkout sau chuẩn hóa CRLF. Kiểm cấu trúc 20 câu quiz, 31 câu vấn đáp, 4 bài dạng sóng và 4 kịch bản so sánh.
- `node .\test-model.cjs --js-only` đạt 205 giá trị kỳ vọng qua 1.364 cạnh lên. Ca kiểm gồm clock enable, fixed/adaptive, ngưỡng 6 và 20, hàng đợi bằng nhau, nút giữa tick, giữ qua reset, đúng ranh giới AFTER_A và AFTER_B, WALK/CLEAR, BOOT, cập nhật `remaining` và lấy mẫu `mode_active`.
- `node .\test-model.cjs` với Icarus 13.0 và `vvp` trên PATH phát lại chuỗi đầu vào qua `traffic_top` thật trong thư mục tạm. Kết quả đạt 38.178 đối chiếu giá trị tín hiệu tại 2.727 mẫu trước/sau cạnh với 4 clock/tick. Bỏ mẫu trước cạnh đầu vì thanh ghi RTL chưa được reset.

## Bốn bench của dự án · PASS

Đã chạy `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\run.ps1` trong bản sao tạm với Icarus 13.0. Lượt `20261123T143101Z-d50ee175` báo `tb_units` 13.056, `tb_controller` 2.268, `tb_top` 182 và `tb_system` 80.480 lượt đánh giá điều kiện. Tổng 95.986 là tổng các bộ đếm do bench báo. Lượt nộp `20261121T091158Z-945dda53` có manifest riêng. Validator của dự án đạt ở cả hai lượt. [Đối chiếu và lệnh](RTL_EVIDENCE.md), [manifest lượt chạy lại](rtl-run/run.json), [kết quả do script tạo](rtl-run/KET_QUA.md).

## Phần chưa xác minh

- Lượt kiểm ngày 24/11 đã chạy `run.ps1 -Wave` trong bản sao tạm, bốn bench đạt và quan sát được cửa sổ tiến trình GTKWave mở bởi script ở run `20261124T022635Z-ecf1b7bd`. GTKWave 3.3.128 cũng đọc thành công khoảng thời gian của hai VCD đóng gói qua `--exit`. Chưa kiểm thủ công việc hiển thị đủ từng tín hiệu trong bố cục GUI. Xem [hướng dẫn demo](HUONG_DAN_KIEM_TRA_THU_CONG.md).
- Giao diện được kiểm thử bằng Chrome headless thật trên Windows. Chọn tệp nhập dùng giao thức kiểm thử của Chrome để đưa cùng tệp trên đĩa vào trường chọn tệp. Chưa chạy hộp thoại chọn tệp bằng chuột hoặc thử trên điện thoại vật lý.
- Cảm biến, luồng đồng bộ/chống dội vật lý, tổng hợp và timing FPGA, chứng minh hình thức, xe ưu tiên và rẽ trái nằm ngoài bằng chứng có trong checkout.
