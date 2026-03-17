package com.order.state;

public class ProcessingState implements OrderState {
    @Override public void handleRequest() { System.out.println("[State] Đang xử lý: Đóng gói và vận chuyển."); }
}