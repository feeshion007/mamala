package com.mamala.web.controller.dish;

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
import com.alibaba.fastjson.JSONException;
import com.alibaba.fastjson.JSONObject;
import com.mamala.common.util.StrUtil;
import com.mamala.market.pojo.common.User;
import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.dish.SetDishRelation;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 
import com.mamala.market.service.dish.DishService;
import com.mamala.market.service.member.MemberService;
import com.mamala.market.service.sys.SysManagerService;
import com.mamala.web.support.JsonBodyParse;

@Controller
@RequestMapping(value = "/dishController")
public class DishController {

    private static Logger logger = Logger.getLogger(DishController.class);

    @Autowired
    private DishService dishService;
    
    //start manager dish
    @RequestMapping(value = "/editDish", method = RequestMethod.POST)
    public void editDish(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY);
            String[] args = {"dish_id","dish_name","dish_name_eng","dish_name_pinyin","dish_type_id","dish_type_name","dish_alias","dish_price","dish_cost","dish_unit","dish_canbe_set","dish_taste","dish_remarks","dish_disabled","dish_canbe_discount","dish_canbe_give"};
            JsonBodyParse.argumentExitsTest(content, args);
            Dish dish = new Dish(); ; 
            dish.setDishId(NumberUtils.toLong(content.getString("dish_id")));
            dish.setDishName(content.getString("dish_name"));
            dish.setDishNameEng(content.getString("dish_name_eng"));
            dish.setDishNamePinyin(content.getString("dish_name_pinyin"));
            dish.setDishTypeId(NumberUtils.toLong(content.getString("dish_type_id")));
            dish.setDishTypeName(content.getString("dish_type_name"));
            dish.setDishAlias(content.getString("dish_alias"));
            dish.setDishPrice(content.getFloatValue("dish_price"));
            dish.setDishCost(content.getFloatValue("dish_cost"));
            dish.setDishUnit(content.getString("dish_unit"));
            dish.setDishCanbeSet(content.getIntValue("dish_canbe_set"));
            dish.setDishTaste(content.getString("dish_taste"));
            dish.setDishRemarks(content.getString("dish_remarks"));
            dish.setDishDisabled(content.getIntValue("dish_disabled"));
            dish.setDishCanbeDiscount(content.getIntValue("dish_canbe_discount"));
            dish.setDishCanbeGive(content.getIntValue("dish_canbe_give"));
            dish.setUserId(user.getUserID());
            dish.setStoreId(user.getStoreId());
            if(dish.getStoreId()==0){
            	dish.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            } 
           
            if(StrUtil.isEmpty(content.getString("dish_id"))){
            	dishService.addDish(dish);
            }else{
            	dishService.updateDish(dish);
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

    @RequestMapping(value = "/deleteDish", method = RequestMethod.POST)
    public void deleteDish(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long dishId = NumberUtils.toLong(content.getString("dish_id"));
              
        	dishService.deleteDish(dishId);
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
    @RequestMapping(value = "qryDishList", method = RequestMethod.POST)
    public void qryDishList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"dish_id","dish_name","dish_name_eng","dish_name_pinyin","dish_type_id","dish_type_name","dish_alias","dish_price","dish_cost","dish_unit","dish_canbe_set","dish_taste","dish_remarks","dish_disabled","dish_canbe_discount","dish_canbe_give"};
            //JsonBodyParse.argumentExitsTest(content, args);
            Dish dish = new Dish(); ; 
            dish.setDishId(NumberUtils.toLong(content.getString("dish_id")));
            dish.setDishName(content.getString("dish_name"));
            dish.setDishNameEng(content.getString("dish_name_eng"));
            dish.setDishNamePinyin(content.getString("dish_name_pinyin"));
            dish.setDishTypeId(NumberUtils.toLong(content.getString("dish_type_id")));
            dish.setDishTypeName(content.getString("dish_type_name"));
            dish.setDishAlias(content.getString("dish_alias"));
            dish.setDishPrice(content.getFloatValue("dish_price"));
            dish.setDishCost(content.getFloatValue("dish_cost"));
            dish.setDishUnit(content.getString("dish_unit"));
            dish.setDishCanbeSet(content.getIntValue("dish_canbe_set"));
            dish.setDishTaste(content.getString("dish_taste"));
            dish.setDishRemarks(content.getString("dish_remarks"));
            dish.setDishDisabled(content.getIntValue("dish_disabled"));
            dish.setDishCanbeDiscount(content.getIntValue("dish_canbe_discount"));
            dish.setDishCanbeGive(content.getIntValue("dish_canbe_give"));
            dish.setUserId(user.getUserID());
            dish.setStoreId(user.getStoreId());
            if(dish.getStoreId()==0){
            	dish.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            } 
            if(dish.getStoreId()>0){
            	dish.setQryStore(dish.getStoreId()+"");
            }
            int start =NumberUtils.toInt(content.getString("start"));
        	int length =NumberUtils.toInt(content.getString("length"));
        	if(length>0){
        		JSONObject search = JSON.parseObject(content.getString("search"));
            	if(search!=null){
            		String key = search.getString("value");
                	dish.setStart(start);
                	dish.setLength(length);
                	dish.setQryKey(key);
            	}
            	List<Dish> list = dishService.qryDishList(dish); 
            	int len = dishService.dishCount(dish);
                resJson.put("draw",0);
                resJson.put("recordsTotal",len);
                resJson.put("recordsFiltered",len) ;
                resJson.put("data", list);
        	}else{ 
                List<Dish> list = dishService.qryDishList(dish); 
                resJson.put("draw",0);
                resJson.put("recordsTotal", list.size());
                resJson.put("recordsFiltered", list.size()) ;
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
    
    
    
  //start manager dishType
    @RequestMapping(value = "/editDishType", method = RequestMethod.POST)
    public void editDishType(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY);
            String[] args = {"dish_type_id","dish_type","dish_type_name","dish_using_range","status","dish_type_set","dish_unit_price"};
            JsonBodyParse.argumentExitsTest(content, args);
            DishType dishType = new DishType(); ; 
            dishType.setDishTypeId(NumberUtils.toLong(content.getString("dish_type_id")));
            dishType.setDishType(content.getString("dish_type"));
            dishType.setDishTypeName(content.getString("dish_type_name"));
            dishType.setDishUsingRange(content.getString("dish_using_range"));
            dishType.setStatus(content.getString("status"));
            dishType.setUserId(NumberUtils.toLong(content.getString("user_id")));
            dishType.setDishTypeSet(NumberUtils.toInt(content.getString("dish_type_set"))); 
            dishType.setDishUnitPrice(NumberUtils.toLong(content.getString("dish_unit_price"))); 
            dishType.setUserId(user.getUserID());
            dishType.setStoreId(user.getStoreId());
            if(dishType.getStoreId()==0){
            	dishType.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            } 
            JSONObject relationObj = JSON.parseObject(content.getString("relations"));
             
                        
            if(StrUtil.isEmpty(content.getString("dish_type_id"))){
            	dishService.addDishType(dishType,relationObj);
            }else{
            	dishService.updateDishType(dishType,relationObj);
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

    @RequestMapping(value = "/deleteDishType", method = RequestMethod.POST)
    public void deleteDishType(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long dishTypeId = NumberUtils.toLong(content.getString("dish_type_id"));
              
        	dishService.deleteDishType(dishTypeId);
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
    @RequestMapping(value = "qryDishTypeList", method = RequestMethod.POST)
    public void qryDishTypeList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"dish_type_id","dish_type","dish_type_name","dish_using_range","status","dish_type_set"};
            //JsonBodyParse.argumentExitsTest(content, args);
            DishType dishType = new DishType(); ; 
            dishType.setDishTypeId(NumberUtils.toLong(content.getString("dish_type_id")));
            dishType.setDishType(content.getString("dish_type"));
            dishType.setDishTypeName(content.getString("dish_type_name"));
            dishType.setDishUsingRange(content.getString("dish_using_range"));
            dishType.setStatus(content.getString("status"));
            dishType.setUserId(NumberUtils.toLong(content.getString("user_id")));
            dishType.setDishTypeSet(content.getIntValue(("dish_type_set")));
            dishType.setStoreId(user.getStoreId());
            if(dishType.getStoreId()==0){
            	dishType.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            } 
            if(dishType.getStoreId()>0){
            	dishType.setQryStore(dishType.getStoreId()+"");
            }
            List<DishType> list = dishService.qryDishTypeList(dishType); 
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
    
    
    
  //start manager dishType
    @RequestMapping(value = "/editSetDishRelation", method = RequestMethod.POST)
    public void editSetDishRelation(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
            String[] args = {"set_id","dish_type_id","dish_id","dish_count","dish_name"};
            JsonBodyParse.argumentExitsTest(content, args);
            SetDishRelation relation = new SetDishRelation(); ; 
            relation.setSetId(NumberUtils.toLong(content.getString("set_id")));
            relation.setDishTypeId(NumberUtils.toLong(content.getString("dish_type_id")));
            relation.setDishName(content.getString("dish_name"));
            relation.setDishId(NumberUtils.toLong(content.getString("dish_id")));
            relation.setCount(NumberUtils.toInt(content.getString("dish_count")));
            
            if(StrUtil.isEmpty(content.getString("set_id"))){
            	dishService.addSetDishRelation(relation);
            }else{
            	dishService.updateSetDishRelation(relation);
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

    @RequestMapping(value = "/deleteSetDishRelation", method = RequestMethod.POST)
    public void deleteSetDishRelation(@RequestBody String body, HttpServletResponse response) throws IOException{

        int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try { 
        	long setId = NumberUtils.toLong(content.getString("set_id"));
              
        	dishService.deleteSetDishRelation(setId);
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
    @RequestMapping(value = "qrySetDishRelation", method = RequestMethod.POST)
    public void qrySetDishRelation(@RequestBody String body, HttpServletRequest request, HttpServletResponse response) throws IOException{
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
        	String[] args = {"set_id","dish_type_id"};
            JsonBodyParse.argumentExitsTest(content, args);
            SetDishRelation relation = new SetDishRelation(); ; 
            relation.setSetId(NumberUtils.toLong(content.getString("set_id")));
            relation.setDishTypeId(NumberUtils.toLong(content.getString("dish_type_id")));
            relation.setDishId(NumberUtils.toLong(content.getString("dish_id")));
            relation.setCount(NumberUtils.toInt(content.getString("dish_count")));
            relation.setDishName(content.getString("dish_name"));
            relation.setDishCanbeGive(NumberUtils.toInt(content.getString("dish_canbe_give")));
            relation.setDishCanbeSet(NumberUtils.toInt(content.getString("dish_canbe_set")));
            relation.setDishTypeSet(NumberUtils.toInt(content.getString("dish_type_set")));
            relation.setStoreId(user.getStoreId());
            if(relation.getStoreId()==0){
            	relation.setStoreId(NumberUtils.toLong(content.getString("store_id")));
            } 
            if(relation.getStoreId()>0){
            	relation.setQryStore(relation.getStoreId()+"");
            }
            
            List<SetDishRelation> list = dishService.qrySetDishRelation(relation); 
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
