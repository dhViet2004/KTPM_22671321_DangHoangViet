package com.payment.decorator;

public class DiscountDecorator implements PaymentAmount {
    private PaymentAmount paymentAmount;
    public DiscountDecorator(PaymentAmount pa) { this.paymentAmount = pa; }
    @Override public double getFinalAmount() { return paymentAmount.getFinalAmount() * 0.9; } // Giảm 10%
    @Override public String getDescription() { return paymentAmount.getDescription() + " - Giảm giá (10%)"; }
}