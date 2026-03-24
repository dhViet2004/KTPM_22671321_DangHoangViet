package com.library;

import com.library.impl.Observer;
import com.library.impl.SearchStrategy;

import java.util.ArrayList;
import java.util.List;

public class Library {
    // Biến static lưu trữ instance duy nhất
    private static Library instance;
    
    private List<Book> books;
    private List<Observer> observers;
    private SearchStrategy searchStrategy;

    // Constructor private để ngăn chặn việc dùng từ khóa 'new' từ bên ngoài
    private Library() {
        books = new ArrayList<>();
        observers = new ArrayList<>();
        searchStrategy = new SearchByName(); // Mặc định tìm theo tên sách
    }

    // Phương thức tĩnh để lấy instance duy nhất
    public static Library getInstance() {
        if (instance == null) {
            instance = new Library();
        }
        return instance;
    }

    // --- Chức năng Observer ---
    public void attach(Observer observer) {
        observers.add(observer);
    }

    private void notifyObservers(String message) {
        for (Observer o : observers) {
            o.update(message);
        }
    }

    // --- Chức năng Quản lý sách ---
    public void addBook(Book book) {
        books.add(book);
        notifyObservers("Sách mới vừa lên kệ: " + book.getDetails());
    }

    // --- Chức năng Strategy (Tìm kiếm) ---
    public void setSearchStrategy(SearchStrategy strategy) {
        this.searchStrategy = strategy;
    }

    public List<Book> searchBooks(String query) {
        return searchStrategy.search(books, query);
    }
}