package com.mamala.common.util;

import java.util.Properties;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

/**
 * <p>Title: Module Information         </p>
 * <p>Description: Function Description </p>
 * <p>Copyright: Copyright (c) 2008     </p>
 * <p>Company: Ruijie Co., Ltd.         </p>
 * <p>Create Time: 2009-3-17              </p>
 * @author Anders
 * <p>Update Time:                      </p>
 * <p>Updater:                          </p>
 * <p>Update Comments:                  </p>
 */
public class PropertiesLoaderUtils extends org.springframework.core.io.support.PropertiesLoaderUtils {
    
    public static void merge(Properties target, Properties source) {
        target.putAll(source);
    }

    public static Properties loadProperties(String path) throws Exception {
        Properties props = new Properties();
        Resource resource = new ClassPathResource(path);
        PropertiesLoaderUtils.fillProperties(props, resource);
        return props;
    }
}
