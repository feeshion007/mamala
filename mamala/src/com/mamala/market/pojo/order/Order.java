package com.mamala.market.pojo.order;

import java.util.List;

public class Order {
	   	  
	private long orderId;
	private String orderNum;
	private int orderStatus;
	private int orderType;
	private long orderTicketId;
	private String orderTicketName;
	private long lastOrderTicketId;
	private String lastOrderTicketName;
	private int orderCustomerCount;
	private String orderWaiter;
	private String orderAddress;
	private String orderBuyer;
	private String orderCorpAddress;
	private String orderStartTime;
	private String orderEndTime;
	private long senderUserId;
	private String senderUserName;
	private long userId;
	private float orderSpend;
	private float orderGive;
	private float orderDiscount;
	private float orderPay;
	private float orderAllDiscount;
	private float orderShouldPay;
	private int ifpay;
	private String phone;
	private String cardNumber;
	private long memberId;
	private String createTime;
	private String modifyTime;
	private String qryKey;
	private String remarks;
	private int payType;
	private int ifleave;
	private List<OrderDish> orderDishes;
	private int start = 0;
	private int length = 0;
	private int total = 0;
	private long storeId;
	private String qryStore;
	
	public long getOrderId() {
		return orderId;
	}
	public void setOrderId(long orderId) {
		this.orderId = orderId;
	}
	public String getOrderNum() {
		return orderNum;
	}
	public void setOrderNum(String orderNum) {
		this.orderNum = orderNum;
	}
	public int getOrderStatus() {
		return orderStatus;
	}
	public void setOrderStatus(int orderStatus) {
		this.orderStatus = orderStatus;
	}
	public int getOrderType() {
		return orderType;
	}
	public void setOrderType(int orderType) {
		this.orderType = orderType;
	}
	public long getOrderTicketId() {
		return orderTicketId;
	}
	public void setOrderTicketId(long orderTicketId) {
		this.orderTicketId = orderTicketId;
	}
	public String getOrderTicketName() {
		return orderTicketName;
	}
	public void setOrderTicketName(String orderTicketName) {
		this.orderTicketName = orderTicketName;
	}
	public long getLastOrderTicketId() {
		return lastOrderTicketId;
	}
	public void setLastOrderTicketId(long lastOrderTicketId) {
		this.lastOrderTicketId = lastOrderTicketId;
	}
	public String getLastOrderTicketName() {
		return lastOrderTicketName;
	}
	public void setLastOrderTicketName(String lastOrderTicketName) {
		this.lastOrderTicketName = lastOrderTicketName;
	}
	public int getOrderCustomerCount() {
		return orderCustomerCount;
	}
	public void setOrderCustomerCount(int orderCustomerCount) {
		this.orderCustomerCount = orderCustomerCount;
	}
	public String getOrderWaiter() {
		return orderWaiter;
	}
	public void setOrderWaiter(String orderWaiter) {
		this.orderWaiter = orderWaiter;
	}
	public String getOrderAddress() {
		return orderAddress;
	}
	public void setOrderAddress(String orderAddress) {
		this.orderAddress = orderAddress;
	}
	 
	public String getOrderStartTime() {
		return orderStartTime;
	}
	public void setOrderStartTime(String orderStartTime) {
		this.orderStartTime = orderStartTime;
	}
	public String getOrderEndTime() {
		return orderEndTime;
	}
	public void setOrderEndTime(String orderEndTime) {
		this.orderEndTime = orderEndTime;
	}
	public long getSenderUserId() {
		return senderUserId;
	}
	public void setSenderUserId(long senderUserId) {
		this.senderUserId = senderUserId;
	}
	public String getSenderUserName() {
		return senderUserName;
	}
	public void setSenderUserName(String senderUserName) {
		this.senderUserName = senderUserName;
	}
	public long getUserId() {
		return userId;
	}
	public void setUserId(long userId) {
		this.userId = userId;
	}
	public float getOrderSpend() {
		return orderSpend;
	}
	public void setOrderSpend(float orderSpend) {
		this.orderSpend = orderSpend;
	}
	public float getOrderGive() {
		return orderGive;
	}
	public void setOrderGive(float orderGive) {
		this.orderGive = orderGive;
	}
	public float getOrderDiscount() {
		return orderDiscount;
	}
	public void setOrderDiscount(float orderDiscount) {
		this.orderDiscount = orderDiscount;
	}
	public float getOrderPay() {
		return orderPay;
	}
	public void setOrderPay(float orderPay) {
		this.orderPay = orderPay;
	}
	public int getIfpay() {
		return ifpay;
	}
	public void setIfpay(int ifpay) {
		this.ifpay = ifpay;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getCardNumber() {
		return cardNumber;
	}
	public void setCardNumber(String cardNumber) {
		this.cardNumber = cardNumber;
	}
	public long getMemberId() {
		return memberId;
	}
	public void setMemberId(long memberId) {
		this.memberId = memberId;
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
	public String getQryKey() {
		return qryKey;
	}
	public void setQryKey(String qryKey) {
		this.qryKey = qryKey;
	}
	public String getRemarks() {
		return remarks;
	}
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
	public List<OrderDish> getOrderDishes() {
		return orderDishes;
	}
	public void setOrderDishes(List<OrderDish> orderDishes) {
		this.orderDishes = orderDishes;
	}
	public int getStart() {
		return start;
	}
	public void setStart(int start) {
		this.start = start;
	}
	public int getLength() {
		return length;
	}
	public void setLength(int length) {
		this.length = length;
	}
	public int getTotal() {
		return total;
	}
	public void setTotal(int total) {
		this.total = total;
	}
	public float getOrderShouldPay() {
		return orderShouldPay;
	}
	public void setOrderShouldPay(float orderShouldPay) {
		this.orderShouldPay = orderShouldPay;
	}
	public float getOrderAllDiscount() {
		return orderAllDiscount;
	}
	public void setOrderAllDiscount(float orderAllDiscount) {
		this.orderAllDiscount = orderAllDiscount;
	}
	public String getOrderBuyer() {
		return orderBuyer;
	}
	public void setOrderBuyer(String orderBuyer) {
		this.orderBuyer = orderBuyer;
	}
	public String getOrderCorpAddress() {
		return orderCorpAddress;
	}
	public void setOrderCorpAddress(String orderCorpAddress) {
		this.orderCorpAddress = orderCorpAddress;
	}
	public int getPayType() {
		return payType;
	}
	public void setPayType(int payType) {
		this.payType = payType;
	}
	public int getIfleave() {
		return ifleave;
	}
	public void setIfleave(int ifleave) {
		this.ifleave = ifleave;
	}
	public long getStoreId() {
		return storeId;
	}
	public void setStoreId(long storeId) {
		this.storeId = storeId;
	}
	public String getQryStore() {
		return qryStore;
	}
	public void setQryStore(String qryStore) {
		this.qryStore = qryStore;
	}
}
