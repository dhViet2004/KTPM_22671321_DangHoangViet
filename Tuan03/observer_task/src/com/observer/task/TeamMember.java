package com.observer.task;

import com.observer.core.Observer;

public class TeamMember implements Observer {
    private String name;

    public TeamMember(String name) {
        this.name = name;
    }

    @Override
    public void update(String taskName, String status) {
        System.out.println("[Gửi tới " + name + "]: Công việc '" + taskName + "' đã chuyển sang trạng thái mới: " + status);
    }
}