package com.mamala.market.pojo.member;

import java.sql.Date;

public class Member {
	//"member_d","member_name","group_id","group_name","card_number","remain_money","disabled","phone","sex","birthday","create_time","modify_time","user_id","address","remarks","weixin"
	private long memberId;
	private String memberName;
	private long groupId;
	private String groupName;
	private String cardNumber;
	private float remainMoney;
	private int disabled;
	private String phone;
	private int sex;
	private String birthday;
	private long userId;
	private String address;
	private String weixin;
	private String remarks;
	private boolean check;
	private int chargeType;
	private float rechargeMoney;
	private float chargeDiscount;
	private long storeId;
	private String qryStore;
	private int start;
	private int length;
	private String qryKey;
	
	public long getMemberId() {
		return memberId;
	}
	public void setMemberId(long memberId) {
		this.memberId = memberId;
	}
	public String getMemberName() {
		return memberName;
	}
	public void setMemberName(String memberName) {
		this.memberName = memberName;
	}
	public long getGroupId() {
		return groupId;
	}
	public void setGroupId(long groupId) {
		this.groupId = groupId;
	}
	public String getGroupName() {
		return groupName;
	}
	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}
	public String getCardNumber() {
		return cardNumber;
	}
	public void setCardNumber(String cardNumber) {
		this.cardNumber = cardNumber;
	}
	public float getRemainMoney() {
		return remainMoney;
	}
	public void setRemainMoney(float remainMoney) {
		this.remainMoney = remainMoney;
	}
	public int getDisabled() {
		return disabled;
	}
	public void setDisabled(int disabled) {
		this.disabled = disabled;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public int getSex() {
		return sex;
	}
	public void setSex(int sex) {
		this.sex = sex;
	}
	public String getBirthday() {
		return birthday;
	}
	public void setBirthday(String birthday) {
		this.birthday = birthday;
	}
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getWeixin() {
		return weixin;
	}
	public void setWeixin(String weixin) {
		this.weixin = weixin;
	}
	public String getRemarks() {
		return remarks;
	}
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
	public boolean isCheck() {
		return check;
	}
	public void setCheck(boolean check) {
		this.check = check;
	}
	public int getChargeType() {
		return chargeType;
	}
	public void setChargeType(int chargeType) {
		this.chargeType = chargeType;
	}
	public float getRechargeMoney() {
		return rechargeMoney;
	}
	public void setRechargeMoney(float rechargeMoney) {
		this.rechargeMoney = rechargeMoney;
	}
	public float getChargeDiscount() {
		return chargeDiscount;
	}
	public void setChargeDiscount(float chargeDiscount) {
		this.chargeDiscount = chargeDiscount;
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
	public String getQryKey() {
		return qryKey;
	}
	public void setQryKey(String qryKey) {
		this.qryKey = qryKey;
	}
	
}
