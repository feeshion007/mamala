package com.mamala.market.dao.support;
  
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

@Repository
public class CustomerSaleUploadDao {
    private static Logger logger = Logger.getLogger(CustomerSaleUploadDao.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void insertUploadData(final List customerSaleFormatList) throws Exception{
        
    }
}
