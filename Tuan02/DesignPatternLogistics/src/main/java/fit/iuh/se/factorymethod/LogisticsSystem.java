package fit.iuh.se.factorymethod;

public abstract class LogisticsSystem {
    public void executeDelivery(String items) {
        System.out.println("\n--- XỬ LÝ GIAO HÀNG ---");
        Transport transport = createTransport();
        transport.deliver(items);
    }

    protected abstract Transport createTransport();
}

