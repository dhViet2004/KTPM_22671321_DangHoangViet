package fit.iuh.se.factorymethod;

import fit.iuh.se.singleton.StoreLogger;

public interface TransportMethods {}
interface Transport { void deliver(String items); }

class Truck implements Transport {
    @Override public void deliver(String items) {
        StoreLogger.getInstance().log("Xe tải (Truck) đang bốc xếp: " + items);
        System.out.println("🚛 Đang giao hàng bằng ĐƯỜNG BỘ tới địa chỉ của bạn...");
    }
}

class Ship implements Transport {
    @Override public void deliver(String items) {
        StoreLogger.getInstance().log("Tàu thủy (Ship) đang bốc xếp: " + items);
        System.out.println("🚢 Đang giao hàng bằng ĐƯỜNG BIỂN xuyên quốc gia...");
    }
}