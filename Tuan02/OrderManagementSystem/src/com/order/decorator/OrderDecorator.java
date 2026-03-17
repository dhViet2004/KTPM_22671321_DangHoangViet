package com.order.decorator;

public abstract class OrderDecorator implements OrderComponent {
    protected OrderComponent decoratedOrder;
    public OrderDecorator(OrderComponent order) { this.decoratedOrder = order; }
}