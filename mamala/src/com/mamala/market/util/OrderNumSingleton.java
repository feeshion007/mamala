package com.mamala.market.util;

import java.util.Date;

import com.mamala.common.util.DateUtils;
import com.mamala.common.util.NumberUtils;
import com.mamala.common.util.StrUtil;

public class OrderNumSingleton {
	private OrderNumSingleton() {
	}

	private static OrderNumSingleton single = null;
	
	private static long orderNum = 0;
	private static String currentDate = DateUtils.dateToStr(new Date(), "yyyyMMdd");
	// 静态工厂方法
	public static long getOrderNum() { 
		if(orderNum > 100000){
			orderNum=1;
		}
		String date = DateUtils.dateToStr(new Date(), "yyyyMMdd");
		if(!currentDate.equals(date) ){
			currentDate = date;
			orderNum = 1;
		}
		if(orderNum==0){//临时解决方案,防止单重复
			orderNum = NumberUtils.toLong(StrUtil.subString(System.currentTimeMillis()+"", 8,13));
		}
		orderNum++; 
		
		return NumberUtils.toLong(date+"00000")+orderNum;
	}
	
	public static void main(String args[]){
		System.out.println(StrUtil.subString(System.currentTimeMillis()+"", 8,13));
	}
}
