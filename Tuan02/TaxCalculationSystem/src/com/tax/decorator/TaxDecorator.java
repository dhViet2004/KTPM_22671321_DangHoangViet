package com.tax.decorator;

public abstract class TaxDecorator implements TaxableProduct {
    protected TaxableProduct product;
    public TaxDecorator(TaxableProduct product) { this.product = product; }
}