public class LegacyXMLSystem implements XMLProcessor {
    @Override
    public void processXML(String xmlData) {
        System.out.println("[Legacy System] Đang xử lý dữ liệu XML: " + xmlData);
    }
}