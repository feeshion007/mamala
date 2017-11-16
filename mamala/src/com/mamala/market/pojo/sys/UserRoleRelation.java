package com.mamala.market.pojo.sys;

public class UserRoleRelation {
	private long userId;
	private long merchantId;
	private long roleId;
	private int level;
	private int parentLevel;
	private long parentId;
	
	
	public UserRoleRelation(long userId, long merchantId, long roleId,
			int level, int parentLevel, long parentId) {
		super();
		this.userId = userId;
		this.merchantId = merchantId;
		this.roleId = roleId;
		this.level = level;
		this.parentLevel = parentLevel;
		this.parentId = parentId;
	}
	
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
	}
	public long getMerchantId() {
		return merchantId;
	}
	public void setMerchantId(long merchantId) {
		this.merchantId = merchantId;
	}
	public long getRoleId() {
		return roleId;
	}
	public void setRoleId(long roleId) {
		this.roleId = roleId;
	}
	public int getLevel() {
		return level;
	}
	public void setLevel(int level) {
		this.level = level;
	}
	public int getParentLevel() {
		return parentLevel;
	}
	public void setParentLevel(int parentLevel) {
		this.parentLevel = parentLevel;
	}
	public long getParentId() {
		return parentId;
	}
	public void setParentId(long parentId) {
		this.parentId = parentId;
	}
	
	
}
