package com.mamala.web.controller.order;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;

import javax.management.relation.Relation;
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
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONException;
import com.alibaba.fastjson.JSONObject;
import com.mamala.common.util.IConstants;
import com.mamala.common.util.StrUtil;
import com.mamala.market.pojo.common.User;
import com.mamala.market.pojo.dine.Dine;
import com.mamala.market.pojo.dine.DineTable;
import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.dish.SetDishRelation;
import com.mamala.market.pojo.order.Order;
import com.mamala.market.pojo.order.OrderDish;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 
import com.mamala.market.service.dine.DineService;
import com.mamala.market.service.dish.DishService;
import com.mamala.market.service.member.MemberService;
import com.mamala.market.service.order.OrderService;
import com.mamala.market.service.sys.SysManagerService;
import com.mamala.web.support.JsonBodyParse;

@Controller
@RequestMapping(value = "/orderController")
public class OrderController {

    private static Logger logger = Logger.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;
    @Autowired
    private DishService dishService; 
    
   
    @RequestMapping(value = "/editOrder", method = RequestMethod.POST)
    public void editOrder(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);
        
        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY); 
            String[] args = {"order_id"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            JsonBodyParse.argumentExitsTest(content, args);
            Order order = new Order(); ; 
            order.setOrderId(NumberUtils.toLong(content.getString("order_id"))); 
            order.setOrderNum(content.getString("order_num"));
            order.setOrderType(NumberUtils.toInt(content.getString("order_type"))); 
            order.setOrderTicketId(NumberUtils.toLong(content.getString("order_ticket_id")));
            order.setOrderTicketName(content.getString("order_ticket_name"));            
            order.setOrderPay(NumberUtils.toFloat(content.getString("order_pay"))); 
            order.setSenderUserId(NumberUtils.toLong(content.getString("sender_user_id")));
            order.setSenderUserName(content.getString("sender_user_name"));           
            order.setOrderAddress(content.getString("order_address"));   
            order.setOrderCorpAddress(content.getString("order_corp_address"));   
            order.setOrderBuyer(content.getString("order_buyer"));   
	       	order.setPhone(content.getString("phone"));     
	       	order.setCardNumber(content.getString("card_number"));
	       	order.setOrderStartTime(content.getString("start_time"));
	       	order.setOrderEndTime(content.getString("end_time")); 
	       	order.setMemberId(NumberUtils.toLong(content.getString("member_id")));              
            order.setUserId(user.getUserID());
            order.setStoreId(user.getStoreId());
            if(order.getStoreId()==0){
            	order.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            }
            
            if(StrUtil.isEmpty(content.getString("order_id"))){
            	order.setIfpay(IConstants.ORDER_NO_PAY);  
            	order.setOrderStatus(IConstants.ORDER_STATUS_NEW);
            	orderService.addOrder(order);
            }else{ 
            	if(order.getOrderPay()>0){
            		order.setIfpay(IConstants.ORDER_PAY); 
            	}else{
            		order.setIfpay(IConstants.ORDER_NO_PAY);
            	}
            	orderService.updateOrder(order);
            } 
            
            contentJson.put("order", order);
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
    
    @RequestMapping(value = "/editOrderDish", method = RequestMethod.POST)
    public void editOrderDish(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);
        User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY); 
        try { 
            String[] args = {"order_dish_detail_id","order_id","dish_id","dish_type_id","dish_count","isset"};
            JsonBodyParse.argumentExitsTest(content, args);
            OrderDish orderDish = new OrderDish(); 
            orderDish.setOrderDishDetailId(NumberUtils.toLong(content.getString("order_dish_detail_id"))); 
            orderDish.setDeskId(NumberUtils.toLong(content.getString("desk_id"))); 
            orderDish.setOrderId(NumberUtils.toLong(content.getString("order_id"))); 
            orderDish.setDishId(NumberUtils.toLong(content.getString("dish_id"))); 
            orderDish.setDishName(content.getString("dish_names"));
            orderDish.setDishTypeId(NumberUtils.toInt(content.getString("dish_type_id"))); 
            orderDish.setDishGive(NumberUtils.toFloat(content.getString("dish_give")));
            orderDish.setDishDiscount(NumberUtils.toFloat(content.getString("dish_discount")));
            orderDish.setDishCount(NumberUtils.toInt(content.getString("dish_count")));
            orderDish.setIsset(NumberUtils.toInt(content.getString("isset")));
            orderDish.setDishNeed(content.getString("dish_need"));  
            orderDish.setDishUnit(content.getString("dish_unit"));
            orderDish.setUserId(user.getUserID());
             
            if(StrUtil.isEmpty(content.getString("order_dish_detail_id"))){  
            	orderService.addOrderDish(orderDish);
            }else{ 
            	orderService.changeOrderDishCount(orderDish.getOrderDishDetailId(),orderDish.getOrderId(),orderDish.getDishCount());
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
    
    @RequestMapping(value = "/orderDishes", method = RequestMethod.POST)
    public void orderDishes(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {  
            String[] args = {"order_id"};
            JsonBodyParse.argumentExitsTest(content, args);
            long orderId = NumberUtils.toLong(content.getString("order_id"));
            
            if(!StrUtil.isEmpty(content.getString("order_id"))){  
            	orderService.editOrderDishes(orderId);
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
    
    @RequestMapping(value = "/move2Storage", method = RequestMethod.POST)
    public void move2Storage(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
            String[] args = {"detail_id"};
            JsonBodyParse.argumentExitsTest(content, args);
            long detailId = NumberUtils.toLong(content.getString("detail_id"));
            int updateCount = NumberUtils.toInt(content.getString("update_count"));
            
            if(!StrUtil.isEmpty(content.getString("detail_id"))){  
            	orderService.move2Storage(detailId,updateCount);
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
    
    @RequestMapping(value = "/move2Order", method = RequestMethod.POST)
    public void move2Order(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
            String[] args = {"order_id","member_dish_id"};
            JsonBodyParse.argumentExitsTest(content, args);
            long memberDishId = NumberUtils.toLong(content.getString("member_dish_id"));
            long orderId = NumberUtils.toLong(content.getString("order_id"));
            
            if(!StrUtil.isEmpty(content.getString("member_dish_id"))){  
            	orderService.move2Order(orderId,memberDishId);
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
    
    @RequestMapping(value = "/changeOrderDishCount", method = RequestMethod.POST)
    public void changeOrderDishCount(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
            String[] args = {"order_dish_detail_id","order_id","dish_count"};
            JsonBodyParse.argumentExitsTest(content, args);
            long detaiId = NumberUtils.toLong(content.getString("order_dish_detail_id"));
            long orderId = NumberUtils.toLong(content.getString("order_id"));
            int dishCount = NumberUtils.toInt(content.getString("dish_count"));
            if(dishCount>=0){
            	if(!StrUtil.isEmpty(content.getString("order_dish_detail_id"))){  
                	orderService.changeOrderDishCount(detaiId,orderId,dishCount);
                	retCode = 100;
                    descStr = "完成更新";
                } 
            }else{
            	retCode = 105;
                descStr = "不能小于0";
            } 
           
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

    @RequestMapping(value = "/deleteOrder", method = RequestMethod.POST)
    public void deleteOrder(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long orderId = NumberUtils.toLong(content.getString("order_id"));
              
        	orderService.deleteOrder(orderId);
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
    @RequestMapping(value = "qryOrderList", method = RequestMethod.POST)
    public void qryOrderList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"order_id","order_status","order_ticket_id","order_customer_count"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args);
            Order order = new Order(); ; 
            order.setOrderId(NumberUtils.toLong(content.getString("order_id")));
            order.setOrderStatus(NumberUtils.toInt(content.getString("order_status"))); 
            order.setOrderNum(content.getString("order_num"));
            order.setOrderType(NumberUtils.toInt(content.getString("order_type"))); 
            order.setOrderTicketId(NumberUtils.toLong(content.getString("order_ticket_id")));
            order.setOrderTicketName(content.getString("order_ticket_name"));
            order.setIfpay(NumberUtils.toInt(content.getString("Ifpay"))); 
            order.setOrderPay(NumberUtils.toFloat(content.getString("order_pay")));  
            order.setQryKey(content.getString("qry_key"));
            order.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            if(order.getStoreId()==0 && user.getStoreId()!=0){
            	order.setQryStore(user.getStoreId()+"");
            }else if(order.getStoreId()>0){
            	order.setQryStore(order.getStoreId()+"");
            }
            List<Order> list = new ArrayList(); 
            if(order.getOrderTicketId()>0){
            	list = orderService.qryOrderAndDetailList(order);  
            	resJson.put("draw",0);
                resJson.put("recordsTotal", list.size());
                resJson.put("recordsFiltered", list.size()) ;
                resJson.put("data", list);
            }else{
            	order.setOrderTicketId(0);
            	int start =NumberUtils.toInt(content.getString("start"));
            	int length =NumberUtils.toInt(content.getString("length"));
            	JSONObject search = JSON.parseObject(content.getString("search"));
            	if(search!=null){
            		String key = search.getString("value");
                	order.setStart(start);
                	order.setLength(length);
                	order.setQryKey(key);
            	}
            	list = orderService.qryOrderList(order);  
            	int len = orderService.orderCount(order);
            	resJson.put("draw",0);
                resJson.put("recordsTotal", len);
                resJson.put("recordsFiltered", len) ;
                resJson.put("data", list);
            }
            
            
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
    
    @RequestMapping(value = "qryOrderDishesByOrderId", method = RequestMethod.POST)
    public void qryOrderDishesByOrderId(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"order_id"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args);
            Order order = new Order(); ; 
            order.setOrderId(NumberUtils.toLong(content.getString("order_id")));
            if(order.getOrderId()>0){ 
            	List<OrderDish> list = orderService.qryOrderDishesByOrderId(order);  
            	resJson.put("data",list); 
            }
            resJson.put("code", "100");
            
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
    
    @RequestMapping(value = "/deleteOrderDish", method = RequestMethod.POST)
    public void deleteOrderDish(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long detailId = NumberUtils.toLong(content.getString("detail_id"));
        	boolean retreat = Boolean.parseBoolean(content.getString("retreat"));
        	orderService.deleteOrderDish(detailId,retreat); 
        	
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
    
    @RequestMapping(value = "qryTakeoutOrderList", method = RequestMethod.POST)
    public void qryTakeoutOrderList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"order_id","order_status","order_ticket","order_customer_count"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args);
            Order order = new Order(); ; 
            order.setOrderId(NumberUtils.toLong(content.getString("order_id")));
            order.setOrderStatus(NumberUtils.toInt(content.getString("order_status"))); 
            order.setOrderNum(content.getString("order_num"));
            order.setOrderType(IConstants.ORDER_TYPE_TAKEOUT); 
            order.setOrderTicketId(NumberUtils.toLong(content.getString("order_ticket_id")));
            order.setOrderTicketName(content.getString("order_ticket_name"));
            order.setIfpay(NumberUtils.toInt(content.getString("Ifpay"))); 
            order.setOrderPay(NumberUtils.toFloat(content.getString("order_pay"))); 
            List<Order> list = orderService.qryOrderAndDetailList(order);  
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
    
    @RequestMapping(value = "/orderNopayLeave", method = RequestMethod.POST)
    public void orderNopayLeave(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
            String[] args = {"order_id","order_num","order_ticket_id"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args);
            Order order = new Order(); ; 
            order.setOrderId(NumberUtils.toLong(content.getString("order_id"))); 
            order.setOrderNum(content.getString("order_num")); 
            order.setOrderTicketId(NumberUtils.toLong(content.getString("order_ticket_id")));  
            order.setOrderStatus(IConstants.ORDER_NO_PAY_LEAVE);
            order.setOrderShouldPay(NumberUtils.toFloat(content.getString("order_should_pay"))); 
            order.setOrderAllDiscount(NumberUtils.toFloat(content.getString("order_all_discount")));
            order.setOrderDiscount(NumberUtils.toFloat(content.getString("order_dish_discount")));
            order.setRemarks(content.getString("remarks"));  
            order.setOrderPay(0);
             
            if(!StrUtil.isEmpty(content.getString("order_id"))){ 
            	orderService.updatePayOrder(order);
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
    
    @RequestMapping(value = "/cancleOrder", method = RequestMethod.POST)
    public void cancleOrder(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
            String[] args = {"order_id","order_num","order_ticket_id"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args);
            Order order = new Order(); ; 
            order.setOrderId(NumberUtils.toLong(content.getString("order_id"))); 
            order.setOrderNum(content.getString("order_num")); 
            order.setOrderTicketId(NumberUtils.toLong(content.getString("order_ticket_id")));  
                         
            boolean result = false;
            if(!StrUtil.isEmpty(content.getString("order_ticket_id")) || !StrUtil.isEmpty(content.getString("order_id"))){ 
            	result = orderService.updateOrderCancel(order);
            } 
                                
            retCode = result?100:105;
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
    
    @RequestMapping(value = "/orderCheckpay", method = RequestMethod.POST)
    public void orderCheckpay(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY); 
            String[] args = {"order_id","order_num","order_ticket_id"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args);
            Order order = new Order(); ; 
            order.setOrderId(NumberUtils.toLong(content.getString("order_id"))); 
            order.setOrderNum(content.getString("order_num")); 
            order.setOrderTicketId(NumberUtils.toLong(content.getString("order_ticket_id")));  
            order.setOrderStatus(IConstants.ORDER_NO_PAY_LEAVE);
            order.setOrderShouldPay(NumberUtils.toFloat(content.getString("order_should_pay"))); 
            order.setOrderAllDiscount(NumberUtils.toFloat(content.getString("order_all_discount")));
            order.setOrderDiscount(NumberUtils.toFloat(content.getString("order_dish_discount")));
            order.setRemarks(content.getString("remarks")); 
            order.setOrderPay(NumberUtils.toFloat(content.getString("order_pay")));
            order.setIfpay(IConstants.ORDER_PAY);
            order.setPayType(NumberUtils.toInt(content.getString("pay_type")));
            order.setUserId(user.getUserID());
            boolean result = false;
            if(!StrUtil.isEmpty(content.getString("order_id"))){ 
            	result = orderService.updatePayOrder(order);
            } 
                                
            retCode = result?100:105;
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
    
    @RequestMapping(value = "/orderDishNeed", method = RequestMethod.POST)
    public void orderDishNeed(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
            String[] args = {"detail_id","dish_need"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            JsonBodyParse.argumentExitsTest(content, args);
            OrderDish orderDish = new OrderDish(); ; 
            orderDish.setOrderDishDetailId(NumberUtils.toLong(content.getString("detail_id"))); 
            orderDish.setDishNeed(content.getString("dish_need"));   
             
            if(!StrUtil.isEmpty(content.getString("detail_id"))){ 
            	orderService.orderDishNeed(orderDish);
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
