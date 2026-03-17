package com.payment.state;

public class TransactionContext {
    private TransactionState state;
    public TransactionContext() { this.state = new PendingState(); } // Mặc định là Chờ
    public void setState(TransactionState state) { this.state = state; }
    public void next() { state.next(this); }
    public void printStatus() { state.printStatus(); }
}