package fit.iuh.se.factorymethod;

public class SeaLogistics extends LogisticsSystem {
    @Override 
    protected Transport createTransport() { 
        return new Ship(); 
    }
}