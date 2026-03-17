package com.tax.strategy;

public class FixedAmountTaxStrategy implements TaxCalculationStrategy {
    private double amount;
    public FixedAmountTaxStrategy(double amount) { this.amount = amount; }
    @Override public double calculate(double basePrice) { return amount; }
}