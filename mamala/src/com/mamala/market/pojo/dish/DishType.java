package com.mamala.market.pojo.dish;

public class DishType {
	private long dishTypeId;
	private String dishType;
	private String dishTypeName;
	private String dishUsingRange;
	private String status;
	private int dishTypeSet;
	private long userId;
	private float dishUnitPrice;
	private long storeId;
	private String qryStore;
	
	public long getDishTypeId() {
		return dishTypeId;
	}
	public void setDishTypeId(long dishTypeId) {
		this.dishTypeId = dishTypeId;
	}
	public String getDishType() {
		return dishType;
	}
	public void setDishType(String dishType) {
		this.dishType = dishType;
	}
	public String getDishTypeName() {
		return dishTypeName;
	}
	public void setDishTypeName(String dishTypeName) {
		this.dishTypeName = dishTypeName;
	} 
	public String getDishUsingRange() {
		return dishUsingRange;
	}
	public void setDishUsingRange(String dishUsingRange) {
		this.dishUsingRange = dishUsingRange;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
	}
	public int getDishTypeSet() {
		return dishTypeSet;
	}
	public void setDishTypeSet(int dishTypeSet) {
		this.dishTypeSet = dishTypeSet;
	}
	public float getDishUnitPrice() {
		return dishUnitPrice;
	}
	public void setDishUnitPrice(float dishUnitPrice) {
		this.dishUnitPrice = dishUnitPrice;
	}
	public long getStoreId() {
		return storeId;
	}
	public void setStoreId(long storeId) {
		this.storeId = storeId;
	}
	public String getQryStore() {
		return qryStore;
	}
	public void setQryStore(String qryStore) {
		this.qryStore = qryStore;
	} 
		
}
