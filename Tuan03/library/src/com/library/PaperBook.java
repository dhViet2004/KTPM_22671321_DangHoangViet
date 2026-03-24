package com.library;

public class PaperBook extends Book {
    public PaperBook(String title, String author, String category) {
        super(title, author, category);
    }

    @Override
    public String getDetails() {
        return "[Sách giấy] " + title + " - " + author;
    }
}