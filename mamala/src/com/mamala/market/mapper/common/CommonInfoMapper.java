package com.mamala.market.mapper.common;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.mamala.market.pojo.common.LicenseInfo;
 

/**
 * Created by OA on 2015/8/13.
 */
public interface CommonInfoMapper {
    
    
    /**
     * 查询系统参数及其对应值
     */
    List<String> qryForSysStatus(
    		@Param("attr") String attr
    );

	List<LicenseInfo> qryForLic(String licStr);
}
