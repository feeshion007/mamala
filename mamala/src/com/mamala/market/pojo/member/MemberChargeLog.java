package com.mamala.market.pojo.member;

public class MemberChargeLog {
	private long payId;
	private long objId;
	private long objType;
	private String cardNumber;
	private int payTypeId;
	private float realPayMoney;
	private float payDiscount;
	private float remainMoney;
	private String payRemarks;
	private long userId;
	private float shouldPayMoney;
	
	
	public MemberChargeLog(long payId, long objId, int objType, String cardNumber,
			int payTypeId, float realPayMoney, float payDiscount,
			float remainMoney,float shouldPayMoney, String payRemarks, long userId) {
		super();
		this.payId = payId;
		this.objId = objId;
		this.objType = objType;
		this.cardNumber = cardNumber;
		this.payTypeId = payTypeId;
		this.realPayMoney = realPayMoney;
		this.payDiscount = payDiscount;
		this.remainMoney = remainMoney;
		this.shouldPayMoney = shouldPayMoney;
		this.payRemarks = payRemarks;
		this.userId = userId;
	}
	
	public long getPayId() {
		return payId;
	}
	public void setPayId(long payId) {
		this.payId = payId;
	}
 
	public String getCardNumber() {
		return cardNumber;
	}
	public void setCardNumber(String cardNumber) {
		this.cardNumber = cardNumber;
	}
	public int getPayTypeId() {
		return payTypeId;
	}
	public void setPayTypeId(int payTypeId) {
		this.payTypeId = payTypeId;
	}
	public float getRealPayMoney() {
		return realPayMoney;
	}
	public void setRealPayMoney(float realPayMoney) {
		this.realPayMoney = realPayMoney;
	}
	public float getPayDiscount() {
		return payDiscount;
	}
	public void setPayDiscount(float payDiscount) {
		this.payDiscount = payDiscount;
	}
	public float getRemainMoney() {
		return remainMoney;
	}
	public void setRemainMoney(float remainMoney) {
		this.remainMoney = remainMoney;
	}
	public String getPayRemarks() {
		return payRemarks;
	}
	public void setPayRemarks(String payRemarks) {
		this.payRemarks = payRemarks;
	}
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
	}

	public long getObjId() {
		return objId;
	}

	public void setObjId(long objId) {
		this.objId = objId;
	}

	public long getObjType() {
		return objType;
	}

	public void setObjType(long objType) {
		this.objType = objType;
	}

	public float getShouldPayMoney() {
		return shouldPayMoney;
	}

	public void setShouldPayMoney(float shouldPayMoney) {
		this.shouldPayMoney = shouldPayMoney;
	}
	
	

}
