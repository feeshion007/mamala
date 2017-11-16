package com.mamala.web.controller.systemManage;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONException;
import com.alibaba.fastjson.JSONObject;  
import com.mamala.market.dao.systemManager.UserManageDao;
import com.mamala.market.mapper.common.CommonInfoMapper;  
import com.mamala.market.pojo.common.SystemFunction;
import com.mamala.market.pojo.common.User;
import com.mamala.market.pojo.common.UserRole;

@Controller
@RequestMapping(value = "/userManage")
public class UserManagerController {

    private static Logger logger = Logger.getLogger(UserManagerController.class);
    public static Map<Integer, List<HttpSession>> userSessionMap = new HashMap<Integer, List<HttpSession>>();//userID

    @Autowired
    private UserManageDao userManageDao;
    
    @Autowired
    private CommonInfoMapper commonInfoMapper;
    
    private boolean licenseCheck;

    /* -----角色 ----|-----管理权限 ----------|-可用功能列表-----------------|--门店查看范围
     * (1)系统管理员-|-系统管理员/门店管理员 --|---全部----------------------|------全部 
     * (2)门店管理员-|-所属的门店用户---------|---部分(小于等于系统管理员)---|-----所属租户下全部门店
     * (3)门店用户---|-自身密码 --------------|---部分(小于等于门店管理员)---|-----所属租户下的一个门店 
     * 
     * 用户的角色ID值保存在User.java中,因此需要保证其与数据库t_role_info的值一致
     * 
     * 
     * 登录成功后将用户信息对象保存在session中,但是目前只使用了userID, roleID等信息 TODO
     * UserManageImpl.userSessionMap保存用户ID与sessionList的对应关系
     * 
     * TODO 
     * 系统允许一个账号userID被多个人使用并同时登陆,
     * 此情况下,如果userID对应的信息被修改,系统会无效掉此userID对应的所有session,以便修改信息能马上同步.
     * 
     * 设计约定1 - 系统只有一个系统管理员
     */
    
    /* 打印session信息 */
    private void debugPrintSession(StringBuffer log, String debugStr) {
        logger.info("[" + debugStr + "]=============================");
        for(Integer userIDIndex: UserManagerController.userSessionMap.keySet()) {
            logger.info("====>UserID=" + String.valueOf(userIDIndex)
                    + " | Size=" + String.valueOf(userSessionMap.get(userIDIndex).size()));
            for (HttpSession session : userSessionMap.get(userIDIndex)) {
                logger.info("     Session = " + session.getId());
            }
        }
    }
    
    /* 将此userID对应的所有Session无效掉(排除excludeUserID&excludeSessionID),所有使用这个账号登录的用户全部下线. 
     * 
     * invalidate后会触发UserManageSessionListener.java的sessionDestroyed(),内部会处理UserManageImpl.userSessionMap
     * session timeout也会触发, 因此此处可以不修改UserManageImpl.userSessionMap的内容,有listener统一处理
     * */
    private void invalidateUserIDSession(StringBuffer log, List<Integer> userIDList, boolean needExclude, int excludeUserID, String excludeSessionID) {
        for (int i = 0; userIDList != null && i < userIDList.size(); i++) {
            int userID = userIDList.get(i).intValue();
            List<HttpSession> userSessionList = userSessionMap.get(Integer.valueOf(userID));
            
            if (userSessionList == null) {
                userSessionMap.remove(Integer.valueOf(userID));
                continue;
            }
            
            //else invalidate all session exclude excludeSessionID
            debugPrintSession(log, "Remove-Before");
            List<HttpSession> tempSessionsList = new ArrayList<HttpSession>();
            for (HttpSession tempUserSession : userSessionList) {
                if (needExclude && userID == excludeUserID && tempUserSession.getId().equals(excludeSessionID)) {
                    logger.info("Session[Find-Exclude] UserID=" + String.valueOf(userID) + "|excludeSessionID=" + excludeSessionID);
                    continue;
                }
                tempSessionsList.add(tempUserSession);
            }
            
            for(HttpSession tempUserSession : tempSessionsList) {
                tempUserSession.invalidate();
                //立即触发session destroy listener,
                //导致UserManageImpl.userSessionMap(UserID).userSessionList发送变化,所以无法在前面的foreach中做invalidate
                logger.info("Session[Remove-ing] UserID=" + String.valueOf(userID) + "|removeSessionID=" + tempUserSession.getId());
            }
            debugPrintSession(log, "Remove-After");
        }
    }
    
    /* 1、   用户登录 */
    @RequestMapping(value = "/userLogin", method = RequestMethod.POST)
    public void userLogin(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException{
        //delete
        StringBuffer log = null;
        int retCode  = 100;//successful
        String descStr  = null;

        //内容
        JSONObject content = JSON.parseObject(body);

        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();
        JSONObject jsonLoginUserObject = new JSONObject();
        
        String userName  = null;
        String password  = null;
        User user = null;
        
        /*
    	 * 判断客流组件的授权licence
    	 * start
    	 */
        try{
        	licenseCheck = true;
        	List<String> licStrList = commonInfoMapper.qryForSysStatus("license_check");
        	if(licStrList!=null && licStrList.size()>0) {
        		String licCheckStr = licStrList.get(0);
        		if("false".equals(licCheckStr.trim())) {
        			licenseCheck = false;
        		}
        	}
        }catch(Exception e) {
        	logger.error("Query License Check Failed!", e);
        }
        
    	try {
        	 
        	/*
        	 * end
        	 */
        	
            if (content.containsKey("userName")) {
                userName = content.getString("userName");
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [userName]");
            }
            
            if (content.containsKey("password")) {
                password = content.getString("password");
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [password]");
            }
            //session处理
            HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session
            if (!session.isNew()) {
                session.invalidate();
                session = request.getSession(true);
            }


            if (userManageDao.userNameIsExist(userName)) {
                user = userManageDao.userLogin(userName, password);
                if (user == null) {
                    //密码错误
                    retCode = 204;//204 密码不正确
                    descStr = "password is not match username";
                } else {
                    //登录成功 - user中保存了哪些信息:
                    
                    retCode  = 100;//successful
                    descStr  = null;
                    
                    user.setUserIsLogin(true);
                    user.setIpAddr((String)session.getAttribute(User.USER_IP_KEY));
                    
                    //构造返回信息
                    jsonLoginUserObject.put("userID", String.valueOf(user.getUserID()));
                    jsonLoginUserObject.put("userName", user.getUserName());
                    jsonLoginUserObject.put("roleID", String.valueOf(user.getRoleID()));
                    jsonLoginUserObject.put("roleName", user.getRoleName());
                    jsonLoginUserObject.put("name", user.getName());
                    //debug  
                    
                    TreeMap<String, SystemFunction> funcTreeMap = user.getFunctionTreeMap();
                    JSONArray jsonFuncListArray = new JSONArray();
                    if (!funcTreeMap.isEmpty()) {
                    	String pageUrl = null;
                        for (String funcIDStr : funcTreeMap.keySet()) {
                        	 
                        	
                            JSONObject jsonSysFuncObject = new JSONObject();
                            
                            jsonSysFuncObject.put("funcID", String.valueOf(funcTreeMap.get(funcIDStr).getFuncID()));
                            jsonSysFuncObject.put("funcName", funcTreeMap.get(funcIDStr).getFuncName());
                            jsonSysFuncObject.put("funcNameEng", funcTreeMap.get(funcIDStr).getFuncNameEng());
                            jsonSysFuncObject.put("pageUrl", pageUrl);
                            jsonSysFuncObject.put("pageArg", String.valueOf(funcTreeMap.get(funcIDStr).getPageArg()));
                            
                            jsonFuncListArray.add(jsonSysFuncObject);
                        }
                    }
                    jsonLoginUserObject.put("funcList", jsonFuncListArray);
                    
                    //增加登录log
                    userManageDao.insertLoginLog(user);
                    
                    //其实ApiServlet.java中已经在调用此函数之前,通过处理,保证session.isNew = true;
                    if (session.isNew()) {
                        logger.info("session id= " + session.getId() + " isNew=" + String.valueOf(session.isNew()));
                        //设置session超时时间
                        session.setMaxInactiveInterval(60*60*2);//2小时 60*60*2 s
                        
                        //登录成功后将用户信息对象保存在session中
                        session.setAttribute(User.USER_SESSIONG_KEY, user);
                        
                        //保存用户ID与sessionList的对应关系
                        debugPrintSession(log, "Login-Before");
                        List<HttpSession> userSessionList = userSessionMap.get(Integer.valueOf(user.getUserID()));
                        if (userSessionList != null) {
                            //此账号第N次登录,从不同的浏览器
                            //(同一浏览器登录的session是一样的,这种情况在ApiServlet.java中有处理,参考其注释)
                            userSessionList.add(session);
                            logger.info("UserID=" + String.valueOf(user.getUserID()) + " userSessionList != null");
                        } else {
                            //此账号第一次登录
                            //或者只从同一浏览器登录多次(之前同一浏览器登录的session会被无效掉ApiServlet.java,导致session listener清空userID的userSessionList)
                            logger.info("UserID=" + String.valueOf(user.getUserID()) + " userSessionList = null");
                            List<HttpSession> userNewSessionList = new ArrayList<HttpSession>();
                            userNewSessionList.add(session);
                            userSessionMap.put(Integer.valueOf(user.getUserID()), userNewSessionList);
                        }
                        debugPrintSession(log, "Login-After");
                    } else {
                        logger.info("[Error]session id= " + session.getId() + " isNew = false");
                    }
//                    logger.info( "session id= " + session.getId() + " isNew=" + String.valueOf(session.isNew()));
                    //2015-10-15，检测如果是root用户登录，并且root用户密码为默认密码（root）,则需要重置密码
                    if(userName.equals("root") && password.equals("63a9f0ea7bb98050796b649e85481845")){
                        jsonLoginUserObject.put("rootDefault", 1);
                    }else{
                        jsonLoginUserObject.put("rootDefault", 0);
                    }
                }
            } else {
                //用户名不存在
                retCode = 208;//208 用户名不存在
                descStr = "userName(" + userName + ") is not exist, Login failed";
            }
        }  catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = e.getMessage();
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        contentJson.put("loginUser", jsonLoginUserObject);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("userLogin() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
    }
    
    /* 2、   用户登出 */
    @RequestMapping(value = "/userLogout", method = RequestMethod.POST)
    public void userLogout(HttpServletRequest request, HttpServletResponse response)throws IOException{
        int    retCode  = 100;//successful
        String descStr  = null;
        StringBuffer log = null;

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session

        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();
        
        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("userLogout() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
        try{
            debugPrintSession(log, "Logout-Before");
            List<HttpSession> userSessionList = userSessionMap.get(Integer.valueOf(user.getUserID()));
            if (userSessionList != null) {
                if (userSessionList.contains(session)) {
                    userSessionList.remove(session);
                }
                
                if (userSessionList.size() == 0) {
                    userSessionMap.remove(Integer.valueOf(user.getUserID()));
                }
            }
            debugPrintSession(log, "Logout-After");
            
            //session.removeAttribute(User.USER_SESSIONG_KEY); 
            session.setAttribute(User.USER_SESSIONG_KEY, null);
            session.invalidate();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("userLogout() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;
        //return resJson.toString();
    }
    
    /* 3、   用户列表 - 当前登录账号的可见用户列表 */
    @RequestMapping(value = "/userList", method = RequestMethod.POST)
    public void userList(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException {
        StringBuffer log = null;
        int    retCode  = 100;//100  成功:  服务调用成功
        String descStr  = null;

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session

        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();
        JSONArray  jsonUserArray = new JSONArray();
        
        String userNameFilter = "", roleNameFilter = "", unionNameFilter = "";
        
        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("userList() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;

                //return resJson.toString();
            }
        }
        
/*
        */
/* 非管理员账号, 账号等级低 *//*

        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {
            retCode = 211;
            descStr = "You have no right to get user list(need System Administor or Merchant Administor)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("userList() ->" + resJson.toString());
                        //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;

            //return resJson.toString();
        }
*/

        //内容 20150527 add
        JSONObject content = JSON.parseObject(body);

        String NumberParseError = "";
        String indexStr = null, limitStr = null;
        int index = 0, limit = 15;
        int totalNum = 0;
        boolean is_enough = false;
        try {
            if (content.containsKey("index")) {
                indexStr = content.getString("index").trim();
                NumberParseError = "indexStr";
                index = Integer.parseInt(indexStr);
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [index]");
            }
            
            if (content.containsKey("limit")) {
                limitStr = content.getString("limit").trim();
                NumberParseError = "limitStr";
                limit = Integer.parseInt(limitStr);
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [limit]");
            }
            
            if (content.containsKey("userName")) {
                userNameFilter = content.getString("userName").trim();
            }
            
            if (content.containsKey("roleName")) {
                roleNameFilter = content.getString("roleName").trim();
            }
            
            if (content.containsKey("unionName")) {
                unionNameFilter = content.getString("unionName").trim();
            }
            
            /* index,limit表示从有效的数据list中返回[index, index+limit)个数据
             * 因为无法在sql中使用过滤语句,因此需要在for循环中排除不符合的数据
             * */
            List<User> listUsers = userManageDao.qryForUserList(user);
            if (listUsers != null) {
                for (int i = 0, validUserCount = 0, validUserIndex = -1; i < listUsers.size(); i++) {
                    //User.USER_ROLE_MERCHANT_USER 时使用 
                    
                    String unionIDStr = "", unionNameStr = "";
                    if (listUsers.get(i).getRoleID() == User.USER_ROLE_SYSTEM_ADMIN) {
                        //系统管理员 - 页面"所属用户"字段填写的是"系统管理员"
                        unionIDStr   = "0";
                        unionNameStr = "系统管理员";
                    }  
                    logger.info("RoleID = " + String.valueOf(listUsers.get(i).getRoleID())
                            + "|unionIDStr=" + unionIDStr
                            + "|unionNameStr=" + unionNameStr);
                    //过滤信息:userNameFilter, roleNameFilter, unionNameFilter
                    //系统管理员管理页面(目前页面过滤:账号名+账号类型+所属用户) - listUsers中只包含系统管理员和门店管理员 <- unionNameStr
                    //门店管理员管理页面(目前页面过滤:账号名+       +门店名称) - listUsers中只包含门店管理员和门店用户 <- unionNameStr
                    //[1]userNameFilter
                    if (!userNameFilter.isEmpty() && !listUsers.get(i).getUserName().contains(userNameFilter)) {
                        continue;
                    }
                    if (user.getRoleID() == User.USER_ROLE_SYSTEM_ADMIN) {
                        //[2]roleNameFilter
                        if (!roleNameFilter.isEmpty() && !listUsers.get(i).getRoleName().contains(roleNameFilter)) {
                            continue;
                        }
                    }
                    //[3]unionNameFilter
                    if (!unionNameFilter.isEmpty() && !unionNameStr.contains(unionNameFilter)) {
                        continue;
                    }
                    
                    //统计总的可返回的用户数, 判断是否到达了返回的index 和 limit限制
                    totalNum++;
                    //是否到达了结束位置
                    if (validUserCount >= limit) {
                        is_enough = true;
                    } else {
                        is_enough = false;
                    }
                    //未到开始index位置,则直接跳过之前的数据
                    validUserIndex++;//第一次时: (-1) + (1) = 0
                    if (validUserIndex < index) {
                        continue;
                    }
                    validUserCount++;
                    //logger.info( "validUserIndex=" + String.valueOf(validUserIndex) +"|validUserCount=" + String.valueOf(validUserCount));
                    
                    //可返回的用户信息,构造返回信息
                    if (is_enough == false) {
                        JSONObject jsonUserObj = new JSONObject();
                        //基本信息
                        jsonUserObj.put("userID", String.valueOf(listUsers.get(i).getUserID()));
                        jsonUserObj.put("userName", listUsers.get(i).getUserName());
                        jsonUserObj.put("roleID", String.valueOf(listUsers.get(i).getRoleID()));
                        jsonUserObj.put("roleName", listUsers.get(i).getRoleName());
                        jsonUserObj.put("name",     listUsers.get(i).getName() != null ? listUsers.get(i).getName() : "");
                        jsonUserObj.put("position", listUsers.get(i).getPosition() != null ? listUsers.get(i).getPosition() : "");
                        jsonUserObj.put("phoneNum", listUsers.get(i).getPhoneNum() != null ? listUsers.get(i).getPhoneNum() : ""); 
                        
                        //union信息
                        jsonUserObj.put("unionID",   unionIDStr);
                        jsonUserObj.put("unionName", unionNameStr);
                        
                        //功能信息
                        TreeMap<String, SystemFunction> funcTreeMap = listUsers.get(i).getFunctionTreeMap();
                        JSONArray jsonFuncListArray = new JSONArray();
                        if (!funcTreeMap.isEmpty()) {
                            for (String funcIDStr : funcTreeMap.keySet()) {
                                JSONObject jsonSysFuncObject = new JSONObject();
                                
                                jsonSysFuncObject.put("funcID", String.valueOf(funcTreeMap.get(funcIDStr).getFuncID()));
                                jsonSysFuncObject.put("funcName", funcTreeMap.get(funcIDStr).getFuncName());
                                jsonSysFuncObject.put("pageUrl", funcTreeMap.get(funcIDStr).getPageUrl());
                                jsonSysFuncObject.put("funcNameEng", String.valueOf(funcTreeMap.get(funcIDStr).getFuncNameEng()));
                                jsonSysFuncObject.put("pageArg", String.valueOf(funcTreeMap.get(funcIDStr).getPageArg()));
                                
                                jsonFuncListArray.add(jsonSysFuncObject);
                            }
                        }
                        jsonUserObj.put("funcList", jsonFuncListArray);
                        
                        jsonUserArray.add(jsonUserObj);
                    }
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = "Illegal parameter: NumberFormatException - " + NumberParseError;
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        contentJson.put("totalNum", String.valueOf(totalNum));
        contentJson.put("list", jsonUserArray);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("userList() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;

        //return resJson.toString();
    }
    
    /* 4、   角色列表 - 当前登录账号的可见角色列表-实时获取 */
    @RequestMapping(value = "/roleList", method = RequestMethod.POST)
    public void roleList(HttpServletRequest request, HttpServletResponse response)throws IOException {
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;
        
        JSONArray  jsonRoleListArray = new JSONArray();
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session

        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("roleList() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
/*        *//* 非管理员账号, 账号等级低 *//*
        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {
            retCode = 211;
            descStr = "You have no right to get role list(need system Administor or merchant Administor)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("roleList() ->" + resJson.toString());
             //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;
            //return resJson.toString();
        }*/
        
        List<UserRole> roleList = userManageDao.qryForRoleList(user);
        if (roleList != null) {
            for (int i = 0; i < roleList.size(); i++) {
                JSONObject jsonRoleObject = new JSONObject();
                
                jsonRoleObject.put("roleID", String.valueOf(roleList.get(i).getRoleID()));
                jsonRoleObject.put("roleName", roleList.get(i).getRoleName());
                
                jsonRoleListArray.add(jsonRoleObject);
            }
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        contentJson.put("list", jsonRoleListArray);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("roleList() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;

        //return resJson.toString();
    }
    
    /* 5、   商户列表 - 当前登录账号的可见商户列表-实时获取 */
    @RequestMapping(value = "/merchantList", method = RequestMethod.POST)
    public void merchantList(HttpServletRequest request, HttpServletResponse response)throws IOException {
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;
        
        JSONArray  jsonMerchantListArray = new JSONArray();
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session

        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("merchantList() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
            }
        }
        
/*        *//* 非管理员账号, 账号等级低 *//*
        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {

            retCode = 211;
            descStr = "You have no right to get merchant list(need System Administrator or Merchant Administrator)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("merchantList() ->" + resJson.toString());
                                //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;

            //return resJson.toString();
        }
 */ 
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        contentJson.put("list", jsonMerchantListArray);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("merchantList() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
    }
    
    /* 6、  门店列表 - 当前登录账号的可见门店列表-实时获取 */
    @RequestMapping(value = "/buildingList", method = RequestMethod.POST)
    public void buildingList(HttpServletRequest request, HttpServletResponse response)throws IOException  {
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session

        JSONArray  jsonBuildingListArray = new JSONArray();
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();
        
        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("buildingList() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
/*        *//* 非管理员账号, 账号等级低 *//*
        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {
            retCode = 211;
            descStr = "You have no right to get building list(need System Administrator or Merchant Administrator)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("buildingList() ->" + resJson.toString());
            //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;
            //return resJson.toString();
        }
 */ 
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        contentJson.put("list", jsonBuildingListArray);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("buildingList() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        //return resJson.toString();
    }
    
    /* 7、   功能列表 - 当前登录账号的可见功能列表-实时获取 */
    @RequestMapping(value = "/funcList", method = RequestMethod.POST)
    public void funcList(HttpServletRequest request, HttpServletResponse response)throws IOException  {
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session

        JSONArray  jsonFunctionListArray = new JSONArray();
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();
        
        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("funcList() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
        /* 非管理员账号, 账号等级低 */
/*        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {
            retCode = 211;
            descStr = "You have no right to get function list(need System Administrator or Merchant Administrator)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("funcList() ->" + resJson.toString());
            //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;
            //return resJson.toString();
        }
 */
        List<SystemFunction> functionList = userManageDao.qryForFunctionList(user);
        if (functionList != null) {
            for (int i = 0; i < functionList.size(); i++) {
                JSONObject jsonFunctionObject = new JSONObject();
                
                jsonFunctionObject.put("funcID", String.valueOf(functionList.get(i).getFuncID()));
                jsonFunctionObject.put("funcName", functionList.get(i).getFuncName());
                jsonFunctionObject.put("funcNameEng", functionList.get(i).getFuncNameEng());
                jsonFunctionObject.put("pageUrl", functionList.get(i).getPageUrl());
                jsonFunctionObject.put("pageArg", functionList.get(i).getPageArg());
                
                jsonFunctionListArray.add(jsonFunctionObject);
            }
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        contentJson.put("list", jsonFunctionListArray);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("funcList() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;
        //return resJson.toString();
    }
    
    /* 8、   添加用户 */
    @RequestMapping(value = "/addUser", method = RequestMethod.POST)
    public void addUser(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException{
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;
        
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session

        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("addUser() ->" + resJson.toString());

                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
        /* 非管理员账号, 账号等级低 */
        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {
            retCode = 211;
            descStr = "You have no right to add any other account(need System Administrator or Merchant Administrator)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("addUser() ->" + resJson.toString());
            //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;
            //return resJson.toString();
        }
        
        String userName = null;
        String password = null;
        String gender   = null;
        int userID = User.INVALID_USER_ID;
        int roleID = User.INVALID_USER_ROLEID;
        int merchantID = User.INVALID_USER_MERID;
        int buildingID = User.INVALID_USER_BUILDID;
        String roleIDStr = null, merchantIDStr = null;
        String name = null, position = null, phoneNum = null;
        String funcListStr = null, buildingIDStr = null;
        User newUser = new User();
        String NumberParseError = null;

        //内容
        JSONObject content = JSON.parseObject(body);
        logger.info("add user api, argument" + content.toString());

        try {
            if (content.containsKey("userName")) {
                userName = content.getString("userName").trim();
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [userName]");
            }
            
            if (content.containsKey("password")) {
                password = content.getString("password").trim();
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [password]");
            }
            
            if (content.containsKey("roleID")) {
                roleIDStr = content.getString("roleID").trim();
                NumberParseError = "roleID";
                roleID = Integer.parseInt(roleIDStr);
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [roleID]");
            }
            
            if (roleID == User.USER_ROLE_MERCHANT_ADMIN) {
                if (content.containsKey("merchantID")) {
                    merchantIDStr = content.getString("merchantID").trim();
                    NumberParseError = "merchantID";
                    merchantID = Integer.parseInt(merchantIDStr);
                } else {
                    throw new JSONException("Illegal parameter:JSON String can not found [merchantID]");
                }
            } else if (roleID == User.USER_ROLE_MERCHANT_USER) {
                //添加门店用用户 
                NumberParseError = "merchantID";
                merchantID = Integer.parseInt(merchantIDStr);
                
                 
            } else {
                //添加系统管理员
                //merchantID = 0;
                retCode = 211;//不能增加系统管理员
                descStr = "You have no right to add system administrator account(System Administrator account can not be added from Web)";
                contentJson.put("code", String.valueOf(retCode));
                contentJson.put("desc", descStr);
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("addUser() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
            
            if (content.containsKey("name")) {
                name = content.getString("name").trim();
            } else {
                name = "";
            }
            
            if (content.containsKey("position")) {
                position = content.getString("position").trim();
            } else {
                position = "";
            }
            
            if (content.containsKey("phoneNum")) {
                phoneNum = content.getString("phoneNum").trim();
            } else {
                phoneNum = "";
            }
            
            if (content.containsKey("gender")) {
                gender = content.getString("gender").trim();
            } else {
                gender = "男";
            }
            
            if (content.containsKey("funcList")) {
                funcListStr = content.getString("funcList").trim();
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [funcList]");
            }
            
            if (userManageDao.userNameIsExist(userName)) {
                retCode = 201;//201 用户名已经存在
                descStr = "userName is exist already";
            } else {
                TreeMap<String, String> merchantCache = new TreeMap<String, String>();
                /* 门店管理员 */
                if (user.getRoleID() == User.USER_ROLE_MERCHANT_ADMIN) {
                    //只能添加门店用户账号
                    if (roleID != User.USER_ROLE_MERCHANT_USER) {//roleID: 1,2,3*
                        retCode = 211;//门店管理员不能管理其他门店管理员(删除/修改)
                        descStr = "You have no right to add new Merchant Administrator";
                        contentJson.put("code", String.valueOf(retCode));
                        contentJson.put("desc", descStr);
                        resJson.put("sign", "null");
                        resJson.put("content", contentJson);
                        
                        logger.info("addUser() ->" + resJson.toString());
                        //web回复
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/plain");
                        response.getWriter().write(resJson.toString());
                        return;
                        //return resJson.toString();
                    }
                     
                    //门店用户的功能列表只能小于等于门店管理员
                    if (user.functionIDIsUnderControl(funcListStr) == false) {
                        retCode = 214;//非法的功能列表参数 - 超出账号管理范围
                        descStr = "You have no right to assign part of the function to the new account";
                        contentJson.put("code", String.valueOf(retCode));
                        contentJson.put("desc", descStr);
                        resJson.put("sign", "null");
                        resJson.put("content", contentJson);
                        
                        logger.info("addUser() ->" + resJson.toString());
                        //web回复
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/plain");
                        response.getWriter().write(resJson.toString());
                        return;
                        //return resJson.toString();
                    }
                    
                     
                }
                
                /* 系统管理员账号 */
                if (user.getRoleID() == User.USER_ROLE_SYSTEM_ADMIN) {
                    //只能添加门店管理员
                    if (roleID != User.USER_ROLE_MERCHANT_ADMIN) {//roleID: 1,2,3*
                        retCode = 211;//系统管理员不能管理门店用户(删除/修改)
                        descStr = "You have no right to add a Merchant User account, you can only add Merchant Administrator account.";
                        contentJson.put("code", String.valueOf(retCode));
                        contentJson.put("desc", descStr);
                        resJson.put("sign", "null");
                        resJson.put("content", contentJson);
                        
                        logger.info("addUser() ->" + resJson.toString());
                        //web回复
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/plain");
                        response.getWriter().write(resJson.toString());
                        return;
                        //return resJson.toString();
                    }
                    
                     
                    //功能列表只能小于等于系统管理员
                    if (user.functionIDIsUnderControl(funcListStr) == false) {
                        retCode = 214;//非法的功能列表
                        descStr = "You have no right to assign part of the function to  the new account.";
                        contentJson.put("code", String.valueOf(retCode));
                        contentJson.put("desc", descStr);
                        resJson.put("sign", "null");
                        resJson.put("content", contentJson);
                        
                        logger.info("addUser() ->" + resJson.toString());
                        //web回复
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/plain");
                        response.getWriter().write(resJson.toString());
                        return;
                        //return resJson.toString();
                    }
                }
                
                newUser.setUserName(userName);
                newUser.setUserPass(password);
                newUser.setRoleID(roleID); 
                newUser.setName(name);
                newUser.setPosition(position);
                newUser.setPhoneNum(phoneNum);
                newUser.setGender(gender);
                if (roleID == User.USER_ROLE_MERCHANT_USER) {
                    //后续不能使用buildingName,因为这里无法获取
                    TreeMap<String, String> buildingCache = new TreeMap<String, String>();
                    
                   
                }
                
                userID = userManageDao.addUser(newUser, funcListStr);
                if (userID == User.INVALID_USER_ID) {
                    //failed
                    retCode = 202;//202 用户ID无法获取
                    descStr = "userID error";
                } else {
                    //success
                    retCode = 100;//100  成功:  服务调用成功
                    descStr = "";
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;//105 错误：非法的请求参数
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = "Illegal parameter: NumberFormatException - " + NumberParseError;
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        contentJson.put("userID", userID);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("addUser() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;
        //return resJson.toString();
    }
    
    /* 9、  删除用户 */
    @RequestMapping(value = "/deleteUser", method = RequestMethod.POST)
    public void deleteUser(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException{
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;
        
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session
        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("deleteUser() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
        /* 非管理员账号, 账号等级低 */
        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {
            retCode = 211;
            descStr = "You have no right to delete any other account(need System Administrator or Merchant Administrator)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("deleteUser() ->" + resJson.toString());
            //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;
            //return resJson.toString();
        } 
        
        String userIDStr = null;
        String exceptStr = "";
        int userID = User.INVALID_USER_ID;

        //内容
        JSONObject content = JSON.parseObject(body);
        try {
            if (content.containsKey("userID")) {
                userIDStr = content.getString("userID");
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [userID]");
            }
            
            exceptStr = "userID";
            userID = Integer.parseInt(userIDStr);
            
            if (userManageDao.userIDIsExist(userID)) {
                List<Integer> delUserIDList = new ArrayList<Integer>();
                if (userID != user.getUserID()) {
                    /* 管理员账号, 但是不可以管理此userID */
                    List<Integer> subUserIDList = userManageDao.qryForSubUserIDList(user);
                    if (subUserIDList == null || !subUserIDList.contains(Integer.valueOf(userID))) {
                        retCode = 212;
                        descStr = "You have no right to delete the selected account,(" + String.valueOf(user.getUserID()) +  ":" + String.valueOf(userID) + ")";
                        contentJson.put("code", String.valueOf(retCode));
                        contentJson.put("desc", descStr);
                        resJson.put("sign", "null");
                        resJson.put("content", contentJson);
                        
                        logger.info("deleteUser() ->" + resJson.toString());
                        //web回复
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/plain");
                        response.getWriter().write(resJson.toString());
                        return;
                        //return resJson.toString();
                    }
                    //管理员可以删除: 系统管理员删除门店管理员  or 门店管理员删除门店用户
                    delUserIDList.add(Integer.valueOf(userID));
                    List<Integer> delSubUserIDList = null;
                    User delUser = userManageDao.qryForUserInfo(userID);
                     
                    if (delSubUserIDList != null && delSubUserIDList.size() > 0) {
                        delUserIDList.addAll(delSubUserIDList);
                    }
                } else {
                    //删除当前登录的账号自己  - 2014-12-03限制不能删除自己
                    if (user.getRoleID() == User.USER_ROLE_SYSTEM_ADMIN) {
                        retCode = 209;
                        descStr = "You have no right to delete System Administor account:" + user.getUserName();
                        contentJson.put("code", String.valueOf(retCode));
                        contentJson.put("desc", descStr);
                        resJson.put("sign", "null");
                        resJson.put("content", contentJson);
                        
                        logger.info("deleteUser() ->" + resJson.toString());
                        //web回复
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/plain");
                        response.getWriter().write(resJson.toString());
                        return;
                        //return resJson.toString();
                        
//                        //系统管理员 自己删除自己 - 禁止
//                        if (bwService.getSystemAdminCount() == 1) {
//                            //避免删除唯一的系统管理员
//                            retCode = 209;
//                            descStr = "You have no right to the only one System Admin:" + user.getUserName();
//                            contentJson.put("code", String.valueOf(retCode));
//                            contentJson.put("desc", descStr);
//                            resJson.put("sign", "null");
//                            resJson.put("content", contentJson);
//                                    
//                            logger.info( "deleteUser() ->" + resJson.toString());
//                            return resJson.toString();
//                        } else {
//                            delUserIDList.add(Integer.valueOf(user.getUserID()));
//                        }
                    } else {
                        retCode = 209;
                        descStr = "You have no right to delete Merchant Administor account:" + user.getUserName();
                        contentJson.put("code", String.valueOf(retCode));
                        contentJson.put("desc", descStr);
                        resJson.put("sign", "null");
                        resJson.put("content", contentJson);
                        
                        logger.info("deleteUser() ->" + resJson.toString());
                        //web回复
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/plain");
                        response.getWriter().write(resJson.toString());
                        return;
                        //return resJson.toString();
//                        //门店管理员 自己删除自己 - 禁止
//                        delUserIDList.add(Integer.valueOf(userID));
//                        List<Integer> delSubUserIDList = null;
//                        if (bwService.getMerchantAdminCount(Integer.parseInt(user.getMerchantCache().firstKey())) == 1) {
//                            //如果删除商户仅剩下的一个门店管理员,那么门店管理员下面的商户用户将全部一并删除
//                            delSubUserIDList = bwService.getSubUserIDList(log, user);
//                        }
//                        if (delSubUserIDList != null && delSubUserIDList.size() > 0) {
//                            delUserIDList.addAll(delSubUserIDList);
//                        }
                    }
                }
                
                if (userManageDao.deleteUser(delUserIDList)) {
                    retCode = 100;//100  成功:  服务调用成功
                    descStr = "";
                    
                    //将此delUserIDList对应的所有Session都无效掉,使 使用这个账号登录的用户全部下线.
                    invalidateUserIDSession(log, delUserIDList, false, User.INVALID_USER_ID, "");
                } else {
                    retCode = 107;//107  错误：系统出错
                    descStr = "Del user failed";
                }
            } else {
                retCode = 203;//203 用户ID不存在
                descStr = "userId is not exist";
            }
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = "Illegal parameter: NumberFormatException - " + exceptStr;
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("deleteUser() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;
        //return resJson.toString();
    }
    
    /* 10、   修改用户 
     * 
     * (1)系统管理员可修改项:
     *   (A) 修改自己:position,phoneNum,gender <- only, so no need to invalid Session
     *   (B) 修改门店管理员:position,phoneNum,funcList(可能导致门店管理员之下的门店用户funcList被修改)
     * (2)门店管理员可修改项:
     *   (A) 修改自己:position,phoneNum,gender <- only, so no need to invalid Session
     *   (B) 修改门店用户:position,phoneNum,funcList,buildingID
     * (3)门店用户: 无权限访问接口
     **/
    @RequestMapping(value = "/changeUser", method = RequestMethod.POST)
    public void changeUser(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException{
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;
        
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session

        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("changeUser() ->" + resJson.toString());

                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
        String userIDStr = null;
        int userID = User.INVALID_USER_ID;
        int buildingID = User.INVALID_USER_BUILDID;
        String name = null, position = null, phoneNum = null, gender = null;
        String funcListStr = null;
        String buildingIDStr = null;
        User newUser = new User();
        String NumberParseError = null;
        
/*
        */
/* 非管理员账号, 账号等级低 *//*

        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {
            retCode = 211;
            descStr = "You have no right to change any other account's information (need System Administor or Merchant Administor)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("changeUser() ->" + resJson.toString());
            //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;
            //return resJson.toString();
        }
*/

        //内容
        JSONObject content = JSON.parseObject(body);
        try {
            if (content.containsKey("userID")) {
                userIDStr = content.getString("userID").trim();
                NumberParseError = "userID";
                userID = Integer.parseInt(userIDStr);
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [userID]");
            }
            //null在DAO出表示不需要修改, 前端""或者不包含在json中表示不修改
            if (content.containsKey("name")) {
                name = content.getString("name").trim().length() > 0 ? content.getString("name").trim() : null;
            } else {
                name = null;
            }
            
            if (content.containsKey("position")) {
                position = content.getString("position").trim().length() > 0 ? content.getString("position").trim() : null;
            } else {
                position = null;
            }
            
            if (content.containsKey("phoneNum")) {
                phoneNum = content.getString("phoneNum").trim().length() > 0 ? content.getString("phoneNum").trim() : null;
            } else {
                phoneNum = null;
            }
            
            if (content.containsKey("gender")) {
                gender = content.getString("gender").trim().length() > 0 ? content.getString("gender").trim() : null;
            } else {
                gender = null;
            }
            
            if (content.containsKey("funcList")) {
                funcListStr = content.getString("funcList").trim().length() > 0 ? content.getString("funcList").trim() : null;
            } else {
                funcListStr = null;
            }
            
            if (content.containsKey("buildingID")) {
                buildingIDStr = content.getString("buildingID").trim();
                if (buildingIDStr.isEmpty()) {
                    buildingID = User.INVALID_USER_BUILDID;//表示不修改
                } else {
                    NumberParseError = "buildingID";
                    buildingID = Integer.parseInt(buildingIDStr);
                }
            } else {
                buildingID = User.INVALID_USER_BUILDID;//表示不修改
            }
            
            if (!userManageDao.userIDIsExist(userID)) {
                retCode = 203;//203 用户ID不存在
                descStr = "userID is not exist";
            } else {
                boolean needExclude = false;
                int excludeUserID = User.INVALID_USER_ID;
                String excludeSession = session.getId();
                /* 管理员账号 
                 * 
                 * 系统管理员 管理:自己+门店管理员
                 * 门店管理员 管理:自己+门店用户(同一merchant_id下)
                 * */
                //[0]管理自己:修改自身信息: 仅支持 position phoneNum gender
                if (userID == user.getUserID()) {
                    if (name == null && position == null && phoneNum == null && gender == null) {//无需修改?
                        retCode = 100;
                        descStr = "";
                        contentJson.put("code", String.valueOf(retCode));
                        contentJson.put("desc", descStr);
                        resJson.put("sign", "null");
                        resJson.put("content", contentJson);
                        
                        logger.info("changeUser() ->" + resJson.toString());
                        //web回复
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/plain");
                        response.getWriter().write(resJson.toString());
                        return;
                        //return resJson.toString();
                    } else {
                        newUser.setUserId(userID);
                        newUser.setName(name);
                        newUser.setPosition(position);
                        newUser.setPhoneNum(phoneNum);
                        newUser.setGender(gender); 
                        funcListStr = null;//不能修改
                    }
                } else {
                    /* 管理员账号: 不可以管理此userID */
                    List<Integer> subUserIDList = userManageDao.qryForSubUserIDList(user);
                    if (subUserIDList == null || !subUserIDList.contains(Integer.valueOf(userID))) {
                        retCode = 212;
                        descStr = "You have no right to change the selected account,(" + String.valueOf(user.getUserID()) +  ":" + String.valueOf(userID) + ")";
                        contentJson.put("code", String.valueOf(retCode));
                        contentJson.put("desc", descStr);
                        resJson.put("sign", "null");
                        resJson.put("content", contentJson);
                        
                        logger.info("changeUser() ->" + resJson.toString());
                        //web回复
                        response.setCharacterEncoding("utf-8");
                        response.setContentType("text/plain");
                        response.getWriter().write(resJson.toString());
                        return;
                        //return resJson.toString();
                    }
                    
                    /* 管理员账号: 可管理此userID, 这此ID的roleID一定等于2,表示门店管理员
                     * (1)系统管理员: 管理 门店管理员
                     * (2)门店管理员: 管理 门店用户
                     * */
                    if (user.getRoleID() == User.USER_ROLE_SYSTEM_ADMIN) {
                        /* 系统管理员-修改-门店管理员 */
                        //必须设置, 登录用户为SyatemAdmin,并且修订的时merchantAdmin,DAO需要判断是否导致merchantAdmin的子用户功能列表一并修改
                        newUser.setRoleID(User.USER_ROLE_MERCHANT_ADMIN);
                        
                        if (name == null && position == null && phoneNum == null && gender == null 
                            && buildingID == User.INVALID_USER_BUILDID ) {//无需修改?
                            retCode = 100;
                            descStr = "";
                            contentJson.put("code", String.valueOf(retCode));
                            contentJson.put("desc", descStr);
                            resJson.put("sign", "null");
                            resJson.put("content", contentJson);
                            
                            logger.info("changeUser() ->" + resJson.toString());
                            //web回复
                            response.setCharacterEncoding("utf-8");
                            response.setContentType("text/plain");
                            response.getWriter().write(resJson.toString());
                            return;
                            //return resJson.toString();
                        } else {
                            newUser.setUserId(userID);
                            newUser.setName(name);
                            newUser.setPosition(position);
                            newUser.setPhoneNum(phoneNum);
                            newUser.setGender(gender); 
                            if (funcListStr == null || funcListStr.isEmpty()) {
                                funcListStr = null;//不用修改
                            } else {
                                //功能列表只能小于等于系统管理员
                                if (user.functionIDIsUnderControl(funcListStr) == false) {
                                    retCode = 214;//非法的功能列表
                                    descStr = "You have no right to assign part of the function to the selected account";
                                    contentJson.put("code", String.valueOf(retCode));
                                    contentJson.put("desc", descStr);
                                    resJson.put("sign", "null");
                                    resJson.put("content", contentJson);
                                    
                                    logger.info("changeUser() ->" + resJson.toString());
                                    //web回复
                                    response.setCharacterEncoding("utf-8");
                                    response.setContentType("text/plain");
                                    response.getWriter().write(resJson.toString());
                                    return;
                                    //return resJson.toString();
                                }
                            }
                        }
                    } else {
                        /* 门店管理员-修改-门店用户 */
                        if (name == null && position == null && phoneNum == null && gender == null
                            && buildingID == User.INVALID_USER_BUILDID 
                            && (funcListStr == null || funcListStr.isEmpty())) {//无需修改?
                            retCode = 100;
                            descStr = "";
                            contentJson.put("code", String.valueOf(retCode));
                            contentJson.put("desc", descStr);
                            resJson.put("sign", "null");
                            resJson.put("content", contentJson);
                            
                            logger.info("changeUser() ->" + resJson.toString());
                            //web回复
                            response.setCharacterEncoding("utf-8");
                            response.setContentType("text/plain");
                            response.getWriter().write(resJson.toString());
                            return;
                            //return resJson.toString();
                        } else {
                            newUser.setUserId(userID);
                            newUser.setName(name);
                            newUser.setPosition(position);
                            newUser.setPhoneNum(phoneNum);
                            newUser.setGender(gender);
                             
                            if (funcListStr == null || funcListStr.isEmpty()) {
                                funcListStr = null;//不用修改
                            } else {
                                //功能列表只能小于等于门店管理员
                                if (user.functionIDIsUnderControl(funcListStr) == false) {
                                    retCode = 214;//非法的功能列表
                                    descStr = "You have no right to assign part of the function to the selected account";
                                    contentJson.put("code", String.valueOf(retCode));
                                    contentJson.put("desc", descStr);
                                    resJson.put("sign", "null");
                                    resJson.put("content", contentJson);
                                    
                                    logger.info("changeUser() ->" + resJson.toString());
                                    //web回复
                                    response.setCharacterEncoding("utf-8");
                                    response.setContentType("text/plain");
                                    response.getWriter().write(resJson.toString());
                                    return;
                                    //return resJson.toString();
                                }
                            }
                        }
                    }
                }
                
                if (!userManageDao.changeUser(user, newUser, funcListStr)) {
                    //failed
                    retCode = 107;//107 系统错误 - 修改失败
                    descStr = "userID error";
                } else {
                    //success
                    retCode = 100;//100  成功:  服务调用成功
                    descStr = "";
                    
                    if (userID == user.getUserID()) {
                        needExclude = true;
                        excludeUserID = userID;
                        
                        //自己只可以修改此3项数据.此时可以不用无效自己的session,只需同步user内的数据即可
                        if (position != null) {
                            user.setPosition(position);
                        }
                        if (phoneNum != null) {
                            user.setPhoneNum(phoneNum);
                        }
                        
                        if (gender != null) {
                            user.setGender(gender);
                        }
                    }
                    
                    //无效newUser id 的全部session
                    List<Integer> tempUserList = new ArrayList<Integer>();
                    tempUserList.add(Integer.valueOf(newUser.getUserID()));
                    invalidateUserIDSession(log, tempUserList, needExclude, excludeUserID, excludeSession);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;//105 错误：非法的请求参数
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;
            descStr = "Illegal parameter: NumberFormatException - " + NumberParseError;
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("changeUser() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;
        //return resJson.toString();
    }
    
    /* 11、  密码更新-自己 */
    @RequestMapping(value = "/updatePassword", method = RequestMethod.POST)
    public void updatePassword(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException{
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;
        
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session
        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("updatePassword() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
        String oldPass   = null;
        String newPass   = null;
        String exceptStr = "";
        int userID = Integer.MAX_VALUE;

        //内容
        JSONObject content = JSON.parseObject(body);
        try {
            if (content.containsKey("oldPass")) {
                oldPass = content.getString("oldPass");
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [oldPass]");
            }
            
            if (content.containsKey("newPass")) {
                newPass = content.getString("newPass");
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [newPass]");
            }
            
            userID = user.getUserID();
            if (userManageDao.userIDIsExist(userID)) {
                if (userManageDao.userPassIsCurrent(userID, oldPass)) {
                    if (userManageDao.updateUserPass(userID, newPass)) {
                        retCode = 100;//100  成功:  服务调用成功
                        descStr = "";
                        user.setUserPass(newPass);
                        
                        //将此userID对应的所有Session都无效掉,使用这个账号登录的用户全部下线(除了当前正在处理的user).
                        List<Integer> userIDList = new ArrayList<Integer>();
                        userIDList.add(Integer.valueOf(userID));
                        invalidateUserIDSession(log, userIDList, true, userID, session.getId());
                    } else {
                        retCode = 107;//107  错误：系统出错
                        descStr = "Update user password failed - system error";
                    }
                } else {
                    retCode = 204;//204   原密码不正确
                    descStr = "Old password is not current";
                }
            } else {
                retCode = 203;//203 用户ID不存在
                descStr = "userId is not exist";
            }
        }  catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = "Illegal parameter: NumberFormatException - " + exceptStr;
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("updatePassword() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;
        //return resJson.toString();
    }

    /* 11 plus、  用户名 密码更新*/
    @RequestMapping(value = "/updateUser", method = RequestMethod.POST)
    public void updateUser(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException{
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;

        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session
        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew()
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);

                logger.info("updatePassword() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }

        String oldPass   = null;
        String newPass   = null;
        String userName = null;
        String exceptStr = "";
        int userID = Integer.MAX_VALUE;

        //内容
        JSONObject content = JSON.parseObject(body);
        try {
            if (content.containsKey("oldPass")) {
                oldPass = content.getString("oldPass");
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [oldPass]");
            }

            if (content.containsKey("newPass")) {
                newPass = content.getString("newPass");
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [newPass]");
            }

            if(content.containsKey("userName")){
                userName = content.getString("userName");
            }else{
                throw new JSONException("Illegal parameter:JSON String can not found [userName]");
            }

            userID = user.getUserID();
            if (userManageDao.userIDIsExist(userID)) {
                if (userManageDao.userPassIsCurrent(userID, oldPass)) {
                    if (userManageDao.updateUser(userID, userName, newPass)) {
                        retCode = 100;//100  成功:  服务调用成功
                        descStr = "";
                        user.setName(userName);
                        user.setUserPass(newPass);

                        //将此userID对应的所有Session都无效掉,使用这个账号登录的用户全部下线(除了当前正在处理的user).
                        List<Integer> userIDList = new ArrayList<Integer>();
                        userIDList.add(Integer.valueOf(userID));
                        invalidateUserIDSession(log, userIDList, true, userID, session.getId());
                    } else {
                        retCode = 107;//107  错误：系统出错
                        descStr = "Update user password failed - system error";
                    }
                } else {
                    retCode = 204;//204   原密码不正确
                    descStr = "原密码不正确";
                }
            } else {
                retCode = 203;//203 用户ID不存在
                descStr = "用户不存在";
            }
        }  catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = "Illegal parameter: NumberFormatException - " + exceptStr;
        }

        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);

        logger.info("updatePassword() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;
        //return resJson.toString();
    }

    /* 12、  密码重置 -重置其他人密码 */
    @RequestMapping(value = "/resetPassword", method = RequestMethod.POST)
    public void resetPassword(@RequestBody String body, HttpServletRequest request, HttpServletResponse response)throws IOException{
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;
        
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session
        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("resetPassword() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
        /* 非管理员账号, 账号等级低 */
        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {
            retCode = 211;
            descStr = "You have no right to reset other account's password(need System Administor or Merchant Administor)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("resetPassword() ->" + resJson.toString());
            //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;
            //return resJson.toString();
        } 
        
        String userIDStr = null;
        String newPass   = null;
        String exceptStr = "";
        int userID = Integer.MAX_VALUE;

        //内容
        JSONObject content = JSON.parseObject(body);
        try {
            if (content.containsKey("userID")) {
                userIDStr = content.getString("userID");
                exceptStr = "userID";
                userID = Integer.parseInt(userIDStr);
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [userID]");
            }
            
            if (content.containsKey("newPass")) {
                newPass = content.getString("newPass");
            } else {
                throw new JSONException("Illegal parameter:JSON String can not found [newPass]");
            }
            
            if (userManageDao.userIDIsExist(userID)) {
                /* 管理员账号, 但是不可以管理此userID */
                List<Integer> subUserIDList = userManageDao.qryForSubUserIDList(user);
                if (subUserIDList == null || !subUserIDList.contains(Integer.valueOf(userID))) {
                    retCode = 212;
                    descStr = "You have no right to delete the selected account,(" + String.valueOf(user.getUserID()) +  ":" + String.valueOf(userID) + ")";
                    contentJson.put("code", String.valueOf(retCode));
                    contentJson.put("desc", descStr);
                    resJson.put("sign", "null");
                    resJson.put("content", contentJson);
                    
                    logger.info("resetPassword() ->" + resJson.toString());
                    //web回复
                    response.setCharacterEncoding("utf-8");
                    response.setContentType("text/plain");
                    response.getWriter().write(resJson.toString());
                    return;
                    //return resJson.toString();
                }
                
                //重置密码
                if (userManageDao.resetUserPass(userID, newPass)) {
                    retCode = 100;//100  成功:  服务调用成功
                    descStr = "";
                    
                    //将此userID对应的所有Session都无效掉,使 使用这个账号登录的用户全部下线.
                    List<Integer> userIDList = new ArrayList<Integer>();
                    userIDList.add(Integer.valueOf(userID));
                    invalidateUserIDSession(log, userIDList, false, User.INVALID_USER_ID, "");
                } else {
                    retCode = 107;//107  错误：系统出错
                    descStr = "Reset user password failed - system error";
                }
            } else {
                retCode = 203;//203 用户ID不存在
                descStr = "userID is not exist";
            }
        }  catch (JSONException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = e.getMessage();
        } catch (NumberFormatException e) {
            e.printStackTrace();
            retCode = 105;//105  错误：非法的请求参数
            descStr = "Illegal parameter: NumberFormatException - " + exceptStr;
        }
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("resetPassword() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        return;
        //return resJson.toString();
    }
    
    /* 13、  职位列表 */
    @RequestMapping(value = "/positionList", method = RequestMethod.POST)
    public void positionList(HttpServletRequest request, HttpServletResponse response)throws IOException{
        StringBuffer log = null;
        int    retCode  = 100;//successful
        String descStr  = null;
        
        JSONArray  jsonPositionListArray = new JSONArray();
        JSONObject resJson = new JSONObject();
        JSONObject contentJson = new JSONObject();

        //session处理 20150527 add
        HttpSession session = request.getSession(true);//true指明: 如果session不存在则创建新session
        User user = null;
        if (User.is_user_session_check_enable) {
            if (!session.isNew() 
                && session.getAttribute(User.USER_SESSIONG_KEY) != null
                && ((User)session.getAttribute(User.USER_SESSIONG_KEY)).getUserIsLogin()) {
                //账号已登陆,获取账号信息
                user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
            } else {
                contentJson.put("code", String.valueOf(210));//210 账号未登陆/或超时
                contentJson.put("desc", "userName is not login or timeout");
                resJson.put("sign", "null");
                resJson.put("content", contentJson);
                
                logger.info("positionList() ->" + resJson.toString());
                //web回复
                response.setCharacterEncoding("utf-8");
                response.setContentType("text/plain");
                response.getWriter().write(resJson.toString());
                return;
                //return resJson.toString();
            }
        }
        
/*        *//* 非管理员账号, 账号等级低 *//*
        if (user.getRoleID() >= User.USER_ROLE_MERCHANT_USER) {
            retCode = 211;
            descStr = "You have no right to get building list(need System Administrator or Merchant Administrator)";
            contentJson.put("code", String.valueOf(retCode));
            contentJson.put("desc", descStr);
            resJson.put("sign", "null");
            resJson.put("content", contentJson);
            
            logger.info("positionList() ->" + resJson.toString());
            //web回复
            response.setCharacterEncoding("utf-8");
            response.setContentType("text/plain");
            response.getWriter().write(resJson.toString());
            return;
            //return resJson.toString();
        }
 */
         
        
        contentJson.put("code", String.valueOf(retCode));
        contentJson.put("desc", descStr);
        contentJson.put("list", jsonPositionListArray);
        resJson.put("sign", "null");
        resJson.put("content", contentJson);
        
        logger.info("positionList() ->" + resJson.toString());
        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        response.getWriter().write(resJson.toString());
        //return resJson.toString();
    }
 
}
