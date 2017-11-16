package com.mamala.common.util;

import java.util.Calendar;
import java.util.Date;

public class DateSimpleUtil {
	/**
	 * 获取指定日期所在周的周一
	 * @Methods Name getMonday
	 * @return Date
	 */
	public static Date getMonday(Date date){
		Calendar cDay = Calendar.getInstance();   
        cDay.setTime(date);
        cDay.setFirstDayOfWeek(Calendar.MONDAY);
        cDay.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);//老外将周日定位第一天，周一取第二天
        return cDay.getTime();   
	}
	/**
	 * 获取指定日期所在周日
	 * @Methods Name getSunday
	 * @return Date
	 */
	public static Date getSunday(Date date){
		Calendar cDay = Calendar.getInstance();   
        cDay.setTime(date);
        if(Calendar.DAY_OF_WEEK==cDay.getFirstDayOfWeek()){	//如果刚好是周日，直接返回
        	return date;
        }else{//如果不是周日，加一周计算
        	cDay.add(Calendar.DAY_OF_YEAR, 7);
        	cDay.set(Calendar.DAY_OF_WEEK, 1);
        	System.out.println(cDay.getTime());
        	return cDay.getTime();
        }  
	}
	/**
     * 得到本月第一天的日期
     * @Methods Name getFirstDayOfMonth
     * @return Date
     */
	public static Date getFirstDayOfMonth(Date date)   {   
        Calendar cDay = Calendar.getInstance();   
        cDay.setTime(date);
        cDay.set(Calendar.DAY_OF_MONTH, 1);
        System.out.println(cDay.getTime());
        return cDay.getTime();   
	}   
	/**
     * 得到本月最后一天的日期
     * @Methods Name getLastDayOfMonth
     * @return Date
     */
	public static Date getLastDayOfMonth(Date date)   {   
    	Calendar cDay = Calendar.getInstance();   
        cDay.setTime(date);
        cDay.set(Calendar.DAY_OF_MONTH, cDay.getActualMaximum(Calendar.DAY_OF_MONTH));
        System.out.println(cDay.getTime());
        return cDay.getTime();   
	}
	/**
     * 得到本季度第一天的日期
     * @Methods Name getFirstDayOfQuarter
     * @return Date
     */
	public static Date getFirstDayOfQuarter(Date date)   {   
    	Calendar cDay = Calendar.getInstance();   
        cDay.setTime(date);
        int curMonth = cDay.get(Calendar.MONTH);
        if (curMonth >= Calendar.JANUARY && curMonth <= Calendar.MARCH){  
        	cDay.set(Calendar.MONTH, Calendar.JANUARY);
        }
        if (curMonth >= Calendar.APRIL && curMonth <= Calendar.JUNE){  
        	cDay.set(Calendar.MONTH, Calendar.APRIL);
        }
        if (curMonth >= Calendar.JULY && curMonth <= Calendar.AUGUST) {  
        	cDay.set(Calendar.MONTH, Calendar.JULY);
        }
        if (curMonth >= Calendar.OCTOBER && curMonth <= Calendar.DECEMBER) {  
        	cDay.set(Calendar.MONTH, Calendar.OCTOBER);
        }
        cDay.set(Calendar.DAY_OF_MONTH, cDay.getActualMinimum(Calendar.DAY_OF_MONTH));
        System.out.println(cDay.getTime());
        return cDay.getTime();   
	}
	/**
     * 得到本季度最后一天的日期
     * @Methods Name getLastDayOfQuarter
     * @return Date
     */
	public static Date getLastDayOfQuarter(Date date)   {   
    	Calendar cDay = Calendar.getInstance();   
        cDay.setTime(date);
        int curMonth = cDay.get(Calendar.MONTH);
        if (curMonth >= Calendar.JANUARY && curMonth <= Calendar.MARCH){  
        	cDay.set(Calendar.MONTH, Calendar.MARCH);
        }
        if (curMonth >= Calendar.APRIL && curMonth <= Calendar.JUNE){  
        	cDay.set(Calendar.MONTH, Calendar.JUNE);
        }
        if (curMonth >= Calendar.JULY && curMonth <= Calendar.AUGUST) {  
        	cDay.set(Calendar.MONTH, Calendar.AUGUST);
        }
        if (curMonth >= Calendar.OCTOBER && curMonth <= Calendar.DECEMBER) {  
        	cDay.set(Calendar.MONTH, Calendar.DECEMBER);
        }
        cDay.set(Calendar.DAY_OF_MONTH, cDay.getActualMaximum(Calendar.DAY_OF_MONTH));
        System.out.println(cDay.getTime());
        return cDay.getTime();   
	}

}
