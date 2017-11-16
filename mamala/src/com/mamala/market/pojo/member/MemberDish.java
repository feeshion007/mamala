package com.mamala.market.pojo.member;

public class MemberDish {
	private long memberDishId;
	private long memberId;
	private long dishId; 
	private String dishName;
	private int dishCount;
	private int status;
	private long dishTypeId;
	private long relaDishTypeId;
	private String relaDishTypeName;
	private String createTime;
	private String usingTime;
	private int dishUsingRange;
	private float dishPrice;
	private String dishUnit;
	private long detailId;
	private int ifPay; 
	
	public MemberDish()
	{
		
	}
	public MemberDish(long memberId,long detailId,long relaDishTypeId)
	{
		this.memberId = memberId;
		this.detailId = detailId;
		this.relaDishTypeId = relaDishTypeId;
	}
	
	public long getMemberDishId() {
		return memberDishId;
	}
	public void setMemberDishId(long memberDishId) {
		this.memberDishId = memberDishId;
	}
	public long getMemberId() {
		return memberId;
	}
	public void setMemberId(long memberId) {
		this.memberId = memberId;
	}
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
	public int getDishCount() {
		return dishCount;
	}
	public void setDishCount(int dishCount) {
		this.dishCount = dishCount;
	}
	public int getStatus() {
		return status;
	}
	public void setStatus(int status) {
		this.status = status;
	}
	public long getDishTypeId() {
		return dishTypeId;
	}
	public void setDishTypeId(long dishTypeId) {
		this.dishTypeId = dishTypeId;
	}
	public long getRelaDishTypeId() {
		return relaDishTypeId;
	}
	public void setRelaDishTypeId(long relaDishTypeId) {
		this.relaDishTypeId = relaDishTypeId;
	}
	public String getCreateTime() {
		return createTime;
	}
	public void setCreateTime(String createTime) {
		this.createTime = createTime;
	}
	public String getUsingTime() {
		return usingTime;
	}
	public void setUsingTime(String usingTime) {
		this.usingTime = usingTime;
	}
	public int getDishUsingRange() {
		return dishUsingRange;
	}
	public void setDishUsingRange(int dishUsingRange) {
		this.dishUsingRange = dishUsingRange;
	}
	public float getDishPrice() {
		return dishPrice;
	}
	public void setDishPrice(float dishPrice) {
		this.dishPrice = dishPrice;
	}
	public String getRelaDishTypeName() {
		return relaDishTypeName;
	}
	public void setRelaDishTypeName(String relaDishTypeName) {
		this.relaDishTypeName = relaDishTypeName;
	}
	public String getDishUnit() {
		return dishUnit;
	}
	public void setDishUnit(String dishUnit) {
		this.dishUnit = dishUnit;
	}
	public long getDetailId() {
		return detailId;
	}
	public void setDetailId(long detailId) {
		this.detailId = detailId;
	}
	public int getIfPay() {
		return ifPay;
	}
	public void setIfPay(int ifPay) {
		this.ifPay = ifPay;
	} 
}
