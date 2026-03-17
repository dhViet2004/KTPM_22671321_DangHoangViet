package com.tax.state;

public class TaxExemptState implements TaxState {
    @Override public void applyTaxation(ProductContext context) { System.out.println("[State] Trạng thái: Miễn thuế (Hàng xuất khẩu)."); }
}