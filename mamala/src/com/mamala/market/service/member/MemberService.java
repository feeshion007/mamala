package com.mamala.market.service.member;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mamala.common.util.IConstants;
import com.mamala.market.mapper.dine.DineMapper;
import com.mamala.market.mapper.member.MemberMapper;
import com.mamala.market.mapper.order.OrderMapper;
import com.mamala.market.mapper.sys.StoreMapper;
import com.mamala.market.mapper.sys.SysAttrMapper;
import com.mamala.market.pojo.dine.Dine;
import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.member.Member;
import com.mamala.market.pojo.member.MemberChargeLog;
import com.mamala.market.pojo.member.MemberDish;
import com.mamala.market.pojo.member.MemberGroup;
import com.mamala.market.pojo.order.Order;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 
import com.mamala.market.pojo.order.OrderDish;

@Service
public class MemberService {

	private static Logger logger = Logger.getLogger(MemberService.class);
 
    @Autowired
    private MemberMapper memberMapper; 
    @Autowired
    private OrderMapper orderMapper;
 
    public void addMember(Member member) {
		memberMapper.addMember(member);
		
	}
	public void updateMember(Member member) {
		memberMapper.updateMember(member); 
	}
	public void memberRecharge(Member myMember) {
		Member member = memberMapper.qryMemberById(myMember.getMemberId());
		member.setRemainMoney(myMember.getRemainMoney());
		memberMapper.updateMember(member); 
		MemberChargeLog log = new MemberChargeLog(0, member.getMemberId(),IConstants.MEMBER_OBJ_TYPE_RECHARGE, member.getCardNumber(),
				myMember.getChargeType(),myMember.getRechargeMoney(),myMember.getChargeDiscount(),
				myMember.getRemainMoney(), myMember.getRemainMoney(),myMember.getRemarks(), myMember.getUserId());
		memberMapper.addMemberChargeLog(log);
	}
	public List<Member> qryMemberList(Member member) {
		List<Member> MemberList = null;
		if(member.isCheck()){
			 MemberList =  memberMapper.qryMemberListByCheck(member);
		}else{
			 MemberList =  memberMapper.qryMemberList(member);
		}
		
        return MemberList;
	}
	public void addMemberGroup(MemberGroup MemberGroup) {
		memberMapper.addMemberGroup(MemberGroup);
		
	}
	public void updateMemberGroup(MemberGroup memberGroup) {
		memberMapper.updateMemberGroup(memberGroup);
		
	}
	public List<MemberGroup> qryMemberGroupList(MemberGroup memberGroup) {
		List<MemberGroup> MemberList =  memberMapper.qryMemberGroupList(memberGroup);
        return MemberList;
	}
	public void deleteMemberGroup(long groupId) {
		if(memberMapper.hasChild(groupId) >0 || memberMapper.hasMember(groupId) >0){
			return;
		}
		memberMapper.deleteMemberGroup(groupId);
		
	}
	public void deleteMember(long memberId) {
		memberMapper.deleteMember(memberId);
		
	}
	public void addMemberDish(MemberDish memberDish) { 
		memberMapper.addMemberDish(memberDish);
	}
	public void updateMemberDish(MemberDish memberDish) { 
		memberMapper.updateMemberDish(memberDish);
	}
	public void deleteMemberDish(long memberDishId) {
		memberMapper.deleteMemberDish(memberDishId);
		
	}
	public List<MemberDish> qryMemberDishByDeskId(long dineId) {  
		Order order = new Order(); 
		List<Order> orderList = orderMapper.qryOrderByTicketId(dineId);
		if(orderList.size()<=0) return new ArrayList<MemberDish>();
		order = orderList.get(0);
		if(order.getMemberId()>0){
			 List<MemberDish> memberDishes =  memberMapper.qryMemberDishByMemberId(order.getMemberId());
			 List<MemberDish> list = new ArrayList<MemberDish>();
	            for(MemberDish dish :memberDishes){
	            	OrderDish orderDish = orderMapper.qryOrderDishByDetailId(dish.getDetailId());
	            	if(orderDish!=null){
	            		if(orderDish.getOrderId() != order.getOrderId() && dish.getIfPay()==IConstants.MEMBER_DISH_PAY){
		            		list.add(dish);
		            	}else if(orderDish.getOrderId() == order.getOrderId()){
		            		list.add(dish);
		            	}
	            	}else{
	            		list.add(dish);
	            	}
	            }
			return list;
		}	
        return new ArrayList<MemberDish>();
	}
	
	public List<MemberDish> qryMemberDishByOrderId(long orderId) {  
		Order order = orderMapper.qryOrderByOrderId(orderId); 
		if(order !=null && order.getMemberId()>0){
			 List<MemberDish> memberDishes =  memberMapper.qryMemberDishByMemberId(order.getMemberId());
			 List<MemberDish> list = new ArrayList<MemberDish>();
	            for(MemberDish dish :memberDishes){
	            	OrderDish orderDish = orderMapper.qryOrderDishByDetailId(dish.getDetailId());
	            	if(orderDish!=null){
	            		if(orderDish.getOrderId() != order.getOrderId() && dish.getIfPay()==IConstants.MEMBER_DISH_PAY){
		            		list.add(dish);
		            	}else if(orderDish.getOrderId() == order.getOrderId()){
		            		list.add(dish);
		            	}
	            	}else{
	            		list.add(dish);
	            	}
	            }
			return list;
		}	
        return new ArrayList<MemberDish>();
	}
	public List<MemberDish> qryMemberDishByMemberId(long memberId) {
		List<MemberDish> memberDishes =  memberMapper.qryMemberDishByMemberId(memberId);
		return memberDishes;
	}
	public void addMemberGiveDish(MemberDish memberDish) {
		memberDish.setIfPay(IConstants.MEMBER_DISH_PAY);
		memberDish.setDishUsingRange(4);
		List<MemberDish> dishes = memberMapper.qryMemberDishList(memberDish);
		if(dishes==null || dishes.size()==0){
			memberDish.setDishCount(1);
			this.memberMapper.addMemberDish(memberDish);
		}else{ 
			memberDish = dishes.get(0);
			memberDish.setDishCount(memberDish.getDishCount()+1);
			this.memberMapper.updateMemberDish(memberDish);
		}
		
	}
	public void updateMemberGiveDish(MemberDish memberDish) {
		MemberDish dish = this.memberMapper.qryMemberDishById(memberDish.getMemberDishId());
		if(dish.getDishCount()-1<0) return;
		dish.setDishCount(dish.getDishCount()-1); 
		this.memberMapper.updateMemberDish(dish);
		
	}
	public int qryMemberCount(Member member) {
		return this.memberMapper.qryMemberCount(member);
	}
}
