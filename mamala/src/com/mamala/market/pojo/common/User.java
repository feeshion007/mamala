package com.mamala.market.pojo.common;

import java.util.List;
import java.util.Set;
import java.util.TreeMap;

public class User {
    public static final boolean is_user_session_check_enable = true;//TODO 修改为true可用,调整到登录页面需web前端配合
    public static final int INVALID_USER_LEVEL = -1;
    public static final int INVALID_USER_BUILDID = -1;
    public static final int INVALID_USER_MERID = -1;
    public static final int INVALID_USER_ROLEID = -1;
    public static final int INVALID_USER_ID    = -1;
    
    //是否支持user中缓存floorCache 及 storeCache信息, store依赖floor
    public static boolean isSupportFloorCacheInUser = true;
    public static boolean isSupportStoreCacheInUser = true;
    
    //same as DataBase t_role_info
    public static final int USER_ROLE_SYSTEM_ADMIN   = 1;
    public static final int USER_ROLE_MERCHANT_ADMIN = 2;
    public static final int USER_ROLE_MERCHANT_USER  = 3;
    
    public static final String USER_SESSIONG_KEY = "sessionKey";
    public static final String USER_IP_KEY       = "sessionIPKey";
    
    
    /* 
     * userID, userName, userLevel, roleID, roleName -> 账号的这些信息不会改变
     * password                 自己修改,系统管理员重置门店管理员,门店管理员重置门店用户
     * 
     * position,phoneNum,gender 自己修改,系统管理员修改门店管理员,门店管理员修改门店用户
     * */
    int    userID;
    String userName;
    String userPass;
    int    userLevel;
    String ipAddr;
    boolean userIsLogin;
    
    int    roleID;    /* 账号角色ID */
    String roleName;  /* 账号角色名称:系统管理员/门店管理员/门店用户  */
    String name;      /* 姓名 */
    String position;  /* 管理员头衔 */
    String phoneNum;  /* 联系电话 */
    String gender;    /* 性别 */
    long storeId;
    
    //账号的商户可见信息
    String merchantIDString;                //"1,2,3,4"格式
    TreeMap<String, String> merchantCache;//保存当前用户的商户信息 <id,name>,除系统管理员外目前只支持一个数据 2014-11-26
    //账号的建筑可见信息
    String buildingIDString;                //"1,2,3,4"格式
    TreeMap<String, String> buildingCache;//保存当前用户的建筑信息 <id,name>,门店用户只支持一个2014-11-26
    //账号的楼层可见信息
    String floorIDString;                   //"1,2,3,4"格式
    TreeMap<String, String> floorCache;   //保存当前用户的楼层信息 <id,name>2014-11-26
    //账号的店铺可见信息
    String storeIDString;                   //"1,2,3,4"格式
    TreeMap<String, String> storeCache;   //保存当前用户的店铺信息 <id,name> 2014-11-26
    //账号的功能可见信息
    String functionIDString;                //"1,2,3,4"格式
    TreeMap<String, SystemFunction> functionTreeMap;//保存当前用户的功能信息 <id,name>
//    List<Integer> subUserIDList;/* 本用户可管理的子用户ID列表: 系统管理员可管理门店管理员,门店管理员可以管理:本门店用户,不能越权管理 */
    
    //get
    public int getUserID() {
        return this.userID;
    }
    
    public String getUserName() {
        return this.userName;
    }
    
    public String getUserPass() {
        return this.userPass;
    }
    
    public String getIpAddr() {
        return this.ipAddr;
    }
    
    public boolean getUserIsLogin() {
        return this.userIsLogin;
    }
    
    public int getUserLevel() {
        return this.userLevel;
    }
    
    public int getRoleID() {
        return this.roleID;
    }
    
    public String getRoleName() {
        return this.roleName;
    }
    
    public String getName() {
        return this.name;
    }
    
    public String getPosition() {
        return this.position;
    }
    
    public String getPhoneNum() {
        return this.phoneNum;
    }
    
    public String getGender() {
        return this.gender;
    }
    
    public TreeMap<String, SystemFunction> getFunctionTreeMap() {
        return this.functionTreeMap;
    }
    
//    public List<Integer> getSubUserIDList() {
//        return this.subUserIDList;
//    }
    //set
    public void setUserId(int userID) {
        this.userID = userID;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public void setUserPass(String userPass) {
        this.userPass = userPass;
    }
    
    public void setIpAddr(String ipAddr) {
        this.ipAddr = ipAddr;
    }
    
    public void setUserIsLogin(boolean userIsLogin) {
        this.userIsLogin = userIsLogin;
    }
    
    public void setUserLevel(int userLevel) {
        this.userLevel = userLevel;
    }
    
    public void setRoleID(int roleID) {
        this.roleID = roleID;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public void setPosition(String position) {
        this.position = position;
    }
    
    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
    
    public long getStoreId() {
		return storeId;
	}

	public void setStoreId(long storeId) {
		this.storeId = storeId;
	}

	public void setFunctionTreeMap(TreeMap<String, SystemFunction> funcTreeMap) {
        this.functionTreeMap = funcTreeMap;
        
        //同时将FunctionID其转换为"1,2,3,4"个形式保存
        functionIDString = this.setToCommaString(funcTreeMap != null ? funcTreeMap.keySet() : null);
    }
    public void setFunctionTreeMap(List<SystemFunction> funcList) {
        TreeMap<String, SystemFunction> funcTreeMap = new TreeMap<String, SystemFunction>();
        
        if (funcList != null) {
            for (SystemFunction sysFunc: funcList) {
                funcTreeMap.put(String.valueOf(sysFunc.getFuncID()), sysFunc);
            }
        }
        this.functionTreeMap = funcTreeMap;
        
        //同时将FunctionID其转换为"1,2,3,4"个形式保存
        functionIDString = this.setToCommaString(funcTreeMap.keySet());
    }
    
    /* 判断funcStr集合与funcList集合的关系
     * funcStr = "1,2,3,4"
     * 
     * true : if funcTreeMap >= funcStr
     * false: else
     * */
    public boolean functionIDIsUnderControl(String funcStr) {
        if (isFunctionTreeMapValid() == false) {
            return false;
        }
        
        //debug print
        String tempStr = "";
        StringBuffer funcListStr = new StringBuffer();
        for (String funcIDStr: this.functionTreeMap.keySet()) {
            funcListStr.append(tempStr).append(funcIDStr);
            tempStr = ",";
            
        }
        
        /* 判断funcStr集合与funcList集合的关系 */
        String[] funcArray = funcStr.split(",");
        for (int i = 0; i < funcArray.length; i++) {
            if (!this.functionTreeMap.containsKey(funcArray[i].trim())) {
//                System.out.println("[functionCheck]Failed FuncStr=" + funcListStr.toString() 
//                        + "| NewFuncStr=" + funcStr);
                return false;
            }
        }
        
//        System.out.println("[functionIDIsUnderControl]Succ FuncStr=" + funcListStr.toString() 
//                + "| NewFuncStr=" + funcStr);
        return true;
    }
    
    /* 返回FunctionID的逗号字符串分割格式 */
    public String getFunctionIDListString() {
        return functionIDString;
    }
    
    /* 返回functionTreeMap是否有效 */
    public boolean isFunctionTreeMapValid() {
        if (this.functionTreeMap == null || this.functionTreeMap.isEmpty()) {
            return false;
        } else {
            return true;
        }
    }
    
    /* 将字符串集合转换为"1,2,3,4,5"的形式 */
    private String setToCommaString(Set<String> stringSet) {
        if (stringSet == null) {
            return "";
        }
        
        String tempStr = "";
        StringBuffer treeKeyStringBuffer = new StringBuffer("");
        for (String str : stringSet) {
            treeKeyStringBuffer.append(tempStr).append(str);
            tempStr = ",";
        }
        
        return treeKeyStringBuffer.toString();
    }
}
