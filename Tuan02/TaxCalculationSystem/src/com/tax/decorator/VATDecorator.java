package com.tax.decorator;
import com.tax.strategy.TaxCalculationStrategy;

public class VATDecorator extends TaxDecorator {
    private TaxCalculationStrategy strategy;
    public VATDecorator(TaxableProduct product, TaxCalculationStrategy strategy) {
        super(product);
        this.strategy = strategy;
    }
    @Override public double getPrice() { return product.getPrice() + strategy.calculate(product.getPrice()); }
    @Override public String getDescription() { return product.getDescription() + " + Thuế VAT"; }
}