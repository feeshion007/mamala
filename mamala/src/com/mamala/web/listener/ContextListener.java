package com.mamala.web.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class ContextListener implements ServletContextListener {
    public static String contextPath;

    @Override
    public void contextDestroyed(ServletContextEvent arg0) {
        // TODO Auto-generated method stub
    }
    
    @Override
    public void contextInitialized(ServletContextEvent arg0) {
        contextPath = arg0.getServletContext().getRealPath("/");
        //System.out.println("contextPath" + contextPath);
    }
}
