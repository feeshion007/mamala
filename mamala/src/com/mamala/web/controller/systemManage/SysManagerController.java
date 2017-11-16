package com.mamala.web.controller.systemManage;

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
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 
import com.mamala.market.service.sys.SysManagerService;
import com.mamala.web.support.JsonBodyParse;

@Controller
@RequestMapping(value = "/sysMananger")
public class SysManagerController {

    private static Logger logger = Logger.getLogger(SysManagerController.class);

    @Autowired
    private SysManagerService sysService;

    @RequestMapping(value = "/editStoreInfo", method = RequestMethod.POST)
    public void editStoreInfo(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY);
            String[] args = {"store_id", "store_name", "store_grade", "store_address", "store_leader","store_phone","store_open","store_close"};
            JsonBodyParse.argumentExitsTest(content, args);
            StoreInfo store = new StoreInfo(); ; 
            store.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            store.setStoreName(content.getString("store_name"));
            store.setGrade(content.getString("store_grade"));
            store.setAddress(content.getString("store_address"));
            store.setLeader(content.getString("store_leader"));
            store.setPhone(content.getString("store_phone"));
            store.setOpen(content.getString("store_open"));
            store.setClose(content.getString("store_close")); 
            if(user.getRoleID()==IConstants.STAFF_ROLE_ADMIN){
            	if(StrUtil.isEmpty(content.getString("store_id"))){
                	sysService.addStoreInfo(store);
                }else{
                	sysService.updateStoreInfo(store);
                } 
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

    @RequestMapping(value = "/deleteStoreInfo", method = RequestMethod.POST)
    public void deleteStoreInfo(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long storeId = NumberUtils.toLong(content.getString("store_id"));
              
        	sysService.deleteStoreInfo(storeId);
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
    @RequestMapping(value = "qryStoreInfoList", method = RequestMethod.POST)
    public void qryStoreInfoList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
//        	String[] args = {"store_id", "store_name", "store_grade", "store_address", "store_leader","store_phone","store_open_close"};
            //JsonBodyParse.argumentExitsTest(content, args);
            StoreInfo store = new StoreInfo(); ; 
            store.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            store.setStoreName(content.getString("store_name"));
            store.setGrade(content.getString("store_grade"));
            store.setAddress(content.getString("store_address"));
            store.setLeader(content.getString("store_leader"));
            store.setPhone(content.getString("store_phone"));
            store.setOpen(content.getString("store_open"));
            store.setOpen(content.getString("store_close"));
            if(store.getStoreId()==0 && user.getStoreId()!=0){
            	store.setQryStore(user.getStoreId()+"");
            }
            if(user.getRoleID() != IConstants.STAFF_ROLE_ADMIN){
            	store.setUserId(user.getUserID());
            }
            List<StoreInfo> list = sysService.qryStoreInfoList(store);
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
    
    
    
    //start manager staff
    @RequestMapping(value = "/editStaff", method = RequestMethod.POST)
    public void editStaff(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
            String[] args = {"staff_id", "staff_name","staff_account","staff_role","staff_type","staff_phone","store_id","store_name"};
            JsonBodyParse.argumentExitsTest(content, args);
            Staff staff = new Staff(); ; 
            staff.setStaffId(NumberUtils.toLong(content.getString("staff_id")));
            staff.setStaffName(content.getString("staff_name"));
            staff.setStaffAccount(content.getString("staff_account"));
            staff.setStaffRole(content.getString("staff_role"));
            staff.setStaffType(content.getString("staff_type"));
            staff.setStaffPhone(content.getString("staff_phone"));
            staff.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            staff.setStoreName(content.getString("store_name"));
           
            if(StrUtil.isEmpty(content.getString("staff_id"))){
            	sysService.addStaff(staff);
            }else{
            	sysService.updateStaff(staff);
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

    @RequestMapping(value = "/deleteStaff", method = RequestMethod.POST)
    public void deleteStaff(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long staff_id = NumberUtils.toLong(content.getString("staff_id"));
              
        	sysService.deleteStaff(staff_id);
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
    @RequestMapping(value = "qryStaffList", method = RequestMethod.POST)
    public void qryStaffList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"staff_id", "staff_name","staff_account","staff_role","staff_type","staff_phone","store_id","store_name"};
            //JsonBodyParse.argumentExitsTest(content, args);
        	Staff staff = new Staff(); ; 
            staff.setStaffId(NumberUtils.toLong(content.getString("staff_id")));
            staff.setStaffName(content.getString("staff_name"));
            staff.setStaffAccount(content.getString("staff_account"));
            staff.setStaffRole(content.getString("staff_role"));
            staff.setStaffType(content.getString("staff_type"));
            staff.setStaffPhone(content.getString("staff_phone")); 
            staff.setStoreName(content.getString("store_name")); 
            if(user.getRoleID()!=IConstants.STAFF_ROLE_ADMIN ){
            	staff.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            	if(staff.getStoreId()==0){
            		staff.setStoreId(user.getStoreId());
            	}
            }
            List<Staff> list = new ArrayList<Staff>();
            if(user.getRoleID()==IConstants.STAFF_ROLE_ADMIN  || user.getRoleID()==IConstants.STAFF_ROLE_MANAGER){
            	 list = sysService.qryStaffList(staff); 
            }
            
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
}
