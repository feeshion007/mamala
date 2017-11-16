package com.mamala.market.service.sys;

import java.util.List;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mamala.market.mapper.sys.StoreMapper;
import com.mamala.market.mapper.sys.SysAttrMapper;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 
import com.mamala.market.pojo.sys.UserRoleRelation;

@Service
public class SysManagerService {

	private static Logger logger = Logger.getLogger(SysManagerService.class);

    @Autowired
    private SysAttrMapper sysAttrMapper;
    
    @Autowired
    private StoreMapper storeMapper;

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
    
    public List<StoreInfo> qryStoreInfoList(StoreInfo storeInfo){
        List<StoreInfo> floorList =  storeMapper.qryStoreInfoList(storeInfo);
        return floorList;
    }
    public void updateStoreInfo(StoreInfo storeInfo){
    	storeMapper.updateStoreInfo(storeInfo);
    }
    public void addStoreInfo(StoreInfo storeInfo){
    	storeMapper.addStoreInfo(storeInfo);
    }
    public void deleteStoreInfo(long storeId){
    	storeMapper.deleteStoreInfo(storeId);
    }
    
    public List<Staff> qryStaffList(Staff staff){
        List<Staff> floorList =  storeMapper.qryStaffList(staff);
        return floorList;
    }
    public void updateStaff(Staff staff){
    	storeMapper.updateStaff(staff);
    	storeMapper.updateUserRoleRelation(new UserRoleRelation(staff.getStaffId(),1L,NumberUtils.toLong(staff.getStaffRole()), 1, 0, 0L));
    }
    public void addStaff(Staff staff){
    	storeMapper.addStaff(staff);
    	storeMapper.addUserRoleRelation(new UserRoleRelation(staff.getStaffId(), 1L,NumberUtils.toLong(staff.getStaffRole()), 1, 0, 0L));
    }
    public void deleteStaff(long staffId){
    	storeMapper.deleteUserRoleRelation(staffId);
    	storeMapper.deleteStaff(staffId);
    }
}
