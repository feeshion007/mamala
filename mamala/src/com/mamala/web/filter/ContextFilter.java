package com.mamala.web.filter;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.mamala.web.listener.ServletContext;

/**
 * @author lqiang
 *
 */
public class ContextFilter implements Filter {
    private static final Integer MAX_CONCURRENT_COUNT = 5000;
    private AtomicInteger count;
    private static final Log logger = LogFactory.getLog(ContextFilter.class);
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        count= new AtomicInteger(0);
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain) throws IOException, ServletException {
        int current_count = count.incrementAndGet();
        //如果当前访问量大于系统最大并发数，则拒绝访问
        if(current_count > MAX_CONCURRENT_COUNT) {
            count.decrementAndGet();
            logger.warn("当前访问量大于系统最大并发数.............current_count:" + current_count);
            return;
        }
        //初始化Context
        ServletContext.setRequest((HttpServletRequest)request);
        ServletContext.setResponse((HttpServletResponse)response);
        
        chain.doFilter(request, response);
        
        //清除Context
        ServletContext.cleanContext();
        count.decrementAndGet();
    }
    
    @Override
    public void destroy() {
        // TODO Auto-generated method stub
    }
}
