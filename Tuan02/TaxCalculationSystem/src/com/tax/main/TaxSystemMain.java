package com.tax.main;
import com.tax.decorator.*;
import com.tax.strategy.*;
import com.tax.state.*;

public class TaxSystemMain {
    public static void main(String[] args) {
        // 1. Khởi tạo sản phẩm gốc (Laptop giá 1000)
        TaxableProduct product = new SimpleProduct("Laptop", 1000.0);

        // 2. Kiểm tra trạng thái (State)
        TaxState state = new TaxableState();
        state.applyTaxation(null); // Giả lập kiểm tra trạng thái

        // 3. Áp dụng các loại thuế (Decorator + Strategy)
        // Áp dụng VAT 10% (Strategy phần trăm)
        product = new VATDecorator(product, new PercentageTaxStrategy(0.1));
        
        // Áp dụng Thuế tiêu thụ đặc biệt cố định 50$ (Strategy cố định)
        product = new VATDecorator(product, new FixedAmountTaxStrategy(50.0));

        System.out.println("Sản phẩm: " + product.getDescription());
        System.out.println("Tổng giá sau thuế: " + product.getPrice());
    }
}