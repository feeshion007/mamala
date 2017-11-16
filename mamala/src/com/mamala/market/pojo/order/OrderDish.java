package com.mamala.market.pojo.order;

public class OrderDish {
	//order_dish_detail_id,order_id,dish_id,dish_name,dish_status,dish_price,dish_unit_price,dish_order_time,dish_count,
	//ifgive,iforder,isset,user_id,dish_need
	
	private long orderDishDetailId;
	private long orderId;
	private String orderNum;
	private long dishId;
	private long oldDetailId;
	private long parentDetailId;
	private long oldParentDetailId;
	private long dishTypeId;
	private String dishName;
	private int dishStatus;
	private String dishUnit;
	private int dishUnitCount;
	private float dishUnitPrice;
	private float dishTotalPrice;
	private float dishDiscount;
	private float dishGive;
	private int dishCount;
	private int dishStorage;
	private int ifgive;
	private int iforder;
	private int isset;
	private long userId;
	private String dishNeed;
	private String createTime;
	private String modifyTime;
	private String orderTime;
	private long deskId;
	private long memberId;
	
	public OrderDish()
	{ 
	}
	public OrderDish(long orderDishDetailId,long orderId,long dishId,long parentDetailId,long dishTypeId,String dishName,int dishUnitCount,int dishStatus,String dishUnit,float dishUnitPrice,float dishTotalPrice,float dishDiscount,float dishGive,int dishCount,int ifgive,int iforder,int isset,long userId,String dishNeed,String orderTime,int dishStorage,long oldParentDetailId,long oldDetailId)
	{
		this.orderDishDetailId=orderDishDetailId;
		this.orderId=orderId;
		this.dishId=dishId;
		this.parentDetailId=parentDetailId;
		this.dishTypeId=dishTypeId;
		this.dishName=dishName;
		this.dishStatus=dishStatus;
		this.dishUnit=dishUnit;
		this.dishUnitPrice=dishUnitPrice;
		this.dishTotalPrice=dishTotalPrice;
		this.dishDiscount=dishDiscount;
		this.dishGive=dishGive;
		this.dishCount=dishCount;
		this.ifgive=ifgive;
		this.iforder=iforder;
		this.isset=isset;
		this.userId=userId;
		this.dishNeed=dishNeed; 
		this.orderTime=orderTime; 
		this.dishUnitCount = dishUnitCount;
		this.dishStorage = dishStorage;
		this.oldParentDetailId = oldParentDetailId;
		this.oldDetailId = oldDetailId;
	}
	
	public long getOrderDishDetailId() {
		return orderDishDetailId;
	}
	public void setOrderDishDetailId(long orderDishDetailId) {
		this.orderDishDetailId = orderDishDetailId;
	}
	public long getOrderId() {
		return orderId;
	}
	public void setOrderId(long orderId) {
		this.orderId = orderId;
	}
	public long getDishId() {
		return dishId;
	}
	public void setDishId(long dishId) {
		this.dishId = dishId;
	}
	public String getDishName() {
		return dishName;
	}
	public void setDishName(String dishName) {
		this.dishName = dishName;
	}
	public int getDishStatus() {
		return dishStatus;
	}
	public void setDishStatus(int dishStatus) {
		this.dishStatus = dishStatus;
	}
	public float getDishUnitPrice() {
		return dishUnitPrice;
	}
	public int getDishUnitCount() {
		return dishUnitCount;
	}
	public void setDishUnitCount(int dishUnitCount) {
		this.dishUnitCount = dishUnitCount;
	}
	public void setDishUnitPrice(float dishUnitPrice) {
		this.dishUnitPrice = dishUnitPrice;
	}
	public float getDishTotalPrice() {
		return dishTotalPrice;
	}
	public void setDishTotalPrice(float dishTotalPrice) {
		this.dishTotalPrice = dishTotalPrice;
	}
	public int getDishCount() {
		return dishCount;
	}
	public void setDishCount(int dishCount) {
		this.dishCount = dishCount;
	}
	 
	public int getIfgive() {
		return ifgive;
	}
	public void setIfgive(int ifgive) {
		this.ifgive = ifgive;
	}
	public int getIforder() {
		return iforder;
	}
	public void setIforder(int iforder) {
		this.iforder = iforder;
	}
	public int getIsset() {
		return isset;
	}
	public void setIsset(int isset) {
		this.isset = isset;
	}
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
	}
	public String getDishNeed() {
		return dishNeed;
	}
	public void setDishNeed(String dishNeed) {
		this.dishNeed = dishNeed;
	}
	public String getCreateTime() {
		return createTime;
	}
	public void setCreateTime(String createTime) {
		this.createTime = createTime;
	}
	public String getModifyTime() {
		return modifyTime;
	}
	public void setModifyTime(String modifyTime) {
		this.modifyTime = modifyTime;
	}
	public String getOrderTime() {
		return orderTime;
	}
	public void setOrderTime(String orderTime) {
		this.orderTime = orderTime;
	}
	public float getDishDiscount() {
		return dishDiscount;
	} 
	public void setDishDiscount(float dishDiscount) {
		this.dishDiscount = dishDiscount;
	} 
	public float getDishGive() {
		return dishGive;
	}
	public void setDishGive(float dishGive) {
		this.dishGive = dishGive;
	}
	public long getDishTypeId() {
		return dishTypeId;
	}
	public void setDishTypeId(long dishTypeId) {
		this.dishTypeId = dishTypeId;
	}
 
	public String getDishUnit() {
		return dishUnit;
	}
	public void setDishUnit(String dishUnit) {
		this.dishUnit = dishUnit;
	}
	public long getDeskId() {
		return deskId;
	}
	public void setDeskId(long deskId) {
		this.deskId = deskId;
	}
	public int getDishStorage() {
		return dishStorage;
	}
	public void setDishStorage(int dishStorage) {
		this.dishStorage = dishStorage;
	}
	public long getOldParentDetailId() {
		return oldParentDetailId;
	}
	public void setOldParentDetailId(long oldParentDetailId) {
		this.oldParentDetailId = oldParentDetailId;
	}
	public long getOldDetailId() {
		return oldDetailId;
	}
	public void setOldDetailId(long oldDetailId) {
		this.oldDetailId = oldDetailId;
	}
	public long getParentDetailId() {
		return parentDetailId;
	}
	public void setParentDetailId(long parentDetailId) {
		this.parentDetailId = parentDetailId;
	}
	public String getOrderNum() {
		return orderNum;
	}
	public void setOrderNum(String orderNum) {
		this.orderNum = orderNum;
	}
	public long getMemberId() {
		return memberId;
	}
	public void setMemberId(long memberId) {
		this.memberId = memberId;
	} 
	
}
