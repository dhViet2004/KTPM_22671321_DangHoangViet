package fit.iuh.se.abstractfactory;
import fit.iuh.se.singleton.StoreLogger;

public class ModernSofa implements Sofa {
    public ModernSofa() { StoreLogger.getInstance().log("Sản xuất Modern Sofa"); }
    @Override public void showInfo() { System.out.println("- Sofa Hiện đại: Chất liệu da sang trọng."); }
}