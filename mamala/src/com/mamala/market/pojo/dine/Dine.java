package com.mamala.market.pojo.dine;

public class Dine {

	//dine_id","dine_desk_id","dine_desk_name","customer_count","spend_money","dine_status","remarks","dine_start_time","dine_end_time","dine_give_money","dine_discount_money","dine_pay_money",
	//"dine_ispay","user_id","member_id","phone","create_time","modify_time","
	private long dineId;
	private long dineDeskId;
	private String dineDeskName;
	private String dineDeskAlias;
	private int customerCount;
	private float spendMoney;
	private int dineStatus;
	private String remarks;
	private String dineStartTime;
	private String dineEndTime;
	private float dineGiveMoney;
	private float dineDiscountMoney;
	private float dinePayMoney;
	private int dineIspay;
	private long userId;
	private String cardNumber;
	private String phone;
	private String createTime;
	private String modifyTime;
	private long memberId;
	private long storeId;
	
	public long getDineId() {
		return dineId;
	}
	public void setDineId(long dineId) {
		this.dineId = dineId;
	}
	public long getDineDeskId() {
		return dineDeskId;
	}
	public void setDineDeskId(long dineDeskId) {
		this.dineDeskId = dineDeskId;
	}
	public String getDineDeskName() {
		return dineDeskName;
	}
	public void setDineDeskName(String dineDeskName) {
		this.dineDeskName = dineDeskName;
	} 
	
	public String getDineDeskAlias() {
		return dineDeskAlias;
	}
	public void setDineDeskAlias(String dineDeskAlias) {
		this.dineDeskAlias = dineDeskAlias;
	}
	public int getCustomerCount() {
		return customerCount;
	}
	public void setCustomerCount(int customerCount) {
		this.customerCount = customerCount;
	}
	public float getSpendMoney() {
		return spendMoney;
	}
	public void setSpendMoney(float spendMoney) {
		this.spendMoney = spendMoney;
	}
	public int getDineStatus() {
		return dineStatus;
	}
	public void setDineStatus(int dineStatus) {
		this.dineStatus = dineStatus;
	}
	public String getRemarks() {
		return remarks;
	}
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
	public String getDineStartTime() {
		return dineStartTime;
	}
	public void setDineStartTime(String dineStartTime) {
		this.dineStartTime = dineStartTime;
	}
	public String getDineEndTime() {
		return dineEndTime;
	}
	public void setDineEndTime(String dineEndTime) {
		this.dineEndTime = dineEndTime;
	}
	public float getDineGiveMoney() {
		return dineGiveMoney;
	}
	public void setDineGiveMoney(float dineGiveMoney) {
		this.dineGiveMoney = dineGiveMoney;
	}
	public float getDineDiscountMoney() {
		return dineDiscountMoney;
	}
	public void setDineDiscountMoney(float dineDiscountMoney) {
		this.dineDiscountMoney = dineDiscountMoney;
	}
	public float getDinePayMoney() {
		return dinePayMoney;
	}
	public void setDinePayMoney(float dinePayMoney) {
		this.dinePayMoney = dinePayMoney;
	}
	public int getDineIspay() {
		return dineIspay;
	}
	public void setDineIspay(int dineIspay) {
		this.dineIspay = dineIspay;
	}
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
	}
	public String getCardNumber() {
		return cardNumber;
	}
	public void setCardNumber(String cardNumber) {
		this.cardNumber = cardNumber;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getCreateTime() {
		return createTime;
	}
	public void setCreateTime(String createTime) {
		this.createTime = createTime;
	}
	public String getModifyTime() {
		return modifyTime;
	}
	public void setModifyTime(String modifyTime) {
		this.modifyTime = modifyTime;
	}
	public long getMemberId() {
		return memberId;
	}
	public void setMemberId(long memberId) {
		this.memberId = memberId;
	}
	public long getStoreId() {
		return storeId;
	}
	public void setStoreId(long storeId) {
		this.storeId = storeId;
	} 
	
}
