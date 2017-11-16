package com.mamala.market.pojo.fileUpload;

/**
 * Created by OA on 2015/5/28.
 */
public class CustomerSaleFormat {
    private int buildingID;
    private String date;
    private int tradeNum;
    private double saleVolumn;

    public int getBuildingID() {
        return buildingID;
    }

    public void setBuildingID(int buildingID) {
        this.buildingID = buildingID;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getTradeNum() {
        return tradeNum;
    }

    public void setTradeNum(int tradeNum) {
        this.tradeNum = tradeNum;
    }

    public double getSaleVolumn() {
        return saleVolumn;
    }

    public void setSaleVolumn(double saleVolumn) {
        this.saleVolumn = saleVolumn;
    }
}
