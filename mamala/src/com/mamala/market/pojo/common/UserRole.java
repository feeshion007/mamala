package com.mamala.market.pojo.common;

public class UserRole {
    int    roleID;    /* 账号角色ID */
    String roleName;  /* 账号角色名称:系统管理员/门店管理员/门店用户  */
    
    //get
    public int getRoleID() {
        return this.roleID;
    }
    
    public String getRoleName() {
        return this.roleName;
    }
    
    //set
    public void setRoleID(int roleID) {
        this.roleID = roleID;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    public String toString() {
        return "roleID=" + String.valueOf(roleID) + "|roleName=" + roleName;
    }
}
