package com.mamala.web.controller.systemManage;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;
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
import com.mamala.market.pojo.dish.SetDishRelation;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr;
import com.mamala.market.service.sys.SysAttrService;
import com.mamala.web.support.JsonBodyParse;

@Controller
@RequestMapping(value = "/sysAttrManage")
public class SysAttrManage {

    private static Logger logger = Logger.getLogger(SysAttrManage.class);

    @Autowired
    private SysAttrService sysAttrService;

    @RequestMapping(value = "/getSysAttr", method = RequestMethod.POST)
    public void getSysAttr(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException{
    	 int    retCode  = 100;//successful
         String descStr  = null;
         JSONObject resJson     = new JSONObject();
         JSONObject contentJson = new JSONObject();
         //内容
         JSONObject content = JSON.parseObject(body);        
    	try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY);
        	String attr = content.getString("attr");
        	String attrTypeId = content.getString("attr_type_id");
        	SysAttr sysAttr = new SysAttr();
        	sysAttr.setAttr(attr);
        	sysAttr.setAttrTypeId(attrTypeId);
            List<SysAttr>  list = sysAttrService.qryForSysAttr(sysAttr);
            resJson.put("list", list);
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
    
    @RequestMapping(value = "/updateSysAttr", method = RequestMethod.POST)
    public void updateSysAttrs(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException{
    	int    retCode  = 100;//successful
        String descStr  = null;
        JSONObject resJson     = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //内容
        JSONObject content = JSON.parseObject(body);

        try {
        	User user = (User)request.getSession().getAttribute(User.USER_SESSIONG_KEY); 
        	JSONObject attrs = JSON.parseObject(content.getString("attrs"));
        	this.sysAttrService.updateSysAttrs(attrs);
            
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
