# Kết quả mô phỏng và kiểm thử

Mã lần chạy: `20261123T143101Z-d50ee175`.

Kết quả được đọc từ `build/metrics.csv` và các log của cùng lần chạy. Mỗi kịch bản kéo dài 600 giây mô phỏng, với cùng chuỗi xe đến và ba yêu cầu đi bộ trong cả hai chế độ. Cuối cửa sổ đo có thể vẫn còn xe.

| Kịch bản | Chế độ | Xe đến | Xe đi | Còn chờ | Tổng hàng đợi tích lũy xe giây | Hàng đợi cực đại |
|---|---|---:|---:|---:|---:|---:|
| Cân bằng | Cố định | 240 | 213 | 27 | 10252 | 28 |
| Cân bằng | Thích ứng | 240 | 161 | 79 | 24792 | 79 |
| A đông hơn B | Cố định | 260 | 167 | 93 | 29008 | 94 |
| A đông hơn B | Thích ứng | 260 | 219 | 41 | 14754 | 43 |
| B đông hơn A | Cố định | 260 | 167 | 93 | 29621 | 94 |
| B đông hơn A | Thích ứng | 260 | 218 | 42 | 14847 | 43 |
| Lưu lượng đổi hướng | Cố định | 200 | 173 | 27 | 33264 | 93 |
| Lưu lượng đổi hướng | Thích ứng | 200 | 200 | 0 | 22009 | 70 |

## Cách hiểu kết quả

- Tổng hàng đợi tích lũy là tổng số xe chờ của cả hai hướng sau mỗi giây, tính trên 600 giây.
- Chỉ số này không đo thời gian chờ của từng xe. Mô hình chỉ giữ số lượng xe, chưa gắn mã hay theo dõi thời điểm đến/đi riêng.
- `max_red_wait_a/b` đếm khoảng liên tiếp có xe chờ nhưng hướng đó chưa xanh. Chỉ số này không đo thời gian chờ của xe lâu nhất.
- Chỉ so sánh hai chế độ trong cùng kịch bản, cùng đầu vào và cùng quy tắc phục vụ.

## Kết luận theo dữ liệu

- Cân bằng: thích ứng tăng tổng hàng đợi tích lũy 141.8% so với cố định.
- A đông hơn B: thích ứng giảm tổng hàng đợi tích lũy 49.1% so với cố định.
- B đông hơn A: thích ứng giảm tổng hàng đợi tích lũy 49.9% so với cố định.
- Lưu lượng đổi hướng: thích ứng giảm tổng hàng đợi tích lũy 33.8% so với cố định.

Ở kịch bản cân bằng, chênh lệch nhỏ giữa hai hàng đợi có thể khiến pha xanh thích ứng kết thúc sớm. Mỗi lần đổi hướng cần qua pha vàng và đỏ, nên đổi pha thường xuyên làm giảm số tick phục vụ xe. Kết quả này cho thấy sự đánh đổi giữa đáp ứng lưu lượng lệch hướng và chi phí đổi pha.

## Kiểm thử đã chạy

| Nhóm | Số lượt kiểm tra đạt |
|---|---:|
| tb_units | 13,056 |
| tb_controller | 2,268 |
| tb_top | 182 |
| tb_system | 80,480 |
| Tổng | 95,986 |

Số lượt kiểm tra đếm các điều kiện được đánh giá trong mô phỏng, không phải số kịch bản độc lập.

- Kiểm tra chính sách trên 12.800 tổ hợp; kiểm tra phân loại trên đủ 256 giá trị 8 bit.
- Kiểm tra thời lượng pha, đúng màu theo trạng thái, bộ chia nhịp và thứ tự hướng tại cổng wrapper.
- Kiểm tra cạnh nút đi bộ giữa hai tick, khi giữ nút qua reset, và quy tắc bắt hoặc bỏ qua yêu cầu qua các pha.
- Kiểm tra lịch phục vụ, bão hòa, lượt xe đến/đi đồng thời và xóa phần phục vụ dở khi hết xanh.
- Chạy tám lượt so sánh, cùng đầu vào theo từng cặp, và thêm 3.000 giây kích thích giả ngẫu nhiên với seed `0x12345678`.

Các kết quả này áp dụng cho những ca mô phỏng đã chạy. Chưa có kiểm chứng hình thức, đo trên phần cứng hoặc bằng chứng tối ưu thuật toán.
