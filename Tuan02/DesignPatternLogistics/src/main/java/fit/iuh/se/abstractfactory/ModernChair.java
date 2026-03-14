package fit.iuh.se.abstractfactory;
import fit.iuh.se.singleton.StoreLogger;

public class ModernChair implements Chair {
    public ModernChair() { StoreLogger.getInstance().log("Sản xuất Modern Chair"); }
    @Override public void showInfo() { System.out.println("- Ghế Hiện đại: Thiết kế tối giản."); }
}