---
title: "Tìm Hiểu về Strategy Pattern (Mẫu Thiết Kế Chiến Lược)"
description: "Phân tích sâu về Strategy Pattern, một mẫu thiết kế hành vi cho phép lựa chọn một thuật toán tại thời điểm chạy."
tags: ["Mẫu Thiết Kế", "Mẫu Hành Vi", "OOP", "Java"]
categories: ["Mẫu thiết kế", "Ngôn ngữ lập trình"]
date: "2025-08-16"
gradientFrom: "from-purple-500"
gradientTo: "to-indigo-600"
---

## Strategy Pattern là gì?

Strategy Pattern là một mẫu thiết kế thuộc nhóm hành vi (behavioral), cho phép định nghĩa một họ các thuật toán, đóng gói từng thuật toán lại, và làm cho chúng có thể hoán đổi cho nhau. 

Mẫu này cho phép thuật toán có thể thay đổi độc lập so với các client sử dụng nó. Thay vì cài đặt một thuật toán duy nhất một cách trực tiếp, code sẽ nhận chỉ thị vào lúc chạy (runtime) để biết nên sử dụng thuật toán nào trong một họ các thuật toán đã được định nghĩa.

## Khi nào sử dụng?

- Khi bạn có nhiều biến thể của một thuật toán và muốn chuyển đổi giữa chúng tại thời điểm chạy.
- Để tách biệt logic nghiệp vụ của một lớp khỏi chi tiết triển khai của các thuật toán.
- Khi bạn muốn tránh sử dụng các câu lệnh điều kiện (if-else hoặc switch) để chọn một hành vi.

## Cấu trúc

1.  **Context (Ngữ cảnh)**: Duy trì một tham chiếu đến đối tượng Strategy và định nghĩa một giao diện cho phép Strategy truy cập dữ liệu của nó.
2.  **Strategy Interface**: Đây là một interface chung cho tất cả các chiến lược cụ thể. Nó khai báo một phương thức cho thuật toán.
3.  **Concrete Strategies (Các chiến lược cụ thể)**: Các lớp này triển khai Strategy Interface, cung cấp các phiên bản khác nhau của thuật toán.

## Ví dụ Code Java

Hãy xem xét một hệ thống xử lý thanh toán đơn giản, nơi người dùng có thể thanh toán qua Thẻ Tín Dụng hoặc PayPal.

### 1. Strategy Interface

```java
// Strategy Interface
public interface PaymentStrategy {
    // Phương thức thanh toán
    void pay(int amount);
}
```

### 2. Concrete Strategies

```java
// Chiến lược cụ thể 1: Thanh toán bằng Thẻ Tín Dụng
public class CreditCardPayment implements PaymentStrategy {
    private String name;
    private String cardNumber;

    public CreditCardPayment(String name, String cardNumber) {
        this.name = name;
        this.cardNumber = cardNumber;
    }

    @Override
    public void pay(int amount) {
        System.out.println(amount + " đã được thanh toán bằng thẻ tín dụng.");
    }
}

// Chiến lược cụ thể 2: Thanh toán bằng PayPal
public class PayPalPayment implements PaymentStrategy {
    private String email;

    public PayPalPayment(String email) {
        this.email = email;
    }

    @Override
    public void pay(int amount) {
        System.out.println(amount + " đã được thanh toán bằng PayPal.");
    }
}
```

### 3. Context

```java
// Lớp Context
public class ShoppingCart {
    private PaymentStrategy paymentStrategy;

    // Cho phép client đặt chiến lược thanh toán
    public void setPaymentStrategy(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    public void checkout(int amount) {
        // Ủy quyền việc thanh toán cho đối tượng chiến lược
        paymentStrategy.pay(amount);
    }
}
```

### 4. Client Sử Dụng

```java
public class Client {
    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();

        // Thanh toán bằng Thẻ Tín Dụng
        cart.setPaymentStrategy(new CreditCardPayment("John Doe", "1234567890123456"));
        cart.checkout(100);

        // Chuyển sang thanh toán bằng PayPal
        cart.setPaymentStrategy(new PayPalPayment("john.doe@example.com"));
        cart.checkout(50);
    }
}
```

## Ưu và Nhược điểm

### Ưu điểm
- **Nguyên tắc Mở/Đóng (Open/Closed Principle)**: Bạn có thể thêm các chiến lược mới mà không cần thay đổi lớp context.
- **Tính Tách biệt**: Các thuật toán được tách biệt khỏi code của client.
- **Tính Linh hoạt**: Bạn có thể chuyển đổi chiến lược tại thời điểm chạy.
- **Giảm câu lệnh điều kiện**: Loại bỏ các khối `if-else` hoặc `switch` phức tạp.

### Nhược điểm
- **Tăng độ phức tạp**: Có thể làm tăng số lượng đối tượng và lớp trong ứng dụng.
- **Client phải nhận biết**: Client phải biết về các chiến lược khác nhau để có thể chọn chiến lược phù hợp.
