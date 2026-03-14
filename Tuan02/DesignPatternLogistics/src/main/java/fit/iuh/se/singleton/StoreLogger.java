package fit.iuh.se.singleton;

public class StoreLogger {
    private static StoreLogger instance;

    private StoreLogger() {
        System.out.println("[HỆ THỐNG] Đã khởi tạo Store Logger duy nhất.");
    }

    public static StoreLogger getInstance() {
        if (instance == null) {
            instance = new StoreLogger();
        }
        return instance;
    }

    public void log(String message) {
        System.out.println(" [LOG]: " + message);
    }
}