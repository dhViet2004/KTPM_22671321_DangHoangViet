package com.library;

public class BookFactory {
    public static Book createBook(String type, String title, String author, String category) {
        if (type.equalsIgnoreCase("Paper")) {
            return new PaperBook(title, author, category);
        } else if (type.equalsIgnoreCase("EBook")) {
            return new EBook(title, author, category);
        }
        throw new IllegalArgumentException("Loại sách không được hỗ trợ!");
    }
}