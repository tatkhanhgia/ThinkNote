---
title: "Tìm hiểu về Metrics trong Logging"
description: "Hướng dẫn toàn diện về việc tìm hiểu và sử dụng metrics trong logging để giám sát hệ thống và khả năng quan sát."
tags: ["Logging", "Metrics", "Monitoring", "Observability", "Prometheus"]
categories: ["DevCore", "System Design"]
date: "2025-08-29"
gradientFrom: "from-blue-500"
gradientTo: "to-green-500"
---

## Metrics trong Logging là gì?

Trong lĩnh vực phát triển phần mềm và quản trị hệ thống, **metrics** là các phép đo định lượng về hành vi và hiệu suất của một hệ thống. Chúng là các điểm dữ liệu dạng số được thu thập theo thời gian để cung cấp thông tin chi tiết về tình trạng, hiệu quả và độ tin cậy của một ứng dụng hoặc cơ sở hạ tầng.

Không giống như log (là các sự kiện riêng lẻ), metrics thường được tổng hợp theo các khoảng thời gian, giúp chúng trở nên rất hiệu quả để theo dõi xu hướng và kích hoạt cảnh báo. Ví dụ, thay vì ghi log cho mỗi yêu cầu, bạn có thể sử dụng một metric để theo dõi số lượng yêu cầu mỗi phút.

## Tại sao Metrics lại quan trọng?

Metrics là nền tảng của các chiến lược giám sát và quan sát hiện đại. Chúng mang lại nhiều lợi ích:

- **Giám sát hiệu suất:** Theo dõi các chỉ số chính như thời gian phản hồi, tỷ lệ lỗi và việc sử dụng tài nguyên để đảm bảo hệ thống hoạt động trơn tru.
- **Cảnh báo chủ động:** Thiết lập cảnh báo tự động dựa trên các ngưỡng được xác định trước để được thông báo về các sự cố tiềm ẩn trước khi chúng ảnh hưởng đến người dùng.
- **Lập kế hoạch dung lượng:** Phân tích các xu hướng dài hạn để đưa ra quyết định sáng suốt về việc mở rộng cơ sở hạ tầng và tài nguyên.
- **Quyết định dựa trên dữ liệu:** Sử dụng dữ liệu khách quan để ưu tiên công việc phát triển, biện minh cho các thay đổi hệ thống và cải thiện kết quả kinh doanh.
- **Nâng cao trải nghiệm người dùng:** Bằng cách đảm bảo ứng dụng phản hồi nhanh và đáng tin cậy, bạn có thể cải thiện đáng kể sự hài lòng của người dùng.

## Các loại Metrics chính: Bốn Tín hiệu Vàng

Đội ngũ Kỹ thuật Tin cậy Trang web (SRE) của Google đã xác định bốn "Tín hiệu Vàng" cần thiết để giám sát bất kỳ hệ thống nào có người dùng tương tác.

### 1. Độ trễ (Latency)
Thời gian cần thiết để dịch vụ của bạn phản hồi một yêu cầu. Điều quan trọng là phải phân biệt giữa độ trễ của các yêu cầu thành công và độ trễ của các yêu cầu không thành công, vì loại thứ hai có thể gây hiểu nhầm.

### 2. Lưu lượng (Traffic)
Một thước đo về nhu cầu trên hệ thống của bạn, thường được biểu thị bằng một đơn vị cụ thể của hệ thống. Đối với một máy chủ web, đây thường là số yêu cầu mỗi giây.

### 3. Lỗi (Errors)
Tỷ lệ các yêu cầu không thành công, có thể là lỗi rõ ràng (ví dụ: lỗi HTTP 500) hoặc lỗi ngầm (ví dụ: phản hồi 200 OK với nội dung không chính xác).

### 4. Độ bão hòa (Saturation)
Dịch vụ của bạn "đầy" đến mức nào. Điều này đo lường việc sử dụng các tài nguyên bị hạn chế nhất của bạn, chẳng hạn như CPU, bộ nhớ hoặc I/O đĩa. Độ bão hòa cao có thể dẫn đến suy giảm hiệu suất và là một chỉ số quan trọng để lập kế hoạch dung lượng.

![Sơ đồ Bốn Tín hiệu Vàng](https://i.imgur.com/5y4p4Y5.png)
*Hình ảnh: Sơ đồ minh họa Bốn Tín hiệu Vàng.*

## Công cụ cho Metrics: Prometheus và Grafana

Mặc dù bạn có thể lưu trữ metrics trong log, các công cụ chuyên dụng hiệu quả hơn nhiều để thu thập, lưu trữ và trực quan hóa dữ liệu này.

- **Prometheus:** Một bộ công cụ giám sát và cảnh báo mã nguồn mở đã trở thành một tiêu chuẩn để thu thập metrics. Nó sử dụng mô hình kéo (pull model) để lấy metrics từ các điểm cuối được định cấu hình, lưu trữ chúng trong cơ sở dữ liệu chuỗi thời gian và cung cấp một ngôn ngữ truy vấn mạnh mẽ (PromQL).

- **Grafana:** Một nền tảng mã nguồn mở để trực quan hóa, giám sát và phân tích dữ liệu. Nó kết nối với nhiều nguồn dữ liệu khác nhau, bao gồm cả Prometheus, để tạo ra các bảng điều khiển tương tác, phong phú giúp bạn dễ dàng hiểu các metrics của mình.

![Kiến trúc Prometheus và Grafana](https://i.imgur.com/O3b2e3S.png)
*Hình ảnh: Một kiến trúc điển hình cho thấy cách Prometheus lấy metrics và Grafana trực quan hóa chúng.*

## Các phương pháp hay nhất cho Metrics ứng dụng

- **Trang bị cho mã của bạn (Instrument Your Code):** Thêm mã vào ứng dụng của bạn để tạo dữ liệu đo từ xa. Biến nó thành một phần không thể thiếu trong quy trình phát triển của bạn.
- **Chọn đúng Metrics:** Chọn các metrics phù hợp với mục tiêu kinh doanh của bạn và cung cấp một bức tranh rõ ràng về tình trạng ứng dụng của bạn.
- **Sử dụng Logging có cấu trúc:** Khi sử dụng log, hãy sử dụng định dạng có cấu trúc như JSON để dễ dàng phân tích và phân tích cú pháp.
- **Tự động hóa cảnh báo:** Thiết lập cảnh báo tự động để được thông báo về các sự cố một cách chủ động.
- **Thường xuyên xem xét lại chiến lược của bạn:** Khi ứng dụng của bạn phát triển, chiến lược giám sát của bạn cũng vậy. Thường xuyên xem xét và điều chỉnh các metrics và cảnh báo của bạn.
