package com.mamala.market.pojo.report;

public class BusinessPayReport {
	private float totalPay;
	private float debayPay;
	private float rechargePay;
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
	public float getTotalPay() {
		return totalPay;
	}
	public void setTotalPay(float totalPay) {
		this.totalPay = totalPay;
	}
	public float getDebayPay() {
		return debayPay;
	}
	public void setDebayPay(float debayPay) {
		this.debayPay = debayPay;
	}
	public float getRechargePay() {
		return rechargePay;
	}
	public void setRechargePay(float rechargePay) {
		this.rechargePay = rechargePay;
	}
	
	
}
