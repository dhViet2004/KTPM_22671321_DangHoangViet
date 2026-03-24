package com.observer.task;

import com.observer.core.Observer;
import com.observer.core.Subject;
import java.util.ArrayList;
import java.util.List;

public class Task implements Subject {
    private List<Observer> observers = new ArrayList<>();
    
    private String taskName;
    private String status;

    public Task(String taskName, String initialStatus) {
        this.taskName = taskName;
        this.status = initialStatus;
    }

    public void setStatus(String newStatus) {
        this.status = newStatus;
        notifyObservers();
    }

    public String getStatus() {
        return status;
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
        for (Observer observer : observers) {
            observer.update(taskName, status);
        }
    }
}