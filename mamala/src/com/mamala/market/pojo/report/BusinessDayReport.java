package com.mamala.market.pojo.report;

public class BusinessDayReport {
	private String day;
	private float debayMoney;
	private float payMoney;
	private float totalMoney;
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
	
	public String getDay() {
		return day;
	}
	public void setDay(String day) {
		this.day = day;
	}
	public float getDebayMoney() {
		return debayMoney;
	}
	public void setDebayMoney(float debayMoney) {
		this.debayMoney = debayMoney;
	}
	public float getPayMoney() {
		return payMoney;
	}
	public void setPayMoney(float payMoney) {
		this.payMoney = payMoney;
	}
	public float getTotalMoney() {
		return totalMoney;
	}
	public void setTotalMoney(float totalMoney) {
		this.totalMoney = totalMoney;
	}
	 
}
