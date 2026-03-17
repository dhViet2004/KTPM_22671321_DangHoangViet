package com.tax.state;

public class TaxableState implements TaxState {
    @Override public void applyTaxation(ProductContext context) { System.out.println("[State] Trạng thái: Chịu thuế đầy đủ."); }
}