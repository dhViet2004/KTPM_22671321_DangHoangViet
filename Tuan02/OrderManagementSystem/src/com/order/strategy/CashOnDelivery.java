package com.order.strategy;

public class CashOnDelivery implements PaymentStrategy {
    @Override public void pay(double amount) { System.out.println("[Strategy] Thanh toán " + amount + " bằng Tiền mặt khi nhận hàng."); }
}