package com.tax.state;
import com.tax.decorator.TaxableProduct;

public interface TaxState {
    void applyTaxation(ProductContext context);
}