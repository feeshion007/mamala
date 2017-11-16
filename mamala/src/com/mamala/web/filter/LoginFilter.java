package com.mamala.web.filter;

import java.io.IOException;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;

public class LoginFilter implements Filter {
    /** 要检查的 session 的名称 */
    private final static String SESSION_KEY = "sessionKey";
    
    /** 需要排除（不拦截）的URL的正则表达式 */
    private Pattern excepUrlPattern;
    
    /** 检查不通过时，转发的URL */
    private String forwardUrl;
    
    @Override
    public void destroy() {
        
    }
    
    @Override
    public void doFilter(ServletRequest req, ServletResponse res,
            FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        String servletPath = request.getServletPath();
        //System.out.println(servletPath);
        //如果请求的路径与forwardUrl相同，或请求的路径是排除的URL时，则直接放行
        if (servletPath.equals(forwardUrl) || excepUrlPattern.matcher(servletPath).matches()) {
            chain.doFilter(req, res);
            return;
        }
        
        //JSON /login请求不经过此过滤,并且在登录成功后会由用户管理的登录处理函数在session中加入SESSION_KEY属性
        //JSON /service请求都经过此处过滤
//        System.out.println("loginFilter: req.getServletPath()=" + request.getServletPath());
        //getSession()使用true或者无参数,如果没有session将自动创建一个,这不是我们需要的,我们只是想判断是否sessionKey是否存在
        HttpSession session = request.getSession(false);
       
//        System.out.println("loginFilter: session=null ->" + String.valueOf(session == null ? true : false));
        if (session == null || session.getAttribute(SESSION_KEY) == null) {
            //session失效后用户再次操作时页面将会跳回登录页面。
            if (request.getHeader("x-requested-with") != null 
                && request.getHeader("x-requested-with").equalsIgnoreCase("XMLHttpRequest")){
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//                System.out.println("-------------1 SC_FORBIDDEN");
            } else {
                String url = request.getContextPath() + StringUtils.defaultIfEmpty(forwardUrl, "/"); 
                response.sendRedirect(url);
//                System.out.println("-------------2 url=" + url);
            }
        } else {
        	session.setMaxInactiveInterval(-1);
            chain.doFilter(req, res);
        }
    }
    
    @Override
    public void init(FilterConfig cfg) throws ServletException {
        String excepUrlRegex = cfg.getInitParameter("excepUrlRegex");
        if (!StringUtils.isBlank(excepUrlRegex)) {
            excepUrlPattern = Pattern.compile(excepUrlRegex);
        }

        forwardUrl = cfg.getInitParameter("redirectUrl");
    }
}
