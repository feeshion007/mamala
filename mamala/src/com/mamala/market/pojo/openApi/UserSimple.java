package com.mamala.market.pojo.openApi;

import java.io.Serializable;

/**
 * Created by OA on 2015/11/3.
 */
public class UserSimple implements Serializable{
    private static final long serialVersionUID = -5301214684239803515L;
    private int userId;
    private int merchantId;
    private int roleId;
    private int level;
    private int parentLevel;
    private int parentId;
    private String userName;
    private String password;


    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(int merchantId) {
        this.merchantId = merchantId;
    }

    public int getRoleId() {
        return roleId;
    }

    public void setRoleId(int roleId) {
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

    public int getParentId() {
        return parentId;
    }

    public void setParentId(int parentId) {
        this.parentId = parentId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "UserSimple{" +
                "userId=" + userId +
                ", merchantId=" + merchantId +
                ", roleId=" + roleId +
                ", level=" + level +
                ", parentLevel=" + parentLevel +
                ", parentId=" + parentId +
                ", userName='" + userName + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
