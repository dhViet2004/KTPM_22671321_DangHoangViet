package com.tax.state;

public class ProductContext {
    private TaxState state;

    public ProductContext() {
        this.state = null;
    }

    public void setState(TaxState state) {
        this.state = state;
    }

    public TaxState getState() {
        return state;
    }

    public void applyTaxation() {
        if (state != null) {
            state.applyTaxation(this);
        } else {
            System.out.println("[Lỗi] Chưa thiết lập trạng thái thuế cho sản phẩm.");
        }
    }
}