package com.mamala.web.listener;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
/**
 * 封装 request和response在线程上下文中
 * @author lqiang
 *
 */
public class ServletContext {
   private static final ThreadLocal<HashMap<String,Object>> localContext = new ThreadLocal<HashMap<String,Object>>(){
    @Override
    protected HashMap<String, Object> initialValue() {
        return new HashMap<String,Object>();
    }   
   };
   private static final String REQUEST_KEY = "request";
   private static final String RESPONSE_KEY = "response";
  
   public static void setRequest(HttpServletRequest request) {
       localContext.get().put(REQUEST_KEY, request);
   }
   
   public static void setResponse(HttpServletResponse response) {
       localContext.get().put(RESPONSE_KEY, response);
   }

   public static HttpServletRequest getRequest() {
       return  (HttpServletRequest)localContext.get().get(REQUEST_KEY);
   }
   
   public static HttpServletResponse getResponse() {
       return  (HttpServletResponse)localContext.get().get(RESPONSE_KEY);
   }
   
   public static void cleanContext() {
       localContext.get().clear();
   }
}
