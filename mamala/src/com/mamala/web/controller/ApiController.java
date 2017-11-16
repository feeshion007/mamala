package com.mamala.web.controller;

/**
 * Created by OA on 2015/5/22.
 */
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

//import com.alibaba.fastjson.JSON;
//import com.alibaba.fastjson.JSONObject;

//import net.sf.json.JSONObject;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import com.mamala.market.pojo.common.User;
import org.apache.log4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.util.StringUtils;
import org.springframework.web.context.ContextLoader;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Controller
public class ApiController {

    private static Logger logger = Logger.getLogger(ApiController.class);
    public static final ThreadLocal<Map<String, Object>> localParaHolder = new ThreadLocal<Map<String, Object>>();
    private Map<String, InvokeInfo> invokeInfoCacheMap = new ConcurrentHashMap<String, InvokeInfo>();
    //private ApplicationContext context;
    private ApplicationContext context = ContextLoader.getCurrentWebApplicationContext();

    @RequestMapping(value = "/service", method = RequestMethod.POST)
    public void service(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String remoteIp = request.getRemoteAddr();
        logger.info("remoteIp:" + remoteIp);
        Map<String, Object> localPara = new HashMap<String, Object>();
        localPara.put("remoteIp", remoteIp);

        localParaHolder.set(localPara);
        BufferedReader inputStream = new BufferedReader(new InputStreamReader(request.getInputStream(), "UTF-8"));
        StringBuilder requestBody = new StringBuilder();
        String line = null;
        while ((line = inputStream.readLine()) != null) {
            logger.info(line);
            requestBody.append(line);
        }
        inputStream.close();
        String bodyStr = requestBody.toString();
        logger.info("requestBody:" + bodyStr);
        //如果请求内容为空
        if (StringUtils.isEmpty(bodyStr)){
            return;
        }

        //表示请求的内容区数据为form表单提交的参数，此时我们可以通过request.getParameter得到数据（key=value）
        //JSONObject jsonObject = JSON.parseObject(bodyStr);
        JSONObject jsonObject = JSONObject.parseObject(bodyStr);
        JSONObject content = jsonObject.getJSONObject("content");
        String sign = jsonObject.getString("sign");
        String version = jsonObject.getString("version");
        String appId = jsonObject.getString("appId");


        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        PrintWriter out = response.getWriter();

        // 1. 检查请求的4个必备参数是否存在
        if (content == null || StringUtils.isEmpty(sign) || StringUtils.isEmpty(version) || StringUtils.isEmpty(appId)) {
            String resultJson = "{\"content\":\"{'code':'105','desc':'错误:非法的请求参数,请确认请求参数中是否包含content、version、sign、appId字段'}\"}";
            out.write(resultJson);
            out.close();
            logger.info("API接口调用请求出错," + resultJson);
            return;
        }

        String methodStr = (String)content.get("method");
        methodStr = methodStr.trim();
        logger.info("调用的API接口为: " + methodStr);

        //由于原始框架遗留问题，http进来2后解析content内容。根据content中method字段找出对应的bean
        //method字段和bean的对应关系保存在map中。而/service下不能访问userManage.userLogin
        boolean methodGet = false;
        InvokeInfo invokeInfo = new InvokeInfo();
        if (StringUtils.isEmpty(methodStr) || !methodStr.equalsIgnoreCase("userManage.userLogin")) {
            // 4. 解析请求方法
            invokeInfo = invokeInfoCacheMap.get(methodStr);
            if (invokeInfo == null) {
                String[] requestMethod = methodStr.split("\\.");
                Object obj = context.getBean(requestMethod[0]);
                if (obj != null) {
                    Class<? extends Object> objCls = obj.getClass();
                    Method[] mts = objCls.getMethods();
                    for (Method mt : mts) {
                        if (requestMethod[1].equals(mt.getName())) {
                            if (mt.getParameterTypes() != null && mt.getParameterTypes().length != 0) {
                                invokeInfo = new InvokeInfo(mt, obj, mt.getParameterTypes()[0]);
                            } else {
                                invokeInfo = new InvokeInfo(mt, obj);
                            }
                            invokeInfoCacheMap.put(methodStr, invokeInfo);
                            methodGet = true;
                            break;
                        }
                    }
                }
            }else{
                methodGet = true;
            }
        }
        //如果method参数没有获取到，返回错误信息
        if(!methodGet){
            String resultJson = "{\"content\":\"{'code':'109','desc':'Servlet post url = /service, method is userManage.userLogin or notFound'}\"}";
            logger.info("返回字符串为: " + resultJson);
            out.write(resultJson);
            out.close();
            return;
        }

        try{
            Object resultObj = null;
            HttpSession httpSession = request.getSession(true);//true指明: 如果session不存在则创建新session
            httpSession.setAttribute(User.USER_IP_KEY, remoteIp);
            //后续删除
            StringBuffer logTmp = null;
            resultObj = invokeInfo.invokeMethod.invoke(invokeInfo.invokeObj, logTmp, content, httpSession);
            if (resultObj instanceof String) {
                String resultStr = (String)resultObj;
                out.write(resultStr);
                out.close();
                return;
            } else {
                throw new RuntimeException("程序的返回值出错,必须为void 或者 ResponseDto");
            }
        }catch (Exception e){
            logger.error("ApiServlet", e);
            JSONObject resJson = new JSONObject();
            resJson.put("sign", "");
            JSONObject contentJson = new JSONObject();
            contentJson.put("code", "107");
            contentJson.put("desc", e.getMessage());
            resJson.put("content", contentJson);
            logger.info(resJson.toString());
            out.write(resJson.toString());
            out.close();
            return;
        }
    }




    //@RequestMapping(value = "/login", method = RequestMethod.POST)
    @RequestMapping(value = "/login")
    public void login (HttpServletRequest request, HttpServletResponse response)throws IOException {

        String remoteIp = request.getRemoteAddr();
        logger.info("remoteIp:" + remoteIp);
        Map<String, Object> localPara = new HashMap<String, Object>();
        localPara.put("remoteIp", remoteIp);

        localParaHolder.set(localPara);
        BufferedReader inputStream = new BufferedReader(new InputStreamReader(request.getInputStream(), "UTF-8"));
        StringBuilder requestBody = new StringBuilder();
        String line = null;
        while ((line = inputStream.readLine()) != null) {
            logger.info(line);
            requestBody.append(line);
        }
        inputStream.close();
        String bodyStr = requestBody.toString();
        logger.info("requestBody:" + bodyStr);
        //如果请求内容为空
        if (StringUtils.isEmpty(bodyStr)){
            return;
        }

        //表示请求的内容区数据为form表单提交的参数，此时我们可以通过request.getParameter得到数据（key=value）
        //JSONObject jsonObject = JSON.parseObject(bodyStr);
        JSONObject jsonObject = JSON.parseObject(bodyStr);
        JSONObject content = jsonObject.getJSONObject("content");
        String sign = jsonObject.getString("sign");
        String version = jsonObject.getString("version");
        String appId = jsonObject.getString("appId");


        //web回复
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/plain");
        PrintWriter out = response.getWriter();

        // 1. 检查请求的4个必备参数是否存在
        if (content == null || StringUtils.isEmpty(sign) || StringUtils.isEmpty(version) || StringUtils.isEmpty(appId)) {
            String resultJson = "{\"content\":\"{'code':'105','desc':'错误:非法的请求参数,请确认请求参数中是否包含content、version、sign、appId字段'}\"}";
            out.print(resultJson);
            out.close();
            logger.info("API接口调用请求出错," + resultJson);
            return;
        }

        String methodStr = (String)content.get("method");
        methodStr = methodStr.trim();
        logger.info("调用的API接口为: " + methodStr);

        //由于原始框架遗留问题，http进来2后解析content内容。根据content中method字段找出对应的bean
        //method字段和bean的对应关系保存在map中。而/service下不能访问userManage.userLogin
        boolean methodGet = false;
        InvokeInfo invokeInfo = new InvokeInfo();
        if (StringUtils.isEmpty(methodStr) || methodStr.equalsIgnoreCase("userManage.userLogin")) {
            // 4. 解析请求方法
            invokeInfo = invokeInfoCacheMap.get(methodStr);
            if (invokeInfo == null) {
                String[] requestMethod = methodStr.split("\\.");
                Object obj = context.getBean(requestMethod[0]);
                if (obj != null) {
                    Class<? extends Object> objCls = obj.getClass();
                    Method[] mts = objCls.getMethods();
                    for (Method mt : mts) {
                        if (requestMethod[1].equals(mt.getName())) {
                            if (mt.getParameterTypes() != null && mt.getParameterTypes().length != 0) {
                                invokeInfo = new InvokeInfo(mt, obj, mt.getParameterTypes()[0]);
                            } else {
                                invokeInfo = new InvokeInfo(mt, obj);
                            }
                            invokeInfoCacheMap.put(methodStr, invokeInfo);
                            methodGet = true;
                            break;
                        }
                    }
                }
            }else{
                methodGet = true;
            }
        }
        //如果method参数没有获取到，返回错误信息
        if(!methodGet){
            String resultJson = "{\"content\":\"{'code':'109','desc':'Servlet post url = /login, method isnot userManage.userLogin or notFound'}\"}";
            logger.info("返回字符串为: " + resultJson);
            out.print(resultJson);
            out.close();
            return;
        }

        try{
            Object resultObj = null;
            if (invokeInfo.parameterCls == null) {
                resultObj = invokeInfo.invokeMethod.invoke(invokeInfo.invokeObj);
            }else {
                HttpSession httpSession = request.getSession(true);//true指明: 如果session不存在则创建新session
                if (!httpSession.isNew()) {
                    /*
                     * !httpSession.isNew():
                     * 表示已经有人在同一个浏览器上已经登陆过某一个账号(session is Old),或者(未正常退出并且session为超时)
                     *
                     * 浏览器的多标签页(mutil-tab模式)是共享session的,因此多个相同或不同账号通过浏览器tab分别登录会得到同一个session,
                     *
                     * UserManageImpl.java 静态变量Map<Integer, List<HttpSession>> userSessionMap
                     * 这样会导致UserManageImpl.userSessionMap中记录混乱:
                     *    (1)多个不同账号登录时:一个session对应对个账号userID,或者
                     *    (2)多个相同账号登录时:同一个userID下记录多个相同的session
                     * (例如先后登录 sysAdmin,merAdmin,merUser,merUser),
                     *  得到的同一个session中的attribute("USER_KEY")先后被依次覆盖为sysAdmin,merAdmin,merUser,merUser的用户信息,
                     *  虽然最后一个有效,但是这4个tab都可以访问最后一个登陆账号可见的数据.
                     *  但是UserManageImpl.userSessionMap中记录了4个userID分别一个session记录,导致可能后续处理混乱,
                     *      sysAdmin uid=1 session1
                     *      merAdiin uid=2 session1
                     *      merUser  uid=3 session1, session1
                     *  )
                     *
                     * 这里做如下处理:
                     *    1.无效掉前面同一浏览器不同tab登陆时得到的这同一个session(触发sessionDestory listener处理器)
                     *    2.为最新登录的账号生成新的session,
                     *    3.只有新session有效,即服务器认为同一浏览器不同tab页最后登录的账号为有效账号
                     *    4.保证UserManageImpl.userSessionMap只对于最后一个登陆的userID记录session
                     *
                     * 在UserManageImpl.java的login()函数中:
                     *    修改login()代码判断session.isNew(),
                     *    为true时才将session保存到userID对应的静态变量Map<Integer, List<HttpSession>> userSessionMap
                     * */
                    /* 无效旧的session
                     *  - 触发sessionDestory listener处理器,
                     *  - 导致UserManageImpl.userSessionMap记录统一做相关删除处理 */
                    httpSession.invalidate();

                    //创建新的session, isNew=true
                    httpSession = request.getSession(true);
                }

                httpSession.setAttribute(User.USER_IP_KEY, remoteIp);
                //后续删除
                StringBuffer logTmp = null;
                resultObj = invokeInfo.invokeMethod.invoke(invokeInfo.invokeObj, logTmp, content, httpSession);
            }
            if (resultObj instanceof String) {
                String resultStr = (String)resultObj;
                out.write(resultStr);
                out.close();
                return;
            } else {
                throw new RuntimeException("程序的返回值出错,必须为void 或者 ResponseDto");
            }
        }catch (Exception e){
            logger.error("ApiServlet", e);
            JSONObject resJson = new JSONObject();
            resJson.put("sign", "");
            JSONObject contentJson = new JSONObject();
            contentJson.put("code", "107");
            contentJson.put("desc", e.getMessage());
            resJson.put("content", contentJson);
            logger.info(resJson.toString());
            out.write(resJson.toString());
            out.close();
            return;
        }
    }

    //定义反射类，根据传入method字符串，找到对应方法。
    private static class InvokeInfo {
        private Method invokeMethod;
        private Object invokeObj;
        private Class<?> parameterCls;

        public InvokeInfo(){
            super();
        }

        public InvokeInfo(Method invokeMethod, Object invokeObj, Class<?> parameterCls) {
            super();
            this.invokeMethod = invokeMethod;
            this.invokeObj = invokeObj;
            this.parameterCls = parameterCls;
        }

        public InvokeInfo(Method invokeMethod, Object invokeObj) {
            super();
            this.invokeMethod = invokeMethod;
            this.invokeObj = invokeObj;
        }
    }
}
