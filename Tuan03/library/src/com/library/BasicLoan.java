package com.library;

import com.library.impl.Loan;

public class BasicLoan implements Loan {
    private Book book;
    private String userName;

    public BasicLoan(Book book, String userName) {
        this.book = book;
        this.userName = userName;
    }

    @Override
    public String getLoanDetails() {
        return "Người mượn: " + userName + " | Mượn cuốn: " + book.getTitle();
    }
}