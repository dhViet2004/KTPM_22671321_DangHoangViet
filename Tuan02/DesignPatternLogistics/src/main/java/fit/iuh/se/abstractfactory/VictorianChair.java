package fit.iuh.se.abstractfactory;
import fit.iuh.se.singleton.StoreLogger;

public class VictorianChair implements Chair {
    public VictorianChair() { StoreLogger.getInstance().log("Sản xuất Victorian Chair"); }
    @Override public void showInfo() { System.out.println("- Ghế Cổ điển: Chạm khắc hoa văn gỗ."); }
}