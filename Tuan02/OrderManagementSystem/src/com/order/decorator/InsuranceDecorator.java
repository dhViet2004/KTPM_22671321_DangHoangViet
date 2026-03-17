package com.order.decorator;

public class InsuranceDecorator extends OrderDecorator {
    public InsuranceDecorator(OrderComponent order) { super(order); }
    @Override public double getCost() { return decoratedOrder.getCost() + 50.0; }
    @Override public String getDescription() { return decoratedOrder.getDescription() + " + Bảo hiểm"; }
}