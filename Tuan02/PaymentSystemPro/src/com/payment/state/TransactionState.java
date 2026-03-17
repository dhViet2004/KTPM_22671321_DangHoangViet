package com.payment.state;

public interface TransactionState {
    void next(TransactionContext context);
    void printStatus();
}