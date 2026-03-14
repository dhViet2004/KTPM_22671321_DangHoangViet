package fit.iuh.se.abstractfactory;
import fit.iuh.se.singleton.StoreLogger;

public class VictorianSofa implements Sofa {
    public VictorianSofa() { StoreLogger.getInstance().log("Sản xuất Victorian Sofa"); }
    @Override public void showInfo() { System.out.println("- Sofa Cổ điển: Bọc nhung đỏ quý phái."); }
}