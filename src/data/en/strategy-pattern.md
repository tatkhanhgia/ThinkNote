---
title: "Understanding the Strategy Pattern"
description: "A deep dive into the Strategy Pattern, a behavioral design pattern that enables selecting an algorithm at runtime."
tags: ["Design Patterns", "Behavioral Patterns", "OOP", "Java"]
categories: ["Design Patterns", "Programming Languages"]
date: "2025-08-16"
gradientFrom: "from-purple-500"
gradientTo: "to-indigo-600"
---

## What is the Strategy Pattern?

The Strategy Pattern is a behavioral design pattern that turns a set of behaviors into objects and makes them interchangeable inside an original context object.

The core idea is to define a family of algorithms, encapsulate each one, and make them interchangeable. This lets the algorithm vary independently from clients that use it. Instead of implementing a single algorithm directly, the code receives runtime instructions as to which in a family of algorithms to use.

## When to Use It?

- When you have multiple variants of an algorithm and you want to switch between them at runtime.
- To isolate the business logic of a class from the implementation details of its algorithms.
- When you want to avoid conditional statements (if-else or switch) for selecting a behavior.

## Structure

1.  **Context**: Maintains a reference to a Strategy object and defines an interface that lets the Strategy access its data.
2.  **Strategy Interface**: This is a common interface for all concrete strategies. It declares a method for the algorithm.
3.  **Concrete Strategies**: These classes implement the Strategy interface, providing different versions of the algorithm.

## Java Code Example

Let's consider a simple payment processing system where a user can pay via Credit Card or PayPal.

### 1. Strategy Interface

```java
// Strategy Interface
public interface PaymentStrategy {
    void pay(int amount);
}
```

### 2. Concrete Strategies

```java
// Concrete Strategy 1: Credit Card Payment
public class CreditCardPayment implements PaymentStrategy {
    private String name;
    private String cardNumber;

    public CreditCardPayment(String name, String cardNumber) {
        this.name = name;
        this.cardNumber = cardNumber;
    }

    @Override
    public void pay(int amount) {
        System.out.println(amount + " paid with credit card.");
    }
}

// Concrete Strategy 2: PayPal Payment
public class PayPalPayment implements PaymentStrategy {
    private String email;

    public PayPalPayment(String email) {
        this.email = email;
    }

    @Override
    public void pay(int amount) {
        System.out.println(amount + " paid using PayPal.");
    }
}
```

### 3. Context

```java
// Context
public class ShoppingCart {
    private PaymentStrategy paymentStrategy;

    public void setPaymentStrategy(PaymentStrategy paymentStrategy) {
        this.paymentStrategy = paymentStrategy;
    }

    public void checkout(int amount) {
        // Delegate the payment to the strategy
        paymentStrategy.pay(amount);
    }
}
```

### 4. Client Usage

```java
public class Client {
    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();

        // Pay with Credit Card
        cart.setPaymentStrategy(new CreditCardPayment("John Doe", "1234567890123456"));
        cart.checkout(100);

        // Switch to PayPal
        cart.setPaymentStrategy(new PayPalPayment("john.doe@example.com"));
        cart.checkout(50);
    }
}
```

## Pros and Cons

### Pros
- **Open/Closed Principle**: You can introduce new strategies without having to change the context.
- **Isolation**: The algorithms are isolated from the client code.
- **Flexibility**: You can switch strategies at runtime.
- **Reduces Conditionals**: Eliminates complex `if-else` or `switch` blocks.

### Cons
- **Increased Complexity**: Can increase the number of objects and classes in the application.
- **Client Awareness**: The client must be aware of the different strategies to be able to select the appropriate one.
