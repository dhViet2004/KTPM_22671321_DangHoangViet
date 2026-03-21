package com.observer.stock;

import com.observer.core.Observer;
import com.observer.core.Subject;
import java.util.ArrayList;
import java.util.List;

public class Stock implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private String name;
    private double price;

    public Stock(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public void setPrice(double newPrice) {
        this.price = newPrice;
        // Tự động gọi thông báo khi giá thay đổi
        notifyObservers();
    }

    @Override
    public void attach(Observer o) {
        observers.add(o);
    }

    @Override
    public void detach(Observer o) {
        observers.remove(o);
    }

    @Override
    public void notifyObservers() {
        String message = "Cổ phiếu " + name + " cập nhật giá mới: " + price;
        for (Observer observer : observers) {
            observer.update(message);
        }
    }
}