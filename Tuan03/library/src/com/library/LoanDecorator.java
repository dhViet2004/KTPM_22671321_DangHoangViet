package com.library;

import com.library.impl.Loan;

public abstract class LoanDecorator implements Loan {
    protected Loan loanInfo;

    public LoanDecorator(Loan loanInfo) {
        this.loanInfo = loanInfo;
    }

    @Override
    public String getLoanDetails() {
        return loanInfo.getLoanDetails();
    }
}