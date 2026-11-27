# Kịch bản thuyết trình và bảo vệ dự án đèn giao thông Verilog

**Mục tiêu tập là trình bày tới phút 38, dành khoảng 12 phút còn lại để bảo vệ.** Dùng dàn 20 slide: slide 1 là bìa, slide 2–19 là nội dung, slide 20 chốt và mở hỏi đáp. Thời lượng đã tính demo và chuyển người. Các đoạn trích là lời nói mẫu. Dòng *Thao tác* chỉ cách dùng hình hoặc tín hiệu khi nói.

| Người nói | Mốc | Slide | Nội dung |
|---|---|---|---|
| Bạn 1 | 0:00–7:00 | 1–5 | Bài toán, phạm vi, sơ đồ khối và FSM |
| Bạn 2 | 7:00–13:00 | 6–8 | Mô hình xe, thời điểm lấy mẫu và hai chính sách xanh |
| Bạn 3 | 13:00–18:30 | 9–11 | Clock, bộ đếm và phép đo vàng/đỏ |
| Bạn 4 | 18:30–25:30 | 12–15 | Tích hợp, người đi bộ và reset |
| Bạn 5 | 25:30–38:00 | 16–20 | Kiểm thử, hai ca GTKWave, so sánh và bàn luận |
| Cả nhóm | 38:00–50:00 | Hỏi đáp | Trả lời giảng viên và các bạn |

Thay [tên] bằng người nói. Giới thiệu vai trò theo phần việc thực tế cả nhóm đã xác nhận. Khi tập, ưu tiên tự kể lại ví dụ và tự chỉ tín hiệu.

## Bạn 1 — Bài toán và kiến trúc

### Slide 1 — Bìa và giới thiệu nhóm · 0:00–0:40

> Em chào thầy/cô và các bạn. Nhóm em trình bày đề tài thiết kế và mô phỏng bộ điều khiển đèn giao thông thích ứng bằng Verilog. Nhóm em sẽ giới thiệu bài toán, giải thích cách mạch quyết định đổi đèn, sau đó trình diễn và so sánh hai chế độ. Em là [tên], trình bày phần tổng quan. Các phần sau lần lượt do [tên và vai trò đã chốt] trình bày.

*Thao tác:* Chỉ tên đề tài và người sẽ nói từng phần. Giới thiệu ngắn để sang hình ngã tư.

### Slide 2 — Khi hai hướng xe có nhu cầu khác nhau · 0:40–2:10

> Nhóm em quy ngã tư về hai hướng xe đi thẳng A và B. Hình bên này minh họa A có nhiều xe chờ, còn bên kia B có ít xe. Với đèn cố định, một hướng vẫn được cấp đủ thời gian xanh của mình, kể cả lúc đã vắng xe và hướng kia đang chờ.
>
> Từ đó nhóm hỏi: nếu dùng số xe chờ để thay đổi **thời điểm kết thúc xanh**, trong cùng một khoảng mô phỏng có phục vụ được thêm xe không? Chẳng hạn, kết thúc sớm ở hướng thưa có thể dành cơ hội cho hướng đông. Nhưng khi đổi hướng, ta mất thời gian cho pha vàng và đỏ toàn phần. Vì vậy nhóm đo cả xe đã phục vụ lẫn số xe còn chờ theo thời gian để nhìn được hai mặt của quyết định.

*Thao tác:* Chỉ hàng xe A, hàng xe B và vùng giao nhau. Dừng ở câu hỏi dẫn dắt, để phần cuối trả lời bằng số liệu.

### Slide 3 — Phạm vi và vì sao chọn mô phỏng · 2:10–3:40

> Hai hướng xung đột nên thiết kế đặt ra ba quy tắc: hai hướng xe không cùng xanh, đổi hướng phải qua vàng và đỏ toàn phần, và chỉ cho đi bộ khi cả hai đèn xe đỏ. Trong phạm vi đó nhóm làm hai chế độ xanh và một nút yêu cầu đi bộ.
>
> Lý do chọn mô phỏng là để kiểm soát đầu vào. Chẳng hạn, nhóm có thể cho đúng cùng lịch xe đến và cùng lịch nhấn nút chạy qua cả hai chế độ. Khi thấy khác biệt, có thể mở dạng sóng và chỉ ra quyết định xảy ra tại cạnh clock nào. Số xe chờ trong bài đến từ hai hàng đợi mô phỏng. Bản hiện tại xét xe đi thẳng, nút mô phỏng và RTL chạy trên máy tính. Cảm biến thật, luồng rẽ và triển khai FPGA nằm ngoài phạm vi đã thực hiện.

*Thao tác:* Chỉ ba quy tắc, sau đó chỉ cột phạm vi. Giải thích lợi ích của mô phỏng trước khi chuyển sang sơ đồ.

### Slide 4 — Sơ đồ khối hệ thống · 3:40–5:25

> Trong `traffic_top` có bộ chia `second_tick` và `traffic_controller`. Bộ chia gửi tín hiệu cho phép đếm thời gian. Controller lưu trạng thái, thời gian pha, chế độ đang chạy và yêu cầu đi bộ. Bên trong controller, `green_policy` tính điều kiện hết xanh từ chế độ, thời gian và hàng đợi. FSM dùng điều kiện đó để chọn trạng thái kế tiếp. Màu đèn được giải mã từ trạng thái.
>
> Nhìn ra ngoài khung RTL, testbench cấp lịch xe đến cho hai mô hình hàng đợi. Số xe chờ đi vào controller. Tín hiệu xanh quay lại mô hình xe để cho phép phục vụ. Vòng này tạo ra sự tương tác: đèn ảnh hưởng số xe rời hàng đợi, rồi số xe chờ mới có thể ảnh hưởng quyết định ở tick sau.

*Thao tác:* Dùng con trỏ lần theo bộ chia → controller → đèn, rồi đi vòng đèn → hàng đợi → controller. Chỉ chỗ tách lõi RTL khỏi mô hình xe.

### Slide 5 — Một vòng FSM của hai hướng A/B · 5:25–7:00

> FSM, tức máy trạng thái hữu hạn, lưu mạch đang ở pha nào. Sau reset mạch ở BOOT, cả hai đèn đỏ. Chu trình thường tiếp tục qua A xanh, A vàng, AFTER_A với hai đèn đỏ, rồi B xanh nếu không có yêu cầu đi bộ. Lượt B cũng qua vàng và AFTER_B trước khi trở về lượt A.
>
> AFTER_A và AFTER_B xuất cùng hai đèn đỏ, nhưng chúng cần là hai trạng thái khác nhau. AFTER_A nhớ rằng vừa phục vụ A nên hướng tiếp theo là B. AFTER_B nhớ trường hợp ngược lại. Đây cũng là hai vị trí có thể chèn lượt đi bộ. Chính sách thích ứng chỉ báo hết xanh, còn FSM vẫn chuyển qua vàng và đỏ toàn phần để đổi hướng.

*Thao tác:* Lần theo một vòng trên hình và dừng ở AFTER_A. Để phần WALK và CLEAR cho Bạn 4.

> FSM đã xác định sau pha xanh mạch sẽ đi đâu. Tiếp theo, [tên] sẽ giải thích số xe chờ ảnh hưởng tới thời điểm kết thúc xanh như thế nào.

## Bạn 2 — Hàng đợi và chính sách đèn xanh

### Slide 6 — Xe đến, xe đi và thời điểm lấy mẫu · 7:00–9:30

> Mỗi hướng lưu một số đếm từ 0 đến 255. Sau tick, số xe chờ mới bằng số cũ cộng xe đến và trừ xe đi. Nếu tổng vượt 255, mô hình giữ 255 và báo tràn. Một xe rời hàng sau hai tick phục vụ đủ điều kiện: đèn xanh và trước cạnh còn xe. Phần phục vụ dở bị xóa tại tick đèn đã hết xanh hoặc hàng đợi trước cạnh rỗng.
>
> Giả sử trước cạnh hoàn tất tick thứ 6 của A, hai hướng đều có 3 xe chờ. Cùng cạnh đó có thêm một xe đến B. Controller vẫn xét 3 so với 3, nên riêng xe mới này chưa làm A chuyển vàng ở cạnh hiện tại. Mô hình xe cũng dùng màu đèn trước cạnh để tính xe rời hàng. Sau cập nhật, giá trị hàng đợi mới xuất hiện và được dùng cho lần xét sau.
>
> Tương tự, nếu trước cạnh hàng đợi rỗng thì xe đến được cộng vào hàng ở cạnh này. Xe đó chưa thể được tính là đã phục vụ ngay trong cùng tick.

*Thao tác:* Hiện ba cột “trước cạnh”, “tại cạnh”, “sau cạnh”. Giữ số 3/3 ở cột trước cạnh khi hiện xe mới đến B.

### Slide 7 — Vì sao triển khai cả cố định và thích ứng? · 9:30–11:15

> Cố định cho mỗi lượt xanh 12 tick, nên dễ dự đoán và làm mốc so sánh. Với thích ứng, trước 6 tick phải tiếp tục xanh. Khi đủ ít nhất 6 tick, nếu hướng đối diện đông xe hơn thì kết thúc xanh. Đến 20 tick, pha phải kết thúc dù hướng hiện tại vẫn đông. Nếu hai hàng đợi bằng nhau và chưa đến cận trên thì mạch giữ xanh.
>
> Cận dưới giúp mỗi lượt có đủ một khoảng phục vụ tối thiểu. Cận trên ngăn một hướng giữ xanh vô hạn. Hai chế độ dùng chung các pha an toàn, cách phục vụ người đi bộ và cùng mô hình xe. Thay đổi tập trung ở điều kiện kết thúc xanh, nên kết quả có thể đối chiếu trên cùng giả định.

*Thao tác:* Chỉ 12 ở cột cố định. Ở cột thích ứng, lần lượt chỉ cận dưới, điều kiện so sánh và cận trên.

### Slide 8 — A còn 2 xe, B chờ 7 xe · 11:15–13:00

> Giả sử A đang xanh ở chế độ thích ứng. Tại cạnh hoàn tất tick thứ 5, A còn 2 xe và B có 7 xe. Mặc dù B đông hơn, A vẫn chưa đủ thời lượng tối thiểu nên giữ xanh. Tới cạnh hoàn tất tick thứ 6, nếu các số trước cạnh vẫn là 2 và 7, cả hai điều kiện cùng đúng. FSM chuyển A sang vàng, rồi mới qua đỏ toàn phần.
>
> Nếu đổi lại A có 7 xe và B có 2 xe, đủ 6 tick vẫn chưa cần kết thúc xanh. Đến tick 20, cận trên buộc đổi pha. Cặp 2 và 7 là ví dụ giải thích quy tắc. Ca đo thật ở phần demo dùng A bằng 0 và B bằng 10.

*Thao tác:* Hiện tick thứ 5 và thứ 6 trước đáp án. Dừng vài giây cho người nghe dự đoán, rồi tô trạng thái A_YELLOW.

> Vậy “đủ tick thứ sáu” được xác định trên thanh ghi như thế nào? [Tên] sẽ giải thích cách đếm và chỉ cách đo trên dạng sóng.

## Bạn 3 — Bộ đếm và định thời

### Slide 9 — Một clock và tín hiệu cho phép đếm · 13:00–14:45

> Controller dùng cùng một clock để cập nhật các thanh ghi. Bộ chia đếm cạnh lên và tạo `tick`, tín hiệu cho phép tiến một bước thời gian pha. Trong `tb_top`, cấu hình chia 4 đếm từ 0 tới 3. Tại cạnh mà bộ chia đang báo cuối chu kỳ đếm, FSM mới tăng thời gian pha hoặc chuyển trạng thái, đồng thời bộ chia trở về 0.
>
> Hãy nhìn bốn cạnh clock trên hình. Chỉ cạnh có `tick=1` mới làm thời gian pha tiến khi đang vận hành bình thường. Trong khi đó, phần bắt cạnh nút vẫn làm việc trên mỗi clock. Tách hai nhịp xử lý như vậy giúp giữ định thời của đèn mà vẫn bắt được một xung nút giữa hai tick.

*Thao tác:* Chỉ 0, 1, 2, 3 trên sơ đồ. Dừng ở cạnh có tick và chỉ FSM vẫn cập nhật tại cạnh lên của cùng clock.

### Slide 10 — Vì sao đủ 12 tick lại so với 11? · 14:45–16:35

> Khi vừa vào A_GREEN, `elapsed` bằng 0. Sau tick thứ nhất nếu vẫn giữ pha, bộ đếm thành 1. Ngay trước cạnh hoàn tất tick thứ 12, đã có 11 tick xanh đầy đủ trôi qua. Tại cạnh đó, `elapsed >= 12-1` đúng, FSM chuyển sang vàng và bộ đếm pha mới về 0.
>
> Nếu đợi đến khi nhìn thấy `elapsed=12` trước cạnh mới cho chuyển, đèn xanh sẽ dài thêm một tick. Cùng cách đếm đó được dùng cho cận 6 và 20. Trong pha xanh thích ứng, `remaining` cho biết còn bao nhiêu tới cận trên. Pha có thể kết thúc sớm hơn nếu điều kiện hàng đợi đã đúng.

*Thao tác:* Chỉ ba ô “vào pha”, “trước cạnh cuối”, “sau cạnh cuối”. Nếu dùng mã, đọc đúng biểu thức so sánh rồi trở lại trục thời gian.

### Slide 11 — Đo 3 tick vàng và 1 tick đỏ toàn phần · 16:35–18:30

> Hình tĩnh này lấy từ ca cố định trong `controller.vcd`. Trong đoạn này testbench cấp `tick=1`, nên 10 ns trên dạng sóng biểu diễn một tick. Tại 135 ns, A chuyển vàng, B vẫn đỏ. Tại 165 ns, A hết vàng và hai đèn đỏ. Hiệu 165 trừ 135 là 30 ns, tương ứng 3 tick vàng.
>
> Hai hướng cùng đỏ từ 165 đến 175 ns. Hiệu 10 ns ứng với 1 tick. Tại 175 ns, A vẫn đỏ, B mới chuyển xanh. Cách đọc này kiểm cả thời lượng lẫn thứ tự màu. Các số nanô giây là trên trục mô phỏng. Thời lượng điều khiển trên mô hình được đếm bằng tick.

*Thao tác:* Chiếu ảnh có ba vạch 135, 165 và 175 ns. Chỉ hai màu đèn theo từng khoảng rồi mới đọc hiệu thời gian. Để hai ca khác cho demo trực tiếp.

> Mạch đã chuyển đúng nhịp. [Tên] sẽ giải thích khi có yêu cầu đi bộ thì các khối phối hợp và giữ đúng lượt xe ra sao.

## Bạn 4 — Tích hợp, người đi bộ và reset

### Slide 12 — Hai cách ghép để kiểm tra hai mục tiêu · 18:30–20:00

> Hình trái là `tb_top`. Testbench đi qua `traffic_top` với bộ chia hệ số 4. Cấu hình này dùng để kiểm tra thời gian và thứ tự cổng đèn thật của wrapper, cũng như việc lưu một xung nút giữa hai tick. Ví dụ, 12 tick xanh ở đây tương ứng 48 clock.
>
> Hình phải là đường mô phỏng lưu lượng trong `tb_system`. Controller nối với hai hàng đợi và được cấp `tick=1`. Cấu hình này chạy các lịch xe đến dài và thu số liệu để so sánh hai chế độ. Một bên kiểm tra cách nối wrapper và nhịp, bên kia kiểm tra phản hồi giữa controller và hàng đợi.

*Thao tác:* Dùng cùng một màu cho controller trong hai hình. Chỉ chính xác nguồn cấp tick khác nhau và đường về của số xe chờ.

### Slide 13 — Bấm giữa hai tick vẫn được ghi nhớ · 20:00–21:45

> Controller lưu mức nút tại cạnh trước vào `button_prev`. Nút hiện tại bằng 1 và mức trước bằng 0 thì có một cạnh mới. Nếu nút bấm giữa hai tick, controller vẫn có thể giữ yêu cầu vào `ped_pending` ở cạnh clock đó, trong khi trạng thái đèn chưa tiến. Nút có thể trở về 0 trước lúc đổi pha và yêu cầu vẫn còn.
>
> Một trường hợp nữa là nút lên đúng cạnh kết thúc AFTER_A hoặc AFTER_B. Nếu ở cạnh đó chỉ nhìn cờ chờ cũ thì có thể bỏ qua yêu cầu mới ở đúng lượt. Thiết kế xét cả yêu cầu đã lưu lẫn cạnh mới. Vì vậy tại ranh giới phù hợp, FSM có thể vào WALK ngay và xóa yêu cầu khi bắt đầu phục vụ.

*Thao tác:* Vẽ hai tình huống riêng: một xung giữa hai tick để thấy cờ chờ, và một xung ở cuối AFTER để thấy WALK được chọn ngay.

### Slide 14 — Sau khi đi bộ, hướng nào được xanh? · 21:45–23:40

> FSM dùng chung hai trạng thái WALK và CLEAR cho cả hai hướng. Khi rời AFTER_A để vào WALK, controller lưu `resume_b=1` để nhớ B được phục vụ tiếp. Nếu từ AFTER_B thì lưu giá trị chọn A.
>
> Trong WALK, tín hiệu đi bộ bật và cả hai đèn xe đỏ trong 6 tick. Sang CLEAR, tín hiệu đi bộ tắt, còn hai đèn xe vẫn đỏ thêm 1 tick. Sau CLEAR, bit đã lưu quyết định hướng tiếp theo. Vì vậy nhóm có thể dùng chung nhánh đi bộ và vẫn quay lại đúng lượt.

*Thao tác:* Dùng hai màu để lần theo hai đường vào WALK, rồi chỉ hai đường ra từ CLEAR. Nhấn rõ **sau A thì B nhận lượt** trước khi chuyển slide.

### Slide 15 — Reset và các trường hợp biên · 23:40–25:30

> Giữ nút cao chỉ tạo một cạnh lên lúc đầu. Nhấn mới trong WALK bị bỏ qua, còn nhấn trong CLEAR được lưu để xét tại lượt tiếp theo. Một yêu cầu mới không kéo dài thời lượng WALK đang chạy.
>
> Reset đồng bộ có ưu tiên tại cạnh lên: FSM về BOOT, hai đèn đỏ, xóa thời gian và yêu cầu, rồi lưu chế độ từ `mode_select`. Đổi giá trị chọn trong lúc chạy chưa làm chế độ đang hoạt động đổi. Có một ca dễ nhầm: nếu vẫn giữ nút cao khi nhả reset, mức nút đã lưu được xóa về 0 trong reset. Cạnh clock đầu tiên sau nhả reset vì vậy ghi nhận một yêu cầu mới, kể cả khi `tick=0`. Lúc đó FSM vẫn có thể đang ở BOOT.

*Thao tác:* Dùng bảng bốn dòng giữ nút, bấm trong WALK, bấm trong CLEAR, giữ qua reset. Ở dòng cuối, chỉ thứ tự “xóa mức đã nhớ → lấy mẫu mức cao”.

> Các ca này là hành vi thiết kế mong đợi. [Tên] sẽ chỉ cách testbench phát hiện sai và dẫn hai ca trên GTKWave.

## Bạn 5 — Kiểm thử, demo và bàn luận kết quả

### Slide 16 — Testbench bắt được lỗi nào? · 25:30–27:45

> Nhóm sử dụng bốn bench. `tb_units` kiểm chính sách xanh và phân loại nhu cầu. `tb_controller` kiểm FSM, thời lượng, reset và nút đi bộ. `tb_top` kiểm wrapper và bộ chia. `tb_system` kiểm lịch phục vụ xe, hàng đợi và số liệu theo kịch bản.
>
> Ví dụ, khi đổi chỗ hai cổng đèn A/B trên bản sao, tại A_GREEN cặp đèn thực tế thành A đỏ, B xanh. Cặp đúng phải là A xanh, B đỏ, tức mã 1 và 4 theo thứ tự A rồi B. Điều kiện hai hướng không cùng xanh vẫn đúng trên bản sao, nhưng phép so đúng thứ tự của `tb_top` báo lỗi. Đó là lý do test phải kiểm cả ý nghĩa của từng cổng.
>
> Bản sạch có bốn bench PASS với 95.986 lượt đánh giá điều kiện. Nhiều điều kiện lặp lại trên các cạnh clock, nên số lượt này không quy đổi thành chừng ấy kịch bản riêng biệt.

*Thao tác:* Hiện “kỳ vọng 1/4” cạnh “khi đảo 4/1”. Chỉ dòng PASS đã chuẩn bị. Mở cửa sổ dạng sóng đã sẵn sàng thay vì biên dịch lại ngay trên sân khấu.

### Slide 17 — Hai ca demo GTKWave · 27:45–33:15

Mở `build/controller.vcd`, chọn các tín hiệu dưới scope `tb_controller` và dùng thang ns. Hai ca đều theo thứ tự dự đoán, đọc tín hiệu, kết luận.

**Ca 1 · 27:45–30:15 · Xanh thích ứng đủ cận dưới**

> Trước khi đo, ta dự đoán A phải xanh đủ 6 tick, dù A không có xe và B có 10 xe. Trên sóng, `mode_active=1` và hai hàng đợi có giá trị 0 và 10. Tại 645 ns, `state` sang 1, A_GREEN. Tại 705 ns, `state` sang 2 và đèn A đổi từ xanh sang vàng. Hiệu là 60 ns. Trong bench này 10 ns tương ứng một tick, nên A giữ xanh đúng 6 tick.
>
> Kết quả xác nhận cả điều kiện nhu cầu lẫn giới hạn thời gian. B đông là lý do có thể đổi sớm, nhưng FSM chỉ đổi tại cạnh hoàn tất thời lượng tối thiểu.

*Thao tác:* Chỉ `mode_active`, `queue_a`, `queue_b` trước khi kéo con trỏ. Đặt mốc **645 ns** và **705 ns** rồi đọc `state` và `lights_a` ở hai đầu. Cặp A=2 và B=7 ở slide 8 chỉ là ví dụ giải thích.

**Ca 2 · 30:15–33:15 · Đi bộ sau A rồi B nhận lượt**

> Ta dự đoán yêu cầu ở cuối AFTER_A sẽ vào WALK, giữ cả hai đèn xe đỏ và sau CLEAR tiếp tục B. Tại 1435 ns, `state` sang 7 và `walk` bật. Đến 1495 ns, `state` sang 8: `walk` tắt, cả hai đèn vẫn đỏ. Đến 1505 ns, `state` sang 4 và B xanh. Đo hai khoảng này được 60 ns và 10 ns, tức 6 tick WALK và 1 tick CLEAR.
>
> Nút vẫn cao khi B nhận lượt. Dạng sóng này cho thấy yêu cầu ở đúng ranh giới được phục vụ, WALK kết thúc đúng hạn và FSM trả lượt cho B.

*Thao tác:* Chỉ `ped_button`, rồi đọc **1435 → 1495 → 1505 ns** cùng `state`, `walk`, `lights_a`, `lights_b`. Ở chính ca nhận tại ranh giới này, `ped_pending` không hiện một đoạn mức cao vì FSM xét cạnh mới rồi xóa yêu cầu khi vào WALK. Nếu muốn minh họa cơ chế nhớ qua nhiều clock, dùng ca xung giữa tick ở slide 13. Nếu được hỏi về giữ nút mà không lặp ở lượt tiếp theo, mở thêm ca kiểm “No duplicate walk on held button” trong testbench.

### Slide 18 — Thích ứng có lợi ở đâu? · 33:15–35:30

> Mỗi cặp so sánh chạy 600 tick, bắt đầu từ hàng đợi rỗng và nhận cùng lịch xe đến, cùng ba lần bấm nút. Biểu đồ là tổng hàng đợi tích lũy: cộng số xe còn chờ của A và B sau từng tick rồi cộng qua cả cửa sổ. Đơn vị là xe·giây. Ta dùng chỉ số này để xem lượng tồn trong cửa sổ. Mô hình chưa theo dõi thời gian chờ của từng xe.
>
> Ở ca A đông, cùng 260 xe đến, cố định phục vụ 167 xe và thích ứng phục vụ 219 xe. Tích lũy giảm từ 29.008 xuống 14.754 xe·giây, khoảng 49,1%. Ca B đông và ca đổi hướng cũng giảm trên các lịch đã thử. Nhưng ở ca cân bằng, cùng 240 xe đến, số xe phục vụ giảm từ 213 xuống 161. Câu hỏi là hai chế độ đã dùng thời gian xanh khác nhau thế nào?

*Thao tác:* Chỉ đơn vị trước khi đọc cột. Nói sâu hai ca A đông và cân bằng. Để hai cặp còn lại trên hình để đối chiếu hoặc trả lời nếu được hỏi.

### Slide 19 — Vì sao ca cân bằng kém hơn? · 35:30–37:30

> Từ trace, ta đếm các tick có đèn xanh trước cạnh, tức những tick mà mô hình xe thấy xanh. Cố định kết thúc 36 pha xanh và có 434 tick xanh. Thích ứng kết thúc 54 pha và có 362 tick xanh.
>
> Chênh lệch là 18 lần kết thúc xanh. Mỗi lần chuyển thêm dùng 3 tick vàng và 1 tick đỏ toàn phần, nên mất 18 nhân 4, bằng 72 tick xanh. Đây là chi phí đổi pha trong ca cân bằng đã thử. Số xe phục vụ còn phụ thuộc việc hàng đợi có xe đúng lúc và có đủ hai tick phục vụ liên tiếp. Khi pha kết thúc, phần phục vụ dở có thể mất. Vì vậy 72 là số tick xanh giảm, không phải số xe giảm.
>
> Hướng kiểm chứng tiếp là thử một ngưỡng chênh lệch để giảm đổi pha vì chênh lệch nhỏ, rồi đo lại trên cùng các lịch xe và giữ các phép kiểm an toàn.

*Thao tác:* Hiện lần lượt ba dòng “pha kết thúc xanh”, “tick xanh”, “xe phục vụ”. Khoanh **72 tick** trên phép tính và nối với câu hỏi ở slide 2.

### Slide 20 — Kết luận và chuyển sang bảo vệ · 37:30–38:00

> Nhóm em dùng FSM và bộ đếm để giữ đúng chu trình điều khiển, rồi dùng testbench và dạng sóng để kiểm tra. Trong các lịch mô phỏng đã chạy, thích ứng có lợi khi lệch hướng, nhưng đổi pha nhiều làm ca cân bằng kém hơn. Nhóm em xin dừng phần trình bày và sẵn sàng trả lời câu hỏi.

*Thao tác:* Giữ slide kết có link repo. Khi trả lời, quay lại đúng slide hoặc dạng sóng được hỏi.

## Câu hỏi ôn tập chung

1. **Vì sao giữ cả hai chế độ?** Cố định là mốc dễ đối chiếu. Thích ứng thay điều kiện hết xanh dựa trên số xe chờ. Cùng FSM an toàn và cùng đầu vào cho phép so sánh tác động của chính sách.
2. **Nếu nút bấm giữa hai tick thì sao?** Logic bắt cạnh nút làm việc trên mỗi clock. Tick cho phép tiến thời gian pha. Tại cuối AFTER_A/B, FSM xét cả cờ chờ lẫn cạnh nút mới, nên có thể chuyển WALK ngay.
3. **Xe vừa đến có thể đi tại cùng tick không?** Nếu hàng đợi trước cạnh rỗng, xe mới đến chỉ được cộng vào sau cạnh. Lượt phục vụ ở cạnh đó được quyết định từ hàng cũ và màu đèn cũ.
4. **Có thể lấy 72 chia 2 để tính số xe giảm không?** 72 là số tick xanh mất đi. Số xe đi còn phụ thuộc tick xanh đó có xe chờ hay không, và có đủ hai tick phục vụ liên tiếp để hoàn tất lượt hay không.
5. **Ca A đông có tốt lên ở cả hai hướng không?** Tổng tăng 167 → 219 xe, nhưng B phục vụ 60 → 50 xe. Chỉ số khoảng liên tiếp dài nhất mà B có xe chờ và chưa xanh cũng tăng 25 → 35 tick. Giá trị đó gồm các pha chưa xanh và không phải thời gian chờ của một xe cụ thể. Giới hạn 40 tick được kiểm trong các lịch đã chạy, không phải bảo đảm cho mọi đầu vào.
6. **95.986 lượt đánh giá có đồng nghĩa với bao phủ hết không?** Không. Riêng `tb_units` quét 12.800 tổ hợp trong miền chính sách đã chọn và toàn bộ 256 giá trị của khối phân loại. Các phép kiểm hướng đến miền và tình huống đã nêu. Ví dụ đảo A/B cho thấy một lỗi cụ thể được phát hiện.
7. **Dự án đã chạy FPGA chưa?** Bản hiện tại mô phỏng RTL. Đưa lên bo còn cần xử lý đầu vào vật lý, ánh xạ chân, tổng hợp, kiểm tra timing và chạy thử.
8. **Có thể cải tiến gì?** Thử yêu cầu chênh lệch đủ lớn sau tick tối thiểu trước khi đổi sớm, vẫn buộc hết xanh ở tick tối đa. So sánh lại trên cùng kịch bản và theo dõi cả tổng lẫn từng hướng. Đây là phương án tiếp theo, chưa có kết quả đo.

## Cách tập trên máy trình chiếu

- Chạy `.\scripts\run.ps1` từ repo và kiểm tra đủ bốn dòng PASS. Tùy chọn `-Wave` mở `demo.vcd`. Với các mốc dùng trên slide 11 và 17, mở riêng **`build/controller.vcd`**.
- Mở sẵn hai vùng zoom, lưu ảnh tĩnh có con trỏ và chuẩn bị bảng số liệu cùng lượt. Nếu GTKWave mở chậm, đo trên ảnh tĩnh và giữ nguyên câu hỏi kỹ thuật của mỗi ca.
- Tập bàn giao ở phút **7, 13, 18:30 và 25:30**. Bấm giờ cả lời nói lẫn thao tác. Nếu vượt 38 phút, cắt ví dụ phụ hoặc thao tác tìm tín hiệu, ưu tiên giữ phần giải thích số liệu ở slide 18–19. Nếu nói nhanh, dùng phần thời gian còn lại để chỉ tín hiệu và giải thích ví dụ bằng lời của mình.

Đọc kèm [hướng dẫn demo](DEMO_VA_TIEN_DO.md), [bảng tra mã khi bảo vệ](TRA_CUU_BAO_VE.md), [đặc tả thiết kế](THIET_KE.md) và [bảng kết quả](KET_QUA.md).
