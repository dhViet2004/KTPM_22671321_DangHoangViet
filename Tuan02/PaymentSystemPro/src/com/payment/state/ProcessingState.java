package com.payment.state;

public class ProcessingState implements TransactionState {
    @Override
    public void next(TransactionContext context) {
        context.setState(new CompletedState());
    }

    @Override
    public void printStatus() {
        System.out.println("[State] Trạng thái: Hệ thống đang xử lý giao dịch...");
    }
}