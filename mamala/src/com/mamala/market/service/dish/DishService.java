package com.mamala.market.service.dish;

import java.util.ArrayList;
import java.util.List;

import javax.management.relation.Relation;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.mamala.common.util.IConstants;
import com.mamala.market.mapper.dine.DineMapper;
import com.mamala.market.mapper.dish.DishMapper;
import com.mamala.market.mapper.sys.StoreMapper;
import com.mamala.market.mapper.sys.SysAttrMapper;
import com.mamala.market.pojo.dine.DineTable;
import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.dish.SetDishRelation;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 

@Service
public class DishService {

	private static Logger logger = Logger.getLogger(DishService.class);
 
    @Autowired
    private DishMapper dishMapper;

    @Autowired
    private DineMapper dineMapper;
    
	public void addDish(Dish dish) {
		dishMapper.addDish(dish);
		
	}
	public void updateDish(Dish dish) {
		dishMapper.updateDish(dish);
		
	}
	public int dishCount(Dish dish) {
		return dishMapper.dishCount(dish);
	}
	
	public List<Dish> qryDishList(Dish dish) {
		List<Dish> dishList =  dishMapper.qryDishList(dish);
        return dishList;
	}
	public void addDishType(DishType dishType,JSONObject jsonRelations) {
		dishMapper.addDishType(dishType);
		SetDishRelation relation = null;
		for(String str :jsonRelations.keySet()){
			relation = JSON.toJavaObject(JSON.parseObject(jsonRelations.getString(str)), SetDishRelation.class); 
			relation.setDishTypeId(dishType.getDishTypeId());
        	addSetDishRelation(relation);
        }	
	}
	public void updateDishType(DishType dishType,JSONObject jsonRelations) {
		dishMapper.updateDishType(dishType);		
		SetDishRelation relation = null;
		for(String str :jsonRelations.keySet()){
			relation = JSON.toJavaObject(JSON.parseObject(jsonRelations.getString(str)), SetDishRelation.class); 
			if(relation.getSetId()>0 && relation.getDishId()>0){
				updateSetDishRelation(relation);
			}else if(relation.getDishId()>0){
				addSetDishRelation(relation);
			}else{
				deleteSetDishRelation(relation.getSetId());
			}
        }		
	}
	public List<DishType> qryDishTypeList(DishType dishType) {
		List<DishType> dishList =  dishMapper.qryDishTypeList(dishType);
//		List<DishType> retList =  new ArrayList(dishList.size());
//		if(dishType.getDishTypeSet()==IConstants.DISH_TYPE_SET){ 
//			float unitPrice = 0;
//			for(DishType type:dishList){
//				unitPrice = dishMapper.qryDishTypeUnitPrice(type.getDishTypeId());
//				type.setDishUnitPrice(unitPrice);
//				retList.add(type);
//			}
//			return retList;
//		}
        return dishList;
	}
	public void deleteDishType(long dishTypeId) {
		dishMapper.deleteDishType(dishTypeId);
		
	}
	public void deleteDish(long dishId) {
		dishMapper.deleteDish(dishId);
		
	}
	public void addSetDishRelation(SetDishRelation relation) {
		dishMapper.addSetDishRelation(relation);
		
	}
	public void updateSetDishRelation(SetDishRelation relation) {
		dishMapper.updateSetDishRelation(relation);
		
	}
	public void deleteSetDishRelation(long setId) {
		dishMapper.deleteSetDishRelation(setId);
		
	}
	public List<SetDishRelation> qrySetDishRelation(SetDishRelation relation) {
		List<SetDishRelation> relationList = dishMapper.qrySetDishRelation(relation);
		return relationList;
	}
	public DineTable findTableById(long tableId){
		return dineMapper.findTableById(tableId);
	}
}
