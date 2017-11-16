package com.mamala.market.pojo.dine;

public class DineTable {
	private long tableId;
	private String tableName;
	private String tableAlias;
	private int tableSeats;
	private int tableStatus;
	private float currentCost;
	private long currentDineId;
	private long currentCustomerCount;
	private String phone;
	private String memberId; 
	private String modifyTime;
	private long storeId;
	private long userId;
	private String qryStore;
	
	public long getTableId() {
		return tableId;
	}
	public void setTableId(long tableId) {
		this.tableId = tableId;
	}
	public String getTableName() {
		return tableName;
	}
	public void setTableName(String tableName) {
		this.tableName = tableName;
	}
	public String getTableAlias() {
		return tableAlias;
	}
	public void setTableAlias(String tableAlias) {
		this.tableAlias = tableAlias;
	}
	public int getTableSeats() {
		return tableSeats;
	}
	public void setTableSeats(int tableSeats) {
		this.tableSeats = tableSeats;
	}
	public int getTableStatus() {
		return tableStatus;
	}
	public void setTableStatus(int tableStatus) {
		this.tableStatus = tableStatus;
	}
	public float getCurrentCost() {
		return currentCost;
	}
	public void setCurrentCost(float currentCost) {
		this.currentCost = currentCost;
	}
	public long getCurrentDineId() {
		return currentDineId;
	}
	public void setCurrentDineId(long currentDineId) {
		this.currentDineId = currentDineId;
	}
	public long getCurrentCustomerCount() {
		return currentCustomerCount;
	}
	public void setCurrentCustomerCount(long currentCustomerCount) {
		this.currentCustomerCount = currentCustomerCount;
	}
	public String getModifyTime() {
		return modifyTime;
	}
	public void setModifyTime(String modifyTime) {
		this.modifyTime = modifyTime;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getMemberId() {
		return memberId;
	}
	public void setMemberId(String memberId) {
		this.memberId = memberId;
	}
	public long getStoreId() {
		return storeId;
	}
	public void setStoreId(long storeId) {
		this.storeId = storeId;
	}
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
	}
	public String getQryStore() {
		return qryStore;
	}
	public void setQryStore(String qryStore) {
		this.qryStore = qryStore;
	} 
	 
}
