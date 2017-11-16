package com.mamala.market.pojo.dish;

public class Dish {
	//dish_id,dish_name,dish_name_eng,dish_name_pinying,dish_type_id,dish_alias,dish_price,dish_cost,dish_unit,dish_canbe_set,dish_taste,dish_remarks,dish_disabled,dish_canbe_discount,dish_canbe_give,create_time,modify_time
	private long dishId;
	private String dishName;
	private String dishNameEng;
	private String dishNamePinyin;
	private long dishTypeId;
	private String dishTypeName;
	private String dishAlias;
	private float dishPrice;
	private float dishCost;
	private String dishUnit;
	private int dishCanbeSet;
	private String dishTaste;
	private String dishRemarks;
	private int dishDisabled;
	private int dishCanbeDiscount;
    private int dishCanbeGive;
    private long userId;
    private long storeId;
    private String qryStore;
    private int start;
    private int length;
    private String qryKey;
    
	public long getDishId() {
		return dishId;
	}
	public void setDishId(long dishId) {
		this.dishId = dishId;
	}
	public String getDishName() {
		return dishName;
	}
	public void setDishName(String dishName) {
		this.dishName = dishName;
	}
	public String getDishNameEng() {
		return dishNameEng;
	}
	public void setDishNameEng(String dishNameEng) {
		this.dishNameEng = dishNameEng;
	}
	public String getDishNamePinyin() {
		return dishNamePinyin;
	}
	public void setDishNamePinyin(String dishNamePinyin) {
		this.dishNamePinyin = dishNamePinyin;
	}
	public long getDishTypeId() {
		return dishTypeId;
	}
	public void setDishTypeId(long dishTypeId) {
		this.dishTypeId = dishTypeId;
	}
	public String getDishTypeName() {
		return dishTypeName;
	}
	public void setDishTypeName(String dishTypeName) {
		this.dishTypeName = dishTypeName;
	}
	public String getDishAlias() {
		return dishAlias;
	}
	public void setDishAlias(String dishAlias) {
		this.dishAlias = dishAlias;
	}
	public float getDishPrice() {
		return dishPrice;
	}
	public void setDishPrice(float dishPrice) {
		this.dishPrice = dishPrice;
	}
	public float getDishCost() {
		return dishCost;
	}
	public void setDishCost(float dishCost) {
		this.dishCost = dishCost;
	}
	public String getDishUnit() {
		return dishUnit;
	}
	public void setDishUnit(String dishUnit) {
		this.dishUnit = dishUnit;
	}
	public int getDishCanbeSet() {
		return dishCanbeSet;
	}
	public void setDishCanbeSet(int dishCanbeSet) {
		this.dishCanbeSet = dishCanbeSet;
	}
	public String getDishTaste() {
		return dishTaste;
	}
	public void setDishTaste(String dishTaste) {
		this.dishTaste = dishTaste;
	}
	public String getDishRemarks() {
		return dishRemarks;
	}
	public void setDishRemarks(String dishRemarks) {
		this.dishRemarks = dishRemarks;
	}
	public int getDishDisabled() {
		return dishDisabled;
	}
	public void setDishDisabled(int dishDisabled) {
		this.dishDisabled = dishDisabled;
	}
	public int getDishCanbeDiscount() {
		return dishCanbeDiscount;
	}
	public void setDishCanbeDiscount(int dishCanbeDiscount) {
		this.dishCanbeDiscount = dishCanbeDiscount;
	}
	public int getDishCanbeGive() {
		return dishCanbeGive;
	}
	public void setDishCanbeGive(int dishCanbeGive) {
		this.dishCanbeGive = dishCanbeGive;
	}
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
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
	public int getStart() {
		return start;
	}
	public void setStart(int start) {
		this.start = start;
	}
	public int getLength() {
		return length;
	}
	public void setLength(int length) {
		this.length = length;
	}
	public String getQryKey() {
		return qryKey;
	}
	public void setQryKey(String qryKey) {
		this.qryKey = qryKey;
	}
    
	 
}
