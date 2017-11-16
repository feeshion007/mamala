package com.mamala.market.mapper.dish;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.mamala.market.pojo.dine.Dine;
import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.dish.SetDishRelation;
import com.mamala.market.pojo.order.Order;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr;

public interface DishMapper {

	public List<Dish> qryDishList(Dish dish);

	public List<DishType> qryDishTypeList(DishType dishType);
	
	public Dish findDishById(@Param("dishId") long dishId);
	
	public int dishCount(Dish dish);

	public void addDish(Dish dish);

	public void updateDish(Dish dish);

	public long addDishType(DishType dishType);

	public void updateDishType(DishType dishType);

	public void deleteDishType(@Param("dishTypeId") long dishTypeId);

	public void deleteDish(@Param("dishId") long dishId);

	public void addSetDishRelation(SetDishRelation relation);

	public void updateSetDishRelation(SetDishRelation relation);

	public void deleteSetDishRelation(long setId);

	public List<SetDishRelation> qrySetDishRelation(SetDishRelation relation);
	
	public float qryDishTypeUnitPrice(@Param("dishTypeId")long dishTypeId);
	
	public DishType findDishTypeById(@Param("dishTypeId") long dishTypeId);
 
}
