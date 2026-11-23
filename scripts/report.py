"""Render the validated simulation results as Markdown (standard Python only)."""
from pathlib import Path

from validate_results import METRICS_FIELDS, bench_counts, records, validate


def render_report(build, run_id=None):
    rows = records(build, 'metrics.csv', METRICS_FIELDS)
    by_case = {(row['scenario'], row['adaptive']): row for row in rows}
    names = ['Cân bằng', 'A đông hơn B', 'B đông hơn A', 'Lưu lượng đổi hướng']
    lines = ['# Kết quả mô phỏng và kiểm thử', '']
    if run_id:
        lines += [f'Mã lần chạy: `{run_id}`.', '']
    lines += [
        'Kết quả được đọc từ `build/metrics.csv` và các log của cùng lần chạy. Mỗi kịch bản kéo dài 600 giây mô phỏng, với cùng chuỗi xe đến và ba yêu cầu đi bộ trong cả hai chế độ. Cuối cửa sổ đo có thể vẫn còn xe.',
        '',
        '| Kịch bản | Chế độ | Xe đến | Xe đi | Còn chờ | Tổng hàng đợi tích lũy xe giây | Hàng đợi cực đại |',
        '|---|---|---:|---:|---:|---:|---:|',
    ]
    for row in rows:
        mode = 'Thích ứng' if row['adaptive'] else 'Cố định'
        lines.append(f"| {names[row['scenario']]} | {mode} | {row['arrived']} | {row['served']} | "
                     f"{row['final_queue']} | {row['queue_area_car_seconds']} | {row['peak_total_queue']} |")

    lines += [
        '', '## Cách hiểu kết quả', '',
        '- Tổng hàng đợi tích lũy là tổng số xe chờ của cả hai hướng sau mỗi giây, tính trên 600 giây.',
        '- Chỉ số này không đo thời gian chờ của từng xe. Mô hình chỉ giữ số lượng xe, chưa gắn mã hay theo dõi thời điểm đến/đi riêng.',
        '- `max_red_wait_a/b` đếm khoảng liên tiếp có xe chờ nhưng hướng đó chưa xanh. Chỉ số này không đo thời gian chờ của xe lâu nhất.',
        '- Chỉ so sánh hai chế độ trong cùng kịch bản, cùng đầu vào và cùng quy tắc phục vụ.',
        '', '## Kết luận theo dữ liệu', '',
    ]
    for i, name in enumerate(names):
        fixed = by_case[i, 0]['queue_area_car_seconds']
        adaptive = by_case[i, 1]['queue_area_car_seconds']
        if fixed == 0:
            lines.append(f'- {name}: tổng tích lũy của cố định bằng 0, không tính được tỷ lệ thay đổi; '
                         f'thích ứng đạt {adaptive} xe giây.')
        elif adaptive == fixed:
            lines.append(f'- {name}: hai chế độ có cùng tổng hàng đợi tích lũy.')
        else:
            delta = 100 * (adaptive - fixed) / fixed
            change = 'tăng' if delta > 0 else 'giảm'
            lines.append(f'- {name}: thích ứng {change} tổng hàng đợi tích lũy {abs(delta):.1f}% so với cố định.')

    lines += [
        '',
        'Ở kịch bản cân bằng, chênh lệch nhỏ giữa hai hàng đợi có thể khiến pha xanh thích ứng kết thúc sớm. Mỗi lần đổi hướng cần qua pha vàng và đỏ, nên đổi pha thường xuyên làm giảm số tick phục vụ xe. Kết quả này cho thấy sự đánh đổi giữa đáp ứng lưu lượng lệch hướng và chi phí đổi pha.',
        '', '## Kiểm thử đã chạy', '',
        '| Nhóm | Số lượt kiểm tra đạt |', '|---|---:|',
    ]
    counts = bench_counts(build)
    total = sum(counts.values())
    for name, count in counts.items():
        lines.append(f'| {name} | {count:,} |')
    lines += [
        f'| Tổng | {total:,} |', '',
        'Số lượt kiểm tra đếm các điều kiện được đánh giá trong mô phỏng, không phải số kịch bản độc lập.', '',
        '- Kiểm tra chính sách trên 12.800 tổ hợp; kiểm tra phân loại trên đủ 256 giá trị 8 bit.',
        '- Kiểm tra thời lượng pha, đúng màu theo trạng thái, bộ chia nhịp và thứ tự hướng tại cổng wrapper.',
        '- Kiểm tra cạnh nút đi bộ giữa hai tick, khi giữ nút qua reset, và quy tắc bắt hoặc bỏ qua yêu cầu qua các pha.',
        '- Kiểm tra lịch phục vụ, bão hòa, lượt xe đến/đi đồng thời và xóa phần phục vụ dở khi hết xanh.',
        '- Chạy tám lượt so sánh, cùng đầu vào theo từng cặp, và thêm 3.000 giây kích thích giả ngẫu nhiên với seed `0x12345678`.',
        '',
        'Các kết quả này áp dụng cho những ca mô phỏng đã chạy. Chưa có kiểm chứng hình thức, đo trên phần cứng hoặc bằng chứng tối ưu thuật toán.',
    ]
    return '\n'.join(lines) + '\n', total


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    build = root / 'build'
    manifest = validate(root, build)
    report, total = render_report(build, manifest['run_id'])
    (root / 'docs/KET_QUA.md').write_text(report, encoding='utf-8')
    print(f'Report written; {total} successful check evaluations')
