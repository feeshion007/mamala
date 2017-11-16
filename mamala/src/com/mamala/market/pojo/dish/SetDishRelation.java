package com.mamala.market.pojo.dish;

public class SetDishRelation {
	private long setId;
	private long dishTypeId;
	private long dishId;
	private int count;
	private String dishName;
	private int dishCanbeSet;
	private int dishCanbeGive;
	private float dishPrice; 
	private String dishUnit;
	private int dishTypeSet;
	private int realTypeId;
	private long storeId;
	private String qryStore;
	
	public SetDishRelation()
	{ 
	}
	
	public SetDishRelation(long dishTypeId)
	{
		this.dishTypeId = dishTypeId;
	}
	
	public long getSetId() {
		return setId;
	}
	public void setSetId(long setId) {
		this.setId = setId;
	}
	public long getDishTypeId() {
		return dishTypeId;
	}
	public void setDishTypeId(long dishTypeId) {
		this.dishTypeId = dishTypeId;
	}
	public long getDishId() {
		return dishId;
	}
	public void setDishId(long dishId) {
		this.dishId = dishId;
	}
	public int getCount() {
		return count;
	}
	public void setCount(int count) {
		this.count = count;
	}
	public String getDishName() {
		return dishName;
	}
	public void setDishName(String dishName) {
		this.dishName = dishName;
	}
	public int getDishCanbeSet() {
		return dishCanbeSet;
	}
	public void setDishCanbeSet(int dishCanbeSet) {
		this.dishCanbeSet = dishCanbeSet;
	}
	public int getDishCanbeGive() {
		return dishCanbeGive;
	}
	public void setDishCanbeGive(int dishCanbeGive) {
		this.dishCanbeGive = dishCanbeGive;
	}
	public float getDishPrice() {
		return dishPrice;
	}
	public void setDishPrice(float dishPrice) {
		this.dishPrice = dishPrice;
	}
	public String getDishUnit() {
		return dishUnit;
	}
	public void setDishUnit(String dishUnit) {
		this.dishUnit = dishUnit;
	}

	public int getDishTypeSet() {
		return dishTypeSet;
	}

	public void setDishTypeSet(int dishTypeSet) {
		this.dishTypeSet = dishTypeSet;
	}

	public int getRealTypeId() {
		return realTypeId;
	}

	public void setRealTypeId(int realTypeId) {
		this.realTypeId = realTypeId;
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
