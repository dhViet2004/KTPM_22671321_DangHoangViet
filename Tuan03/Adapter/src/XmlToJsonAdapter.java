public class XmlToJsonAdapter implements XMLProcessor {
    private JSONProcessor jsonService;

    public XmlToJsonAdapter(JSONProcessor jsonService) {
        this.jsonService = jsonService;
    }

    @Override
    public void processXML(String xmlData) {
        System.out.println("\n[Adapter] Nhận yêu cầu XML. Đang tiến hành chuyển đổi sang JSON...");
        String jsonData = convertXmlToJson(xmlData);
        
        jsonService.processJSON(jsonData);
    }

    private String convertXmlToJson(String xml) {
        return xml.replace("<", "{ \"").replace(">", "\": \"").replace("/", "") + "\" }";
    }
}