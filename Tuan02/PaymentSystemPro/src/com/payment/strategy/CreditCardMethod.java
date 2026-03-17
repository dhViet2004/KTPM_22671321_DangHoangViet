package com.payment.strategy;

public class CreditCardMethod implements PaymentMethod {
    @Override
    public void processPayment(double amount) {
        System.out.println("[Strategy] Đang thanh toán " + amount + " bằng Thẻ tín dụng...");
    }
}