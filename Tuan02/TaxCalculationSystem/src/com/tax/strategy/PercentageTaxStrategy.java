package com.tax.strategy;

public class PercentageTaxStrategy implements TaxCalculationStrategy {
    private double rate;
    public PercentageTaxStrategy(double rate) { this.rate = rate; }
    @Override public double calculate(double basePrice) { return basePrice * rate; }
}