package com.mamala.market.mapper.order;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.mamala.market.pojo.order.Order;
import com.mamala.market.pojo.order.OrderDish;

public interface OrderMapper {

	public void updateOrder(Order order);

	public long addOrder(Order order) ;

	public void deleteOrder(@Param("orderId") long orderId);
	
	public long addOrderDish(OrderDish orderDish) ;

	public void deleteOrderDish(@Param("orderDishDetailId") long orderDishDetailId);

	public void updateOrderDish(OrderDish orderDish) ;

	public List<Order> qryOrderAndDetailList(Order order);//查询订单的同时查询菜品详情
	
	public List<Order> qryOrderList(Order order);//只查询订单信息不查询菜品详情
	
	public List<OrderDish> qryOrderDishesByOrderId(@Param("orderId") long orderId);

	public Order qryOrderByOrderId(@Param("orderId") long orderId);

	public OrderDish qryOrderDishByDetailId(@Param("detailId")long detailId);
	
	public int orderCount(Order order);

	public int getOrderDishCountByParentId(@Param("parentDetailId")long parentDetailId);

	public void deleteOrderDishByParent(long orderDishDetailId);

	public List<OrderDish> qryOrderDishByParentId(@Param("parentDetailId")long orderDishDetailId);

	public List<OrderDish> qryOrderDishByOldDetailId(@Param("oldDetailId") long detailId);

	public List<Order> qryOrderByTicketId(@Param("orderTicketId")long dineId);
	
}
