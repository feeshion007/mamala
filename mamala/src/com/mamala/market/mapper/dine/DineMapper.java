package com.mamala.market.mapper.dine;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.mamala.market.pojo.dine.Dine;
import com.mamala.market.pojo.dine.DineTable;
import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr;

public interface DineMapper {

	//public List<Dine> qryDineOrderList(Dine dish);
	//public void deleteDine(@Param("dineId") long dishId);
	//Dine
	public long addDine(Dine dine);

	public void updateDine(Dine dine);
	 
	//Dine Desk
	public void addDineTable(DineTable dineTable);

	public void updateDineTable(DineTable dineTable);

	public void deleteDineTable(@Param("tableId") long tableId);
	
	public List<DineTable> qryDineTableList(DineTable dineTable);

	public DineTable findTableById(@Param("tableId") long dineDeskId);

	public Dine findDineById(@Param("dineId") long dineId);

}
