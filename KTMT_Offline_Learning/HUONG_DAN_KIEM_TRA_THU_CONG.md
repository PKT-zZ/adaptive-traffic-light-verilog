# Hướng dẫn demo và kiểm tra thủ công

Các mục dưới đây mô tả thao tác và kết quả kỳ vọng. Ghi lệnh, phiên bản, kết quả quan sát và tệp bằng chứng khi chạy. Xem `TEST_REPORT.md` cho kết quả kiểm tra khi bàn giao.

## Mở website ngoại tuyến

1. Mở Chrome trên Windows. Dùng `Ctrl+O` để mở `index.html` trong thư mục `KTMT_Offline_Learning` của repo đã tải. Kiểm tra thanh địa chỉ bắt đầu bằng `file:///`.
2. Mở DevTools (`F12`), vào **Network**, đổi giới hạn mạng thành **Offline**, rồi tải lại trang. Giữ trạng thái này trong suốt lượt kiểm website. Mở **Console** để ghi lỗi JavaScript hoặc tài nguyên nếu có.
3. Xác nhận trang Tổng quan hiện và có đủ bảy bài cùng các mục thực hành. Kiểm tra danh sách yêu cầu mạng. Tài nguyên của website nằm trong thư mục cục bộ.

## Lộ trình kiểm trên Chrome

| Mục | Thao tác | Kết quả kỳ vọng |
| --- | --- | --- |
| Bảy bài | Đi lần lượt từ Bài 1 đến Bài 7 bằng mục lục và nút kế tiếp, rồi mở Bài 6 từ Bài 7. | Mỗi bài có nội dung tiếng Việt, liên kết thực hành, dẫn nguồn và nút đánh dấu đã học. Bảng, mã và sơ đồ đọc được. |
| Tìm kiếm | Gõ `người đi bộ`, rồi `nguoi di bo`. Thử thêm `đổi hướng` hoặc `doi huong` và `ped_pending`. Chọn một kết quả. | Các truy vấn có dấu và không dấu tìm được nội dung liên quan. Kết quả mở đúng bài hoặc mục thực hành. Một chuỗi không có trong học liệu hiện trạng thái không tìm thấy. |
| Đọc mã | Chọn `rtl/traffic_controller.v`, đến dòng 55 rồi chọn **Mở đối chiếu**. Chọn `sim/tb_system.sv`, đến dòng 61. | Dòng 55 xóa `ped_pending` khi vào `PED_WALK`. Dòng 61 của bench chờ cạnh rồi thêm `#1`. Tên nguồn và số dòng khớp tệp ở checkout. |
| Quiz | Lọc bài Người đi bộ và reset. Chọn sai một câu, đọc gợi ý, thử lại rồi mở lời giải. | Có phản hồi gợi ý ngay sau lựa chọn sai. Lời giải có thể mở riêng, nêu bằng chứng và giải thích giá trị trước/sau cạnh. |
| Dạng sóng | Mở từng bài, xác định đơn vị ns và khoảng giữa hai cạnh lên. Đo thời lượng một pha bằng hiệu thời gian, tìm một cạnh có yêu cầu và đối chiếu với bảng. | Từng bài ghi nguồn và quy ước thời gian. Đáp án nhất quán với hình, bảng và phép quy đổi sang tick. |
| So sánh chế độ | Chuyển đủ bốn kịch bản, đối chiếu `rtl-run/metrics.csv` của run `20261123T143101Z-d50ee175`. | Mỗi kịch bản có hai chế độ. Ca cân bằng: 240 xe đến, 213/161 xe đi, 27/79 còn chờ. Ca A đông: 260 xe đến, 167/219 đi, 93/41 còn chờ. Đọc tiếp area, peak và max red ở các cột riêng. |
| Bảo vệ thử | Chọn bộ 5 câu theo Thành viên 4. Chọn **Mở tiêu chí đối chiếu**, tự chấm và chuyển hết bộ. Thử thêm một lượt theo chủ đề có đồng hồ. | Câu hỏi thuộc lựa chọn hiện tại. Có ý cần đạt, lỗi thường gặp, dẫn chứng và câu hỏi phụ. Tổng kết có kết quả tự đánh giá và đường về phần ôn. Đồng hồ chạy khi được bật. |
| Flashcard | Lật mặt trước/sau, chuyển một thẻ, mở bài liên quan. | Có 12 thẻ chọn lọc. Chuyển thẻ đổi nội dung. Đường dẫn mở đúng bài. |
| Desktop và mobile | Kiểm tra cửa sổ desktop. Trong DevTools bật chế độ thiết bị và thử khoảng 390 × 844. Mở mục lục, các trang có bảng, dạng sóng và đọc mã. | Trên desktop, mục lục và nội dung hiển thị đồng thời. Trên mobile, mở được mục lục, điều khiển chạm thuận tiện. Bảng/mã dài có thể cuộn trong vùng nội dung. Kiểm tra cả sáng và tối. |

## Tiến độ, reload, xuất và nhập JSON thật

1. Đánh dấu Bài 1 và Bài 5 đã học. Đổi sang giao diện sáng. Mở **Tiến độ và dữ liệu** và ghi số bài đã học. Tải lại đúng đường dẫn `file://` bằng cùng hồ sơ Chrome. Kiểm tra giao diện, hai dấu đã học và bài mở gần nhất.
2. Dùng nút **Xuất JSON**. Xác nhận có tệp JSON thực trong danh sách tải xuống của Chrome (`Ctrl+J`). Mở tệp bằng trình soạn thảo. Với hai bài trên, nội dung phải có `version: 1`, `theme: "light"`, `completed` chứa `nen-tang` và `nguoi-di-bo`. Nếu bạn vừa mở Bài 5 trước màn hình tiến độ thì `lastLesson` là `nguoi-di-bo`.
3. Bỏ đánh dấu Bài 5, đổi giao diện tối, rồi dùng mục nhập để chọn đúng tệp vừa xuất. Kiểm tra hai dấu đã học và giao diện sáng được khôi phục. Tải lại và so lại lần nữa.
4. Tạo một tệp lỗi trong thư mục tạm với nội dung `{"version":` và chọn nhập. Sau đó thử JSON cú pháp hợp lệ nhưng có mã bài lạ, ví dụ `{"version":1,"theme":"dark","completed":["sai-id"],"lastLesson":null}`. Cả hai lần cần hiện thông báo lỗi rõ ràng và duy trì tiến độ đang có.

## Chuỗi đối chiếu mô phỏng FSM

Mỗi hàng là một ca riêng. Tại đầu ca, đưa nút về 0, tắt giữ reset và thực hiện **Reset 1 cạnh** sau khi chọn chế độ và số clock/tick. `tick`, `new_request` và điều kiện chuyển lấy ở cột **trước cạnh**. Đèn và thanh ghi đã chốt đọc ở cột **sau cạnh**. Nhãn “Mô hình JavaScript” xác định loại mô phỏng này.

| Ca | Đầu vào và bước thực hiện | Kết quả dự đoán |
| --- | --- | --- |
| Chia 4 và BOOT | 4 clock/tick, cố định. Từ reset, bấm `+1 cạnh clock` bốn lần. | Ba cạnh đầu giữ BOOT với `tick=0` trước cạnh. Cạnh thứ tư có `tick=1`, sang A_GREEN và `elapsed=0`. Counter sau cạnh về 0. |
| Chu trình cố định | 1 clock/tick, cố định, nút thấp. Từ BOOT, đi một tick vào A_GREEN. Đi thêm 11 rồi 1, thêm 3, rồi thêm 1 tick. | `A_GREEN/11 → A_YELLOW/0 → AFTER_A/0 → B_GREEN/0`. Hai đèn ở AFTER_A là 4/4. Thời lượng lần lượt 12, 3 và 1 tick từ mốc vào pha. |
| Ngưỡng xanh thích ứng | 1 clock/tick, `queue_a=2`, `queue_b=7`. Chọn thích ứng, kiểm `mode_active` trước reset rồi reset. Vào A_GREEN và bước 5 tick, sau đó 1 tick. | Đổi `mode_select` ngoài reset giữ giá trị `mode_active` cũ. Sau reset, `mode_active=1`. Sau 5 tick giữ xanh; tick thứ 6 chuyển vàng. Lặp lại với `qa=qb=7` để thấy giữ xanh ở tick 6 và kết thúc ở tick 20. |
| Xung giữa hai tick | 4 clock/tick. Bấm **Bấm 1 cạnh** ngay sau reset. | Cạnh có `tick=0` trong BOOT vẫn chốt `ped_pending=1`. BOOT đi A_GREEN ở tick đủ điều kiện. Yêu cầu chờ tới cuối AFTER_A. |
| Cạnh nút cuối đỏ | 1 clock/tick. Đi tới AFTER_A khi chưa có pending rồi bấm **Bấm 1 cạnh**. Lặp với AFTER_B từ chu trình sạch. | `PED_WALK`, `pending=0`, `walk=1`, đèn 4/4. Sau AFTER_A lưu `resume_b=1`; sau AFTER_B lưu `resume_b=0`. Sau 6 tick WALK và 1 tick CLEAR, tiếp tục đúng hướng. |
| WALK và CLEAR | Sau khi vào WALK, lấy mẫu nút thấp một cạnh rồi tạo một cạnh lên trong WALK. Đưa nút về thấp và đi đến CLEAR, tạo cạnh lên ở cuối CLEAR. | Cạnh trong WALK bị bỏ qua. Cạnh ở cuối CLEAR đặt `ped_pending=1` trong khi quay về hướng đã lưu. |
| Nút giữ qua reset | 4 clock/tick. Giữ nút, giữ reset và bước hai cạnh, rồi bỏ giữ reset và tiến một cạnh. Tiếp tục giữ nút thêm vài cạnh. | Hai cạnh reset giữ BOOT với `button_prev=0` và xóa pending. Cạnh đầu ngoài reset tạo một yêu cầu ở BOOT dù `tick=0`. Những cạnh giữ nút tiếp theo có `new_request=0`. |

Ca cố định và chia 4 có đối chứng trực tiếp ở `sim/tb_top.sv` dòng 28–44. Ca thích ứng có đối chứng ở `sim/tb_controller.sv` dòng 68–74. Ca nút có đối chứng ở `sim/tb_controller.sv` dòng 75–101 và `sim/tb_top.sv` dòng 35–40. Ranh giới chính xác AFTER_B được dự đoán từ nhánh ở `rtl/traffic_controller.v` dòng 36–37. Ca sau B ở `sim/tb_controller.sv` dòng 80–81 kiểm hướng trở lại với nút chốt sớm hơn.

## Trình diễn bằng chứng RTL

Xem [kịch bản thuyết trình 38 phút](../docs/KICH_BAN_THUYET_TRINH.md) để chia lời nói và thao tác theo slide.

1. Mở VCD, CSV và bốn log trong `rtl-run/`. `rtl-run/run.json` chỉ lượt `20261123T143101Z-d50ee175`. Lượt nộp ghi trong `../docs/KET_QUA.md` có run ID `20261121T091158Z-945dda53`.
2. Muốn chạy lại, dùng PowerShell ở gốc checkout và chạy `.\scripts\run.ps1`. Nếu cần giữ nguyên `build/` và `runs/`, sao chép checkout cần thiết sang thư mục tạm rồi chạy lệnh ở gốc bản sao. Yêu cầu Python 3, `iverilog` và `vvp`. Sau khi thành công, lưu run ID mới, bốn log, bảng CSV và VCD. Nếu thiếu công cụ, ghi **NOT RUN** cho lượt định chạy.
3. Với GTKWave, mở `controller.vcd` để đo đoạn A xanh → A vàng → hai đỏ → B xanh. Thêm `state`, `elapsed`, `lights_a`, `lights_b`, `tick`, `ped_button`, `ped_pending`, `walk` trong `tb_controller`. Chọn đầu và cuối pha. Đếm số khoảng 10 ns giữa hai mốc với `tick=1` ở đoạn cố định.
4. Để xem luồng hệ thống khi chạy mới, dùng `.\scripts\run.ps1 -Wave` tại gốc checkout. Với lượt đóng gói, mở `rtl-run/demo.vcd`. Tệp `../demo.gtkw` liệt kê nhóm tín hiệu `tb_system`. Thêm `tb_system.scenario.kind`, `.adaptive` và `.t` để khớp các cột `scenario`, `adaptive` và `second` trong `trace.csv`. Chẳng hạn, ca A đông cố định (`1, 0`) ở `second=35` được lấy mẫu sau cạnh lên 12.815 ns trong lượt đóng gói. Dùng `button`, `pending`, `walk`, `la/lb`, `qa/qb` và `state` để lần theo yêu cầu.
5. Nếu GTKWave không mở, dùng log và `trace.csv` như trên, kèm `metrics.csv` cho phần so sánh. Một hàng CSV được ghi sau cập nhật tại cạnh. Với nhãn nguồn đi kèm, dạng sóng trên website cũng có thể dùng để tập giải thích quy tắc và căn thời điểm.

Hai số liệu trình bày ngắn từ `rtl-run/trace.csv` và `rtl-run/metrics.csv`. Ca cân bằng có 36 lần kết thúc xanh cố định và 54 lần khi thích ứng. Tổng số tick vàng/đỏ sau hai hướng tăng từ 144 lên 216, còn mẫu xanh sau cạnh giảm từ 435 xuống 363. Khi tính tick xanh dùng để phục vụ theo tín hiệu trước cạnh, dùng 434 và 362 như trong kịch bản bảo vệ. Ca A đông cho 219 xe đi ở thích ứng và 167 ở cố định, cùng 260 xe đến. Cả hai cặp có cửa sổ 600 tick và cùng ba mốc bấm.

Kết thúc demo bằng phạm vi mô phỏng học tập. Trình bày giá trị của mô hình hai hướng, sau đó nêu các phần cần thực hiện riêng nếu chuyển sang phần cứng, đo hàng đợi từ cảm biến hoặc kiểm chứng hình thức.
