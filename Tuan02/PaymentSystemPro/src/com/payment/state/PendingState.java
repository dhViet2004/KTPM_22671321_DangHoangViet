package com.payment.state;

public class PendingState implements TransactionState {
    @Override public void next(TransactionContext ctx) { ctx.setState(new ProcessingState()); }
    @Override public void printStatus() { System.out.println("[State] Trạng thái: Chờ thanh toán."); }
}