package com.payment.main;
import com.payment.decorator.*;
import com.payment.strategy.*;
import com.payment.state.*;

public class PaymentMain {
    public static void main(String[] args) {
        // 1. Tính toán số tiền với Decorator
        PaymentAmount finalPayment = new BaseAmount(100.0);
        finalPayment = new ProcessingFeeDecorator(finalPayment); // Thêm phí
        finalPayment = new DiscountDecorator(finalPayment);      // Thêm giảm giá
        
        System.out.println("Chi tiết: " + finalPayment.getDescription());
        double total = finalPayment.getFinalAmount();

        // 2. Quản lý luồng giao dịch với State
        TransactionContext transaction = new TransactionContext();
        transaction.printStatus();
        
        // 3. Thực hiện thanh toán với Strategy
        PaymentMethod method = new PayPalMethod();
        method.processPayment(total);

        // Chuyển sang trạng thái hoàn tất
        transaction.next(); // Chuyển sang Processing
        transaction.setState(new CompletedState());
        transaction.printStatus();
    }
}