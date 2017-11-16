define(function(require, takeout, module){ 
	var comm = require('../js/modules/common/common.js');
	var utils = require('../js/modules/common/util.js');

	function init() { 
		adjustInitConfig()
		initEvent();
		freshOrderTable();
		freshDishType(); 
		var bHeight=$(".recipes-classify-content-left-box").height(); 
		$(".recipes-classify-content-left").css("height",(bHeight * 67 /100 -42)+"px");
		$(".recipes-classify-content-left-set").css("height",(bHeight *33 /100 -42)+"px");
	}
	takeout.init = init;
	
	function adjustInitConfig()
	{
		$('.user-recipes-box1').css("width",($(".content").width()-164)+"px"); 
//		$("#desk-order-dish-div").css("width",($(".content").width()-$(".consumed").width()-6)+"px");
//		$("#order-dish-div").css("height",($(".content").height()-150)+"px");
//		$("#desk-order-dish-div").css("height",$(".desk-list").height()-143+"px");
		$(".my-drowdown-menu").css("margin-left",$(".content").width() * 0.35 ); 
		$(".width-change").css("margin-left",$(".content").width() * 0.35 -3); 
		$(".takeout-custom-info").css("width",$(".content").width() * 0.35-34); 
//		$(".msg-error").css("margin-left","305px"); 

		
		if(takeout.orderDishTb)takeout.orderDishTb.clear()
		takeout.orderDishTb = null;
		takeout.orderPayTb = null;
		takeout.tmpOrderData = {};
		takeout.memberDishes ={}; 
	}
	function initEvent() {   
		initAutocomplete({"method":"memberController.qryMemberList","check":false,"store_id":$("#store-select").val()},"phone","memberId","#phone","#member_id",0,["memberName","#order-buyer"]);
		initAutocomplete({"method":"sysMananger.qryStaffList","staff_role":1,"store_id":$("#store-select").val()},"staffName","staffId","#order_sender_name","#order_sender_id",0,["staffPhone","#order_sender_phone"]);
		initAutocomplete({"method":"orderController.qryOrderList","order_type":2,"store_id":$("#store-select").val()},"orderNum","orderId","#takeout-order-num","#order_id",0,["phone","#title_phone"]);
		
		$("#takeout-custom-form").validate();  
		$(".width-change").click(function(){
		    $(".user-recipes-box1").css("z-index",3);
		    $(".shop-recipes-box1").css("z-index",2); 
		    $(".dataTables_empty").css("text-align","center")
		    $(this).css("margin-left",$('.user-recipes-box1').width())
		})
		$(".shop-recipes-box1").click(function(){
		    $(this).css("z-index",3);
		    $(".user-recipes-box1").css("z-index",2);   
		    $(".dataTables_empty").css("text-align","left")
		    $(".width-change").css("margin-left",$(".content").width() * 0.35 -3); 
		});
		$(".order-new-btn").click(function(){
			$(".nav-item[type=takeout]").click();
			var request = {"method":"dineController.getOrderNum" };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.content.code == 100) { 
			    	 $("#takeout-order-num").val(data.content.data)
			    	 $(".takeout-custom-info").show(); 
			    	 initAutocomplete({"method":"orderController.qryOrderList","order_type":2,"store_id":$("#store-select").val()},"orderNum","orderId","#takeout-order-num","#order_id",0);			
			 		
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    });
		})
		$(".view-detail-btn").click(function(){
			var val = $("#takeout-order-num").val(); 
			if(val.indexOf("T")!=0|| val.length!=14 || !ValidateRules.isInteger(val.substring(1))){  
				$("#num-error").html("无效单号"); 
				return; 				
			}
			$(".nav-item[type=inventory]").attr("key",val)
			$(".nav-item[type=inventory]").click();
		});
		$(".confirm-order-btn").click(function(){
			confirmOrder();
		})
		$("#order_id").change(function(){ 
			freshOrderTable();
			freshDishType();  
		})
		$("#takeout-order-num").change(function(){
			var val = $("#takeout-order-num").val();
			if(val.indexOf("T")!=0|| val.length!=14 || !ValidateRules.isInteger(val.substring(1))){  
				$("#num-error").html("无效单号");
				takeout.order ={};
				$("#num-error").show();
			}else{ 
				$("#num-error").hide();
			}  
		})
		$(".recipes-title").click(function(e){
//			$(".takeout-custom-info").show(); 
		})
		$(".my-drowdown-menu li").click(function(){
			menuItemClick($(this));
		})
		$(".all-dish-discount li").click(function(){
			payMenuItemClick($(this));
		})
		$(".show-pay-btn").click(function(){
			if(takeout.order && (takeout.order.ifpay == 1 || takeout.order.orderStatus==4)){
			   alert("该单已结账，请建新单");
			   return false;
			}
			if(takeout.order && (takeout.order.orderStatus==5)){
				   alert("该单已退，请建新单");
				   return false;
			}
			if(takeout.orderDishTb.data().length <1)
			{
				alert("顾客还未点菜!?");
				return false;
			}
			
			var hasNewOrderDish = false;
			$("#order-dish-tb2 tr").each(function(){
				var tmpData = takeout.orderDishTb.row($(this)).data();
				var checked = $(this).find("input").is(':checked');  
				if(tmpData && tmpData.orderDishDetailId> 0 && !checked){
					hasNewOrderDish = true;  
				}
			}) 
			if(hasNewOrderDish == true){ 
				alert("还有未下单得菜!?");
				return false;
			}
			hasNewOrderDish = false;
			$("#order-dish-tb2 tr").each(function(){
				var tmpData = takeout.orderDishTb.row($(this)).data(); 
				if(tmpData && tmpData.dishStatus!=3){
					hasNewOrderDish = true;  
				}
			}) 
			if(hasNewOrderDish == false){ 
				alert("顾客还未点新菜!?");
				return false;
			}
			freshOrderPayTable();
		})
		$("#pay-order-payer").keyup(function(){
		    $("#payback").html($("#pay-order-payer").val()-$("#pay-order-pay").val());
		})
		$(".pay-nopay-leave").click(function(){
			orderNopayLeave();
		})
		$(".pay-check-pay").click(function(){
			orderCheckPay();
		}) 
		$(".order-ret-btn").click(function(){ 
				var val = $("#takeout-order-num").val(); 
				if(val.indexOf("T")!=0|| val.length!=14 || !ValidateRules.isInteger(val.substring(1))){  
					$("#num-error").html("无效单号"); 
					return; 				
				} 
				if(takeout.order.ifpay == 1 ) {
					alert("该单已支付,无法退单");
					return;
				}
				
				if(typeof(takeout.order)=='undefined' || takeout.order.orderId==null) return ;
				if(takeout.order && (takeout.order.orderStatus==5 )){
					   alert("该单已退");
					   return false;
				}
				var request = {"method":"orderController.cancleOrder" ,"order_id":takeout.order.orderId};
				comm.jsonRequest(request, function (ret){ 
				    var data = JSON.parse(ret); 
				    if (data.content.code == 100) { 
				    	$(".nav-item[type=takeout]").click();
				    	takeout.order = null;
				    	return false;
				    }
				    comm.message("管理信息","保持门店成功！",true);			  
			    });
				return false; 
		})
		$(".order-close-btn").click(function(e){			 
				var request = {"method":"orderController.editOrder",
						   "order_num": $("#takeout-order-num").val(),
						   "order_id":((typeof(takeout.order.orderId)=="undefined"||takeout.order==null)?'':takeout.order.orderId),
						   "order_type":2,
						   "order_ticket_id":0,
						   "order_ticket_name":$("#takeout-order-num").val(),
						   "sender_user_id":$("#order_sender_id").val(),
						   "sender_name":$("#order_sender_name").val(),
						   "order_address":$("#order_address").val(),
						   "order_corp_address":$("#order_corp_address").val(),
						   "order_buyer":$("#order_buyer").val(),
						   "phone":$("#phone").val(),
						   "member_id":$("#member_id").val(),
						   "start_time":'',//$("#start_time").val(),
							"store_id":$("#store-select").val()
				}; 
				comm.jsonRequest(request, function (ret){ 		
				    var data = JSON.parse(ret);
				    if (data.content.code == 100) {  
				    	takeout.order = data.content.order;
				    	takeout.orderDishTb.ajax.reload(); 
				    	$(".takeout-custom-info").hide(); 
				    	$("#title_phone").val($("#phone").val());
				    	$("#order_id").val(takeout.order.orderId);
				    	freshMemberDish();
				    	initAutocomplete({"method":"orderController.qryOrderList","order_type":2,"store_id":$("#store-select").val()},"orderNum","orderId","#takeout-order-num","#order_id",0);			
					   
				    	if(takeout.order.memberId>0){
			            	$("#title_phone").attr("disabled","true"); 
							$('.recipes-classify-content-left-set').parent().show();
							var bHeight=$(".recipes-classify-content-left-box").height(); 
							$('.recipes-classify-content-left').parent().css("height",'67%');
							$(".recipes-classify-content-left").css("height",(bHeight *67 /100 -42)+"px");
							$(".recipes-classify-content-left-set").css("height",(bHeight *33 /100 -42)+"px");
							$(".my-drowdown-menu li[type=memberDishMove]").show();
				    	}else{
				    		$('.recipes-classify-content-left-set').parent().hide();
							$('.recipes-classify-content-left').parent().css("height",'100%');
							$(".recipes-classify-content-left").css("height",(bHeight  -42)+"px");
							$(".my-drowdown-menu li[type=memberDishMove]").hide();
				    	}
				    	return;
				    } 		  
			    });
			 
			e.stopPropagation(); 
		})
		$(document).click(function(e){ 
			$(".my-drowdown-menu").hide()
			$(".all-dish-discount").hide()
		}) 
	}
	 
	function freshOrderTable()
	{ 
		if(takeout.orderDishTb!=null){//初始化方式来 
			takeout.orderDishTb.clear()
		    takeout.orderDishTb.ajax.reload();
		}else{			
			takeout.orderDishTb = $('#order-dish-tb2').DataTable({
				 "minHeight":"500px",
				 "scrollY": ($(".content").height()-188)+"px",  
				 "scrollX": true,
			     "scrollCollapse": true,
			     "searching": false, 
			     "lengthChange": false,//"ordering": false,
			     "paging": false,
			     "info": false, 
			     "columnDefs": [
	                    {"targets": [ 0 ],"visible": false,"searchable": false},
	                    {"targets": [ 1 ],"visible": false,"searchable": false},
	                    {"targets": [ 2 ],"visible": false,"searchable": false}
			      ],
			      "processing": true, 
			      //"serverSide": false,//打开后台分页  
			      "ajax":{
			        	"url": comm.jsonServer()+"/orderController/qryTakeoutOrderList",    
				        "contentType": "application/json",
				        "type": "POST",
				        "data": function ( d ) { 
				          d.store_id=$("#store-select").val();
				          d.order_num=($("#takeout-order-num").val()=='' || $("#takeout-order-num").val()==null)?'T':$("#takeout-order-num").val();
				          return JSON.stringify( d );
				        } ,
				        "dataSrc": function ( json ) {  
				        	if(json.data && json.data[0]){
				        		var dataDishes = json.data[0].orderDishes;
				        		var currentDishDetailId = 0
				        		var commonStatus={1:"即起",2:"退菜",3:"已付"}
					        	for ( var i=0; i<dataDishes.length ; i++ ) {    
					        		json.data[0].orderDishes[i]["tmpTotalPrice"]= (json.data[0].orderDishes[i]["dishCount"] * json.data[0].orderDishes[i]["dishUnitPrice"]).toFixed(2);
					        		if(json.data[0].orderDishes[i]["isset"]==1 && json.data[0].orderDishes[i]["parentDetailId"]==0 ){
					        			json.data[0].orderDishes[i]["expand"] = "<a class='dish-expand expand'>▼</a>"; 
					        			currentDishDetailId = json.data[0].orderDishes[i]["orderDishDetailId"];
					        		} else if(json.data[0].orderDishes[i]["isset"]==2){
					        			json.data[0].orderDishes[i]["expand"] = ""; 
					        			currentDishDetailId =0;
					        		}else{
					        			json.data[0].orderDishes[i]["tmpTotalPrice"] = '- -'
					        			json.data[0].orderDishes[i]["expand"] = "";
					        		}
					        		if(json.data[0].orderDishes[i]["dishCount"] == 0){
					        			json.data[0].orderDishes[i]["tmpDishCount"]='- -'
					        			json.data[0].orderDishes[i]["tmpTotalPrice"]='- -'
					        		}else {
					        			if(json.data[0].orderDishes[i]["iforder"] ==1 && json.data[0].orderDishes[i]["parentDetailId"]==0){
					        				json.data[0].orderDishes[i]["tmpDishCount"] =  json.data[0].orderDishes[i]["dishCount"];//+" <a class='dish-add dish-operate'>+</a><a class='dish-minus dish-operate' style='font-size: 22px;'>-</a>";
						        			
					        			}else{
					        				if(json.data[0].orderDishes[i]["parentDetailId"] > 0 && json.data[0].orderDishes[i]["oldParentDetailId"] == 0){
						        				if(json.data[0]["memberId"] !=0){
					        					  json.data[0].orderDishes[i]["tmpDishCount"] =  (json.data[0].orderDishes[i]["dishCount"]-json.data[0].orderDishes[i]["dishStorage"]) +" <a class='dish-add dish-operate'>+</a><a class='dish-minus dish-operate' style='font-size: 22px;'>-</a>";
						        				}else{
						        					json.data[0].orderDishes[i]["tmpDishCount"] = json.data[0].orderDishes[i]["dishCount"];
						        				}
						        			}else if(json.data[0].orderDishes[i]["oldParentDetailId"] > 0){
						        				if(json.data[0]["memberId"] !=0){
						        					json.data[0].orderDishes[i]["tmpDishCount"] =  (json.data[0].orderDishes[i]["dishCount"]-json.data[0].orderDishes[i]["dishStorage"]) +" <a class='dish-add dish-operate' style='font-size: 22px;'>-</a><a class='dish-minus dish-operate'>+</a>";
							        			}else{
						        					json.data[0].orderDishes[i]["tmpDishCount"] =json.data[0].orderDishes[i]["dishCount"];
						        				}
						        			}else if(json.data[0].orderDishes[i]["ifgive"] ==4){
						        				if(json.data[0]["memberId"] !=0){
						        					json.data[0].orderDishes[i]["tmpDishCount"] = (json.data[0].orderDishes[i]["dishCount"]-json.data[0].orderDishes[i]["dishStorage"]) +" <a class='dish-add dish-operate'>+</a>";
						        				}else{
						        					json.data[0].orderDishes[i]["tmpDishCount"] = json.data[0].orderDishes[i]["dishCount"];
						        				}
						        			}else{
						        				json.data[0].orderDishes[i]["tmpDishCount"] =  (json.data[0].orderDishes[i]["dishCount"]-json.data[0].orderDishes[i]["dishStorage"]) +" <a class='dish-minus dish-operate' style='font-size: 22px;'>-</a><a class='dish-add dish-operate'>+</a>";
						        			}
					        			}
					        			
					        	    }
					        		json.data[0].orderDishes[i]["tmpDishName"] = json.data[0].orderDishes[i]["dishName"];
					        		if(json.data[0].orderDishes[i]["ifgive"]==4){
					        			json.data[0].orderDishes[i]["tmpDishName"] = "赠送--"+ json.data[0].orderDishes[i]["dishName"];
					        		}
					        		var iforder = json.data[0].orderDishes[i]["iforder"];
					        		var isset = json.data[0].orderDishes[i]["isset"];
					        		var dishTypeId = json.data[0].orderDishes[i]["dishTypeId"];
					        		var updetailId = (currentDishDetailId ==0)? json.data[0].orderDishes[i]["orderDishDetailId"]:currentDishDetailId;
					        		var dishId =(json.data[0].orderDishes[i]["isset"]==2)?json.data[0].orderDishes[i]["dishId"]:"";
					        		if((json.data[0].orderDishes[i]["parentDetailId"] > 0)){
					        			dishId = json.data[0].orderDishes[i]["dishId"]+"i";
					        			var tmpKey = iforder + "-"+isset + '-'+dishTypeId+"-"+updetailId+"-"+dishId;
					        			takeout.tmpOrderData[tmpKey] = true;  
					        		} 
					        		console.log('=###========:',iforder + "-"+isset + '-'+(1000000+(json.data[0].orderDishes[i]["isset"]==2?dishId:dishTypeId))+"-"+(1000000000000+updetailId)+"-"+dishId);
					        		json.data[0].orderDishes[i]["index"] = iforder + "-"+isset + '-'+(1000000+(json.data[0].orderDishes[i]["isset"]==2?dishId:dishTypeId))+"-"+(1000000000000+updetailId)+"-"+dishId;
					        		var status = commonStatus[json.data[0].orderDishes[i]["dishStatus"]];
					        		if(json.data[0].orderDishes[i]["parentDetailId"] >0 && json.data[0].orderDishes[i]["dishStorage"] > 0 && json.data[0].orderDishes[i]["dishStatus"] !=2 && json.data[0].orderDishes[i]["dishStatus"] !=3){
					        			status="存"+json.data[0].orderDishes[i]["dishStorage"]; 
					        		}
					        		
					        		json.data[0].orderDishes[i]["tmpDishStatus"]= "<a>"+status+"</a>";
					        		json.data[0].orderDishes[i]["tmpDishNeed"] = (typeof(json.data[0].orderDishes[i]["dishNeed"])=="undefined" )?"":json.data[0].orderDishes[i]["dishNeed"];
					        		
					        		json.data[0].orderDishes[i]["tmpOrderTime"] = (typeof(json.data[0].orderDishes[i]["orderTime"])=="undefined" )?new Date().format("yyyy-MM-dd hh:mm:ss"):json.data[0].orderDishes[i]["orderTime"];
					        		json.data[0].orderDishes[i]["tmpIforder"]= "<input disabled=true "+(json.data[0].orderDishes[i]["iforder"]==1?"checked":"")+" type='checkbox'/>";
					              }
					        	takeout.order = json.data[0];
					        	
					        	$(".order-dish-spend").html(takeout.order.orderSpend+"￥");
					        	$(".order-dish-discount").html(takeout.order.orderDiscount+"￥");
					        	$(".order-dish-give").html(takeout.order.orderGive+"￥");
					        	$(".order-dish-pay").html((takeout.order.orderSpend-takeout.order.orderDiscount-takeout.order.orderGive)+"￥");
					        	$(".takeout-custom-info").hide(); 					            
					            
					            if(takeout.order.memberId>0){
					            	$("#title_phone").attr("disabled","true"); 
									$('.recipes-classify-content-left-set').parent().show();
									var bHeight=$(".recipes-classify-content-left-box").height(); 
									$('.recipes-classify-content-left').parent().css("height",'67%');
									$(".recipes-classify-content-left").css("height",(bHeight *67 /100 -42)+"px"); 
									$(".recipes-classify-content-left-set").css("height",(bHeight *33 /100 -42)+"px");
									$(".my-drowdown-menu li[type=memberDishMove]").show();
						    	}else{
						    		$('.recipes-classify-content-left-set').parent().hide();
									$('.recipes-classify-content-left').parent().css("height",'100%');
									$(".recipes-classify-content-left").css("height",(bHeight  -42)+"px");
									$(".my-drowdown-menu li[type=memberDishMove]").hide();
						    	}
					            return json.data[0].orderDishes;
				        	}else{
				        		$(".order-dish-spend").html("0￥");
					        	$(".order-dish-discount").html("0￥");
					        	$(".order-dish-give").html("0￥");
					        	$(".order-dish-pay").html("0￥");
				        		takeout.order = {memberId:0};
				        	}
				           return [];
					    } 				     
			        }, 
			        "drawCallback": function( settings ) {
			        	orderTableTRClick();   
			        	
			        	$("#order-dish-tb2 .dish-add").click(function(e){
			        		var tr = $(this).closest("tr");
			        		var tmpData = takeout.orderDishTb.row(tr).data();  
			        		dishCount(e,tmpData,1,true);
			        	});
			        	$("#order-dish-tb2 .dish-minus").click(function(e){
			        		var tr = $(this).closest("tr");
			        		var tmpData = takeout.orderDishTb.row(tr).data();  
			        		dishCount(e,tmpData,-1,true);
			        	});
			        	
			        	$("#order-dish-tb2").find("tbody tr").each(function(){  
			        		if(!takeout.orderDishTb) return;
			        		var tmpData = takeout.orderDishTb.row($(this)).data();  
			    			  if(!!tmpData && tmpData.index.indexOf("i")>0) {
			    				  $(this).css("background-color","#eee");
			    			  }
			    		 });
			        },
			        "columns": [
			          { "data": "index"},
	                  { "data": "dishTypeId" },
	                  { "data": "dishId" },
	                  { "data": "expand" },
	                  { "data": "tmpDishName" },
	                  { "data": "tmpDishStatus"},
	                  { "data": "tmpDishCount" },
	                  { "data": "tmpIforder" },
	                  { "data": "dishUnitPrice" },
	                  { "data": "tmpTotalPrice" },
	                  { "data": "tmpDishNeed" },
	                  { "data": "tmpOrderTime" }                  
	              ] 
			 });
			
			
		}
		//$(".shop-recipes-box1").dblclick(); 
		
		$(".dataTables_empty").css("text-align","left");
	}
	
	function freshOrderPayTable()
	{
		$("#pay-order-num").html(takeout.order.orderNum);
		$("#pay-phone").html(takeout.order.phone); 
		
		if(takeout.orderPayTb!=null){//初始化方式来 
		    takeout.orderPayTb.ajax.reload();
		}else{			
			takeout.orderPayTb = $('#order-pay-tb2').DataTable({
				 "minHeight":"250px", 
				 "scrollY": 260+"px",  
				 "scrollX": true,
			     "scrollCollapse": true,
			     "searching": false, 
			     "lengthChange": false,//"ordering": false,
			     "paging": false,
			     "info": false, 
			     "columnDefs": [
	                    {"targets": [ 0 ],"visible": false,"searchable": false}, 
			      ],
			      "processing": true, 
			      "serverSide": false,//打开后台分页  
			      "ajax":{
						"url": comm.jsonServer()+"/orderController/qryTakeoutOrderList",    
				        "contentType": "application/json",
				        "type": "POST",
				        "data": function ( d ) { 
				          d.store_id=$("#store-select").val();
				          d.order_num=($("#takeout-order-num").val()=='' || $("#takeout-order-num").val()==null)?'T':$("#takeout-order-num").val();
				          return JSON.stringify( d );
				        } ,
				        "dataSrc": function ( json ) {  
				        	if(json.data && json.data[0]){
				        		var dataDishes = json.data[0].orderDishes;
				        		var currentDishDetailId = 0
				        		var commonStatus={1:"即起",2:"退菜",3:"已付"}
					        	for ( var i=0; i<dataDishes.length ; i++ ) {   
					        		json.data[0].orderDishes[i]["tmpTotalPrice"]= json.data[0].orderDishes[i]["dishCount"] * json.data[0].orderDishes[i]["dishUnitPrice"];
					        		if(json.data[0].orderDishes[i]["isset"]==1 && json.data[0].orderDishes[i]["parentDetailId"]==0 ){
					        			json.data[0].orderDishes[i]["expand"] = "<a class='dish-expand expand'>▼</a>"; 
					        			currentDishDetailId = json.data[0].orderDishes[i]["orderDishDetailId"];
					        		} else if(json.data[0].orderDishes[i]["isset"]==2){
					        			json.data[0].orderDishes[i]["expand"] = ""; 
					        			currentDishDetailId =0;
					        		}else{
					        			json.data[0].orderDishes[i]["tmpTotalPrice"] = '- -'
					        			json.data[0].orderDishes[i]["expand"] = "";
					        		}
					        		if(json.data[0].orderDishes[i]["dishCount"] == 0){
					        			json.data[0].orderDishes[i]["tmpDishCount"]='- -'
					        			json.data[0].orderDishes[i]["tmpTotalPrice"]='- -'
					        		}else {
					        			json.data[0].orderDishes[i]["tmpDishCount"] = json.data[0].orderDishes[i]["dishCount"];
					        		}
					        		var iforder = json.data[0].orderDishes[i]["iforder"];
					        		var isset = json.data[0].orderDishes[i]["isset"];
					        		var dishTypeId = json.data[0].orderDishes[i]["dishTypeId"];
					        		var updetailId = (currentDishDetailId ==0)? json.data[0].orderDishes[i]["orderDishDetailId"]:currentDishDetailId;
					        		var dishId = "";
					        		if((json.data[0].orderDishes[i]["parentDetailId"] > 0)){
					        			dishId = json.data[0].orderDishes[i]["dishId"]+"i";
					        			var tmpKey = iforder + "-"+isset + '-'+dishTypeId+"-"+updetailId+"-"+dishId;
					        			takeout.tmpOrderData[tmpKey] = true;  
					        		} 
					        		console.log('=###========:',iforder + "-"+isset + '-'+dishTypeId+"-"+updetailId+"-"+dishId);
					        		json.data[0].orderDishes[i]["index"] = iforder + "-"+isset + '-'+(1000000+dishTypeId)+"-"+(1000000000000+updetailId)+"-"+dishId;
					        		var status = commonStatus[json.data[0].orderDishes[i]["dishStatus"]];
					        		if(json.data[0].orderDishes[i]["parentDetailId"] >0 && json.data[0].orderDishes[i]["dishStorage"] > 0 && json.data[0].orderDishes[i]["dishStatus"] !=2 && json.data[0].orderDishes[i]["dishStatus"] !=3){
					        			status="存"+json.data[0].orderDishes[i]["dishStorage"]; 
					        		}
					        		json.data[0].orderDishes[i]["tmpDiscount"]=0;
					        		if(json.data[0].orderDishes[i]["isset"]==2 && status!=2){
					        			json.data[0].orderDishes[i]["tmpDiscount"]= "<select class='select-discount'><option value='0'>无</option><option value='0.1'>9.0折</option><option value='0.05'>9.5折</option><option value='0.03'>9.7折</option></select>";
					        		}
					        		json.data[0].orderDishes[i]["tmpDishName"] = json.data[0].orderDishes[i]["dishName"];
					        		if(json.data[0].orderDishes[i]["ifgive"]==4){
					        			json.data[0].orderDishes[i]["tmpDishName"] = "赠送--"+ json.data[0].orderDishes[i]["dishName"];
					        		}
					        		json.data[0].orderDishes[i]["tmpDishStatus"]= "<a>"+status+"</a>";
					        		json.data[0].orderDishes[i]["tmpOrderTime"] = (typeof(json.data[0].orderDishes[i]["orderTime"])=="undefined" )?new Date().format("yyyy-MM-dd hh:mm:ss"):json.data[0].orderDishes[i]["orderTime"];
					        		json.data[0].orderDishes[i]["tmpIforder"]= "<input style='width:20px' disabled=true "+(json.data[0].orderDishes[i]["iforder"]==1?"checked":"")+" type='checkbox'/>";
					              }  
					        	$("#pay-total-spend").html(takeout.order.orderSpend+"");
					        	$("#pay-order-pay").val(Math.floor(parseFloat(takeout.order.orderSpend)-parseFloat(takeout.order.orderDiscount)));
					        	$("#pay-dish-discount").html(takeout.order.orderDiscount+"");
					        	$("#pay-order-discount").html("0");
					        	$("#pay-dish-zero").html((takeout.order.orderSpend -Math.floor(takeout.order.orderSpend)).toFixed(2));
//					        	$("#pay-had-pay").html((takeout.order.orderSpend-takeout.order.orderDiscount-takeout.order.orderGive)+"");
					        	$("#pay-order-result").html(Math.floor(parseFloat(takeout.order.orderSpend)-parseFloat(takeout.order.orderDiscount)));
					        	$("#pay-order-payer").val(Math.floor(parseFloat(takeout.order.orderSpend)-parseFloat(takeout.order.orderDiscount)));
					        	
					        	return json.data[0].orderDishes;
				        	}else{
				        		$("#pay-total-spend").html("0");
					        	$("#pay-dish-discount").html("0");
					        	$("#pay-order-discount").html("0");
					        	$("#pay-dish-zero").html("0");
					        	$("#pay-order-pay").val("0");
					        	$("#pay-order-result").html("0");
				        		takeout.order = {memberId:0};
				        	}
				           return [];
					    } 				     
			        }, 
			        "drawCallback": function( settings ) { 
			        	$("#order-pay-tb2").find("tbody tr").each(function(){  
			        		if(!takeout.orderDishTb) return;
			        		var tmpData = takeout.orderDishTb.row($(this)).data();  
			    			  if(!!tmpData && tmpData.index.indexOf("i")>0) {
			    				  $(this).css("background-color","#eee");
			    			  }
			    		 });
			        	$("#order-pay-tb2").find("tbody").unbind("click");
			        	$("#order-pay-tb2").find("tbody").click(function(e){   
			        		$(".all-dish-discount").css("left",e.pageX);
			        		$(".all-dish-discount").css("z-index",1999);
			        		$(".all-dish-discount").css("top",e.pageY);
			        		 $(".all-dish-discount").show();
			        		 e.stopPropagation(); 
			    		 });
			        	$(".select-discount").click(function(e){
			        		$(".all-dish-discount").hide();
			        		e.stopPropagation();
			        	});
			        	$(".select-discount").unbind("change");
			        	$(".select-discount").change(function(e){
			        		var tr = $(this).closest("tr");
			        		var tmpData = takeout.orderDishTb.row(tr).data();
			        		var thisDiscount = tmpData.dishCount * tmpData.dishUnitPrice * parseFloat($(this).val());
			        		tmpData.dishDiscount=thisDiscount
			        		takeout.orderDishTb.row(tr).data()
			        		//todo update discount
			    			var allData = takeout.orderDishTb.data();
			    			dishDiscount=0;
			    			 for(var i in allData){
			    				 if(allData[i].isset ==2){
			    					 dishDiscount+=parseFloat(allData[i].dishDiscount);
			    			     }
			    			 }
			    			$("#pay-dish-discount").html(dishDiscount.toFixed(2))
			    			$("#pay-dish-zero").html((parseFloat($("#pay-total-spend").html()-dishDiscount) - Math.floor(parseFloat($("#pay-total-spend").html()-dishDiscount))).toFixed(2));
			    			$("#pay-order-result").html(Math.floor(parseFloat($("#pay-total-spend").html())-dishDiscount-parseFloat($("#pay-order-discount").html())));
			    			$("#pay-order-pay").val(Math.floor(parseFloat($("#pay-total-spend").html())-dishDiscount-parseFloat($("#pay-order-discount").html())))
			    			$("#pay-order-payer").val(Math.floor(parseFloat($("#pay-total-spend").html())-dishDiscount-parseFloat($("#pay-order-discount").html())));
			    			e.stopPropagation(); 
			        	})
			        },
			        "columns": [
			          { "data": "index"}, 
			          { "data": "tmpIforder"},
			          { "data": "expand"},
	                  { "data": "tmpDishName" },
	                  { "data": "tmpTotalPrice" }, 
	                  { "data": "tmpDiscount" },
	                  { "data": "dishCount" }, 
	                  { "data": "dishUnitPrice" }, 
	                  { "data": "tmpDishStatus" }, 
	                  { "data": "tmpOrderTime" }                  
	              ] 
			 });
		} 
	}
	
	function freshDishType()
	{
		var request = {"method":"dishController.qryDishTypeList" ,"store_id":$("#store-select").val()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code !== 100) { 
		    	var dishTypes = data.data,dishTypeStr  ="<div class='item item-box dish-type-box' index='-1'>全部菜品</div><div class='item item-box dish-type-box' index='-2'>菜品套餐</div>"; 
		    	var tmpTypeSet = {2:"套餐",1:""};//tmpTypeSet[dishTypes[i]['dishTypeSet']]+
		    	$('.recipes-classify-select').empty(); 				
		    	for(var i in dishTypes){
		    		if(dishTypes[i]['dishTypeSet'] == 1)
		    		dishTypeStr +="<div class='item item-box dish-type-box' index='"+i+"'>"+dishTypes[i]['dishTypeName']+"</div>";
				}
		    	takeout.dishTypeData = dishTypes;
				$(".recipes-classify-select").append(dishTypeStr);
				freshMemberDish();
				$('.recipes-classify-select .dish-type-box').click(showDishes); 
				$('.recipes-classify-select .dish-type-box[index=-1]').click(); 
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    }); 
	}
	function freshMemberDish()
	{
		//if($("#member_id").val()=='' || $("#member_id").val()==null){return;}
		if($("#order_id").val()=='' || $("#order_id").val()==null){return};
		$('.recipes-classify-content-left-set').empty();
		var request = {"method":"memberController.qryMemberDishList" ,"order_id":$("#order_id").val(),"desk_id":''};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code == 100) {
		    	var dishes = data.data,dishStr ="";   
		    	var dishesUnits={11:'只',10:'串',9:'千克',8:'克',7:'打',6:'盘',5:'瓶',4:'个',3:'根',2:'份',1:'斤'};
		    	for(var i in dishes){ 
		    		if(dishes[i] && dishes[i].dishCount<=0) continue;
		    		var bgcolor  ="";
		    		if(dishes[i].ifPay == 2) bgcolor = "style='background:#FFEFD5'";
		    		dishStr +="<div "+bgcolor+" class='item fl' index="+i+"><div style='display: inline-block;margin-top: 3px;'>["+((typeof(dishes[i]['relaDishTypeName'])=='undefined')?'赠送':dishes[i]['relaDishTypeName'])+"  --</div><div style='display: inline-block;'>"+dishes[i]["dishName"]+"]</div><div style='color: #888;display: inline-table;margin: 0 20px;'>剩余："+dishes[i]['dishCount']+dishesUnits[dishes[i]["dishUnit"]]+"</div><div style='color: #888;position: relative;clear: both;display: inline-block;margin-top: 3px;float: right;margin-right: 6px;'><a class='dish-minus dish-operate' style='font-size:12px'>减存</a></div></div>";
		        }
		    	takeout.memberDishesData = dishes;
		    	
	    		$('.recipes-classify-content-left-set').append(dishStr); 
	    		$(".recipes-classify-content-left-set .item").click(move2Order);   
	        	$("#order-dish-tb2 .dish-minus").click(function(e){
	        		var index =  $(this).parent().parent().attr("index");
	    			var tmpData = takeout.memberDishesData[index];
	        		dishCount(e,tmpData,-1,false);
	        	});
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    }); 
	}
	
	
	function showDishes()
	{  
		var index = $(this).attr("index");
		if(index==-1){
			var dishTypeId = -1; 
			showNotDishSet(dishTypeId); 
		}else if(index==-2){ 
			showSetDish(true);
		}else{ 
			var typeSet = takeout.dishTypeData[index]['dishTypeSet'];
			var dishTypeId = takeout.dishTypeData[index]['dishTypeId'];	
			showNotDishSet(dishTypeId);
		}
		 
	}
	function showNotDishSet(dishTypeId)
	{ 
		var request = {"method":"dishController.qryDishList","dish_type_id":dishTypeId,"store_id":$("#store-select").val()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code !== 100) { 
		    	var dishes = data.data,dishStr ="";  
		    	for(var i in dishes){
		    		dishStr +="<div class='item fl' type='' index='"+i+"'><div>"+dishes[i]['dishName']+"</div><div style='margin-top: 20px;float: right;color: #888;'>单价："+dishes[i]['dishPrice']+"￥</div></div>"; 
				}
		    	takeout.dishesData = dishes;
		    	$('.recipes-classify-content-left').empty();
	    		$('.recipes-classify-content-left').append(dishStr);
	    		if(dishTypeId==-1) showSetDish();
	    		$(".recipes-classify-content-left .item[type='']").click(fillOrderDishes);  
				
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });   
	}
	function showSetDish(empty)
	{
		var request = {"method":"dishController.qryDishTypeList","dish_type_set":2 ,"status":2,"store_id":$("#store-select").val()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code !== 100) { 
		    	var dishes = data.data,dishStr ="";  
		    	for(var i in dishes){
//		    		if(takeout.order && takeout.order.memberId<=0){//必须在后台执行 
//						 continue;
//					}
		    		dishStr +="<div class='item fl' type='set' index='"+i+"'><div>"+dishes[i]['dishTypeName']+"</div><div style='margin-top: 20px;float: right;color: #888;'>单价："+dishes[i]['dishUnitPrice']+"￥</div></div>"; 
				}
		    	takeout.dishesSetData = dishes;
		    	if(empty)$('.recipes-classify-content-left').empty();
	    		$('.recipes-classify-content-left').append(dishStr);
	    		$(".recipes-classify-content-left .item[type='set']").click(fillOrderDishes);  
				
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });   
	}
	function fillOrderDishes(e,type,index,addCount)
	{ 
		if(takeout.order && (takeout.order.ifpay == 1 || takeout.order.orderStatus==4)){
			   alert("该单已结账，请建新单");
			   return false;
		}
		if(takeout.order && (takeout.order.orderStatus==5)){
			   alert("该单已退，请建新单");
			   return false;
		}
		if(takeout.orderDishTb.data().length >100)
		{
			alert("不要太浪费哦！");
			return;
		}
		if(addCount==0){return;}
		if(typeof(type)=="undefined"){
			type= $(this).attr("type");  
		}
		if(typeof(index)=="undefined"){ 
			index = $(this).attr("index");
		}
		if(typeof(addCount)=="undefined"){
			addCount = 1;
		}
		
		var orderDishDetailId = "";
		var dishCount = 1;
		
		if(type == "set"){  
			var dishTypeId = takeout.dishesSetData[index].dishTypeId;
			var dishTypeName = takeout.dishesSetData[index].dishTypeName;
			var dishPrice = takeout.dishesSetData[index].dishUnitPrice;  
			$("#order-dish-tb2 tr").each(function(){
				  var tmpDishData = takeout.orderDishTb.row($(this)).data();
				  tmpKey = 2 + "-"+1 + '-'+(1000000+dishTypeId)+"-";
				  if( typeof(tmpDishData)!="undefined" && tmpDishData.index.indexOf(tmpKey)>= 0 && tmpDishData.iforder==2 && tmpDishData.parentDetailId==0 && tmpDishData.dishCount!=0) {  
					  orderDishDetailId = tmpDishData.orderDishDetailId;
					  dishCount = tmpDishData.dishCount+addCount; 
				  }
			});
			var request = {"method":"orderController.editOrderDish",
					   "order_dish_detail_id":orderDishDetailId,
					   "order_id":((typeof(takeout.order)=="undefined"||takeout.order==null)?'':takeout.order.orderId),
					   "desk_id":$("#title-desk-id").html(),
					   "dish_id":dishTypeId,
					   "dish_name":dishTypeName,
					   "dish_type_id":dishTypeId,
					   "dish_count":dishCount,
					   "member_id":$("#title-member_id").val(),
					   "isset":1,
					   "store_id":$("#store-select").val()
			};
			
		}else{
			var dishId = takeout.dishesData[index].dishId;
			var dishTypeId = takeout.dishesData[index].dishId;
			var dishName = takeout.dishesData[index].dishName;
			var dishPrice = takeout.dishesData[index].dishPrice;    
			var dishUnit = takeout.dishesData[index].dishUnit;  
			$("#order-dish-tb2 tr").each(function(){
				  var tmpDishData = takeout.orderDishTb.row($(this)).data();
				  if(typeof(tmpDishData)!="undefined"){
					  tmpKey = 2 + "-"+2 + '-'+(1000000+dishId)+"-";
				  } 
				  if(typeof(tmpDishData)!="undefined"  && tmpDishData.index.indexOf(tmpKey)>= 0 && tmpDishData.iforder==2 && tmpDishData.isset == 2) {  
					  orderDishDetailId = tmpDishData.orderDishDetailId;
					  dishCount = tmpDishData.dishCount+addCount; 
				  }
			});
			var request = {"method":"orderController.editOrderDish",
					   "order_dish_detail_id":orderDishDetailId,
					   "order_id":((typeof(takeout.order)=="undefined"||takeout.order==null)?'':takeout.order.orderId),
					   "desk_id":$("#title-desk-id").html(),
					   "dish_id":dishId,
					   "dish_name":dishName,
					   "dish_type_id":dishTypeId,
					   "dish_count":dishCount,
					   "member_id":$("#title-member_id").val(),
					   "isset":2,
					   "dish_unit":dishUnit,
					   "store_id":$("#store-select").val()
			};
		}
		comm.jsonRequest(request, function (ret){ 		
		    var data = JSON.parse(ret);
		    if (data.code !== 100) {  
		    	takeout.orderDishTb.ajax.reload(); 
		    	return;
		    } 		  
	    });
	  orderTableTRClick(); 
 
	}
	function orderTableTRClick()
	{
		$(".dish-expand").unbind('click');
		$(".dish-expand").click(function(e){
			$(this).toggleClass("expand","");
			var tr = $(this).closest("tr");
			var tmpTypeData = takeout.orderDishTb.row(tr).data();
			$(".my-drowdown-menu").hide(); 
			
			if($(this).hasClass("expand")){
				$(this).html("▼"); 
				$("#order-dish-tb2").find("tbody tr").each(function(){  
						var tmpData = takeout.orderDishTb.row($(this)).data();   
					    var iforder = tmpData.iforder;
					    var isset = tmpData.isset;
					    var dishTypeId = tmpTypeData.dishTypeId;
					    var updetailId = tmpTypeData.orderDishDetailId;
					    var dishId = tmpData.dishId;
			    	    var tmpKey = iforder + "-"+isset + '-'+(1000000+dishTypeId)+"-"+(1000000000000+updetailId)+"-"+dishId+"i"; 
   					    if(tmpData.index==tmpKey) {
   						   $(this).show();
   					    }
   				  });
			}else{
				$(this).html("▲");
				$("#order-dish-tb2").find("tbody tr").each(function(){   
						var tmpData = takeout.orderDishTb.row($(this)).data();   
					    var iforder = tmpData.iforder;
					    var isset = tmpData.isset;
					    var dishTypeId = tmpTypeData.dishTypeId;
					    var updetailId = tmpTypeData.orderDishDetailId;
					    var dishId = tmpData.dishId;
			    	    var tmpKey = iforder + "-"+isset + '-'+(1000000+dishTypeId)+"-"+(1000000000000+updetailId)+"-"+dishId+"i"; 
			    	    console.log("========CC=========",tmpKey)
						if(tmpData.index==tmpKey) {
							  $(this).hide(); 
						}
				  });
			}
			
			e.stopPropagation(); 
		});
		
		$("#order-dish-tb2 tr").unbind('click');
		$("#order-dish-tb2 tr").click(function(e){ 
			
			if(e.pageY+$(".my-drowdown-menu").height()>$(document).height()){
				$(".my-drowdown-menu").css("top",e.pageY-(e.pageY+$(".my-drowdown-menu").height()-$(document).height())-10);
			}else{
				$(".my-drowdown-menu").css("top",e.pageY);
			} 
			$(".my-drowdown-menu").show(); 
			var tmpData = takeout.orderDishTb.row($(this)).data();
			$("#order-dish-tb2 tr").each(function(){
				$(this).attr("currentTr","false");
			})
			$(this).attr("currentTr", "true");
			var checked = $(this).find("input").is(':checked'); 
			if(tmpData){
				if(checked){//已选择的只提供item:[整桌转台,顾客退菜]功能
					if(tmpData.isset==1 && tmpData.parentDetailId>0){//表示未套餐中的菜品
                    	$(".my-drowdown-menu li").removeClass("disabled");
                    	$(".my-drowdown-menu li").addClass("disabled");
					    if(tmpData.dishStatus!=2){
						    $(".my-drowdown-menu li[cat=3]").removeClass("disabled")
					    }
					    if(tmpData.parentDetailId<=0 && tmpData.dishStatus!=2){
					    	$(".my-drowdown-menu li[cat=2]").removeClass("disabled")
					    }
					   
					    $(".my-drowdown-menu li[cat=11]").removeClass("disabled");  
					    $(".my-drowdown-menu li[cat=21]").removeClass("disabled")
					}else{ 
						$(".my-drowdown-menu li").removeClass("disabled");
						$(".my-drowdown-menu li").addClass("disabled");
						if(tmpData.dishStatus!=2){
					    	$(".my-drowdown-menu li[cat=2]").removeClass("disabled")
					    }  
						if(tmpData.isset!=1){
							$(".my-drowdown-menu li[cat=11]").removeClass("disabled");  
						}
					    $(".my-drowdown-menu li[cat=21]").removeClass("disabled")
					}
				}else{//未选择的需要判断是套餐、赠送还是单点
                    if(tmpData.isset==1 && tmpData.parentDetailId>0){//表示未套餐中的菜品
                    	$(".my-drowdown-menu li").removeClass("disabled");
                    	$(".my-drowdown-menu li").addClass("disabled");
                    	if(tmpData.parentDetailId==0){
							$(".my-drowdown-menu li[cat=1]").removeClass("disabled");
                    	} else{
                    		$(".my-drowdown-menu li[cat=11]").removeClass("disabled");  
                    	}
					    $(".my-drowdown-menu li[cat=3]").removeClass("disabled")
					    $(".my-drowdown-menu li[cat=21]").removeClass("disabled")
					}else{
						$(".my-drowdown-menu li").removeClass("disabled");
						$(".my-drowdown-menu li").addClass("disabled");  
						if(tmpData.dishCount!=0){
							$(".my-drowdown-menu li[cat=1]").removeClass("disabled");   
						}
						$(".my-drowdown-menu li[type=dishDel]").removeClass("disabled");   
						if(tmpData.isset!=1 ){
							$(".my-drowdown-menu li[cat=11]").removeClass("disabled");  
						}
					    $(".my-drowdown-menu li[cat=21]").removeClass("disabled")
					}
				}
			} 
			
			e.stopPropagation(); 
		})
	}
	
	function menuItemClick(itemElem)
	{
		if(itemElem.hasClass("disabled")){return;}
		if(itemElem.attr("type")=='memberDishMove'){
			var tr = $("#order-dish-tb2 tbody tr[currentTr=true]");
			var dishes = takeout.orderDishTb.row(tr).data();
			if(dishes.dishCount==dishes.dishStorage){
				alert("该菜品已转存完成");
				return;
			}
			var request = {"method":"orderController.move2Storage","detail_id":dishes.orderDishDetailId};
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.code !== 100) { 
			    	freshMemberDish();  
			    	takeout.orderDishTb.ajax.reload(); 
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    });   
		}else if(itemElem.attr("type")=='dishTurntable'){
			var request = {"method":"dineController.qryDineTableList" };
			$(".turn-desk").empty();
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.code !== 100) { 
			    	var desk = data.data,deskStr  =""; 
			    	for(var i in desk){
						if (desk[i]['tableStatus']==1) {
							deskStr += "<div  class='desk fl desk-color' desk='"+desk[i]['tableId']+"' >"
							deskStr +=	"<div class='desk-name'>"+desk[i]['tableName']+"</div>" ;  
							deskStr +=	"<div class='desk-consumed' seats="+desk[i]["tableSeats"]+"'>"+("可供"+desk[i]["tableSeats"]+"人")+"</div>";
						        
				            deskStr +="</div>";
						}   
					}
			    	
					$(".turn-desk").append(deskStr);
					$('.turn-desk .desk').unbind("click"); 
					$('.turn-desk .desk').click(turnDesk); 
			    	return;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    });
		} else if(itemElem.attr("type")=='dishDel'){
			var tr = $("#order-dish-tb2 tbody tr[currentTr=true]");
			var dishes = takeout.orderDishTb.row(tr).data();
			if(dishes.ifOrder==1){alert("已下单，不能删除")}
			var request = {"method":"orderController.deleteOrderDish","detail_id":dishes.orderDishDetailId};
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.code !== 100) { 
			    	freshMemberDish();  
			    	takeout.orderDishTb.ajax.reload(); 
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    });    
		}else if(itemElem.attr("type")=='dishRetreat'){
			var tr = $("#order-dish-tb2 tbody tr[currentTr=true]");
			var dishes = takeout.orderDishTb.row(tr).data();
			if(dishes.ifOrder==2){alert("为下单菜品,请选择退菜")}
			var request = {"method":"orderController.deleteOrderDish","detail_id":dishes.orderDishDetailId,"retreat":true};
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.code !== 100) { 
			    	freshMemberDish();  
			    	takeout.orderDishTb.ajax.reload(); 
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    });    
		} else if(itemElem.attr("type")=='dishDemand'){
			var tr = $("#order-dish-tb2 tbody tr[currentTr=true]");
			var dishes = takeout.orderDishTb.row(tr).data();
			var dishDemands = dishes.dishNeed;
			var demands = {1:{name:"重辣",flag:1},2:{name:"辣",flag:1},3:{name:"微辣",flag:1},4:{name:"不辣",flag:1},5:{name:"麻",flag:2},6:{name:"淡点",flag:3},7:{name:"加糖",flag:4},8:{name:"不加糖",flag:4},9:{name:"加醋",flag:5},10:{name:"加酱油",flag:5}};
			var needHtml = '<ul class="sui-tag tag-bordered dish_need">';
			for(var i in demands){ 
				if((","+dishDemands).indexOf(","+demands[i].name+",")>-1){
					needHtml +="<li type="+demands[i].flag+" class='tag-selected'>"+demands[i].name+"</li>";
				}else{
					needHtml +="<li type="+demands[i].flag+">"+demands[i].name+"</li>";
				}
			}
			needHtml +='</ul>';
			var back =  $.confirm({
			      body: needHtml
			      ,height: 70
			      ,width: 400
			      ,title:"选择口味:"
			      ,okHide:function(){
				     var dishNeed = "";
				     $(".dish_need li").each(function(){
				    	 if($(this).hasClass("tag-selected")){
				    		 dishNeed +=$(this).html()+",";
				    	 } 
				     })
				     if(dishNeed==""){
				    	 return false;
				     } else{
				    	 var request = {"method":"orderController.orderDishNeed","detail_id":dishes.orderDishDetailId,"dish_need":dishNeed};
							comm.jsonRequest(request, function (ret){ 
							    var data = JSON.parse(ret); 
							    if (data.code !== 100) {  
							    	takeout.orderDishTb.ajax.reload(); 
							    	return true;
							    }
							    comm.message("管理信息","保持门店成功！",true);			  
						  }); 
							return true;
				      }
			       }
			  })
			  $(".dish_need li").click(function(){  
				  if(!$(this).hasClass("tag-selected")){
					  var type = $(this).attr("type");
					  $(".dish_need").find("li[type="+type+"]").removeClass("tag-selected");
					  $(this).addClass("tag-selected","");
				  }else{
					  $(this).removeClass("tag-selected","");
				  }				  
			  })
			  return;
		}
	}
		
	function move2Order()
    { 
		if(takeout.order && (takeout.order.ifpay == 1 || takeout.order.orderStatus==4)){
			   alert("该单已结账，请建新单");
			   return false;
		}
		if(takeout.order && (takeout.order.orderStatus==5)){
			   alert("该单已退，请建新单");
			   return false;
		}
    	var index = $(this).attr("index");
    	var memberDish = takeout.memberDishesData[index]
		var request = {"method":"orderController.move2Order","member_dish_id":memberDish.memberDishId,"order_id":((typeof(takeout.order)=="undefined"||takeout.order==null)?'':takeout.order.orderId)};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code !== 100) { 
		    	freshMemberDish(); 
		    	takeout.orderDishTb.ajax.reload();
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });   
    }
	
	function confirmOrder()
	{
		var val = $("#takeout-order-num").val(); 
		if(val.indexOf("T")!=0|| val.length!=14 || !ValidateRules.isInteger(val.substring(1))){  
			$("#num-error").html("无效单号"); 
			return; 				
		}
		if(takeout.order && (takeout.order.ifpay == 1 || takeout.order.orderStatus==4)){
			   alert("该单已结账，请建新单");
			   return false;
		}
		if(takeout.order && (takeout.order.orderStatus==5)){
			   alert("该单已退，请建新单");
			   return false;
		}
		if(takeout.orderDishTb.data().length <1)
		{
			alert("顾客还未点菜!?");
			return false;
		}
		var hasNewOrderDish = false;
		$("#order-dish-tb2 tr").each(function(){
			var tmpData = takeout.orderDishTb.row($(this)).data();
			var checked = $(this).find("input").is(':checked');  
			if(tmpData && tmpData.orderDishDetailId> 0 && !checked){
				hasNewOrderDish = true;  
			}
		}) 
		if(hasNewOrderDish == false){ 
			alert("顾客还未点新菜!?");
			return false;
		}
		var request = {"method":"orderController.orderDishes",
				   "order_id":((typeof(takeout.order)=="undefined"||takeout.order==null)?'':takeout.order.orderId) 
			    };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) { 
			    	comm.message("管理信息","保持门店失败！",true);
			    	var dishes = takeout.orderDishTb.data();
			    	takeout.orderDishTb.ajax.reload();  
			  
//			    	$("#order-dish-div").printArea();
			    	var check = $(".user-print-btn input").is(':checked');
			    	if(check){
			    		doPrint(dishes,takeout.order.orderNum);
			    	}
			    	doPrint(dishes,takeout.order.orderNum);
			    	return;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		   });
	}
	
	function initAutocomplete(request,keyName,valName,keyElem,valElem,selfval,thirdArr)
	{
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret);
		    if (data.code !== 100) {
		    	var obj = {"query":'a'};
		    	obj.suggestions = [];
		    	retObj = data.data; 
		    	for(var i in retObj){
		    		if(selfval && retObj[i][valName] == selfval) {
		    			continue;
		    		}
		    		if(thirdArr && thirdArr.length==2){
		    			tmpObj = {"value":retObj[i][keyName],"data":{"id":retObj[i][valName],"third":retObj[i][thirdArr[0]]}};
		    		}else{
		    			tmpObj = {"value":retObj[i][keyName],"data":{"id":retObj[i][valName]}};
		    		}
		    		
		    		obj.suggestions.push(tmpObj);
		    	}     
		    	if($(keyElem).data() && $(keyElem).data().autocomplete) {
		    		$(keyElem).data().autocomplete.options.lookup= obj.suggestions;
		    	} 
		    	else{
		    		takeout.comp = $(keyElem).autocomplete({
			    		lookup:   obj.suggestions,
					    minChars: 0, 
					    isLocal:true,
				        onSelect: function (suggestion) {
				            $(valElem).val(suggestion.data.id); 
				            if(thirdArr && thirdArr.length==2){
				            	$(thirdArr[1]).val(suggestion.data.third); 
				    		}  
				            $(valElem).parent().find(".msg-error").remove();
				            $(valElem).parent().find("input, select, textarea").each(function(){
						    	   $(this).removeClass("input-error")
						       }) 
						    $(valElem).change();
				            $(keyElem).change();
				        },
				        lookupFilter: function (suggestion, originalQuery, queryLowerCase) { 
				            	$(valElem).val(""); 
					            if(thirdArr && thirdArr.length==2){
					            	$(thirdArr[1]).val(""); 
					    		} 
				              
				            return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
				        } 
				    });
		    	}
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	   });   
	}
	
	function dishCount(e,data,count,isorder)
	{
		$(".my-drowdown-menu").hide()
		$(".all-dish-discount").hide();
		if(isorder){
			if((data.iforder==1 && data.parentDetailId ==0)||  data.dishCount <=0){e.stopPropagation(); return;} 
			var type ="",index=-1;
			if(data.parentDetailId>0  || data.ifgive==4){  
				if(data.dishStorage+count<0) {e.stopPropagation();return;} 
				var request = {"method":"orderController.move2Storage","detail_id":data.orderDishDetailId,"update_count":count};
				comm.jsonRequest(request, function (ret){ 
				    var data = JSON.parse(ret); 
				    if (data.code !== 100) {  
				    	takeout.orderDishTb.ajax.reload(); 
				    	freshMemberDish();  
				    }
				    comm.message("管理信息","保持门店成功！",true);			  
			    });   
			}else {
				if(data.dishCount+count<1) {
					var request = {"method":"orderController.deleteOrderDish","detail_id":data.orderDishDetailId};
					comm.jsonRequest(request, function (ret){ 
					    var data = JSON.parse(ret); 
					    if (data.code !== 100) { 
					    	freshMemberDish();  
					    	takeout.orderDishTb.ajax.reload(); 
					    }
					    comm.message("管理信息","保持门店成功！",true);			  
				    })
				}else{
					var request = {"method":"orderController.editOrderDish",
							   "order_dish_detail_id":data.orderDishDetailId,
							   "order_id":((typeof(takeout.order)=="undefined"||takeout.order==null)?'':takeout.order.orderId),
							   "desk_id":$("#title-desk-id").html(),
							   "dish_id":data.dishId,
							   "dish_name":data.dishName,
							   "dish_type_id":data.dishTypeId,
							   "dish_count":data.dishCount+count,
							   "member_id":$("#title-member_id").val(),
							   "isset":2
					}; 
					comm.jsonRequest(request, function (ret){ 		
					    var data = JSON.parse(ret);
					    if (data.code !== 100) {  
					    	takeout.orderDishTb.ajax.reload(); 
					    	freshMemberDish();
					    	return;
					    } 		  
				    });
				}
				
			} 
			
		}
		e.stopPropagation(); 
	}
	
	function orderNopayLeave()
	{
		var realPay = $("#pay-order-payer").val();
		var shouldPay = $("#pay-order-pay").val();
		if(realPay!=shouldPay && realPay < shouldPay * 0.8){
			alert("实付金额不能小于应付金额的80%:"+(shouldPay * 0.8));
			return;
		}
		if(realPay!=shouldPay && realPay > shouldPay ){
			alert("实付金额不能大于应付金额");
			return;
		}
		if($("#payremarks").val()=='' ||$("#payremarks").val()==null){
			alert("结账备注中,写点什么吧");
			return;
		}
		var request = {"method":"orderController.orderNopayLeave" ,'order_dish_discount':$("#pay-dish-discount").html(),'order_all_discount':$("#pay-order-discount").html(),"remarks":$("payremarks").val(),"order_should_pay":realPay,"order_num":"","order_id":((typeof(takeout.order)=="undefined"||takeout.order==null)?'':takeout.order.orderId),"order_ticket_id":$("#title-desk-id").html()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.content.code == 100) { 
		    	$(".pay-close").click();
		    	$(".nav-item[type=takeout]").click();
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    }); 
	}
	function orderCheckPay()
	{
		var realPay = $("#pay-order-payer").val();
		var shouldPay = $("#pay-order-pay").val();
		if(realPay!=shouldPay && realPay < shouldPay * 0.8){
			alert("实付金额不能小于应付金额的80%:"+(shouldPay * 0.8));
			return;
		}
		if(realPay!=shouldPay && realPay > shouldPay ){
			alert("实付金额不能大于应付金额");
			return;
		}
		var request = {"method":"orderController.orderCheckpay" ,'order_pay':realPay,'pay_type':$("#pay_type").val(),'order_dish_discount':$("#pay-dish-discount").html(),'order_dish_discount':$("#pay-dish-discount").html(),'order_all_discount':$("#pay-order-discount").html(),"remarks":$("payremarks").text(),"order_should_pay":$("#pay-order-pay").val(),"order_num":"","order_id":((typeof(takeout.order)=="undefined"||takeout.order==null)?'':takeout.order.orderId),"order_ticket_id":$("#title-desk-id").html()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.content.code == 100) { 
		    	var dishes = takeout.orderPayTb.data();
		    	doPrint(dishes,takeout.order.orderNum,{'realPay':realPay,'dishDiscount':$("#pay-dish-discount").html(),'orderAllDiscount':$("#pay-order-discount").html(),"orderShouldPay":$("#pay-order-pay").val()});
		    	$(".pay-close").click();
		    	$(".nav-item[type=takeout]").click();
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });
	}
	function cancelOrder()
	{
		var index = $(this).parent().attr("index");
		var dineId = takeout.data[index]['currentDineId'];
		var request = {"method":"orderController.cancleOrder" ,"order_ticket_id":dineId};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.content.code == 100) { 
		    	freshDesk();
		    	return false;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });
		return false;
	}
	
	function doPrint(dishes,orderNum,payRet)
	{
		$(".report-list .remove").remove();
		var str='';var len =0,total=0;
		var units = {11:'只',10:'串',9:'千克',8:'克',7:'打',6:'盘',5:'瓶',4:'个',3:'根',2:'份',1:'斤'} 
		for(var i =0;i <dishes.length; i++){
			var dish = dishes[i]; 
			if(payRet){
				if(dish.iforder!=1)continue;
			}else{
				if(dish.iforder==1)continue;
			}
			
			str += "<div class='report-dish-tr remove'>"+
					      "<span style='text-align:left;margin-left:4px;display:block;font-size:14px;font-weight:800'>"+dish.dishName+"</span>";
			if(dish.isset==1 && dish.parentDetailId==0 && dish.dishStatus==3){
				 str+= "<span style='margin-left:49%;'>--</span>";	   
			 }else{
				 str+= "<span style='margin-left:38%;'>"+(dish.dishCount-dish.dishStorage)+(typeof(dish.dishUnit)=='undefined'?'份':units[dish.dishUnit])+(dish.dishStorage>0?"/存"+dish.dishStorage:'')+"</span>";	   
					
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
		str += "<div class='report-dish-tr remove' style='border-top:dotted 2px #999;padding-top:4px;margin-top:6px'>"+
	      "<span style='text-align:left;font-size:14px;margin-left:6px;font-weight:800'>消费总计：</span>"+
	      "<span style='font-size:14px;font-weight:800'>￥"+(total).toFixed(2)+"</span>";
		  if(payRet){
			  str +="<div><span style='text-align:left;font-size:14px;margin-left:6px;font-weight:800'>菜品折扣：</span>"+
		      "<span style='font-size:14px;font-weight:600'>￥"+(parseFloat(payRet.dishDiscount)).toFixed(2)+"</span></div>";
			  str +="<div><span style='text-align:left;font-size:14px;margin-left:6px;font-weight:800'>整单折扣：</span>"+
		      "<span style='font-size:14px;font-weight:600'>￥"+(parseFloat(payRet.orderAllDiscount)).toFixed(2)+"</span></div>";
			  str +="<div><span style='text-align:left;font-size:14px;margin-left:6px;font-weight:800'>找零应付：</span>"+
		      "<span style='font-size:14px;font-weight:600'>￥"+(parseFloat(payRet.orderShouldPay)).toFixed(2)+"</span></div>";
			  str +="<div><span style='text-align:left;font-size:14px;margin-left:6px;font-weight:800'>实付金额：</span>"+
		      "<span style='font-size:14px;font-weight:600'>￥"+(parseFloat(payRet.realPay)).toFixed(2)+"</span></div>";
		  }
        str+= "</div>";
   
        var check = $(".user-print-btn .takeout-cls").is(':checked');
        $(".report-name").html("<蚝功夫枫亭旗舰店>外卖单"); 
		$(".deskCount").html($("#title-customer-count").html())
		$(".orderNum").html(orderNum);
		$(".address").html(takeout.order.orderAddress);
		$(".phoneinfo").html($("#title_phone").val());
		$(".deskTime").html(new Date().format('yyyy-MM-dd hh:mm:ss'))
		$(".print-time").html(new Date().format('yyyy-MM-dd hh:mm:ss'))
		$(".report-list").append(str);
		var height = 0.9 * len;
		demoPrint({html:$("#dishPrinter").html(),prview:false,printName:'MyPrinter','height':600+(payRet?190:0)+height*100})
	}
	function payMenuItemClick(itemElem)
	{
		var orderSpend = parseFloat($("#pay-total-spend").html());
		var orderDiscount = parseFloat($("#pay-total-spend").html())* itemElem.attr("type");
		var orderDishDiscount = parseFloat($("#pay-dish-discount").html());
		$("#pay-order-discount").html(orderDiscount.toFixed(2))
		$("#pay-dish-zero").html((orderSpend-orderDiscount-orderDishDiscount -Math.floor(orderSpend-orderDiscount-orderDishDiscount)).toFixed(2))
		$("#pay-order-result").html(Math.floor(orderSpend-orderDiscount-orderDishDiscount));
		$("#pay-order-pay").val(Math.floor(orderSpend-orderDiscount-orderDishDiscount));
		$("#pay-order-payer").val(Math.floor(orderSpend-orderDiscount-orderDishDiscount)); 
	}
})