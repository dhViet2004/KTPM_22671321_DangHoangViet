package com.observer.main;

import com.observer.task.Task;
import com.observer.task.TeamMember;

public class MainTask {
    public static void main(String[] args) {
        Task devTask = new Task("Lập trình Module Observer", "Mới (New)");

        TeamMember developer = new TeamMember("Việt (Developer)");
        TeamMember tester = new TeamMember("An (Tester)");
        TeamMember manager = new TeamMember("Bình (Manager)");

        devTask.attach(developer);
        devTask.attach(tester);
        devTask.attach(manager);

        System.out.println("--- CẬP NHẬT LẦN 1 ---");
        devTask.setStatus("Đang thực hiện (In Progress)");

        System.out.println("\n--- CẬP NHẬT LẦN 2 ---");
        devTask.detach(developer);
        devTask.setStatus("Hoàn tất - Chờ kiểm thử (Testing)");
    }
}