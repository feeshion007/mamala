package com.mamala.market.pojo.member;

public class MemberGroup {
	private long groupId;
	private long upGroupId;
	private String groupName;
	private String upGroupName;
	private float rebate;
	private long userId;
	private long storeId;
	private String qryStore;
	public long getGroupId() {
		return groupId;
	}
	public void setGroupId(long groupId) {
		this.groupId = groupId;
	}
	public long getUpGroupId() {
		return upGroupId;
	}
	public void setUpGroupId(long upGroupId) {
		this.upGroupId = upGroupId;
	}
	public String getGroupName() {
		return groupName;
	}
	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}
	 
	public String getUpGroupName() {
		return upGroupName;
	}
	public void setUpGroupName(String upGroupName) {
		this.upGroupName = upGroupName;
	}
	public float getRebate() {
		return rebate;
	}
	public void setRebate(float rebate) {
		this.rebate = rebate;
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
	
}
