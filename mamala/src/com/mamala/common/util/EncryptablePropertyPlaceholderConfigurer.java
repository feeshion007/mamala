package com.mamala.common.util;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanInitializationException;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;

import java.util.Properties;

/**
 * 解析jdbc.properties 并对系统进行配置
 * Created by OA on 2015/12/3.
 */

public class EncryptablePropertyPlaceholderConfigurer extends PropertyPlaceholderConfigurer {

    private static final String DB_DRIVER_CLASS_NAME="dataSource.driverClassName";
    private static final String DB_URL = "dataSource.url";
    private static final String DB_USERNAME = "dataSource.username";
    private static final String DB_PASSWORD = "dataSource.password";

    @Override
    protected void processProperties(ConfigurableListableBeanFactory beanFactoryToProcess, Properties props) throws BeansException {

        try{
            String driverName = props.getProperty(DB_DRIVER_CLASS_NAME);
            if(driverName != null){
                props.setProperty(DB_DRIVER_CLASS_NAME, DesUtil.getDecryptString(driverName));
            }

            String url = props.getProperty(DB_URL);
            if(url != null){
                props.setProperty(DB_URL, DesUtil.getDecryptString(url));
            }

            String username = props.getProperty(DB_USERNAME);
            if(username != null){
                props.setProperty(DB_USERNAME, DesUtil.getDecryptString(username));
            }

            String password = props.getProperty(DB_PASSWORD);
            if(password != null){
                props.setProperty(DB_PASSWORD, DesUtil.getDecryptString(password));
            }
            super.processProperties(beanFactoryToProcess, props);
        }catch (Exception e){
            e.printStackTrace();
            throw new BeanInitializationException(e.getMessage());
        }
    }
}
