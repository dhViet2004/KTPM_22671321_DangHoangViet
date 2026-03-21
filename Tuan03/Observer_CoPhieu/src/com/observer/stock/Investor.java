package com.observer.stock;

import com.observer.core.Observer;

public class Investor implements Observer {
    private String name;

    public Investor(String name) {
        this.name = name;
    }

    @Override
    public void update(String message) {
        System.out.println("[Gửi tới " + name + "]: " + message);
    }
}