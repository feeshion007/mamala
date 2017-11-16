package com.mamala.market.service.dine;

import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mamala.common.util.IConstants;
import com.mamala.market.mapper.dine.DineMapper;
import com.mamala.market.mapper.dish.DishMapper;
import com.mamala.market.mapper.order.OrderMapper;
import com.mamala.market.mapper.sys.StoreMapper;
import com.mamala.market.mapper.sys.SysAttrMapper;
import com.mamala.market.pojo.dine.Dine;
import com.mamala.market.pojo.dine.DineTable;
import com.mamala.market.pojo.dish.Dish;
import com.mamala.market.pojo.dish.DishType;
import com.mamala.market.pojo.order.Order;
import com.mamala.market.pojo.sys.Staff;
import com.mamala.market.pojo.sys.StoreInfo;
import com.mamala.market.pojo.sys.SysAttr; 
import com.mamala.market.util.OrderNumSingleton;

@Service
public class DineService {

	private static Logger logger = Logger.getLogger(DineService.class);
	private static final int INIT_TABLE_STATUS =1;
 
    @Autowired
    private DineMapper dineMapper;
    @Autowired
    private OrderMapper orderMapper;

    
	public long addDine(Dine dine) {
		long currentDineId = -1;
		if(dine != null && dine.getDineDeskId()>0){
			DineTable table = dineMapper.findTableById(dine.getDineDeskId());
			if(table.getTableStatus() == INIT_TABLE_STATUS ){
				dineMapper.addDine(dine);
				currentDineId = dine.getDineId();
				table.setTableStatus(IConstants.DESK_START_TABLE_STATUS);
				table.setCurrentCustomerCount(dine.getCustomerCount());
				table.setCurrentDineId(dine.getDineId());
				dineMapper.updateDineTable(table);   
				Order order = new Order();
				order.setOrderTicketId(dine.getDineId());
				order.setOrderTicketName(dine.getDineDeskName());
				order.setOrderType(IConstants.ORDER_TYPE_DINE);
				order.setIfpay(IConstants.ORDER_NO_PAY);
				order.setOrderStatus(IConstants.ORDER_STATUS_NEW);
				order.setUserId(dine.getUserId());
				order.setStoreId(dine.getStoreId());
	        	 order.setPhone(dine.getPhone());
	        	 order.setCardNumber(dine.getCardNumber());
	        	 order.setOrderStartTime(dine.getDineStartTime());  
	        	 order.setOrderEndTime(dine.getDineEndTime()); 
	        	 order.setOrderCustomerCount(dine.getCustomerCount());
	        	 order.setMemberId(dine.getMemberId());
	        	 if(order.getOrderType()==IConstants.ORDER_TYPE_DINE){ 
	             	order.setOrderNum("D"+OrderNumSingleton.getOrderNum());
	             }else{
	             	order.setOrderNum("T"+OrderNumSingleton.getOrderNum());
	             }
				orderMapper.addOrder(order);
			}
		} 
		return currentDineId; 
	}
	public void updateDine(Dine dish) {
		dineMapper.updateDine(dish);
		
	}
//	public List<Dine> qryDineList(Dine dish) {
//		List<Dine> dishList =  dineMapper.qryDineList(dish);
//        return dishList;
//	}
	public void addDineTable(DineTable dineTable) {
		dineMapper.addDineTable(dineTable);
		
	}
	public void updateDineTable(DineTable dineTable) {
		dineMapper.updateDineTable(dineTable);
		
	}
	public List<DineTable> qryDineTableList(DineTable dineTable) {
		List<DineTable> dishList =  dineMapper.qryDineTableList(dineTable);
        return dishList;
	}
	public void deleteDineTable(long tableId) {
		dineMapper.deleteDineTable(tableId);
		
	}
	public void deleteDine(long dishId) {
		//dineMapper.deleteDine(dishId);
		
	}

	public void cancelDeskAndDine(long dineId, long dineDeskId) {
//		Dine dine = dineMapper.findDineById(dineId,dineDeskId);
//		if(dine !=null){
//			dine.setDineStatus(IConstants.DINE_INVALID_DINE_STATUS);
//			dine.setDineIspay(IConstants.DINE_UN_PAY);
//			DineTable table = dineMapper.findTableById(dineDeskId);
//			dineMapper.updateDine(dine);
//			dineMapper.updateDineTable(table);
//		}
//		
	} 
	public Dine findDineById(long dineId) {
		Dine dine =  dineMapper.findDineById(dineId);
	    return dine;
	}
	public void turnDesk(long sourceDineId, long targetDeskId) {
		DineTable targetDesk=dineMapper.findTableById(targetDeskId);
		if(targetDesk.getTableStatus() != IConstants.DESK_INIT_TABLE_STATUS){
			return;
		}
		Dine currentDine = dineMapper.findDineById(sourceDineId);  
		DineTable sourceDesk= dineMapper.findTableById(currentDine.getDineDeskId());
		if(sourceDesk.getCurrentDineId() != sourceDineId){
			return;
		}
		
		currentDine.setDineDeskId(targetDeskId);
		currentDine.setDineDeskName(targetDesk.getTableName()); 
		dineMapper.updateDine(currentDine); 
		
		List<Order> list = orderMapper.qryOrderByTicketId(currentDine.getDineId());
		for(Order order :list){ 
			order.setLastOrderTicketId(currentDine.getDineDeskId());
		    order.setOrderTicketName(currentDine.getDineDeskName());
		    orderMapper.updateOrder(order);
		}
		
		
		targetDesk.setTableStatus(IConstants.DESK_START_TABLE_STATUS);
		targetDesk.setCurrentCost(sourceDesk.getCurrentCost());
		targetDesk.setCurrentCustomerCount(currentDine.getCustomerCount());
		targetDesk.setCurrentDineId(sourceDesk.getCurrentDineId());
		dineMapper.updateDineTable(targetDesk);		
		
		sourceDesk.setTableStatus(IConstants.DESK_INIT_TABLE_STATUS);
		sourceDesk.setCurrentCost(0);
		sourceDesk.setCurrentCustomerCount(0);
		sourceDesk.setCurrentDineId(0);
		dineMapper.updateDineTable(sourceDesk);
	}
	
}
