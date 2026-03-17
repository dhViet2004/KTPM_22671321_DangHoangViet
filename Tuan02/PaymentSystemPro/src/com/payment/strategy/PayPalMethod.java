package com.payment.strategy;

public class PayPalMethod implements PaymentMethod {
    @Override
    public void processPayment(double amount) {
        System.out.println("[Strategy] Đang thanh toán " + amount + " qua cổng PayPal...");
    }
}