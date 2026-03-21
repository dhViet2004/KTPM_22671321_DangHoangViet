import com.observer.stock.Investor;
import com.observer.stock.Stock;

public class Main {
    public static void main(String[] args) {
        Stock vnIndex = new Stock("VN-INDEX", 1200.5);

        Investor investorA = new Investor("Nhà đầu tư A");
        Investor investorB = new Investor("Nhà đầu tư B");

        vnIndex.attach(investorA);
        vnIndex.attach(investorB);

        System.out.println("--- GIAO DỊCH LẦN 1 ---");
        vnIndex.setPrice(1215.0);

        System.out.println("\n--- GIAO DỊCH LẦN 2 ---");
        vnIndex.detach(investorB);
        vnIndex.setPrice(1190.5);
    }
}