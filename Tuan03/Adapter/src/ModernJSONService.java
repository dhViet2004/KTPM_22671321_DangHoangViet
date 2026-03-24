public class ModernJSONService implements JSONProcessor {
    @Override
    public void processJSON(String jsonData) {
        System.out.println("[Modern Web Service] Đang xử lý dữ liệu JSON: " + jsonData);
    }
}