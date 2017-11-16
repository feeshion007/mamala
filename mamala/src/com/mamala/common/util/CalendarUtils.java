package com.mamala.common.util;

import java.util.Calendar;
import java.util.Date;

import com.mamala.market.pojo.Const;

public class CalendarUtils {
    //与当前时间比较:按日/月/年类型->对应只比较yyyy-MM-dd yyyy-MM-00 yyyy-00-00数据
    public static boolean afterNow(Date date, String dateType) {
        
        Calendar nowCal = Calendar.getInstance();
        Calendar paraCal = Calendar.getInstance();
        paraCal.setTime(date);
        
        if (Const.MONTH.equalsIgnoreCase(dateType)) {
            nowCal.clear();
            nowCal.set(Calendar.getInstance().get(Calendar.YEAR), Calendar.getInstance().get(Calendar.MONTH), 0);
            paraCal.set(Calendar.DAY_OF_MONTH, 0);
            
            if (nowCal.compareTo(paraCal) <= 0) {//只比较yyyy-MM-00数据
                return true;
            } else {
                return false;
            }
        } else if (Const.YEAR.equalsIgnoreCase(dateType)){
            if (nowCal.get(Calendar.YEAR) <= paraCal.get(Calendar.YEAR)) {//比较yyyy数据
                return true;
            } else {
                return false;
            }
        } else {
            //Default Day
            //Const.DAY.equalsIgnoreCase(dateType)
            nowCal.clear();
            Calendar tempNowCal = Calendar.getInstance();
            nowCal.set(tempNowCal.get(Calendar.YEAR), tempNowCal.get(Calendar.MONTH), tempNowCal.get(Calendar.DAY_OF_MONTH));
            
            if (nowCal.compareTo(paraCal) <= 0) {
                return true;
            } else {
                return false;
            }
        }
    }
}
