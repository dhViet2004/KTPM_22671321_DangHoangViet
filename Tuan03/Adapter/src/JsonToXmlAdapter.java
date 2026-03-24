public class JsonToXmlAdapter implements JSONProcessor {
    private XMLProcessor xmlService;

    public JsonToXmlAdapter(XMLProcessor xmlService) {
        this.xmlService = xmlService;
    }

    @Override
    public void processJSON(String jsonData) {
        System.out.println("\n[Adapter] Nhận yêu cầu JSON. Đang tiến hành chuyển đổi sang XML...");
        String xmlData = convertJsonToXml(jsonData);
        
        xmlService.processXML(xmlData);
    }

    private String convertJsonToXml(String json) {
        return "<data>" + json + "</data>"; // Giả lập bọc thẻ XML
    }
}