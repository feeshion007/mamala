package com.mamala.market.pojo.report;

public class BusinessDishReport {
	private String dishName;
	private int totalCount;
	private int totalBackCount;
	private int totalGiveCount;
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
	public String getDishName() {
		return dishName;
	}
	public void setDishName(String dishName) {
		this.dishName = dishName;
	}
	public int getTotalCount() {
		return totalCount;
	}
	public void setTotalCount(int totalCount) {
		this.totalCount = totalCount;
	}
	public int getTotalBackCount() {
		return totalBackCount;
	}
	public void setTotalBackCount(int totalBackCount) {
		this.totalBackCount = totalBackCount;
	}
	public int getTotalGiveCount() {
		return totalGiveCount;
	}
	public void setTotalGiveCount(int totalGiveCount) {
		this.totalGiveCount = totalGiveCount;
	}
	
}
