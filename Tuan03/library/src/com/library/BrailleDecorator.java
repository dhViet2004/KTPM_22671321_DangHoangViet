package com.library;

import com.library.impl.Loan;

public class BrailleDecorator extends LoanDecorator {
    public BrailleDecorator(Loan loanInfo) {
        super(loanInfo);
    }

    @Override
    public String getLoanDetails() {
        return super.getLoanDetails() + " -> [Kèm phiên bản chữ nổi Braille]";
    }
}