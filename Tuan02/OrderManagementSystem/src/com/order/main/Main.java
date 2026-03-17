package com.order.main;
import com.order.state.*;
import com.order.strategy.*;
import com.order.decorator.*;

public class Main {
    public static void main(String[] args) {
        // 1. Sử dụng Decorator để thiết lập đơn hàng
        OrderComponent myOrder = new BasicOrder();
        myOrder = new InsuranceDecorator(myOrder); // Thêm bảo hiểm
        System.out.println("Sản phẩm: " + myOrder.getDescription());

        // 2. Sử dụng State để xử lý quy trình
        OrderContext context = new OrderContext();
        context.setState(new NewOrderState());
        context.applyState();
        
        context.setState(new ProcessingState());
        context.applyState();

        // 3. Sử dụng Strategy để thanh toán
        PaymentStrategy payment = new CreditCardPayment();
        payment.pay(myOrder.getCost());
    }
}