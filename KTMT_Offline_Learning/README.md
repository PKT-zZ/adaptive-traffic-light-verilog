# KTMT Studio · Đèn giao thông thích ứng

Website tiếng Việt để đọc RTL và luyện bảo vệ bài tập lớn Kiến trúc máy tính. Học liệu bám theo checkout `adaptive-traffic-light-verilog`, commit `c3230a0c44c88c7c4598ea399375dfed9419bb16`.

## Bắt đầu theo mục đích

- **Xem mã chính hoặc chạy lại:** mở [README của repo](../README.md), [RTL](../rtl/) và [testbench](../sim/). Đây là các tệp dùng để biên dịch. Mã trong trình đọc offline là bản chụp, nên số dòng tài liệu có thể khác bản đang chỉnh.
- **Chỉnh báo cáo hoặc tập bảo vệ:** dùng [báo cáo cuối kỳ](../bao_cao/Bao_cao_KTMT_mau_Tech.pdf), [ZIP nguồn LaTeX](../bao_cao/Nguon_chinh_sua_mau_Tech.zip) và [kịch bản 20 slide, 38 phút](../docs/KICH_BAN_THUYET_TRINH.md) của repo. Các lượt 3, 5 và 10 phút trong website là bài tập rút gọn.
- **Luyện mở đúng đoạn mã:** vào [Bảo vệ và phản biện](index.html#lesson/bao-ve) để nhảy tới mã trong trình đọc offline, hoặc mở [bảng tra mã hiện hành](../docs/TRA_CUU_BAO_VE.md) ở repo.
- **Học offline:** tải hoặc clone repo, giải nén nếu cần, rồi mở [index.html](index.html) trên máy. Trình xem tệp trên GitHub dùng để xem mã và tài liệu. Nếu gửi riêng thư mục này, giữ toàn bộ CSS, JS và `rtl-run/` để dùng được học liệu và tệp tải mẫu.

## Mở và học

1. Mở [index.html](index.html) trong Chrome trên Windows. Đường dẫn trên thanh địa chỉ bắt đầu bằng `file:///`. Có thể sao chép nguyên thư mục `KTMT_Offline_Learning` để dùng offline, với các tệp CSS, JS và thư mục `rtl-run/` giữ cùng cấu trúc.
2. Chọn **Bắt đầu học** hoặc tìm `người đi bộ`, `nguoi di bo`, `ped_pending` hay `tb_system`. Học theo bảy bài, tra 15 tệp có số dòng và thử 20 câu quiz truy vết.
3. Mở **Mô phỏng FSM** để bước từng cạnh hoặc từng tick. Chọn 1 hoặc 4 clock/tick, thay đổi hàng đợi, đổi `mode_select` rồi thử reset. Đối chiếu cột trước và sau cạnh, sau đó làm bốn bài **Đọc dạng sóng** trên mẫu trích từ VCD.
4. Mở **So sánh chế độ** để đọc tám lượt của bốn kịch bản. Chọn **Bảo vệ thử** để ôn 31 câu theo chủ đề hoặc theo một trong năm vai trò. Một lượt có 5, 7 hoặc 10 câu tùy số câu trong phạm vi, có đồng hồ tùy chọn và tự đánh giá. Flashcard có 12 thẻ ôn nhanh.
5. Đánh dấu sau khi tự giải thích được bài. Mục **Tiến độ** xuất hoặc nhập tệp JSON chứa bài đã đánh dấu, bài gần nhất và giao diện. Tệp JSON hợp lệ thay thế tiến độ hiện tại. Bản nháp bảo vệ và trạng thái mô phỏng chỉ có trong phiên đang mở. Xuất bản sao trước khi đổi trình duyệt hoặc di chuyển thư mục.

Website dùng HTML, CSS và JavaScript cục bộ. Lệnh kiểm thử dưới đây dùng riêng cho việc xác minh.

## Demo và bằng chứng

- [Hướng dẫn demo và kiểm tra thủ công](HUONG_DAN_KIEM_TRA_THU_CONG.md) có các bước mở ngoại tuyến, chạy script từ gốc repo và trình bày khi không mở được GTKWave.
- [Bản đồ học liệu](CONTENT_MAP.md) liên kết bảy bài với nguồn, tương tác và phạm vi bằng chứng.
- [Hồ sơ đối chiếu RTL](RTL_EVIDENCE.md) phân biệt lượt chạy của báo cáo cuối kỳ và bộ dữ liệu **thực hành** của website. Lượt đóng gói `20261123T143101Z-d50ee175` có [manifest chia sẻ](rtl-run/run.json), [báo cáo sinh từ bench](rtl-run/KET_QUA.md), [metrics.csv](rtl-run/metrics.csv), [trace.csv](rtl-run/trace.csv) và hai VCD.
- [Báo cáo kiểm thử](TEST_REPORT.md) ghi tình trạng Chrome, mô hình JavaScript và các giới hạn đã xác minh.

## Chạy lại phép kiểm của website

Tại thư mục website, dùng Node.js 24 và Chrome đã cài. Lệnh Chrome tạo một profile riêng, nạp `file://` với mạng mô phỏng Offline rồi kiểm tra giao diện và tệp thật trong thư mục tạm. Có thể đặt `KTMT_CHROME` thành đường dẫn Chrome nếu cài ở vị trí khác. Khi cần lưu ảnh và JSON thử, truyền thư mục `qa` làm đối số. Git bỏ qua thư mục đầu ra này.

```powershell
node .\test-browser.cjs
node .\test-model.cjs --js-only
```

Khi có `iverilog` và `vvp` trên `PATH`, lệnh dưới đây tạo bench đối chiếu tại thư mục tạm rồi so sánh tín hiệu JavaScript với RTL thật trước và sau cùng các cạnh clock. Chạy từ thư mục website cùng checkout gốc để bench tìm `../rtl/`.

```powershell
node .\test-model.cjs
```

Phạm vi là mô phỏng học tập hai hướng đi thẳng. Các mục cảm biến thật, tổng hợp và timing FPGA, kiểm chứng hình thức, xe ưu tiên và rẽ trái chưa có bằng chứng triển khai trong checkout này.
