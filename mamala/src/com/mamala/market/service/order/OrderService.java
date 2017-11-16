package com.mamala.market.service.order;

import java.text.DateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.mamala.common.util.DateUtils;
import com.mamala.common.util.IConstants;
import com.mamala.common.util.StrUtil;
import com.mamala.market.mapper.dine.DineMapper;
import com.mamala.market.mapper.dish.DishMapper;
import com.mamala.market.mapper.member.MemberMapper;
import com.mamala.market.mapper.order.OrderMapper;
import com.mamala.market.pojo.dine.Dine;
import com.mamala.market.pojo.dine.DineTable;
import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.dish.SetDishRelation;
import com.mamala.market.pojo.member.Member;
import com.mamala.market.pojo.member.MemberChargeLog;
import com.mamala.market.pojo.member.MemberDish;
import com.mamala.market.pojo.order.Order;
import com.mamala.market.pojo.order.OrderDish;
import com.mamala.market.service.dish.DishService;
import com.mamala.market.util.OrderNumSingleton;

@Service
public class OrderService {
	
	private static Logger logger = Logger.getLogger(DishService.class);
	 
    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private DineMapper dineMapper;
    @Autowired
    private DishMapper dishMapper;
    @Autowired
    private MemberMapper memberMapper;
    
	public Order addOrder(Order order) {  
		orderMapper.addOrder(order);   
		return order; 
	}

	public Order updateOrder(Order myOrder) {
	   Order order = orderMapper.qryOrderByOrderId(myOrder.getOrderId());
	   order.setOrderStatus(IConstants.ORDER_NO_PAY); 
	   order.setPhone(myOrder.getPhone());
	   order.setMemberId(myOrder.getMemberId());
	   caclMoney(order);
	   if(order.getOrderType() == IConstants.ORDER_TYPE_DINE){
		   Dine dine = dineMapper.findDineById(order.getOrderTicketId());
		   dine.setPhone(order.getPhone());
		   dine.setMemberId(order.getMemberId());
		   dineMapper.updateDine(dine);
	   }
	   orderMapper.updateOrder(order);     
	   return order;
	}
	
	public boolean updatePayOrder(Order myOrder) {   
		 Order order = orderMapper.qryOrderByOrderId(myOrder.getOrderId());   
         order.setOrderStatus(IConstants.ORDER_NO_PAY_LEAVE);
         order.setOrderShouldPay(myOrder.getOrderShouldPay()); 
         order.setRemarks(myOrder.getRemarks());
         order.setOrderAllDiscount(myOrder.getOrderAllDiscount());
         order.setOrderDiscount(myOrder.getOrderDiscount());
         if(myOrder.getIfpay()==IConstants.ORDER_PAY){
        	 if(myOrder.getOrderPay()< order.getOrderShouldPay()*0.6){
        		 return false;
        	 }
        	 order.setOrderPay(myOrder.getOrderPay());
        	 order.setOrderStatus(IConstants.ORDER_STATUS_PAY);
        	 order.setIfpay(IConstants.ORDER_PAY);
         }else{
        	 order.setOrderPay(0);
         }
         if(myOrder.getIfpay()==IConstants.ORDER_PAY){      	 
        	if(order.getMemberId()>0 && myOrder.getPayType() == IConstants.ORDER_PAY_TYPE_CARD ){
        		Member member = memberMapper.qryMemberById(order.getMemberId());
        		if(member.getRemainMoney()<myOrder.getOrderPay()){
        			return false;
        		}
        		member.setRemainMoney(member.getRemainMoney()-myOrder.getOrderPay());
        		memberMapper.updateMember(member); 
        		MemberChargeLog log = new MemberChargeLog(0, order.getOrderId(),IConstants.MEMBER_OBJ_TYPE_CARD_PAY, StrUtil.strNull(member.getMemberId()),
        				myOrder.getPayType(),-order.getOrderPay(),order.getOrderAllDiscount()+order.getOrderDiscount(),
         				member.getRemainMoney(),order.getOrderShouldPay(), order.getPhone(), order.getUserId());
         		memberMapper.addMemberChargeLog(log);
        	}else if(myOrder.getPayType() != IConstants.ORDER_PAY_TYPE_CARD){
        		MemberChargeLog log = new MemberChargeLog(0, order.getOrderId(),IConstants.MEMBER_OBJ_TYPE_PAY, StrUtil.strNull(order.getUserId()),
         				myOrder.getPayType(),-order.getOrderPay(),order.getOrderAllDiscount()+order.getOrderDiscount(),
         				0, order.getOrderShouldPay(),order.getPhone(), order.getUserId());
         		memberMapper.addMemberChargeLog(log);
        	}  
         }
         if(IConstants.ORDER_NO_PAY_LEAVE == order.getOrderStatus()){
        	 order.setIfleave(IConstants.ORDER_NO_PAY_LEAVE);
         }
		 orderMapper.updateOrder(order);  

		 Dine dine = dineMapper.findDineById(myOrder.getOrderTicketId());
		 if(dine!=null){
			 dine.setDineStatus(IConstants.DINE_UN_PAY);
			 dineMapper.updateDine(dine);
			 
			 DineTable desk = dineMapper.findTableById(dine.getDineDeskId());
			 desk.setCurrentCost(0);
			 desk.setCurrentCustomerCount(0);
			 desk.setCurrentDineId(0);
			 desk.setTableStatus(IConstants.DESK_INIT_TABLE_STATUS);
			 dineMapper.updateDineTable(desk);
		 }
		 
		 if(order.getIfpay()==IConstants.ORDER_PAY){
			 List<OrderDish> orderDishes = orderMapper.qryOrderDishesByOrderId(order.getOrderId());
			 for(OrderDish dish : orderDishes){
				 dish.setDishStatus(IConstants.ORDER_DISH_PAY);
				 orderMapper.updateOrderDish(dish);
				 
				 MemberDish memberDish = memberMapper.qryMemberDishByDetailId(dish.getOrderDishDetailId());
				 if(memberDish!=null){
					 MemberDish payDish = memberMapper.qryMemberDishByMemberDetailId(order.getMemberId(),memberDish.getDishId(),IConstants.MEMBER_DISH_PAY);//结完单所有该顾客下的菜品都归整在一起
					 if(payDish == null){
						 memberDish.setIfPay(IConstants.MEMBER_DISH_PAY); 
						 memberMapper.updateMemberDish(memberDish);
					 }else { 
						 int discount = payDish.getDishCount()+memberDish.getDishCount();
						 payDish.setDishCount(discount); 
						 memberDish.setStatus(IConstants.MEMBER_DISH_DISABLE);
						 memberMapper.updateMemberDish(memberDish);
					     memberMapper.updateMemberDish(payDish);  
					 }  
			    }
		    }
		 }
		 
		 return true;
	}
	
	public boolean updateOrderCancel(Order myOrder) {
		Order order = null;
		 if(myOrder.getOrderId()==0){
			 Dine dine = dineMapper.findDineById(myOrder.getOrderTicketId());
			 DineTable desk = dineMapper.findTableById(dine.getDineDeskId());
			 List<Order> orderList = orderMapper.qryOrderByTicketId(myOrder.getOrderTicketId());
			 if(orderList.size()<0) return false;
			 order = orderList.get(0);	
			 if(desk.getTableStatus() == IConstants.DESK_INIT_TABLE_STATUS){
				 return false;
			 }
			 
			 dine.setDineStatus(IConstants.DINE_UN_PAY);
			 dineMapper.updateDine(dine);
			 		 
			 desk.setCurrentCost(0);
			 desk.setCurrentCustomerCount(0);
			 desk.setCurrentDineId(0);
			 desk.setTableStatus(IConstants.DESK_INIT_TABLE_STATUS);
			 dineMapper.updateDineTable(desk);
		 }else{
			 order = orderMapper.qryOrderByOrderId(myOrder.getOrderId());
		 }  
		 	 
		 if(order.getOrderStatus()==IConstants.ORDER_STATUS_CANCEl){
			 return false;
		 }
		 
         order.setOrderStatus(IConstants.ORDER_STATUS_CANCEl); 
		 orderMapper.updateOrder(order);  
		
		 List<OrderDish> orderDishes = orderMapper.qryOrderDishesByOrderId(order.getOrderId());
		 for(OrderDish dish : orderDishes){
			 dish.setDishStatus(IConstants.ORDER_DISH_CANCEL);
			 orderMapper.updateOrderDish(dish);
			 
			 if(dish.getIfgive()==IConstants.DISH_TYPE_GIVE){
				MemberDish tmpDish = new MemberDish();
				tmpDish.setDishId(dish.getDishId());
				tmpDish.setDishUsingRange(IConstants.DISH_TYPE_GIVE);
				tmpDish.setMemberId(order.getMemberId());
				tmpDish.setIfPay(IConstants.MEMBER_DISH_PAY);
				List<MemberDish> mList = memberMapper.qryMemberDishList(tmpDish);
				if(mList.size()>0){
					tmpDish = mList.get(0);
					tmpDish.setDishCount(dish.getDishCount());
					memberMapper.updateMemberDish(tmpDish);
				} 
			 }else{
				 MemberDish memberDish = memberMapper.qryMemberDishByDetailId(dish.getOldDetailId()>0?dish.getOldDetailId():dish.getOrderDishDetailId());
				 if(memberDish!=null){
					  if(memberDish.getDetailId() == dish.getOrderDishDetailId()){
						  memberMapper.deleteMember(memberDish.getDetailId());
					  }else if(memberDish.getDetailId() == dish.getOldDetailId()){
						  memberDish.setDishCount(memberDish.getDishCount()+dish.getDishCount());
						  memberMapper.updateMemberDish(memberDish);
					  }
			    }
			 }
	    }
		 
		 
		 return true;
	}

	public void deleteOrderDish(long orderDishDetailId,boolean retreat) {//todo安全性考虑
		// TODO Auto-generated method stub
		OrderDish orderDish = orderMapper.qryOrderDishByDetailId(orderDishDetailId);
		if(orderDish.getDishStatus() == IConstants.ORDER_ORDER && orderDish.getParentDetailId()>0 && !retreat){
			//todo throw exception
			return;
		}
		
		if(orderDish.getDishStatus() == IConstants.ORDER_NO_ORDER && orderDish.getParentDetailId()>0 && retreat){
			//todo throw exception
			return;
		}
		long orderId = orderDish.getOrderId();
		if(orderDish.getIfgive()==IConstants.DISH_TYPE_GIVE){
			MemberDish tmpDish = new MemberDish();
			tmpDish.setDishId(orderDish.getDishId());
			tmpDish.setDishUsingRange(IConstants.DISH_TYPE_GIVE);
			tmpDish.setMemberId(orderDish.getMemberId());
			tmpDish.setIfPay(IConstants.MEMBER_DISH_PAY);
			List<MemberDish> mList = memberMapper.qryMemberDishList(tmpDish);
			if(mList.size()>0){
				tmpDish = mList.get(0);
				tmpDish.setDishCount(orderDish.getDishCount());
				memberMapper.updateMemberDish(tmpDish);
			} 
		}else{
			if(orderDish.getIsset() == IConstants.DISH_IS_SET && orderDish.getDishCount() > 0){
				List<OrderDish> childDishes = orderMapper.qryOrderDishByParentId(orderDishDetailId);
				for(OrderDish child:childDishes){
					long detailId = child.getOrderDishDetailId();
					if(retreat){
						List<OrderDish> newDishes = orderMapper.qryOrderDishByOldDetailId(detailId);
						if(newDishes!=null){
							for(OrderDish newDish:newDishes){
								long newParentDishId = newDish.getParentDetailId();
								orderMapper.deleteOrderDish(newDish.getOrderDishDetailId());
								int childCount = orderMapper.getOrderDishCountByParentId(newParentDishId);
								if(childCount <=0){
						 	    	OrderDish parentDish = orderMapper.qryOrderDishByDetailId(newParentDishId);
						 	    	orderMapper.deleteOrderDish(parentDish.getOrderDishDetailId());
						 	    }
							} 
						}
											
						child.setDishStorage(0);
						child.setDishStatus(IConstants.ORDER_DISH_RETREAT); 
						orderMapper.updateOrderDish(child);
					}else{
						orderMapper.deleteOrderDish(child.getOrderDishDetailId());
					}

					memberMapper.deleteMemberDishByDetailId(detailId);
				}
				
			} else if(orderDish.getIsset() == IConstants.DISH_IS_SET && orderDish.getDishCount() <= 0 ){
				List<OrderDish> childDishes = orderMapper.qryOrderDishByParentId(orderDishDetailId);
				for(OrderDish child:childDishes){ 
					memberMapper.setMemberDishCountByDetailId(child.getOldDetailId(),child.getDishCount());
					if(retreat){ 
						child.setDishStatus(IConstants.ORDER_DISH_RETREAT); 
						orderMapper.updateOrderDish(child); 
					}else{ 
						orderMapper.deleteOrderDish(child.getOrderDishDetailId());
					}
				} 
			}
		}
		if(retreat){
			orderDish.setDishStatus(IConstants.ORDER_DISH_RETREAT); 
			orderMapper.updateOrderDish(orderDish); 
		}else{
			orderMapper.deleteOrderDish(orderDishDetailId); 
		}
		
		Order order = orderMapper.qryOrderByOrderId(orderId); 
		   caclMoney(order);
		   orderMapper.updateOrder(order);
		   
	}

	public void updateOrderDish(OrderDish orderDish) {
		// TODO Auto-generated method stub
		orderMapper.updateOrderDish(orderDish);
	}
	public void orderDishNeed(OrderDish myDish) {
		// TODO Auto-generated method stub
		OrderDish orderDish = orderMapper.qryOrderDishByDetailId(myDish.getOrderDishDetailId());
		orderDish.setDishNeed(myDish.getDishNeed());
		orderMapper.updateOrderDish(orderDish);
	}

	public void deleteOrder(long orderId) {
		// TODO Auto-generated method stub
		orderMapper.deleteOrder(orderId);
	}

	public List<Order> qryOrderAndDetailList(Order order) {
		return orderMapper.qryOrderAndDetailList(order); 
	}
	
	public List<Order> qryOrderList(Order order) { 
		return orderMapper.qryOrderList(order); 
	}
	
	public List<OrderDish> qryOrderDishesByOrderId(Order order) { 
		return orderMapper.qryOrderDishesByOrderId(order.getOrderId()); 
	}
	
	
	public int orderCount(Order order) {
		return orderMapper.orderCount(order); 
	}

	  
	public long addOrderDish(OrderDish orderDish) {   
		orderDish.setDishCount(1);  
		long orderDishId  = -1;
		if(orderDish.getIsset() == IConstants.DISH_IS_SET){
			DishType dishType = dishMapper.findDishTypeById(orderDish.getDishTypeId()); 
			orderDish.setDishDiscount(0);
			orderDish.setDishGive(0);
			orderDish.setDishName(dishType.getDishTypeName());
			orderDish.setDishUnitPrice(dishType.getDishUnitPrice()); 
			orderDish.setIforder(IConstants.ORDER_NO_ORDER);
			orderDish.setDishStatus(IConstants.ORDER_STATUS_NEW);
			orderDishId = orderMapper.addOrderDish(orderDish);	
			orderDish.setDishTotalPrice(orderDish.getDishUnitPrice()*1);//默认一份
			List<SetDishRelation> relations = dishMapper.qrySetDishRelation(new SetDishRelation(dishType.getDishTypeId()));
			for(SetDishRelation rela : relations){ 
				if(rela.getSetId()>0){
					OrderDish newDish = new OrderDish(0,orderDish.getOrderId(),rela.getDishId(),orderDish.getOrderDishDetailId(),rela.getDishTypeId(),rela.getDishName(),rela.getCount(),1,rela.getDishUnit(),rela.getDishPrice(),rela.getCount()*rela.getDishPrice(),0,0,rela.getCount()
							,rela.getDishCanbeGive(),IConstants.ORDER_NO_ORDER,1,orderDish.getUserId(),"","",0,0,0);
					 orderMapper.addOrderDish(newDish);
				}
			}  
		}else{
			Dish dish  = dishMapper.findDishById(orderDish.getDishId());
			orderDish.setDishDiscount(0);
			orderDish.setDishGive(0);
			orderDish.setDishName(dish.getDishName());
			orderDish.setDishUnitPrice(dish.getDishPrice()); 
			orderDish.setDishStatus(IConstants.ORDER_STATUS_NEW);
			orderDish.setIforder(IConstants.ORDER_NO_ORDER);
			orderDishId = orderMapper.addOrderDish(orderDish);	 
		} 
		
		Order order = orderMapper.qryOrderByOrderId(orderDish.getOrderId()); 
		   order.setOrderStatus(IConstants.ORDER_NO_PAY);
		   caclMoney(order);
		   orderMapper.updateOrder(order);
	  		    
		return orderDishId;
	}
	
	public void caclMoney(Order order)
	{
	   float totalPrice = 0,totalDiscount=0,totalGive=0; 
		   
	   List<OrderDish> dishes = orderMapper.qryOrderDishesByOrderId(order.getOrderId());
		for(OrderDish dish : dishes){  
			if(dish.getParentDetailId()>0){
				continue;
			}
			if(dish.getDishStatus()==IConstants.ORDER_DISH_PAY || dish.getDishStatus()==IConstants.ORDER_DISH_RETREAT || dish.getIfgive()== IConstants.DISH_TYPE_GIVE){
				continue;
			}
			totalPrice += dish.getDishCount() * dish.getDishUnitPrice();
			totalDiscount += dish.getDishCount() * dish.getDishDiscount();
			totalGive += dish.getDishCount() * dish.getDishGive(); 
	    }
		order.setOrderSpend(totalPrice);
	    order.setOrderDiscount(totalDiscount);
	    order.setOrderGive(totalGive);  
	}

	public void editOrderDishes(long orderId) {
		// TODO Auto-generated method stub
	   Order order = orderMapper.qryOrderByOrderId(orderId);
	   order.setOrderStatus(IConstants.ORDER_NO_PAY);
	   this.caclMoney(order);
	   
	    orderMapper.updateOrder(order);   
	    List<OrderDish> orderDishes = orderMapper.qryOrderDishesByOrderId(orderId);
	    for(OrderDish orderDish: orderDishes){
	    	orderDish.setIforder(IConstants.ORDER_ORDER);
	    	orderDish.setOrderTime(DateUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
	    	this.updateOrderDish(orderDish);
	    }
	    
	    Dine dine = dineMapper.findDineById(order.getOrderTicketId()); 
		if(dine!=null){
			 DineTable desk = dineMapper.findTableById(dine.getDineDeskId()); 
			 desk.setTableStatus(IConstants.DESK_LOCK_TABLE_STATUS);
			 desk.setCurrentCost(order.getOrderSpend());
		   dineMapper.updateDineTable(desk);
		}
	}

	public void changeOrderDishCount(long detaiId, long orderId, int dishCount) {
		OrderDish orderDish = orderMapper.qryOrderDishByDetailId(detaiId);
	    int minus = dishCount - orderDish.getDishCount();
	    if(minus==0) return;
	    if(orderDish.getIsset() == IConstants.DISH_IS_SET){
	    	if(orderDish.getDishCount()==0) {
	    		//todo throw exception
	    		return;
	    	}
	    	List<OrderDish> orderDishes = orderMapper.qryOrderDishesByOrderId(orderId); 
	    	if(minus<0){
	    		for(OrderDish dish: orderDishes){ 
		 	    	if(dish.getDishCount()+dish.getDishStorage() < Math.abs(minus)*dish.getDishUnitCount() && dish.getParentDetailId() == detaiId){
		 	    		return;
		 	    	}
		 	    }
	    	}

	 	    for(OrderDish dish: orderDishes){ 
	 	    	if(dish.getParentDetailId() == detaiId){
	 	    		int newCount = dish.getDishCount() + minus * dish.getDishUnitCount();
		 	    	dish.setDishCount(newCount>0?newCount:0);
		 	    	//dish.setDishStorage(dish.getDishStorage()+(newCount<0?Math.abs(newCount)*dish.getDishUnitCount():0));
		 	    	dish.setDishTotalPrice(dish.getDishCount() * dish.getDishUnitPrice());
		 	    	if(newCount < dish.getDishStorage()){
			 	    	MemberDish memberDish = memberMapper.qryMemberDishByDetailId(dish.getOrderDishDetailId()); 
			 	    	memberDish.setDishCount(newCount); 
			 	    	memberMapper.updateMemberDish(memberDish);
			 	    	dish.setDishStorage(newCount);
			 	    }
		 	    	this.updateOrderDish(dish);
	 	    	} 
	 	    } 
	 	    orderDish.setDishCount(dishCount>0?dishCount:0); 
	 	    orderDish.setDishTotalPrice(orderDish.getDishCount() * orderDish.getDishUnitPrice());
	 	    if(dishCount < orderDish.getDishStorage()){
	 	    	MemberDish memberDish = memberMapper.qryMemberDishByDetailId(orderDish.getOrderDishDetailId()); 
	 	    	memberDish.setDishCount(dishCount); 
	 	    	memberMapper.updateMemberDish(memberDish);
	 	    	orderDish.setDishStorage(dishCount);
	 	    }
	 	    
	 	    this.updateOrderDish(orderDish);
	    }else{
	    	orderDish.setDishCount(dishCount>0?dishCount:0);
	 	    this.updateOrderDish(orderDish);
	    }
	    
	    //update order
	    Order order = orderMapper.qryOrderByOrderId(orderId);  
	    order.setOrderStatus(IConstants.ORDER_NO_PAY);
	    float totalPrice = 0,totalDiscount=0,totalGive=0; 
	   
	    List<OrderDish> dishes = orderMapper.qryOrderDishesByOrderId(orderId);
		for(OrderDish dish : dishes){  
			if(dish.getParentDetailId()>0){
				continue;
			}
			totalPrice += dish.getDishCount() * dish.getDishUnitPrice();
			totalDiscount += dish.getDishCount() * dish.getDishDiscount();
			totalGive += dish.getDishCount() * dish.getDishGive(); 
	    }
		order.setOrderSpend(totalPrice);
	    order.setOrderDiscount(totalDiscount);
	    order.setOrderGive(totalGive); 
	    order.setOrderId(orderId);
	    orderMapper.updateOrder(order);   
	}

	public void move2Storage(long detailId,int updateCount/*add 1 ,minus -1*/) {	//todo move set 	
		OrderDish orderDish = orderMapper.qryOrderDishByDetailId(detailId);
		if(orderDish== null || (updateCount<0  && orderDish.getDishCount()< Math.abs(updateCount))||orderDish.getDishStatus()==IConstants.ORDER_DISH_RETREAT){
			//todo throw exception
			return;
		}
		int minus = orderDish.getDishStorage()+updateCount;
	    if(minus<0) return;
	    if(updateCount == 1 && orderDish.getOldParentDetailId()==0  && orderDish.getDishCount()==orderDish.getDishStorage()) return; 
		
		DishType dishType = dishMapper.findDishTypeById(orderDish.getDishTypeId());
		Order order = orderMapper.qryOrderByOrderId(orderDish.getOrderId());
		if(order.getMemberId()<=0 || orderDish.getIsset() ==IConstants.DISH_IS_NOT_SET) return;
		MemberDish memberDish = new MemberDish();
		
		if(orderDish.getIfgive()== IConstants.DISH_TYPE_GIVE){
			MemberDish tmpDish = new MemberDish();
			tmpDish.setDishId(orderDish.getDishId());
			tmpDish.setDishUsingRange(IConstants.DISH_TYPE_GIVE);
			tmpDish.setMemberId(order.getMemberId());
			tmpDish.setIfPay(IConstants.MEMBER_DISH_PAY);
			List<MemberDish> mList = memberMapper.qryMemberDishList(tmpDish);
			if(mList.size()>0){
				tmpDish = mList.get(0);
				tmpDish.setDishCount(orderDish.getDishCount());
				memberMapper.updateMemberDish(tmpDish);
			}
			orderMapper.deleteOrderDish(orderDish.getOrderDishDetailId());
			return;
		}else{
			long tmpDetailId = orderDish.getOrderDishDetailId();
			if(orderDish.getOldParentDetailId()>0){
				tmpDetailId = orderDish.getOldDetailId();
			}
			List<MemberDish> memberDishes = memberMapper.qryMemberDishList(new MemberDish(order.getMemberId(),tmpDetailId,orderDish.getDishTypeId()));
			if(memberDishes.size()>0){ 
					for(MemberDish md:memberDishes){
						md.setDishCount(updateCount==0?orderDish.getDishCount():md.getDishCount()+updateCount);
						memberMapper.updateMemberDish(md);
					} 
			}else{ 
				if(orderDish.getParentDetailId()<=0){
					List<OrderDish> orderDishes = orderMapper.qryOrderDishesByOrderId(order.getOrderId());  
			 	    for(OrderDish dish: orderDishes){ 
			 	    	if(dish.getParentDetailId() == orderDish.getParentDetailId() && dish.getDishCount() !=dish.getDishStorage() && dish.getDishId()!=orderDish.getDishId()){
			 	    		tmpDetailId = orderDish.getOrderDishDetailId();
				 	   		if(orderDish.getOldParentDetailId()>0){
				 	   			tmpDetailId = orderDish.getOldDetailId();
				 	   		}
				 	   		memberDish.setDishCount(updateCount==0?dish.getDishCount():1);
							memberDish.setDishName(dish.getDishName());
							memberDish.setDishId(dish.getDishId());
							memberDish.setDishPrice(dish.getDishUnitPrice());
							memberDish.setDishTypeId(dish.getDishTypeId());
							memberDish.setDishUnit(dish.getDishUnit());
							memberDish.setDetailId(tmpDetailId);
							memberDish.setIfPay(dish.getDishStatus());
							//memberDish.setDishUsingRange(orderDish.get)
							memberDish.setMemberId(order.getMemberId());
							memberDish.setRelaDishTypeId(dish.getDishTypeId());
							memberDish.setRelaDishTypeName(dishType.getDishTypeName());
							memberDish.setStatus(IConstants.MEMBER_DISH_ENABLE);
							//memberDish.setUsingTIme(usingTIme)
							memberMapper.addMemberDish(memberDish);
			 	    	} 
			 	    }
				}else {
					memberDish.setDishCount(updateCount==0?orderDish.getDishCount():1);
					memberDish.setDishName(orderDish.getDishName());
					memberDish.setDishId(orderDish.getDishId());
					memberDish.setDishPrice(orderDish.getDishUnitPrice());
					memberDish.setDishTypeId(orderDish.getDishTypeId());
					memberDish.setDishUnit(orderDish.getDishUnit());
					memberDish.setDetailId(tmpDetailId);
					memberDish.setIfPay(orderDish.getDishStatus());
					//memberDish.setDishUsingRange(orderDish.get)
					memberDish.setMemberId(order.getMemberId());
					memberDish.setRelaDishTypeId(orderDish.getDishTypeId());
					memberDish.setRelaDishTypeName(dishType.getDishTypeName());
					memberDish.setStatus(IConstants.MEMBER_DISH_ENABLE);
					//memberDish.setUsingTIme(usingTIme)
					memberMapper.addMemberDish(memberDish);
				}
			}
		}
		
		orderDish.setDishStorage(updateCount==0?orderDish.getDishCount():minus);
		//orderDish.setDishCount(0);
		if(orderDish.getOldParentDetailId()>0){
			if(updateCount==0){
				long paentDishId= orderDish.getParentDetailId(); 
				orderMapper.deleteOrderDish(orderDish.getOrderDishDetailId());
				int childCount = orderMapper.getOrderDishCountByParentId(paentDishId);
				if(childCount <=0){
					orderMapper.deleteOrderDish(paentDishId);
				} 
			}else{  
				if(orderDish.getDishCount()-updateCount==0){
					orderMapper.deleteOrderDish(orderDish.getOrderDishDetailId());
				}else{
					orderDish.setDishStorage(orderDish.getDishCount()-updateCount);
					orderDish.setDishCount(orderDish.getDishCount()-updateCount);
					orderMapper.updateOrderDish(orderDish);
				}				
				
				if(updateCount==1){
					long paentDishId= orderDish.getParentDetailId();  
					int childCount = orderMapper.getOrderDishCountByParentId(paentDishId);
					if(childCount <=0){
						orderMapper.deleteOrderDish(paentDishId);
					}
				}
			} 
		}else{
			orderMapper.updateOrderDish(orderDish);
			if(orderDish.getParentDetailId() >0 ){
				int childCount = orderMapper.getOrderDishCountByParentId(orderDish.getParentDetailId());
				if(childCount <=0){
		 	    	OrderDish parentDish = orderMapper.qryOrderDishByDetailId(orderDish.getParentDetailId());
		 	    	if(parentDish.getIforder() == IConstants.ORDER_NO_ORDER){
		 	    		parentDish.setDishStorage(parentDish.getDishCount());
		 	 	    	//parentDish.setDishCount(0);
		 	 	    	orderMapper.updateOrderDish(parentDish); 
		 	    	} 
		 	    }
			}
		} 
 	    
 	 //update order  
	    order.setOrderStatus(IConstants.ORDER_NO_PAY);
	    this.caclMoney(order);
	    orderMapper.updateOrder(order);
	}
	
	public void move2Order(long orderId,long memberDishId) {		 
		Order order = orderMapper.qryOrderByOrderId(orderId); 
		MemberDish memberDish = memberMapper.qryMemberDishById(memberDishId);
		if(order.getMemberId()!=memberDish.getMemberId()) return;
		List<OrderDish> orderDishes = orderMapper.qryOrderDishesByOrderId(order.getOrderId());  
		boolean hadMove = false;
 	    for(OrderDish dish: orderDishes){ 
 	    	if(dish.getOldParentDetailId() ==0 && dish.getOrderDishDetailId() == memberDish.getDetailId() && dish.getIforder()==IConstants.ORDER_NO_ORDER){
 	    		dish.setDishCount(dish.getDishCount()-dish.getDishStorage()+memberDish.getDishCount());
 	    		dish.setDishStorage(dish.getDishStorage()-memberDish.getDishCount()); 
 	    		orderMapper.updateOrderDish(dish);
 	    		hadMove = true;
 	    		break;
 	    	}
 	    }
 	    
 	   if(!hadMove){ 
 		   OrderDish orderDish = orderMapper.qryOrderDishByDetailId(memberDish.getDetailId());
 		   List<OrderDish> listDish = orderMapper.qryOrderDishesByOrderId(orderId);
 		   boolean hadAdd = false;
 		   OrderDish parentDish = null;
 		   for(OrderDish dish:listDish){
 			   if(dish.getIsset()==IConstants.DISH_IS_SET && dish.getIforder() == IConstants.ORDER_NO_ORDER && dish.getDishCount()==0 && orderDish.getDishTypeId() == dish.getDishTypeId()){
 				   hadAdd = true;
 				   parentDish = dish;
 				   break;
 			   }
 		   }
 		   
 		   if(memberDish.getDetailId()!=0){
 			  if(!hadAdd){  
 	 			   parentDish = orderMapper.qryOrderDishByDetailId(orderDish.getParentDetailId()); 
 	 	 		   parentDish.setDishCount(0);
 	 	 		   parentDish.setOrderId(orderId); 
 	 	 		   parentDish.setIforder(IConstants.ORDER_NO_ORDER);
 	 	 		   orderMapper.addOrderDish(parentDish);  
 	 		   } 		   
 	 		   
 	 		   if(orderDish.getOldDetailId()<=0){
 	 			  orderDish.setOldParentDetailId(orderDish.getParentDetailId());
 	 			  orderDish.setOldDetailId(memberDish.getDetailId());
 	 		   }
 	 		 orderDish.setParentDetailId(parentDish.getOrderDishDetailId());
 		   }
 		  
 		   if(orderDish== null){
 		      orderDish = new OrderDish();
 		      orderDish.setDeskId(order.getOrderTicketId());
 		      orderDish.setDishName(memberDish.getDishName());
 		      orderDish.setDishId(memberDish.getDishId());
 		      orderDish.setDishStatus(IConstants.ORDER_DISH_PAY);
 		      orderDish.setDishStorage(0);
 		      orderDish.setDishTypeId(memberDish.getDishTypeId());
 		      orderDish.setOrderId(order.getOrderId());
 		      orderDish.setOrderNum(order.getOrderNum());
 		      orderDish.setMemberId(memberDish.getMemberId());
 		      orderDish.setIfgive(IConstants.DISH_TYPE_GIVE);
 		   }
 		   orderDish.setOrderDishDetailId(0); 		   
 		   orderDish.setDishStorage(0);
 		   orderDish.setIforder(IConstants.ORDER_NO_ORDER);
 		   orderDish.setDishCount(memberDish.getDishCount());
 		   orderDish.setOrderId(orderId);
 		   orderMapper.addOrderDish(orderDish);  
 	   } 
 	   
		memberDish.setDishCount(0); 
		memberMapper.updateMemberDish(memberDish); 
		
		//update order  
	    order.setOrderStatus(IConstants.ORDER_NO_PAY);
	    this.caclMoney(order);
	    orderMapper.updateOrder(order);
	}
	
}
