package com.mamala.web.listener;

import java.util.List;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

//import org.apache.commons.logging.Log;
//import org.apache.commons.logging.LogFactory;
import com.mamala.web.controller.systemManage.UserManagerController;
import org.apache.log4j.Logger;

import com.mamala.market.pojo.common.User;

public class UserManageSessionListener implements HttpSessionListener {
    //private static final Log logger = LogFactory.getLog(UserManageSessionListener.class.getName());
    private static Logger logger = Logger.getLogger(UserManageSessionListener.class);

    
    @Override
    public void sessionCreated(HttpSessionEvent event) {
        return;
    }
    
    @Override
    public void sessionDestroyed(HttpSessionEvent event) {
        HttpSession session = event.getSession();
        String sessiongID = session.getId();
        User user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
        
        if (user != null) {
            user.setUserIsLogin(false);
            List<HttpSession> userSessionList = UserManagerController.userSessionMap.get(Integer.valueOf(user.getUserID()));
            if (userSessionList != null) {
                if (userSessionList.contains(session)) {
                    userSessionList.remove(session); 
                }
                
                if (userSessionList.size() == 0) {
                    UserManagerController.userSessionMap.remove(Integer.valueOf(user.getUserID()));
                }
            }
            
            logger.info("[UserManage] sessionDestroyed - Listener: "
                              + " userID=" + String.valueOf(user.getUserID()) 
                              + " userName=" + user.getUserName()
                              + " sessiongID=" + sessiongID
                              + " userIsLogin=" + String.valueOf(user.getUserIsLogin()));
        }
    }
}
