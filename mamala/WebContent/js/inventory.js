define(function(require, inventory, module){
	var comm = require('../js/modules/common/common.js');
	var utils = require('../js/modules/common/util.js');
	function init() { 
		initEvent();
		$(".nav-item[type=inventory]").attr("key",null);
	}
	inventory.init = init;

	function initEvent() { 
		$('.container-box').css("height",($(".content").height())+"px");
		
		inventory.detailsDb = $('#order-list-tb').DataTable({ 
			 "minHeight":"400px",
			 "scrollY": ($(".content").height()-100)+"px", 
			 "scrollX": true,
		     "scrollCollapse": true,  
		     "search": {
		         "search": $(".nav-item[type=inventory]").attr("key")
		       },
		     "language": {
		            "lengthMenu": "每页  _MENU_ 显示记录",
		            "zeroRecords": "对不起，未找到您要查的记录！",
		            "info": "页码：  _PAGE_ of _PAGES_",
		            "infoEmpty": "查无记录",
		            "infoFiltered": "(filtered from _MAX_ total records)",
		            "search":"查找：",
		            "loadingRecords": "加载中...",
		            "processing":     "处理中...",
		            "paginate": {
				         "first":      "第一页",
				         "last":       "最后页",
				         "next":       "下一页",
				         "previous":   "上一页"
				     }
		        },
		        "processing": true, 
		        "serverSide": true,//打开后台分页  
		        "ajax":{
		        	"url": comm.jsonServer()+"/orderController/qryOrderList",    
			        "contentType": "application/json",
			        "type": "POST",
			        "data": function ( d ) { 
		        	   d.order_ticket_id = -1;
		        	   d.store_id = $("#store-select").val();
			          return JSON.stringify( d );
			        } ,
			        "dataSrc": function ( json ) {  
			        	if(json.data ){
			        		var data = json.data;
			        		var tmpOrderType ={1:"堂吃",2:"外卖"}
			        		var tmpOrderStatus ={1:"开单",2:"未支付",3:"已付款",4:"挂单",5:"退单"}
				        	for ( var i=0; i<data.length ; i++ ) { 
				        		data[i]["orderNum"] = (typeof(data[i]["orderNum"])=="undefined")?"":data[i]["orderNum"];
				        		data[i]["orderWaiter"] = (typeof(data[i]["orderWaiter"])=="undefined")?"":data[i]["orderWaiter"];
				        		data[i]["tmpPhone"] = (typeof(data[i]["phone"])=="undefined")?""+data[i]["remarks"]:data[i]["phone"];
				        		data[i]["tmpOrderType"] = tmpOrderType[data[i]["orderType"]];
				        		data[i]["tmpOrderStatus"] = tmpOrderStatus[data[i]["orderStatus"]];
				        		data[i]["tmpOrderPay"] = data[i]["orderSpend"] - data[i]["orderGive"] - data[i]["orderDiscount"]+ "￥";
				        		data[i]["tmpOrderSpend"] =  data[i]["orderSpend"]  +"￥"
				        		data[i]["tmpOrderGive"] =  data[i]["orderGive"]  +"￥"
				        		data[i]["tmpOrderDiscount"] =  data[i]["orderDiscount"]+"￥"
				        		data[i]["tmpOrderAllDiscount"] =  data[i]["orderAllDiscount"]+"￥"
				        		if(data[i]["orderStatus"]==4){
				        			data[i]["operate"] =  " <a  style='padding: 0px 4px;background-color: #4cb9fc;color: #fff;' href='javascript:void(0);' class='sui-btn btn-bordered btn-xlarge btn-primary order-pay'>付款</a> <a  style='    padding: 0px 4px;background-color: #4cb9fc;color: #fff;' href='javascript:void(0);' class='sui-btn btn-bordered btn-xlarge btn-primary print-order'>打印</a> "
							    }else{
				        			data[i]["operate"] = "<a  style='padding: 0px 4px;background-color: #4cb9fc;color: #fff;' href='javascript:void(0);' class='sui-btn btn-bordered btn-xlarge btn-primary print-order'>打印</a>"
				        		}
				            } 
				            return data;
			        	}
			           return json.data;
				    }
		        } ,
			    "drawCallback": function( settings ) { 
			    	$(".order-pay").click(function(){ 
			    		var tr = $(this).closest("tr");
		        		var tmpData = inventory.detailsDb.row(tr).data();  
						var types = {1:{name:"现金支付",flag:1},2:{name:"微信支付",flag:1},3:{name:"支付宝支付",flag:1},4:{name:"会员卡支付",flag:1},5:{name:"银行卡支付",flag:2},6:{name:"微信优惠券",flag:3},7:{name:"在线支付",flag:4},8:{name:"其他支付",flag:4}};
						var typeHtml = '<ul class="sui-tag tag-bordered order-pay-confirm">';
						for(var i in types){  
							typeHtml +="<li key="+i+" class='"+(i==1?'tag-selected':'')+"'>"+types[i].name+"</li>"; 
						}
						typeHtml +='</ul>';
						var back =  $.confirm({
						      body: typeHtml
						      ,height: 70
						      ,width: 400
						      ,title:"选择支付方式:"
						      ,okHide:function(){
							        var pytype = '';
									$(".order-pay-confirm li").each(function(){
								    	 if($(this).hasClass("tag-selected")){
								    		 pytype =$(this).attr('key');
								    		 return true;
								    	 } 
								     })
									var request = {"method":"orderController.orderCheckpay" ,'pay_type':pytype,'order_pay':tmpData.orderShouldPay,'order_dish_discount':tmpData.orderDiscount,'order_all_discount':tmpData.orderAllDiscount,"order_should_pay":tmpData.orderShouldPay,"order_num":"","order_id":tmpData.orderId,"order_ticket_id":tmpData.orderTicketId};
						    		comm.jsonRequest(request, function (ret){ 
						    		    var data = JSON.parse(ret); 
						    		    if (data.content.code == 100) { 
						    		    	inventory.detailsDb.ajax.reload();
						    		    	return;
						    		    }
						    		    comm.message("管理信息","保持门店成功！",true);			  
						    	   });
						      }
						  }) 
						  
						  $(".order-pay-confirm li").click(function(){  
							  $(".order-pay-confirm li").removeClass("tag-selected");
							  $(this).addClass("tag-selected"); 
						  }) 
			    	})
			    	$(".print-order").click(function(){ 
			    		var tr = $(this).closest("tr");
		        		var tmpData = inventory.detailsDb.row(tr).data();  
		        		var request = {"method":"orderController.qryOrderDishesByOrderId" ,'order_id':tmpData.orderId};
			    		comm.jsonRequest(request, function (ret){ 
			    		    var data = JSON.parse(ret); 
			    		    if (data.code == 100) { 
			    		    	doPrint(data.data,tmpData.orderNum);
			    		    	return;
			    		    }
			    		    comm.message("管理信息","保持门店成功！",true);			  
			    	   });
			    		
			    	});
			    },
		        "columns": [
		           { "data": "orderNum"},
                   { "data": "createTime" },
                   { "data": "tmpOrderType" },
                   { "data": "tmpOrderStatus" },
                   { "data": "orderTicketName"},
                   { "data": "tmpPhone" },
                   { "data": "orderCustomerCount" },  
                   { "data": "orderWaiter" },
                   { "data": "tmpOrderSpend" }, 
                   { "data": "tmpOrderGive" },
                   { "data": "tmpOrderDiscount" },
                   { "data": "tmpOrderAllDiscount" },
                   { "data": "orderShouldPay" },
                   { "data": "orderPay" },
                   { "data": "operate" }     
               ] 
		 });
	}
	
	
	function doPrint(dishes,orderNum)
	{
		$(".report-list .remove").remove();
		var str='';var len =0,total=0;
		var units = {11:'只',10:'串',9:'千克',8:'克',7:'打',6:'盘',5:'瓶',4:'个',3:'根',2:'份',1:'斤'} 
		for(var i =0;i <dishes.length; i++){
			var dish = dishes[i]; 
			if(dish.iforder!=1)continue;
			str += "<div class='report-dish-tr remove'>"+
					      "<span style='text-align:left;margin-left:4px;display:block;font-size:14px;font-weight:800'>"+dish.dishName+"</span>";
			 if(dish.isset==1 && dish.parentDetailId==0 && dish.dishStatus==3){
				 str+= "<span style='margin-left:49%;'>--</span>";	   
			 }else{
				 str+= "<span style='margin-left:49%;'>"+dish.dishCount+(typeof(dish.dishUnit)=='undefined'?'份':units[dish.dishUnit])+"</span>";	   
					
			 }
			 if(dish.isset==1 && dish.parentDetailId>0 || (dish.parentDetailId==0 && dish.dishStatus==3)){
					    	  str+="<span style='margin-left:64px;'>--</span>" 
					      }else{
					    	  str+="<span style='margin-left:36px;'>￥"+(dish.dishCount * dish.dishUnitPrice).toFixed(2)+"</span>"
					    	  total +=(dish.dishCount * dish.dishUnitPrice);
					      }  
				     str+= "</div>"; 
				     len++;
		}
		if(len==0){
			alert("还未下单");
			return;
		}
		str += "<div class='report-dish-tr remove' style='border-top:dotted 2px #999;padding-top:4px;margin-top:6px'>"+
	      "<span style='text-align:left;font-size:14px;margin-left:6px;font-weight:800'>消费总计：</span>"+
	      "<span style='font-size:14px;font-weight:800'>￥"+(total).toFixed(2)+"</span>";	  
        str+= "</div>";
    
        $(".report-name").html("<吉麻姑>外卖单");
		$(".deskNum").html($("#title-desk-name").html())
		$(".deskCount").html($("#title-customer-count").html())
		$(".orderNum").html(orderNum);
		$(".orderserver").html($(".user").attr("username"));
		$(".deskTime").html(new Date().format('yyyy-MM-dd hh:mm:ss'))
		$(".print-time").html(new Date().format('yyyy-MM-dd hh:mm:ss'))
		$(".report-list").append(str);
		var height = 0.9 * len;
		demoPrint({html:$("#dishPrinter").html(),prview:false,printName:'MyPrinter','height':600+height*100})
	}
	 
})
 
//	private float orderSpend;
//	private float orderGive;
//	private float orderDiscount;
//	private float orderPay;
//	private int ifpay;
//	private String phone;
//	private String cardNumber;
//	private long memberId;
//	private String createTime;
//	private String modifyTime;
//	private String qryKey;
//	private String remarks;