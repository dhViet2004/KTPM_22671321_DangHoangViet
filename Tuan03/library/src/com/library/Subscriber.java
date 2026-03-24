package com.library;

import com.library.impl.Observer;

public class Subscriber implements Observer {
    private String name;

    public Subscriber(String name) {
        this.name = name;
    }

    @Override
    public void update(String message) {
        System.out.println("[Tin nhắn đến " + name + "]: " + message);
    }
}