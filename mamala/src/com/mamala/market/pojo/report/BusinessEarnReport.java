package com.mamala.market.pojo.report;

public class BusinessEarnReport {
	private float totalMoney;
	private float payMoney;
	private float costMoney;
	private float earnMoney;
	private String startTime;
	private String endTime;

	public String getStartTime() {
		return startTime;
	}
	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}
	public String getEndTime() {
		return endTime;
	}
	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}
	public float getTotalMoney() {
		return totalMoney;
	}
	public void setTotalMoney(float totalMoney) {
		this.totalMoney = totalMoney;
	}
	public float getCostMoney() {
		return costMoney;
	}
	public void setCostMoney(float costMoney) {
		this.costMoney = costMoney;
	}
	public float getEarnMoney() {
		return earnMoney;
	}
	public void setEarnMoney(float earnMoney) {
		this.earnMoney = earnMoney;
	}
	public float getPayMoney() {
		return payMoney;
	}
	public void setPayMoney(float payMoney) {
		this.payMoney = payMoney;
	}
	
}
