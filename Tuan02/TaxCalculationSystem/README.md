

**State Pattern**: Đóng vai trò bộ lọc quy tắc ở cấp độ cao. Nó giúp xác định tình trạng thuế của sản phẩm (ví dụ: Chịu thuế nội địa `TaxableState` hoặc Miễn thuế xuất khẩu `TaxExemptState`) ngay từ đầu. Điều này cho phép hệ thống thay đổi hành vi xử lý dựa trên ngữ cảnh mà không cần các câu lệnh kiểm tra điều kiện phức tạp.

**Strategy Pattern**: Tách biệt hoàn toàn "cách thức tính toán" ra khỏi đối tượng thuế. Bằng cách sử dụng các chiến lược như tính theo phần trăm (`PercentageTaxStrategy`) hoặc mức phí cố định (`FixedAmountTaxStrategy`), hệ thống có thể dễ dàng thay đổi thuật toán tính thuế khi chính sách pháp luật thay đổi mà không ảnh hưởng đến cấu trúc của sản phẩm.

**Decorator Pattern**: Đây là mô hình chủ đạo giúp giải quyết vấn đề "chồng thuế". Nó cho phép chúng ta cộng dồn nhiều loại thuế khác nhau (VAT, thuế tiêu thụ đặc biệt, thuế môi trường...) lên một sản phẩm cơ bản bằng cách bao bọc đối tượng một cách linh hoạt tại thời điểm thực thi (runtime).
