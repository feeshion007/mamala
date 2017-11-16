package com.mamala.market.pojo;

public class Const {
    public static final String DAY   = "DAY";
    public static final String WEEK  = "WEEK";
    public static final String MONTH = "MONTH";
    public static final String YEAR  = "YEAR";
    
    public static final String TOTAL = "TOTAL";
    public static final String SUB   = "SUB";
    
    public static final String newLine = System.getProperty("line.separator");
    /* 计算小数保留位使用
     * float a = 0.5678;
     * float b = (float) (Math.round(a*decimalPlace2))/decimalPlace2; 取两位小数方法, a表示0.5678 得到0.56 
     * */
    public static final int decimalPlace4 = 10000;
    public static final int decimalPlace3 = 1000;
    public static final int decimalPlace2 = 100;
    public static final int decimalPlace1 = 10;
    
    /* 使用NumberUtls.round()时 scale参数 */
    public static final int decimalPlace  = 4;
    
    /* 特殊的字段值 */
    public static final int INVALED_ACTIVITY_ID = -1;
    public static final int INVALED_ACTIVITY_STORE_ID = 0; //与数据库保持一致,0表示活动为非店铺的活动(即表示门店活动)
    public static final int INVALED_STORE_ID = -1;
    public static final int INVALED_FLOOR_ID = -1;
    public static final int INVALED_BUILD_ID = -1;
    public static final int BUILD_TOTAL_FLAG_ID = -1;//门店汇总是的特殊storeID = -1
    public static final int FLOOR_TOTAL_FLAG_ID = 0; //楼层汇总时的特殊storeID = 0
    public static final String BUILD_TOTAL_FLAG_STR = "门店汇总";
    public static final String FLOOR_TOTAL_FLAG_STR = "楼层汇总";
    public static final int OLD_ID   = 0;      //新旧对比数据的List index
    public static final int NEW_ID   = 1;
    public static final int CUSTOMER_NEW      = 0;//0新顾客/1老顾客/2雇员
    public static final int CUSTOMER_OLD      = 1;
    public static final int CUSTOMER_EMPLOYEE = 2;
    
    //返回码定义2xx - 多租户管理-用户管理
    public static final int    RET_CODE_210 = 210;
    public static final String RET_STR_210  = "用户未登录或Session已超时";
}
