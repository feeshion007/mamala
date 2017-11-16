package com.mamala.common.util;

public interface IConstants {
	 int DESK_INIT_TABLE_STATUS =1;
	 int DESK_START_TABLE_STATUS =2;
	 int DESK_LOCK_TABLE_STATUS =3; 
	 
	 int DINE_INVALID_DINE_STATUS = -1;
	 int DINE_UN_PAY = -1;
	 
	 int ORDER_TYPE_DINE = 1;
	 int ORDER_TYPE_TAKEOUT = 2;
	 
	 int ORDER_STATUS_NEW = 1;//x
	 int ORDER_STATUS_NO_PAY = 2;//x
	 int ORDER_STATUS_PAY = 3; 
	 int ORDER_NO_PAY_LEAVE = 4; 
	 int ORDER_STATUS_CANCEl = 5;
//	 {1:"开单",2:"未支付",3:"已付款",4:"挂单",5:"退单"}	 
	 
	 int ORDER_PAY = 1;
	 int ORDER_NO_PAY = 2; 

	 
	 int ORDER_DISH_CREATE=1;
	 int ORDER_DISH_CANCEL =2;
	 int ORDER_DISH_PAY = 3;
	 
	 int ORDER_ORDER = 1;//x
	 int ORDER_NO_ORDER = 2;//x
	 
	 int DISH_TYPE_SET=2;
	 int DISH_TYPE_GIVE=4;
	 
	 int DISH_IS_SET=1;
	 int DISH_IS_NOT_SET=2;
	 
	 int MEMBER_DISH_ENABLE = 1;
	 int MEMBER_DISH_DISABLE = 2;
	 int MEMBER_DISH_NO_PAY=1;
	 int MEMBER_DISH_PAY = 2;
	 
	 int ORDER_DISH_NEW = 1;
	 int ORDER_DISH_RETREAT = 2;
	 
	 int MEMBER_OBJ_TYPE_RECHARGE=1;//充值支付
	 int MEMBER_OBJ_TYPE_CARD_PAY=2;//充值消费
	 int MEMBER_OBJ_TYPE_PAY=3;//充值消费
	 
	 int ORDER_PAY_TYPE_CASH= 1;
	 int ORDER_PAY_TYPE_WX= 2;
	 int ORDER_PAY_TYPE_ZFB= 3;
	 int ORDER_PAY_TYPE_CARD= 4;
	 int ORDER_PAY_TYPE_IDCARD= 5;
	 int ORDER_PAY_TYPE_WXCARD= 6;
	 int ORDER_PAY_TYPE_ONLINE= 7;
	 int ORDER_PAY_TYPE_OTHER= 8; 	 
	 
	 int STAFF_ROLE_ADMIN=0;
	 int STAFF_ROLE_MANAGER = 4;
}
