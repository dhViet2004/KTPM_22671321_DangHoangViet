package fit.iuh.se.factorymethod;

public class RoadLogistics extends LogisticsSystem {
    @Override 
    protected Transport createTransport() { 
        return new Truck(); 
    }
}