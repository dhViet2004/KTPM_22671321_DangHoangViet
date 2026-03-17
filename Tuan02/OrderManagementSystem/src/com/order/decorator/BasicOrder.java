package com.order.decorator;

public class BasicOrder implements OrderComponent {
    @Override public double getCost() { return 500.0; }
    @Override public String getDescription() { return "Đơn hàng cơ bản"; }
}