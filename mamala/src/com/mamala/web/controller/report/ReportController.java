package com.mamala.web.controller.report;

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
import com.mamala.market.pojo.report.BusinessCreditReport;
import com.mamala.market.pojo.report.BusinessDayReport;
import com.mamala.market.pojo.report.BusinessDishReport;
import com.mamala.market.pojo.report.BusinessEarnReport;
import com.mamala.market.pojo.report.BusinessPayReport;
import com.mamala.market.pojo.report.BusinessTotalReport;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 
import com.mamala.market.service.dine.DineService;
import com.mamala.market.service.dish.DishService;
import com.mamala.market.service.member.MemberService;
import com.mamala.market.service.order.OrderService;
import com.mamala.market.service.report.ReportService;
import com.mamala.market.service.sys.SysManagerService;
import com.mamala.web.support.JsonBodyParse;

@Controller
@RequestMapping(value = "/reportController")
public class ReportController {

    private static Logger logger = Logger.getLogger(ReportController.class);

    @Autowired
    private ReportService reportService; 
    
    
    /**
     * 门店列表
     * @param body
     * @param request
     * @param response
     * @throws IOException
     */
    @RequestMapping(value = "qryTotalReport", method = RequestMethod.POST)
    public void qryTotalReport(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"order_id","order_status","order_ticket","order_customer_count"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args);
        	long userId =0;
        	String startTime = content.getString("start_time");
        	String endTime = content.getString("end_time");
        	long storeId = user.getStoreId();
            if(storeId==0){
            	storeId=NumberUtils.toLong(content.getString("store_id"));
            }
            BusinessTotalReport totalReport = reportService.qryTotalList(storeId,startTime,endTime);
            resJson.put("data", totalReport); 
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
     
    
    @RequestMapping(value = "qryDayReportList", method = RequestMethod.POST)
    public void qryDayReportList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"order_id","order_status","order_ticket","order_customer_count"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args); 
        	String startTime = content.getString("start_time");
        	String endTime = content.getString("end_time"); 
        	long storeId = user.getStoreId();
            if(storeId==0){
            	storeId=NumberUtils.toLong(content.getString("store_id"));
            }
        	List<BusinessDayReport> list = reportService.qryDayReportList(storeId,startTime,endTime);
            resJson.put("data", list); 
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
    
    @RequestMapping(value = "qryDishReportList", method = RequestMethod.POST)
    public void qryDishReportList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"order_id","order_status","order_ticket","order_customer_count"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args); 
        	String startTime = content.getString("start_time");
        	String endTime = content.getString("end_time");  
        	long storeId = user.getStoreId();
            if(storeId==0){
            	storeId=NumberUtils.toLong(content.getString("store_id"));
            }
        	List<BusinessDishReport> list = reportService.qryDishReportList(storeId,startTime,endTime);
            resJson.put("data", list); 
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
    
    
    @RequestMapping(value = "qryCreditReport", method = RequestMethod.POST)
    public void qryCreditReport(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"order_id","order_status","order_ticket","order_customer_count"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args);
        	long userId =0;
        	String startTime = content.getString("start_time");
        	String endTime = content.getString("end_time");   
        	long storeId = user.getStoreId();
            if(storeId==0){
            	storeId=NumberUtils.toLong(content.getString("store_id"));
            }
        	BusinessCreditReport report = reportService.qryCreditReportList(storeId,startTime,endTime);
            resJson.put("data", report); 
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
    
    
    @RequestMapping(value = "qryPayReport", method = RequestMethod.POST)
    public void qryPayReport(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"order_id","order_status","order_ticket","order_customer_count"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args);
        	 
        	String startTime = content.getString("start_time");
        	String endTime = content.getString("end_time");   
        	long storeId = user.getStoreId();
            if(storeId==0){
            	storeId=NumberUtils.toLong(content.getString("store_id"));
            }
        	BusinessPayReport report = reportService.qryPayReportList(storeId,startTime,endTime);
            resJson.put("data", report); 
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
    
    @RequestMapping(value = "qryEarnReport", method = RequestMethod.POST)
    public void qryEarnReport(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"order_id","order_status","order_ticket","order_customer_count"};
            //,"order_waiter","order_address","user_id","order_give","order_discount","order_pay"这几项必须由后台生成
            //JsonBodyParse.argumentExitsTest(content, args); 
        	String startTime = content.getString("start_time");
        	String endTime = content.getString("end_time");     
        	long storeId = user.getStoreId();
            if(storeId==0){
            	storeId=NumberUtils.toLong(content.getString("store_id"));
            }
        	BusinessEarnReport report = reportService.qryEarnReportList(storeId,startTime,endTime);
            resJson.put("data", report); 
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
}
