package fit.iuh.se;


import fit.iuh.se.abstractfactory.*;
import fit.iuh.se.factorymethod.LogisticsSystem;
import fit.iuh.se.factorymethod.RoadLogistics;
import fit.iuh.se.factorymethod.SeaLogistics;
import fit.iuh.se.singleton.StoreLogger;

public class MainStore {
    public static void main(String[] args) {
        StoreLogger logger = StoreLogger.getInstance();
        logger.log("Cửa hàng nội thất mở cửa!");

        System.out.println("\n========== ĐƠN HÀNG #001 (NỘI THẤT HIỆN ĐẠI -> GIAO TRONG NƯỚC) ==========");
        FurnitureFactory modernFactory = new ModernFurnitureFactory();
        Chair modernChair = modernFactory.createChair();
        Sofa modernSofa = modernFactory.createSofa();
        
        modernChair.showInfo();
        modernSofa.showInfo();

        LogisticsSystem roadDelivery = new RoadLogistics();
        roadDelivery.executeDelivery("1 Ghế Hiện đại, 1 Sofa Hiện đại");


        System.out.println("\n========== ĐƠN HÀNG #002 (NỘI THẤT CỔ ĐIỂN -> GIAO QUỐC TẾ) ==========");
        FurnitureFactory victorianFactory = new VictorianFurnitureFactory();
        Chair vicChair = victorianFactory.createChair();
        Sofa vicSofa = victorianFactory.createSofa();
        
        vicChair.showInfo();
        vicSofa.showInfo();

        LogisticsSystem seaDelivery = new SeaLogistics();
        seaDelivery.executeDelivery("1 Ghế Cổ điển, 1 Sofa Cổ điển");


        System.out.println("\n========== KẾT THÚC NGÀY ==========");
        logger.log("Cửa hàng đóng cửa. Đã xử lý xong 2 đơn hàng.");
    }
}