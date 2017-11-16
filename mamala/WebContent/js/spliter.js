define(function(require, takeout, module){ 
	var comm = require('../js/modules/common/common.js');
	var utils = require('../js/modules/common/util.js');

	function init() { 
		adjustInitConfig()
		initEvent();
		freshDishType();
		freshOrderTable();
	}
	takeout.init = init;
	
	function adjustInitConfig()
	{
		$('.user-recipes-box1').css("width",($(".content").width()-164)+"px"); 
//		$("#desk-order-dish-div").css("width",($(".content").width()-$(".consumed").width()-6)+"px");
//		$("#order-dish-div").css("height",($(".content").height()-150)+"px");
//		$("#desk-order-dish-div").css("height",$(".desk-list").height()-143+"px");
//		$(".sui-dropdown-menu").css("margin-left",$(".content").width() * 0.3 ); 
//		$(".width-change").css("margin-left",$(".content").width() * 0.3 -3); 
//		$(".msg-error").css("margin-left","305px"); 
//		desktop.orderDishTb = null;
//		desktop.tmpOrderData = {};
//		desktop.memberDishes ={};
		
		var request = {"method":"dineController.getOrderNum" };
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.content.code == 100) { 
		    	 $("#takeout-order-num").html(data.content.data)
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });
	}
	function initEvent() { 
//		var bHeight=$(".recipes-classify-content-left-box").height(); 
//		$(".recipes-classify-content-left").css("height",(bHeight *50 /100 -42)+"px"); 
		initAutocomplete("memberController.qryMemberList","phone","memberId","#phone","#member_id",0);
		initAutocomplete("memberController.qryMemberList","phone","memberId","#phone","#member_id",0);
		$("#takeout-custom-form").validate(); 
//		$(".shop-recipes-box1").click(function(){
//		    $(this).css("z-index",2);
//		    $(".user-recipes-box1").css("z-index",1); 
//		    $(".recipes-title span").removeClass("fl");
//		    $(".recipes-title").css("padding-top","0px"); 
//		    $(".dataTables_empty").css("text-align","left")
//		    //$(".width-change").css("margin-left",$(".content").width() * 0.3 -3); 
//		});
	}
	 
	function freshOrderTable()
	{
		if(takeout.orderDishTb!=null){//初始化方式来 
		    takeout.orderDishTb.ajax.reload();
		}else{			
			takeout.orderDishTb = $('#order-dish-tb').DataTable({
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
			        	"url": comm.jsonServer()+"/orderController/qryOrderList",    
				        "contentType": "application/json",
				        "type": "POST",
				        "data": function ( d ) { 
				          d.order_ticket_id=$("#title-desk-id").html();
				          return JSON.stringify( d );
				        } ,
				        "dataSrc": function ( json ) {  
				        	if(json.data && json.data[0]){
				        		var dataDishes = json.data[0].orderDishes;
				        		var currentDishDetailId = 0
				        		var commonStatus={1:"即起",2:"退菜"}
					        	for ( var i=0; i<dataDishes.length ; i++ ) {   
					        		if(json.data[0].orderDishes[i]["isset"]==1 && json.data[0].orderDishes[i]["parentDishId"]==0){
					        			json.data[0].orderDishes[i]["expand"] = "<a class='dish-expand expand'>▼</a>"; 
					        			currentDishDetailId = json.data[0].orderDishes[i]["orderDishDetailId"];
					        		} else if(json.data[0].orderDishes[i]["isset"]==2){
					        			json.data[0].orderDishes[i]["expand"] = "";
					        			currentDishDetailId =0;
					        		}else{
					        			json.data[0].orderDishes[i]["expand"] = "";
					        		}
					        		var iforder = json.data[0].orderDishes[i]["iforder"];
					        		var isset = json.data[0].orderDishes[i]["isset"];
					        		var dishTypeId = json.data[0].orderDishes[i]["dishTypeId"];
					        		var updetailId = (currentDishDetailId ==0)? json.data[0].orderDishes[i]["orderDishDetailId"]:currentDishDetailId;
					        		var dishId = "";
					        		if((json.data[0].orderDishes[i]["parentDishId"] > 0)){
					        			dishId = json.data[0].orderDishes[i]["dishId"]+"i";
					        			var tmpKey = iforder + "-"+isset + '-'+dishTypeId+"-"+updetailId+"-"+dishId;
					        			takeout.tmpOrderData[tmpKey] = true;  
					        		} 
					        		console.log('=###========:',iforder + "-"+isset + '-'+dishTypeId+"-"+updetailId+"-"+dishId);
					        		json.data[0].orderDishes[i]["index"] = iforder + "-"+isset + '-'+dishTypeId+"-"+updetailId+"-"+dishId;
					        		var status = commonStatus[json.data[0].orderDishes[i]["dishStatus"]];
					        		if(json.data[0].orderDishes[i]["parentDishId"] >0 && json.data[0].orderDishes[i]["dishStorage"] > 0 && json.data[0].orderDishes[i]["dishStatus"] !=2){
					        			status="寄"+json.data[0].orderDishes[i]["dishStorage"];
					        			if(json.data[0].orderDishes[i]["dishStorage"] == json.data[0].orderDishes[i]["dishCount"]){
					        				status="寄存"
					        			}
					        		}
					        		
					        		json.data[0].orderDishes[i]["tmpDishStatus"]= "<a>"+status+"</a>";
					        		json.data[0].orderDishes[i]["tmpOrderTime"] = (typeof(json.data[0].orderDishes[i]["orderTime"])=="undefined" )?new Date().format("yyyy-MM-dd hh:mm:ss"):json.data[0].orderDishes[i]["orderTime"];
					        		json.data[0].orderDishes[i]["dishTotalPrice"]= json.data[0].orderDishes[i]["dishCount"] * json.data[0].orderDishes[i]["dishUnitPrice"];
					        		json.data[0].orderDishes[i]["tmpIforder"]= "<input disabled=true "+(json.data[0].orderDishes[i]["iforder"]==1?"checked":"")+" type='checkbox'/>";
					              }
					        	takeout.order = json.data[0];
					        	$(".order-dish-spend").html(takeout.order.orderSpend+"￥");
					        	$(".order-dish-discount").html(takeout.order.orderDiscount+"￥");
					        	$(".order-dish-give").html(takeout.order.orderGive+"￥");
					        	$(".order-dish-pay").html((takeout.order.orderSpend-takeout.order.orderDiscount-takeout.order.orderGive)+"￥");
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
			        	
			        	$("#order-dish-tb").find("tbody tr").each(function(){  
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
	                  { "data": "dishName" },
	                  { "data": "tmpDishStatus"},
	                  { "data": "dishCount" },
	                  { "data": "tmpIforder" },
	                  { "data": "dishUnitPrice" },
	                  { "data": "dishTotalPrice" },
	                  { "data": "tmpOrderTime" }                  
	              ] 
			 });
			
			
		}
		//$(".shop-recipes-box1").dblclick(); 
		
		$(".dataTables_empty").css("text-align","left");
	}
	function freshDishType()
	{
		var request = {"method":"dishController.qryDishTypeList" };
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
		var request = {"method":"memberController.qryMemberDishList" ,"order_id":((typeof(takeout.order)=="undefined"||takeout.order==null)?'':takeout.order.orderId),"desk_id":$("#title-desk-id").html()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code !== 100) {
		    	var dishes = data.data,dishStr ="";   
		    	var dishesUnits={3:'根',2:'份',1:"斤"};
		    	for(var i in dishes){ 
		    		if(dishes[i] && dishes[i].dishCount<=0) continue;
		    		dishStr +="<div class='item fl' index="+i+"><div style='display: inline-block;'>["+dishes[i]['relaDishTypeName']+"  --</div><div style='display: inline-block;'>"+dishes[i]["dishName"]+"]</div><div style='color: #888;display: inline-table;margin: 0 20px;'>剩余："+dishes[i]['dishCount']+dishesUnits[dishes[i]["dishUnit"]]+"</div><div style='color: #888;position: relative;clear: both;display: inline-block;margin-top: 4px;'>单价："+dishes[i]["dishPrice"]+"￥</div></div>";
		        }
		    	takeout.memberDishesData = dishes;
		    	$('.recipes-classify-content-left-set').empty();
	    		$('.recipes-classify-content-left-set').append(dishStr); 
	    		$(".recipes-classify-content-left-set .item").click(move2Order);  
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
		var request = {"method":"dishController.qryDishList","dish_type_id":dishTypeId};
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
		var request = {"method":"dishController.qryDishTypeList","dish_type_set":2 ,"status":2};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code !== 100) { 
		    	var dishes = data.data,dishStr ="";  
		    	for(var i in dishes){
		    		if(takeout.order && takeout.order.memberId<=0){//必须在后台执行 
						 continue;
					}
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
	function fillOrderDishes()
	{ 
		if(takeout.orderDishTb.data().length >100)
		{
			alert("不要太浪费哦！");
			return;
		}
		var type= $(this).attr("type");
		var index = $(this).attr("index");  
		var orderDishDetailId = "";
		var dishCount = 1;
		if(type == "set"){  
			var dishTypeId = takeout.dishesSetData[index].dishTypeId;
			var dishTypeName = takeout.dishesSetData[index].dishTypeName;
			var dishPrice = takeout.dishesSetData[index].dishUnitPrice;  
			$("#order-dish-tb tr").each(function(){
				  var tmpDishData = takeout.orderDishTb.row($(this)).data();
				  tmpKey = 2 + "-"+1 + '-'+dishTypeId+"-";
				  if( typeof(tmpDishData)!="undefined" && tmpDishData.index.indexOf(tmpKey)>= 0 && tmpDishData.iforder==2 && tmpDishData.parentDishId==0) {  
					  orderDishDetailId = tmpDishData.orderDishDetailId;
					  dishCount = tmpDishData.dishCount+1; 
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
					   "isset":1
			};
			
		}else{
			var dishId = takeout.dishesData[index].dishId;
			var dishTypeId = takeout.dishesData[index].dishId;
			var dishName = takeout.dishesData[index].dishName;
			var dishPrice = takeout.dishesData[index].dishPrice;    
			$("#order-dish-tb tr").each(function(){
				  var tmpDishData = takeout.orderDishTb.row($(this)).data();
				  tmpKey = 2 + "-"+2 + '-'+dishId+"-";
				  if(typeof(tmpDishData)!="undefined"  && tmpDishData.index.indexOf(tmpKey)>= 0 && tmpDishData.iforder==2 && tmpDishData.isset == 2) {  
					  orderDishDetailId = tmpDishData.orderDishDetailId;
					  dishCount = tmpDishData.dishCount+1; 
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
					   "isset":2
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
			$(".sui-dropdown-menu").hide(); 
			
			if($(this).hasClass("expand")){
				$(this).html("▼"); 
				$("#order-dish-tb").find("tbody tr").each(function(){  
						var tmpData = takeout.orderDishTb.row($(this)).data();   
					    var iforder = tmpData.iforder;
					    var isset = tmpData.isset;
					    var dishTypeId = tmpTypeData.dishTypeId;
					    var updetailId = tmpTypeData.orderDishDetailId;
					    var dishId = tmpData.dishId;
			    	    var tmpKey = iforder + "-"+isset + '-'+dishTypeId+"-"+updetailId+"-"+dishId+"i"; 
   					    if(tmpData.index==tmpKey) {
   						   $(this).show();
   					    }
   				  });
			}else{
				$(this).html("▲");
				$("#order-dish-tb").find("tbody tr").each(function(){   
						var tmpData = takeout.orderDishTb.row($(this)).data();   
					    var iforder = tmpData.iforder;
					    var isset = tmpData.isset;
					    var dishTypeId = tmpTypeData.dishTypeId;
					    var updetailId = tmpTypeData.orderDishDetailId;
					    var dishId = tmpData.dishId;
			    	    var tmpKey = iforder + "-"+isset + '-'+dishTypeId+"-"+updetailId+"-"+dishId+"i"; 
			    	    console.log("========CC=========",tmpKey)
						if(tmpData.index==tmpKey) {
							  $(this).hide(); 
						}
				  });
			}
			
			e.stopPropagation(); 
		});
		
		$("#order-dish-tb tr").unbind('click');
		$("#order-dish-tb tr").click(function(e){ 
			
			if(e.pageY+$(".sui-dropdown-menu").height()>$(document).height()){
				$(".sui-dropdown-menu").css("top",e.pageY-(e.pageY+$(".sui-dropdown-menu").height()-$(document).height())-10);
			}else{
				$(".sui-dropdown-menu").css("top",e.pageY);
			} 
			$(".sui-dropdown-menu").show(); 
			var tmpData = takeout.orderDishTb.row($(this)).data();
			$("#order-dish-tb tr").each(function(){
				$(this).attr("currentTr","false");
			})
			$(this).attr("currentTr", "true");
			var checked = $(this).find("input").is(':checked'); 
			if(tmpData){
				if(checked){//已选择的只提供item:[整桌转台,顾客退菜]功能
					if(tmpData.isset==1 && tmpData.parentDishId>0){//表示未套餐中的菜品
                    	$(".sui-dropdown-menu li").removeClass("disabled");
                    	$(".sui-dropdown-menu li").addClass("disabled");
					    $(".sui-dropdown-menu li[cat=3]").removeClass("disabled")
					    if(tmpData.parentDishId<=0){
					    	$(".sui-dropdown-menu li[cat=2]").removeClass("disabled")
					    }
					    $(".sui-dropdown-menu li[cat=21]").removeClass("disabled")
					}else{ 
						$(".sui-dropdown-menu li").removeClass("disabled");
						$(".sui-dropdown-menu li").addClass("disabled");
					    $(".sui-dropdown-menu li[cat=2]").removeClass("disabled");
					    $(".sui-dropdown-menu li[cat=21]").removeClass("disabled")
					}
				}else{//未选择的需要判断是套餐、赠送还是单点
                    if(tmpData.isset==1 && tmpData.parentDishId>0){//表示未套餐中的菜品
                    	$(".sui-dropdown-menu li").removeClass("disabled");
                    	$(".sui-dropdown-menu li").addClass("disabled");
					    $(".sui-dropdown-menu li[cat=3]").removeClass("disabled")
					    $(".sui-dropdown-menu li[cat=21]").removeClass("disabled")
					}else{
						$(".sui-dropdown-menu li").removeClass("disabled");
						$(".sui-dropdown-menu li").addClass("disabled");
					    $(".sui-dropdown-menu li[cat=1]").removeClass("disabled");
					    $(".sui-dropdown-menu li[cat=21]").removeClass("disabled")
					}
				}
			} 
			
			e.stopPropagation(); 
		})
	}
	
	function menuItemClick(itemElem)
	{
		if(itemElem.attr("type")=='memberDishMove'){
			var tr = $("#order-dish-tb tbody tr[currentTr=true]");
			var dishes = takeout.orderDishTb.row(tr).data();
			var request = {"method":"orderController.move2Storage","detail_id":dishes.orderDishDetailId};
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.code !== 100) { 
			    	freshMemberDish();  
			    	takeout.orderDishTb.ajax.reload();
//			    	takeout.orderDishTb.row(tr).remove().draw();
//			    	var moveAll = true;
//			    	$("#order-dish-tb tr").each(function(){
//						  var tmpDishData = takeout.orderDishTb.row($(this)).data();
//						  tmpKey = dishes.iforder + "-"+dishes.isset + '-'+dishes.dishTypeId+"-"+dishes.parentDishId;
//						  if(typeof(tmpDishData)!="undefined"  && tmpDishData.index.indexOf(tmpKey)>= 0 && tmpDishData.parentDishId == dishes.parentDishId) {  
//							  if(tmpDishData.dishId != dishes.dishId){
//								  moveAll  = false;
//								  return false;
//							  }
//						  }
//					});
//			    	if(moveAll){
//			    		$("#order-dish-tb tr").each(function(){
//							  var tmpDishData = takeout.orderDishTb.row($(this)).data();
//							  tmpKey = dishes.iforder + "-"+dishes.isset + '-'+dishes.dishTypeId+"-"+dishes.parentDishId;
//							  if(typeof(tmpDishData)!="undefined"  && tmpDishData.index.indexOf(tmpKey)>= 0) {   
//									takeout.orderDishTb.row($(this)).remove().draw(); 
//							  }
//						});
//			    	}  
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    });   
		}
	}
		
    function move2Order()
    { 
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
		if(takeout.orderDishTb.data().length <1)
		{
			alert("顾客还未点菜!?");
			return false;
		}
		var hasNewOrderDish = false;
		$("#order-dish-tb tr").each(function(){
			var tmpData = takeout.orderDishTb.row($(this)).data();
			var checked = $(this).find("input").is(':checked');  
			if(!checked){
				hasNewOrderDish = true;  
			}
		}) 
		if(hasNewOrderDish == false){ 
			alert("顾客还未点菜!?");
			return false;
		}
		var request = {"method":"orderController.orderDishes",
				   "order_id":((typeof(takeout.order)=="undefined"||takeout.order==null)?'':takeout.order.orderId) 
			    };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) { 
			    	comm.message("管理信息","保持门店失败！",true);
			    	takeout.orderDishTb.ajax.reload();
			    	$(".order-back-btn").click();
			    	takeout.order = null;
			    	return;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		   });
	}
	
	function initAutocomplete(method,keyName,valName,keyElem,valElem,selfval,thirdArr)
	{
		var request = {"method":method };
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
})