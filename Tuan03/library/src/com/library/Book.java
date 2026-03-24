package com.library;

public abstract class Book {
    protected String title;
    protected String author;
    protected String category;

    public Book(String title, String author, String category) {
        this.title = title;
        this.author = author;
        this.category = category;
    }

    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getCategory() { return category; }
    
    public abstract String getDetails();
}