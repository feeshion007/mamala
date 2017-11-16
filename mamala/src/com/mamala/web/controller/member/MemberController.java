package com.mamala.web.controller.member;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;
import org.dom4j.DocumentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONException;
import com.alibaba.fastjson.JSONObject;
import com.mamala.common.util.IConstants;
import com.mamala.common.util.StrUtil;
import com.mamala.market.pojo.common.User;
import com.mamala.market.pojo.member.Member;
import com.mamala.market.pojo.member.MemberDish;
import com.mamala.market.pojo.member.MemberGroup;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 
import com.mamala.market.service.member.MemberService;
import com.mamala.market.service.order.OrderService;
import com.mamala.market.service.sys.SysManagerService;
import com.mamala.web.support.JsonBodyParse;

@Controller
@RequestMapping(value = "/memberController")
public class MemberController {

    private static Logger logger = Logger.getLogger(MemberController.class);

    @Autowired
    private MemberService memberService;
    
    //start manager member
    @RequestMapping(value = "/editMember", method = RequestMethod.POST)
    public void editMember(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY);
            String[] args = {"member_id","member_name","group_id","group_name","card_number","disabled","phone","sex","birthday","address","remarks","weixin"};
            JsonBodyParse.argumentExitsTest(content, args);
            Member member = new Member(); ; 
            member.setMemberId(NumberUtils.toLong(content.getString("member_id")));
            member.setMemberName(content.getString("member_name"));
            member.setCardNumber(content.getString("card_number"));
            member.setGroupId(NumberUtils.toLong(content.getString("group_id")));
            member.setGroupName(content.getString("group_name")); 
            member.setPhone(content.getString("phone"));
            member.setSex(NumberUtils.toInt(content.getString("sex"))); 
            member.setAddress(content.getString("address"));
            member.setDisabled(NumberUtils.toInt(content.getString("disabled"))); 
            member.setWeixin(content.getString("weixin")); 
            member.setBirthday(content.getString("birthday")); 
            member.setUserId(user.getUserID());
            member.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            if(member.getStoreId()==0){
            	member.setStoreId(user.getStoreId());
            }
           
            if(StrUtil.isEmpty(content.getString("member_id"))){
            	memberService.addMember(member);
            }else{
            	memberService.updateMember(member);
            } 
            
            retCode = 100;
            descStr = "完成更新";
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } 

        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);

        resJson.put("sign", "null");
        resJson.put("content", contentJson);

        logger.info(resJson.toString());

        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());

    }

    @RequestMapping(value = "/deleteMember", method = RequestMethod.POST)
    public void deleteMember(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long memberId = NumberUtils.toLong(content.getString("member_id"));
              
        	memberService.deleteMember(memberId);
            retCode = 100;
            descStr = "删除成功";
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        }

        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);

        resJson.put("sign", "null");
        resJson.put("content", contentJson);

        logger.info(resJson.toString());

        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
    }
    
    /**
     * 门店列表
     * @param body
     * @param request
     * @param response
     * @throws IOException
     */
    @RequestMapping(value = "qryMemberList", method = RequestMethod.POST)
    public void qryMemberList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        JSONObject resJson = new JSONObject(); 
        JSONObject content = JSON.parseObject(body);

        HttpSession session = request.getSession();  
        User user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
//        if(user.getRoleID() == 1){
//            content.put("userId", -1);
//        }else{
//            content.put("userId", user.getUserID());
//        }
        try{
        	String[] args = {"member_id","member_name","group_id","group_name","card_number","remain_money","disabled","phone","sex","birthday","address","remarks","weixin"};
            //JsonBodyParse.argumentExitsTest(content, args);
            Member member = new Member(); ; 
            member.setMemberId(NumberUtils.toLong(content.getString("member_id")));
            member.setMemberName(content.getString("member_name"));
            member.setCardNumber(content.getString("card_number"));
            member.setGroupId(NumberUtils.toLong(content.getString("group_id")));
            member.setGroupName(content.getString("group_name"));
            member.setRemainMoney(content.getFloatValue("remain_money"));
            member.setPhone(content.getString("phone"));
            member.setSex(content.getIntValue("sex"));
            member.setAddress(content.getString("address"));
            member.setDisabled(content.getIntValue("address"));
            member.setWeixin(content.getString("weixin")); 
            member.setBirthday(content.getString("birthday")); 
            member.setCheck(content.getBoolean("check"));
            member.setUserId(user.getUserID());
            member.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            if(member.getStoreId()==0 && user.getUserID()!=0){
            	member.setQryStore(user.getStoreId()+"");
            }else if(member.getStoreId()>0){
            	member.setQryStore(member.getStoreId()+"");
            }
           
            int start =NumberUtils.toInt(content.getString("start"));
        	int length =NumberUtils.toInt(content.getString("length"));  
        	JSONObject search = JSON.parseObject(content.getString("search"));
        	if(search!=null){
        		String key = search.getString("value");
            	member.setStart(start);
            	member.setLength(length);
            	member.setQryKey(key);
        	}
            List<Member> list = memberService.qryMemberList(member); 
            int totalCount = memberService.qryMemberCount(member);
            resJson.put("draw",0);
            resJson.put("recordsTotal", totalCount);
            resJson.put("recordsFiltered", totalCount) ;
            resJson.put("data", list);
        }catch (Exception e){
            e.printStackTrace();
            resJson.put("code", "107");
            resJson.put("code", e.getMessage());
        }
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("application/json");
        response.getWriter().write(resJson.toString());
    }
    
  //start manager member
    @RequestMapping(value = "/editMemberGroup", method = RequestMethod.POST)
    public void editMemberGroup(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY);
            String[] args = {"group_id","group_name","up_group_id","up_group_name","rebate"};
            JsonBodyParse.argumentExitsTest(content, args);
            MemberGroup group = new MemberGroup(); ; 
            group.setGroupId(NumberUtils.toLong(content.getString("group_id")));
            group.setGroupName(content.getString("group_name"));
            group.setUpGroupName(content.getString("up_group_name"));
            group.setUpGroupId(NumberUtils.toLong(content.getString("up_group_id")));
            group.setRebate(content.getFloatValue("rebate"));
            group.setUserId(user.getUserID());
            group.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            if(group.getStoreId()==0){
            	group.setStoreId(user.getStoreId());
            }
           
            if(StrUtil.isEmpty(content.getString("group_id"))){
            	memberService.addMemberGroup(group);
            }else{
            	memberService.updateMemberGroup(group);
            } 
            
            retCode = 100;
            descStr = "完成更新";
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } 

        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);

        resJson.put("sign", "null");
        resJson.put("content", contentJson);

        logger.info(resJson.toString());

        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());

    }

    @RequestMapping(value = "/deleteMemberGroup", method = RequestMethod.POST)
    public void deleteMemberGroup(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long groupId = NumberUtils.toLong(content.getString("group_id"));
              
        	memberService.deleteMemberGroup(groupId);
            retCode = 100;
            descStr = "删除成功";
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        }

        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);

        resJson.put("sign", "null");
        resJson.put("content", contentJson);

        logger.info(resJson.toString());

        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
    }
    
    /**
     * 门店列表
     * @param body
     * @param request
     * @param response
     * @throws IOException
     */
    @RequestMapping(value = "qryMemberGroupList", method = RequestMethod.POST)
    public void qryMemberGroupList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        JSONObject resJson = new JSONObject(); 
        JSONObject content = JSON.parseObject(body);

        HttpSession session = request.getSession();  
        User user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
//        if(user.getRoleID() == 1){
//            content.put("userId", -1);
//        }else{
//            content.put("userId", user.getUserID());
//        }
        try{
        	String[] args = {"group_id","group_name","up_group_id","up_group_name","rebate"};
            //JsonBodyParse.argumentExitsTest(content, args);
            MemberGroup group = new MemberGroup(); ; 
            group.setGroupId(NumberUtils.toLong(content.getString("group_id")));
            group.setGroupName(content.getString("group_name"));
            group.setUpGroupName(content.getString("up_group_name"));
            group.setUpGroupId(NumberUtils.toLong(content.getString("up_group_id")));
            group.setRebate(content.getFloatValue("rebate"));
            group.setUserId(user.getUserID());
            group.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            if(group.getStoreId()==0 && user.getUserID()!=0){
            	group.setQryStore(user.getStoreId()+"");
            }else if(group.getStoreId()>0){
            	group.setQryStore(group.getStoreId()+"");
            }
            List<MemberGroup> list = memberService.qryMemberGroupList(group); 
            resJson.put("draw",0);
            resJson.put("recordsTotal", list.size());
            resJson.put("recordsFiltered", list.size()) ;
            resJson.put("data", list);
        }catch (Exception e){
            e.printStackTrace();
            resJson.put("code", "107");
            resJson.put("code", e.getMessage());
        }
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("application/json");
        response.getWriter().write(resJson.toString());
    }
    
    
  //start manager member
    @RequestMapping(value = "/editMemberDish", method = RequestMethod.POST)
    public void editMemberDish(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
            String[] args = {"member_dish_id","member_id","dish_id","dish_name","dish_price","dish_count","status","dish_type_id","rela_dish_type_id","dish_using_range"};
            JsonBodyParse.argumentExitsTest(content, args);
            MemberDish memberDish = new MemberDish(); ;
            memberDish.setMemberDishId(NumberUtils.toLong(content.getString("member_dish_id"))); 
            memberDish.setMemberId(NumberUtils.toLong(content.getString("member_id")));
            memberDish.setDishId(NumberUtils.toLong(content.getString("dish_id")));
            memberDish.setDishName(content.getString("dish_name"));
            memberDish.setDishPrice(NumberUtils.toFloat(content.getString("member_id")));
            memberDish.setDishCount(NumberUtils.toInt(content.getString("dish_count")));
            memberDish.setStatus(NumberUtils.toInt(content.getString("status")));
            memberDish.setDishTypeId(NumberUtils.toInt(content.getString("dish_type_id")));
            memberDish.setRelaDishTypeId(NumberUtils.toInt(content.getString("rela_dish_type_id")));
            memberDish.setDishUsingRange(NumberUtils.toInt(content.getString("dish_using_range"))); 
            
           
            if(StrUtil.isEmpty(content.getString("member_dish_id"))){
            	memberService.addMemberDish(memberDish);
            }else{
            	memberService.updateMemberDish(memberDish);
            } 
            
            retCode = 100;
            descStr = "完成更新";
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } 

        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);

        resJson.put("sign", "null");
        resJson.put("content", contentJson);

        logger.info(resJson.toString());

        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());

    }
    
    
    @RequestMapping(value = "/editMemberGiveDish", method = RequestMethod.POST)
    public void editMemberGiveDish(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
            String[] args = {"member_dish_id","member_id","dish_id"};
            JsonBodyParse.argumentExitsTest(content, args);
            MemberDish memberDish = new MemberDish(); ;
            memberDish.setMemberDishId(NumberUtils.toLong(content.getString("member_dish_id"))); 
            memberDish.setMemberId(NumberUtils.toLong(content.getString("member_id")));
            memberDish.setDishId(NumberUtils.toLong(content.getString("dish_id")));
            memberDish.setDishName(content.getString("dish_name"));
            memberDish.setDishPrice(NumberUtils.toFloat(content.getString("member_id")));
            memberDish.setDishCount(NumberUtils.toInt(content.getString("dish_count")));
            memberDish.setStatus(NumberUtils.toInt(content.getString("status")));
            memberDish.setDishUnit(content.getString("dish_unit"));
            memberDish.setDishTypeId(NumberUtils.toInt(content.getString("dish_type_id")));
            memberDish.setRelaDishTypeId(NumberUtils.toInt(content.getString("rela_dish_type_id")));
            memberDish.setRelaDishTypeName(content.getString("rela_dish_type_name"));
            memberDish.setDishUsingRange(NumberUtils.toInt(content.getString("dish_using_range"))); 
            
           
            if(StrUtil.isEmpty(content.getString("member_dish_id"))){
            	memberService.addMemberGiveDish(memberDish);
            }else{
            	memberService.updateMemberGiveDish(memberDish);
            } 
            
            retCode = 100;
            descStr = "完成更新";
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } 

        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);

        resJson.put("sign", "null");
        resJson.put("content", contentJson);

        logger.info(resJson.toString());

        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());

    }

    @RequestMapping(value = "/deleteMemberDish", method = RequestMethod.POST)
    public void deleteMemberDish(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long memberDishId = NumberUtils.toLong(content.getString("member_dish_id"));
              
        	memberService.deleteMemberDish(memberDishId);
            retCode = 100;
            descStr = "删除成功";
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        }

        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);

        resJson.put("sign", "null");
        resJson.put("content", contentJson);

        logger.info(resJson.toString());

        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
    }
    
    /**
     * 门店列表
     * @param body
     * @param request
     * @param response
     * @throws IOException
     */
    @RequestMapping(value = "qryMemberDishList", method = RequestMethod.POST)
    public void qryMemberDishList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        JSONObject resJson = new JSONObject(); 
        JSONObject content = JSON.parseObject(body);

        HttpSession session = request.getSession();  
//        User user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
//        if(user.getRoleID() == 1){
//            content.put("userId", -1);
//        }else{
//            content.put("userId", user.getUserID());
//        }
        try{
        	String[] args = {"order_id","desk_id"}; //{"member_dish_id","member_id","dish_id","status","dish_type_id","rela_dish_type_id","dish_using_range"};
            JsonBodyParse.argumentExitsTest(content, args);
            MemberDish memberDish = new MemberDish();
            memberDish.setMemberDishId(NumberUtils.toLong(content.getString("member_dish_id"))); 
            memberDish.setMemberId(NumberUtils.toLong(content.getString("member_id")));
            memberDish.setDishId(NumberUtils.toLong(content.getString("dish_id")));  
            memberDish.setStatus(NumberUtils.toInt(content.getString("status")));
            memberDish.setDishTypeId(NumberUtils.toInt(content.getString("dish_type_id")));
            memberDish.setRelaDishTypeId(NumberUtils.toInt(content.getString("rela_dish_type_id")));
            memberDish.setDishUsingRange(NumberUtils.toInt(content.getString("dish_using_range"))); 
            
            List<MemberDish> list  = new ArrayList<MemberDish>();
            if(NumberUtils.toLong(content.getString("order_id"))!=0){
            	list = memberService.qryMemberDishByOrderId(NumberUtils.toLong(content.getString("order_id"))); 
            }else if(NumberUtils.toLong(content.getString("desk_id"))!=0){
            	 list = memberService.qryMemberDishByDeskId(NumberUtils.toLong(content.getString("desk_id"))); 
            }else if(NumberUtils.toLong(content.getString("member_id"))!=0){
            	 list = memberService.qryMemberDishByMemberId(NumberUtils.toLong(content.getString("member_id"))); 
            }
           
            resJson.put("draw",0);
            resJson.put("recordsTotal", list.size());
            resJson.put("recordsFiltered", list.size()) ;
            resJson.put("data", list);
            resJson.put("code", 100);
        }catch (Exception e){
            e.printStackTrace();
            resJson.put("code", "107");
            resJson.put("code", e.getMessage());
        }
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("application/json");
        response.getWriter().write(resJson.toString());
    }
    
    
    @RequestMapping(value = "/memberRecharge", method = RequestMethod.POST)
    public void memberRecharge(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
            String[] args = {"member_id","remain_money"};
            JsonBodyParse.argumentExitsTest(content, args);
            Member member = new Member(); ; 
            member.setMemberId(NumberUtils.toLong(content.getString("member_id")));
            member.setRemarks(content.getString("remarks"));
            member.setChargeType(NumberUtils.toInt(content.getString("charge_type")));
            member.setRechargeMoney(NumberUtils.toFloat(content.getString("recharge_money")));
            member.setChargeDiscount(NumberUtils.toFloat(content.getString("discount_money"))); 
            member.setRemainMoney(NumberUtils.toFloat(content.getString("remain_money")));
             
           
            if(!StrUtil.isEmpty(content.getString("member_id"))){ 
            	memberService.memberRecharge(member);
            } 
            
            retCode = 100;
            descStr = "完成更新";
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = e.getMessage();
        } 

        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);

        resJson.put("sign", "null");
        resJson.put("content", contentJson);

        logger.info(resJson.toString());

        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());

    }
}
