package com.order.state;

public class NewOrderState implements OrderState {
    @Override public void handleRequest() { System.out.println("[State] Mới tạo: Kiểm tra thông tin đơn hàng."); }
}