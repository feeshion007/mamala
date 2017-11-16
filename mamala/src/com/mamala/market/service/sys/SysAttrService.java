package com.mamala.market.service.sys;

import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;  

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.mamala.market.mapper.sys.SysAttrMapper;
import com.mamala.market.pojo.sys.SysAttr;

@Service
public class SysAttrService {

    private static Logger logger = Logger.getLogger(SysAttrService.class);

    @Autowired
    private SysAttrMapper sysAttrMapper;

    public List<SysAttr> qryForSysAttr(String attr){
        List<SysAttr> floorList =  sysAttrMapper.qryForSysAttr(attr);
        return floorList;
    }
    public void updateSysAttr(String attr,String attrValue){
        sysAttrMapper.updateSysAttr(attr,attrValue);
    }
    public void addSysAttr(SysAttr sysAttr){
        sysAttrMapper.addSysAttr(sysAttr);
    }
    public void updateSysAttrs(JSONObject attrs )
    {
    	SysAttr attr = null;
		for(String str :attrs.keySet()){
			attr = JSON.toJavaObject(JSON.parseObject(attrs.getString(str)), SysAttr.class);
			if(attr.getId()>0){
				this.sysAttrMapper.updateSysAttr(attr);
			}else{
				this.sysAttrMapper.addSysAttr(attr);
			}			
        } 
    }
	public List<SysAttr> qryForSysAttr(SysAttr sysAttr) {
		List<SysAttr> attrs =  sysAttrMapper.qryForSysAttr(sysAttr);
        return attrs;
	} 
}
