package com.library;

import com.library.impl.Loan;

public class ExtensionDecorator extends LoanDecorator {
    public ExtensionDecorator(Loan loanInfo) {
        super(loanInfo);
    }

    @Override
    public String getLoanDetails() {
        return super.getLoanDetails() + " -> [Đã gia hạn thêm 14 ngày]";
    }
}