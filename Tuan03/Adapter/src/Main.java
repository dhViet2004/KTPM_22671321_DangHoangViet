public class Main {
    public static void main(String[] args) {
        ModernJSONService modernService = new ModernJSONService();
        LegacyXMLSystem legacySystem = new LegacyXMLSystem();

        String clientXmlData = "<name>Dang Hoang Viet</name>";
        
        XMLProcessor xmlAdapter = new XmlToJsonAdapter(modernService);
        xmlAdapter.processXML(clientXmlData);
        String clientJsonData = "{ \"name\": \"Dang Hoang Viet\" }";
        

        JSONProcessor jsonAdapter = new JsonToXmlAdapter(legacySystem);

        jsonAdapter.processJSON(clientJsonData);
    }
}