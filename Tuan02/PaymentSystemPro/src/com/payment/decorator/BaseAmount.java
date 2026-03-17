package com.payment.decorator;

public class BaseAmount implements PaymentAmount {
    private double amount;
    public BaseAmount(double amount) { this.amount = amount; }
    @Override public double getFinalAmount() { return amount; }
    @Override public String getDescription() { return "Số tiền gốc"; }
}