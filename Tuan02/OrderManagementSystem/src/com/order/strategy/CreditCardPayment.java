package com.order.strategy;

public class CreditCardPayment implements PaymentStrategy {
    @Override public void pay(double amount) { System.out.println("[Strategy] Thanh toán " + amount + " bằng Thẻ tín dụng."); }
}