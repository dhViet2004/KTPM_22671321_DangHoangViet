package com.observer.core;

public interface Observer {
    void update(String taskName, String status);
}