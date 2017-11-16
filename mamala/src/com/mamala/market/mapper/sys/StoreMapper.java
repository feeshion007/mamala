package com.mamala.market.mapper.sys;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr;
import com.mamala.market.pojo.sys.UserRoleRelation;

public interface StoreMapper {

	public List<StoreInfo> qryStoreInfoList(StoreInfo storeInfo);
 
	public void addStoreInfo(StoreInfo storeInfo);

	public void updateStoreInfo(StoreInfo storeInfo);

	public void deleteStoreInfo( @Param("storeId") long storeId);
	

	public List<Staff> qryStaffList(Staff staff);
	 
	public void addStaff(Staff staff);

	public void updateStaff(Staff staff);

	public void deleteStaff( @Param("staffId") long staffId);
	
	public void addUserRoleRelation(UserRoleRelation relation);
	
	public void updateUserRoleRelation(UserRoleRelation relation);
	
	public void deleteUserRoleRelation(@Param("userId") long userId);
}
