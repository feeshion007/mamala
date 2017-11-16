package com.mamala.market.dao.systemManager;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SysManagerDao {
	    private static Logger logger = Logger.getLogger(SysManagerDao.class);
	    @Autowired
	    private JdbcTemplate jdbcTemplate;
	    
	public void updateStoreInfo(int storeID, String storeName, String type, String category, String svgPath)
	{
         // 数据库更新
        String sql = " update t_store_info set store_name=?, type=?, category=? where store_id=?";
        jdbcTemplate.update(sql, new Object[]{storeName, type, category, storeID});

    }

}
