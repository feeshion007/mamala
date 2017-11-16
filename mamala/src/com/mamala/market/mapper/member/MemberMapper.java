package com.mamala.market.mapper.member;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.member.Member;
import com.mamala.market.pojo.member.MemberChargeLog;
import com.mamala.market.pojo.member.MemberDish;
import com.mamala.market.pojo.member.MemberGroup;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr;

public interface MemberMapper {

	public List<Member> qryMemberList(Member member);

	public List<MemberGroup> qryMemberGroupList(MemberGroup memberGroup);

	public void addMember(Member member);

	public void updateMember(Member member);

	public void addMemberGroup(MemberGroup memberGroup);

	public void updateMemberGroup(MemberGroup memberGroup);

	public void deleteMemberGroup(@Param("groupId") long memberGroupId);

	public void deleteMember(@Param("memberId") long memberId);

	public void addMemberDish(MemberDish memberDish);

	public void updateMemberDish(MemberDish memberDish);

	public void deleteMemberDish(@Param("memberDishId") long memberDishId);

	public List<MemberDish> qryMemberDishByMemberId(@Param("memberId") long memberId);
	
	public List<MemberDish> qryMemberDishList(MemberDish memberDish);

	public MemberDish qryMemberDishById(@Param("memberDishId")long memberDishId);

	public void deleteMemberDishByDetailId(@Param("orderDishDetailId") long orderDishDetailId);

	public void setMemberDishCountByDetailId(@Param("orderDishDetailId") long orderDishDetailId,@Param("dishCount")int dishCount);

	public MemberDish qryMemberDishByDetailId(@Param("detailId") long orderDishDetailId);

	public MemberDish qryMemberDishByMemberDetailId(@Param("memberId")long memberId, @Param("dishId")long dishId,@Param("ifPay")int ifPay);

	public Member qryMemberById(@Param("memberId")long memberId);

	public List<Member> qryMemberListByCheck(Member member);

	public int hasMember(@Param("groupId")long groupId);

	public int hasChild(@Param("groupId")long groupId);

	public void addMemberChargeLog(MemberChargeLog log);

	public int qryMemberCount(Member member);
 
}
