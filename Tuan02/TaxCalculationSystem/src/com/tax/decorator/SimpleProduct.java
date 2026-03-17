package com.tax.decorator;

public class SimpleProduct implements TaxableProduct {
    private double price;
    private String name;
    public SimpleProduct(String name, double price) { this.name = name; this.price = price; }
    @Override public double getPrice() { return price; }
    @Override public String getDescription() { return name; }
}