package com.payment.state;

public class CompletedState implements TransactionState {
    @Override public void next(TransactionContext ctx) { System.out.println("Giao dịch đã kết thúc."); }
    @Override public void printStatus() { System.out.println("[State] Trạng thái: Thanh toán hoàn tất thành công."); }
}