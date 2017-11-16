package com.mamala.market.mapper.sys;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.mamala.market.pojo.sys.SysAttr;
 
public interface SysAttrMapper {
    /**
     * 查询系统属性
     * @param attr
     * @param attrValue
     */  
	List<SysAttr> qryForSysAttr(
            @Param("attr") String attr
    );

    /**
     * 更新系统属性
     * @param attr
     * @param attrValue
     */
    void updateSysAttr(
            @Param("attr") String attr,
            @Param("attrValue") String attrValue
    );
    /**
     * 插入系统属性
     * @param attr
     * @param attrValue
     */
	void addSysAttr( 
			SysAttr sysAttr
    );

	void updateSysAttr(SysAttr attr);

	List<SysAttr> qryForSysAttr(SysAttr sysAttr);
}
