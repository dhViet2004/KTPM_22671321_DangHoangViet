package com.payment.decorator;

public class ProcessingFeeDecorator implements PaymentAmount {
    private PaymentAmount paymentAmount;
    public ProcessingFeeDecorator(PaymentAmount pa) { this.paymentAmount = pa; }
    @Override public double getFinalAmount() { return paymentAmount.getFinalAmount() + 2.0; } // Phí cố định 2$
    @Override public String getDescription() { return paymentAmount.getDescription() + " + Phí xử lý (2$)"; }
}