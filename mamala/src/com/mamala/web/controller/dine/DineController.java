package com.mamala.web.controller.dine;

import java.io.IOException;
import java.net.URLDecoder;
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
import com.mamala.market.pojo.dine.Dine;
import com.mamala.market.pojo.dine.DineTable;
import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 
import com.mamala.market.service.dine.DineService;
import com.mamala.market.service.dish.DishService;
import com.mamala.market.service.member.MemberService;
import com.mamala.market.service.sys.SysManagerService;
import com.mamala.market.util.OrderNumSingleton;
import com.mamala.web.support.JsonBodyParse;

@Controller
@RequestMapping(value = "/dineController")
public class DineController {

    private static Logger logger = Logger.getLogger(DineController.class);
   

    @Autowired
    private DineService dineService;
    
    //start manager dish
    @RequestMapping(value = "/editDineTable", method = RequestMethod.POST)
    public void editDineTable(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY); 
            String[] args = {"table_id","table_name","table_alias","table_seats","table_status","current_cost","current_dine_id"};
            JsonBodyParse.argumentExitsTest(content, args);
            DineTable table = new DineTable(); ; 
            table.setTableId(NumberUtils.toInt(content.getString("table_id")));
            table.setTableName(content.getString("table_name"));
            table.setTableAlias(content.getString("table_alias"));
            table.setTableSeats(NumberUtils.toInt(content.getString("table_seats")));
            table.setTableStatus(NumberUtils.toInt(content.getString("table_status")));
            table.setUserId(user.getUserID());
            table.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            if(table.getStoreId()==0){
            	table.setStoreId(user.getStoreId());
            }
//            table.setCurrentCost(NumberUtils.toFloat(content.getString("current_cost")));
//            table.setCurrentDineId(NumberUtils.toLong(content.getString("current_dine_id")));
//           
            if(StrUtil.isEmpty(content.getString("table_id"))){
            	table.setTableStatus(IConstants.DESK_INIT_TABLE_STATUS);//
            	dineService.addDineTable(table);
            }else{
            	dineService.updateDineTable(table);
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

    @RequestMapping(value = "/deleteDineTable", method = RequestMethod.POST)
    public void deleteDineTable(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long tableId = NumberUtils.toLong(content.getString("table_id"));
              
        	dineService.deleteDineTable(tableId);
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
    @RequestMapping(value = "qryDineTableList", method = RequestMethod.POST)
    public void qryDineTableList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY); 
        	String[] args = {"table_id","table_name","table_alias","table_seats","table_status","current_cost","current_dine_id"};
            //JsonBodyParse.argumentExitsTest(content, args);
            DineTable table = new DineTable(); ; 
            table.setTableId(NumberUtils.toInt(content.getString("table_id")));
            table.setTableName(content.getString("table_name"));
            table.setTableAlias(content.getString("table_alias"));
            table.setTableSeats(NumberUtils.toInt(content.getString("table_seats")));
            table.setTableStatus(NumberUtils.toInt(content.getString("table_status")));
            table.setCurrentCost(NumberUtils.toFloat(content.getString("current_cost")));
            table.setCurrentDineId(NumberUtils.toLong(content.getString("current_dine_id")));
            table.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            if(table.getStoreId()==0 && user.getStoreId()!=0){
            	table.setQryStore(user.getStoreId()+"");
            }else if(table.getStoreId()>0){
            	table.setQryStore(table.getStoreId()+"");
            }
            List<DineTable> list = dineService.qryDineTableList(table); 
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
    
//    
//    
//  //start manager dishType
    @RequestMapping(value = "/addDine", method = RequestMethod.POST)
    public void addDine(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY); 
            String[] args = {"dine_desk_id","dine_desk_name","customer_count","remarks","dine_start_time","dine_end_time","card_number","phone","dine_desk_alias","member_id"};
            JsonBodyParse.argumentExitsTest(content, args);
            Dine dine = new Dine(); ;  
            dine.setDineDeskId(NumberUtils.toLong(content.getString("dine_desk_id")));
            dine.setDineDeskName(content.getString("dine_desk_name"));
            dine.setCustomerCount(NumberUtils.toInt(content.getString("customer_count")));
            dine.setRemarks(content.getString("remarks"));
            dine.setDineStartTime(content.getString("dine_start_time"));
            dine.setDineEndTime(content.getString("dine_end_time"));
            dine.setCardNumber(content.getString("card_number"));
            dine.setMemberId(NumberUtils.toLong(content.getString("member_id")));
            dine.setPhone(content.getString("phone"));
            dine.setDineStatus(IConstants.DESK_START_TABLE_STATUS);
            dine.setDineDeskAlias(content.getString("dine_desk_alias"));
            dine.setUserId(user.getUserID());
            dine.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            if(dine.getStoreId()==0){
            	dine.setStoreId(user.getStoreId());
            }
            
            long currentDineId =  dineService.addDine(dine);//对外不提供修改功能
            contentJson.put("data", currentDineId);
            if(currentDineId>0){
            	retCode = 100;
                descStr = "完成更新";
            }else{
            	retCode = 105;
                descStr = "插入失败";
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

    /**
     * 作废该做(只有再该单桌号未下单情况下方可作废)
     * 
     * @param body
     * @param response
     * @throws IOException
     */
    @RequestMapping(value = "/cancelDeskAndDine", method = RequestMethod.POST)
    public void cancelDeskAndDine(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	 String[] args = {"dine_id","dine_desk_id"};
             JsonBodyParse.argumentExitsTest(content, args);
             
        	long dine_id = NumberUtils.toLong(content.getString("dine_id"));
        	long dineDeskId = NumberUtils.toLong(content.getString("dine_desk_id"));
              
        	dineService.cancelDeskAndDine(dine_id,dineDeskId);
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
    
    @RequestMapping(value = "/getOrderNum", method = RequestMethod.POST)
    public void getOrderNum(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	contentJson.put("data","T"+OrderNumSingleton.getOrderNum());
            
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
     
    @RequestMapping(value = "/turnDesk", method = RequestMethod.POST)
    public void turnDesk(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	String[] args = {"source_dine_id","target_desk_id"};
            JsonBodyParse.argumentExitsTest(content, args);
             
        	long sourceDineId = NumberUtils.toLong(content.getString("source_dine_id"));
        	long targetDeskId = NumberUtils.toLong(content.getString("target_desk_id"));
        	dineService.turnDesk(sourceDineId,targetDeskId);
        	contentJson.put("data","T"+OrderNumSingleton.getOrderNum());
            
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
