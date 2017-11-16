define(function(require, desktop, module){
	var comm = require('../js/modules/common/common.js');
	var utils = require('../js/modules/common/util.js');

	function init() {
		adjustInitConfig();
		freshDesk();
		initEvent(); 
	}
	desktop.init = init;
	
	function adjustInitConfig()
	{
		$('.user-recipes-box1').css("width",($(".content").width()-164)+"px");
		$(".desk-list").css("height",($(".content").height())+"px");
		$(".consumed").width($(".content").width()-$(".desk-order-info").width());
//		$(".desk-order-info-detail").css("width",($(".content").width()-$(".consumed").width()-35)+"px");
		$("#desk-order-dish-div").css("width",($(".content").width()-$(".consumed").width()-6)+"px");
		$("#order-dish-div").css("height",($(".content").height()-150)+"px");
		$("#desk-order-dish-div").css("height",$(".desk-list").height()-143+"px");
		$(".my-drowdown-menu").css("margin-left",$(".content").width() * 0.35 ); 
		$(".width-change").css("margin-left",$(".content").width() * 0.35 -3); 
		$(".msg-error").css("margin-left","305px"); 
		desktop.orderDishTb = null;
		desktop.orderPayTb = null;
		desktop.tmpOrderData = {};
		desktop.memberDishes ={};
	}
 
	function initEvent() {
		$('#back-desktop').click(function () { 
			$('.recipes').hide();
			$('.desk-list').show(); 
			freshDesk();
		});		
		$(".view-detail-btn").click(function(){
			$(".nav-item[type=inventory]").attr("key",desktop.order.orderNum)
			$(".nav-item[type=inventory]").click();
			
		})
		$('#edit-table-panel').on('okHide', function(e){
			$(".msg-error").remove();
		       $(".edit-desk-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".edit-desk-form").find("input, select, textarea").focus();
			$(".edit-desk-form").find("input, select, textarea").blur();
			var ok = ($(".msg-error").length>0); 
			if(!ok){
				saveTableConfig();  
			} 
			return !ok;
         })
         $('#open-desk').on('okHide', function(e){
			$(".msg-error").remove();
		       $(".open-desk-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".open-desk-form").find("input, select, textarea").focus();
			$(".open-desk-form").find("input, select, textarea").blur();
			$(".dropdown-menu").hide();
			var ok = ($(".msg-error").length>0); 
			if(!ok){
				openDesk();
			} 
			return !ok;
         }) 
         $(".confirm-open-order").click(function(){
        	 $(".msg-error").remove();
		       $(".open-desk-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".open-desk-form").find("input, select, textarea").focus();
			$(".open-desk-form").find("input, select, textarea").blur();
			$(".dropdown-menu").hide();
			var ok = ($(".msg-error").length>0); 
			if(!ok){
				openAndOrderDine(); 
			}  
         }) 
		$(".confirm-order-btn").click(function(){
			confirmOrder();
		})
		$(".show-pay-btn").click(function(){
			if(desktop.orderDishTb.data().length <1)
			{
				alert("顾客还未点菜!?");
				return false;
			}
			var hasNewOrderDish = false;
			$("#order-dish-tb tr").each(function(){
				var tmpData = desktop.orderDishTb.row($(this)).data();
				var checked = $(this).find("input").is(':checked');  
				if(tmpData && tmpData.orderDishDetailId> 0 && !checked){
					hasNewOrderDish = true;  
				}
			}) 
			if(hasNewOrderDish == true){ 
				alert("还有未下单得菜!?");
				return false;
			}
			freshOrderPayTable();
		})
		
		$(".width-change").click(function(){
		    $(".user-recipes-box1").css("z-index",3);
		    $(".shop-recipes-box1").css("z-index",2);
		    $(".recipes-title span").addClass("fl");
		    $(".recipes-title").css("padding-top","10px"); 
		    $(".dataTables_empty").css("text-align","center")
		    $(this).css("margin-left",$('.user-recipes-box1').width())
		})
		$(".shop-recipes-box1").click(function(){
		    $(this).css("z-index",3);
		    $(".user-recipes-box1").css("z-index",2); 
		    $(".recipes-title span").removeClass("fl");
		    $(".recipes-title").css("padding-top","0px"); 
		    $(".dataTables_empty").css("text-align","left")
		    $(".width-change").css("margin-left",$(".content").width() * 0.35 -3); 
		});
		$(document).click(function(e){
			var t = e.target
			$(".my-drowdown-menu").hide()
			$(".all-dish-discount").hide()
		})
		$(".my-drowdown-menu li").click(function(){
			menuItemClick($(this));
		})
		$(".all-dish-discount li").click(function(){
			payMenuItemClick($(this));
		})
		
		$("#pay-order-payer").keyup(function(){
		    $("#payback").html($("#pay-order-payer").val()-$("#pay-order-pay").val());
		})
		$(".edit-desk-form").validate();
		$(".open-desk-form").validate();
		$(".desk").click(function() { 
		       $(".msg-error").remove();
		       $("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		       }) 
		  }); 
		
		$(".pay-nopay-leave").click(function(){
			orderNopayLeave();
		})
		$(".pay-check-pay").click(function(){
			orderCheckPay();
		}) 
		$("#title-member_id").change(function(){
			if(ValidateRules.isMobile($("#title-order-phone").val()) && $("#title-member_id").val()!='' && $("#title-member_id").val()!=null ){
				var request = {"method":"orderController.editOrder", 
						   "order_id":((typeof(desktop.order)=="undefined"||desktop.order==null)?'':desktop.order.orderId), 
						   "phone":$("#title-order-phone").val(),
						   "member_id":$("#title-member_id").val() 
				}; 
				comm.jsonRequest(request, function (ret){ 		
				    var data = JSON.parse(ret);
				    if (data.content.code == 100) {   
				    	if(desktop.orderDishTb){desktop.orderDishTb.clear()} 
				    	$("#title-order-canbeset").html("可寄存菜品");
						$("#title-order-phone").attr("disabled","true");
						$('.recipes-classify-content-left-set').parent().show();
						var bHeight=$(".recipes-classify-content-left-box").height(); 
						$('.recipes-classify-content-left').parent().css("height",'67%');
						$(".recipes-classify-content-left").css("height",(bHeight *67 /100 -42)+"px");
						$(".recipes-classify-content-left-set").css("height",(bHeight *33 /100 -42)+"px");
						
						$(".my-drowdown-menu li[type=memberDishMove]").show();
						freshOrderTable();
						freshDishType(); 
				    	return;
				    } 		  
			    });
			}
		}) 
		initAutocomplete({method:"memberController.qryMemberList",check:true,"store_id":$("#store-select").val()},"phone","memberId","#title-order-phone","#title-member_id",0)  
	}
	
	///////////////////Start Desk Page/////////////function freshDesk()
	function freshDesk(){
		var request = {"method":"dineController.qryDineTableList",'store_id':$("#store-select").val()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code !== 100) { 
		    	var desk = data.data,deskStr  ="";
		    	var tmpStatus ={3:"锁定",2:"就餐",1:"空闲"}; 
		    	$(".desk-remove").remove();
		    	for(var i in desk){
					if (desk[i]['tableStatus']==1) {
						deskStr += "<div data-toggle='modal' index='"+i+"' data-target='#open-desk' data-keyboard='false'  class='desk fl desk-color desk-remove'>"
					}  else {
						 deskStr += "<div index='"+i+"' class='desk fl  desk-remove' type='full' style='background:#43ad64;color:#fff' >"
						 deskStr += "<div index='"+i+"' class='order-cancel' style='float: right;margin-top: 3px;color: #fff;font-weight:600;font-size:15px'>退单</div>";
					}
					
					     deskStr +=	"<div class='desk-name'>"+desk[i]['tableName']+"</div>" +
						           "<div class='desk-status'>"+tmpStatus[desk[i]['tableStatus']]+"</div>" +
						           "<div class='desk-consumed'"+(desk[i]['tableStatus']==1?'':" style='color:#fff'")+">"+(desk[i]['tableStatus']==1 ? ("可供"+desk[i]["tableSeats"]+"人"):(desk[i]["currentCost"]==0?"待点菜":"消费："+desk[i]["currentCost"]+"￥"))+"</div>";
		            if (desk[i]['tableStatus']==1) {
						deskStr += "<div class='desk-clear'></div>"
					}  else if (desk[i]['tableStatus']!=1) {
						deskStr += "<div class='desk-find' style='color:#fff' ></div>"
					}  
		            deskStr +="</div>";
				}
		    	desktop.data = desk;
				$(".consumed").append(deskStr);
				$('.desk').click(showDeskConsumed);
				$(".desk-clear").click(deleteDesk);
				$(".desk-find").click(findDeskDetail);
				$(".order-cancel").click(cancelOrder);
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });
			
		var desk ={}; 
	}
	

	function openDesk()
	{
		//"dine_desk_id","dine_desk_name","customer_count","remarks","dine_start_time","dine_end_time","card_number","phone"
		var request = {"method":"dineController.addDine",
				   "dine_desk_id":$("#dine_desk_id").val(),
				   "dine_desk_name":$("#dine_desk_name").val(),
				   "dine_desk_alias":$("#dine_desk_alias").val(),
				   "customer_count":$("#customer_count").val(), 
				   "card_number":$("#card_number").val(),
				   "member_id":$("#member_id").val(),
				   "phone":$("#phone").val(),
				   "dine_start_time":$("#dine_start_time").val(),				  
				   "dine_end_time":$("#dine_start_time").val(), 
				   "remarks":$("#remarks").val() ,
				   "store_id":$("#store-select").val()
			    };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) { 
			    	comm.message("管理信息","保持门店失败！",true);	
			    	freshDesk(); 
			    	return ret.data;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		   });
	}
	function openAndOrderDine()
	{ 
		if(desktop.orderDishTb){desktop.orderDishTb.clear()}
		//"dine_desk_id","dine_desk_name","customer_count","remarks","dine_start_time","dine_end_time","card_number","phone"
		var request = {"method":"dineController.addDine",
				   "dine_desk_id":$("#dine_desk_id").val(),
				   "dine_desk_name":$("#dine_desk_name").val(),
				   "dine_desk_alias":$("#dine_desk_alias").val(),
				   "customer_count":$("#customer_count").val(), 
				   "card_number":$("#card_number").val(),
				   "member_id":$("#member_id").val(),
				   "phone":$("#phone").val(),
				   "dine_start_time":$("#dine_start_time").val(),				  
				   "dine_end_time":$("#dine_start_time").val(), 
				   "remarks":$("#remarks").val() ,
				   "store_id":$("#store-select").val()
			    };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.content.code == 100) { 
			    	comm.message("管理信息","保持门店失败！",true);	 
					$('.recipes').show(); 
					$('.desk-list').hide();
					var bHeight=$(".recipes-classify-content-left-box").height(); 
					$(".recipes-classify-content-left").css("height",(bHeight *67 /100 -42)+"px");  
					$(".recipes-classify-content-left-set").css("height",(bHeight *33 /100 -42)+"px");
					$("#title-desk-id").html(data.content.data);
					$("#title-desk-name").html($("#dine_desk_name").val());
					$("#title-customer-count").html($("#customer_count").val());
					$("#title-desk-seats").html($("#table_seats").val());
					$("#title-order-phone").val($("#phone").val());
					$("#title-order-phone").attr("old",$("#phone").val());
					if($("#member_id").val()!="" && $("#member_id").val()!=null){
						$("#title-order-canbeset").html("可寄存菜品");
						$("#title-member_id").val($("#member_id").val())
						$("#title-order-phone").attr("disabled","true");
					}else{
						$("#title-order-canbeset").html("非会员");
						$("#title-order-phone").removeAttr("disabled");
						$('.recipes-classify-content-left-set').parent().hide();
						$('.recipes-classify-content-left').parent().css("height",'100%');
						$(".recipes-classify-content-left").css("height",(bHeight  -42)+"px");
						$(".my-drowdown-menu li[type=memberDishMove]").hide();
					}
					initAutocomplete({method:"memberController.qryMemberList",check:true,"store_id":$("#store-select").val()},"phone","memberId","#title-order-phone","#title-member_id",0)
					$(".close-open-btn").click();
					freshOrderTable();
					freshDishType(); 	  
					$(".user-print-btn .takeout-cls").removeAttr("checked");
			    	return ret.data;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		   });
			 
	}
	function saveTableConfig()
	{
		  var request = {"method":"dineController.editDineTable",
				   "table_id":$("#table_id").val(),
				   "table_name":$("#table_name").val(),
				   "table_alias":$("#table_alias").val(),
				   "table_seats":$("#table_seats").val(),
				   "table_status":null,
				   "current_cost":null,
				   "current_dine_id":null,
				   "store_id":$("#store-select").val()
			    };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) { 
			    	comm.message("管理信息","保持门店失败！",true);	
			    	freshDesk();
			    	return;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		   });
	}
 	
	function showDeskConsumed() {
		var index = $(this).attr("index");
		if($(this).attr("type")=='full'){ 
			initAutocomplete({method:"memberController.qryMemberList",check:true,"store_id":$("#store-select").val()},"phone","memberId","#title-order-phone","#title-member_id",0)
			$('.recipes').show(); 
			$('.desk-list').hide();
			var desk = desktop.data[index]; 
			desktop.tmpOrderData = {};
			desktop.memberDishes ={};
			$("#title-desk-id").html(desk.currentDineId);
			$("#title-desk-name").html(desk.tableName);
			$("#title-customer-count").html(desk.currentCustomerCount);
			$("#title-desk-seats").html(desk.tableSeats);
			$("#title-order-phone").val(desk.phone); 
			$("#title-member_id").val(desk.memberId)
			$("#title-order-phone").attr("old",desk.phone);
			var bHeight=$(".recipes-classify-content-left-box").height();
			if(desk.memberId>0){
				$("#title-order-canbeset").html("可寄存菜品"); 
				$("#title-order-phone").attr("disabled","true");
				$('.recipes-classify-content-left-set').parent().show();
				$('.recipes-classify-content-left').parent().css("height",'67%');
				$(".recipes-classify-content-left").css("height",(bHeight *67 /100 -42)+"px"); 
				$(".recipes-classify-content-left-set").css("height",(bHeight *33 /100 -42)+"px");
				$(".my-drowdown-menu li[type=memberDishMove]").show();
			}else{
				$("#title-order-canbeset").html("非会员");
				$("#title-order-phone").removeAttr("disabled");
				$('.recipes-classify-content-left-set').parent().hide();
				$('.recipes-classify-content-left').parent().css("height",'100%');
				$(".recipes-classify-content-left").css("height",(bHeight  -42)+"px");
				$(".my-drowdown-menu li[type=memberDishMove]").hide();
			}  
			
			if(desktop.orderDishTb){desktop.orderDishTb.clear()}
			freshOrderTable();
			freshDishType(); 
			$(".user-print-btn .takeout-cls").removeAttr("checked");
		} else{
			$(".open-desk-form")[0].reset();
			var desk = desktop.data[index];
			initAutocomplete({method:"memberController.qryMemberList",check:true,"store_id":$("#store-select").val()},"phone","memberId","#phone","#member_id",0,["cardNumber","#card_number"]) 
			//$("customer_count").attr("data-rules","digits|lt=10");
			$(".msg-error").remove();
		       $("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error");
		    	   $("#dine_start_time").val("");
		       })
		    $("#dine_desk_id").val(desk.tableId);
		    $("#dine_desk_name").val(desk.tableName);
		    $("#table_seats").val(desk.tableSeats);
		    $("#modify_time").val(desk.modifyTime);
		    $("#customer_count").data("rules","digits|lt="+(desk.tableSeats+1)) ; 
		}
	} 
	function deleteDesk()
	{
		var index = $(this).parent().attr("index");
		var tableId = desktop.data[index]['tableId'];
		var request = {"method":"dineController.deleteDineTable",
				   "table_id":tableId
			    };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) { 
			    	comm.message("管理信息","保持门店失败！",true);	
			    	freshDesk();
			    	return false;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		   });
			return false;
	}
	
	function findDeskDetail()
	{
		var index = $(this).parent().attr("index"); 
		var desk = desktop.data[index];
		$("#desk-order-dish-tb tbody").empty();
		$("#desk-name").html(desk.tableName);
		$("#desk-customer-count").html(desk.currentCustomerCount);
		$("#desk-start-time").html(desk.modifyTime);
		 
		var request = {"method":"orderController.qryOrderList","order_ticket_id":desk.currentDineId};
		
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code !== 100) { 
		    	var order = data.data[0];
		    	var dataDishes = order.orderDishes,dishStr ="",dishList=[];    
		    	$("#desk-spend").html(order.orderSpend);
				if(dataDishes && dataDishes.length<1){
					$("#desk-remarks").html("未点菜");
				} else{
					$("#desk-remarks").html("就餐中");
				}
		    	for(var i in dataDishes){
		    		  dataDish = dataDishes[i];
		    		  if(dataDish.isset==1 && dataDish.parentDetailId ==0 ){continue;}
		    		  if(dataDish.dishCount-dataDish.dishStorage==0) continue;
		    		  $("#desk-order-dish-tb tbody").append("<tr><td>"+dataDish.dishName+"</td><td>"+(dataDish.dishCount-dataDish.dishStorage)+"</td><td>"+(((dataDish.dishCount-dataDish.dishStorage))* dataDish.dishUnitPrice).toFixed(2)+"</td></tr>");
				}   
		    	 comm.message("管理信息","保持门店成功！",true);	
		    	return true; 
		    } 
	    });  
		$("#desk-spend").html(0);
		$("#desk-remarks").html("未点菜"); 
		return false;
	}
	
	
	///////////////Start order page///////////////////
	function freshOrderTable()
	{
		if(desktop.orderDishTb!=null){//初始化方式来 
		    desktop.orderDishTb.ajax.reload();
		}else{			
			desktop.orderDishTb = $('#order-dish-tb').DataTable({
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
						        					json.data[0].orderDishes[i]["tmpDishCount"] = (json.data[0].orderDishes[i]["dishCount"]-json.data[0].orderDishes[i]["dishStorage"])+" <a class='dish-add dish-operate' style='font-size: 22px;'>-</a><a class='dish-minus dish-operate'>+</a>";
							        			}else{
						        					json.data[0].orderDishes[i]["tmpDishCount"] = json.data[0].orderDishes[i]["dishCount"];
						        				}
						        			}else if(json.data[0].orderDishes[i]["ifgive"] ==4){
						        				if(json.data[0]["memberId"] !=0){
						        					json.data[0].orderDishes[i]["tmpDishCount"] =  (json.data[0].orderDishes[i]["dishCount"]-json.data[0].orderDishes[i]["dishStorage"])+" <a class='dish-add dish-operate'>+</a>";
						        				}else{
						        					json.data[0].orderDishes[i]["tmpDishCount"] = json.data[0].orderDishes[i]["dishCount"];
						        				}
						        			}else{
						        				json.data[0].orderDishes[i]["tmpDishCount"] =  json.data[0].orderDishes[i]["dishCount"]+" <a class='dish-minus dish-operate' style='font-size: 22px;'>-</a><a class='dish-add dish-operate'>+</a>";
						        			}
					        			}
					        			
					        	    }
					        		var iforder = json.data[0].orderDishes[i]["iforder"];
					        		var isset = json.data[0].orderDishes[i]["isset"];
					        		var dishTypeId = json.data[0].orderDishes[i]["dishTypeId"];
					        		var updetailId = (currentDishDetailId ==0)? json.data[0].orderDishes[i]["orderDishDetailId"]:currentDishDetailId;
					        		var dishId =(json.data[0].orderDishes[i]["isset"]==2)?json.data[0].orderDishes[i]["dishId"]:"";
					        		if((json.data[0].orderDishes[i]["parentDetailId"] > 0)){
					        			dishId = json.data[0].orderDishes[i]["dishId"]+"i";
					        			var tmpKey = iforder + "-"+isset + '-'+dishTypeId+"-"+updetailId+"-"+dishId;
					        			desktop.tmpOrderData[tmpKey] = true;  
					        		} 
					        		console.log('=###========:',iforder + "-"+isset + '-'+(1000000+(json.data[0].orderDishes[i]["isset"]==2?dishId:dishTypeId))+"-"+(1000000000000+updetailId)+"-"+dishId);
					        		json.data[0].orderDishes[i]["index"] = iforder + "-"+isset + '-'+(1000000+(json.data[0].orderDishes[i]["isset"]==2?dishId:dishTypeId))+"-"+(1000000000000+updetailId)+"-"+dishId;
					        		var status = commonStatus[json.data[0].orderDishes[i]["dishStatus"]];
					        		if(json.data[0].orderDishes[i]["parentDetailId"] >0 && json.data[0].orderDishes[i]["dishStorage"] > 0 && json.data[0].orderDishes[i]["dishStatus"] !=2 && json.data[0].orderDishes[i]["dishStatus"] !=3){
					        			status="存"+json.data[0].orderDishes[i]["dishStorage"]; 
					        		}
					        		json.data[0].orderDishes[i]["tmpDishName"] = json.data[0].orderDishes[i]["dishName"];
					        		if(json.data[0].orderDishes[i]["ifgive"]==4){
					        			json.data[0].orderDishes[i]["tmpDishName"] = "赠送--"+ json.data[0].orderDishes[i]["dishName"];
					        		}
					        		json.data[0].orderDishes[i]["tmpDishStatus"]= "<a>"+status+"</a>";
					        		json.data[0].orderDishes[i]["tmpDishNeed"] = (typeof(json.data[0].orderDishes[i]["dishNeed"])=="undefined" )?"":json.data[0].orderDishes[i]["dishNeed"];
					        		
					        		json.data[0].orderDishes[i]["tmpOrderTime"] = (typeof(json.data[0].orderDishes[i]["orderTime"])=="undefined" )?new Date().format("yyyy-MM-dd hh:mm:ss"):json.data[0].orderDishes[i]["orderTime"];
					        		json.data[0].orderDishes[i]["tmpIforder"]= "<input disabled=true "+(json.data[0].orderDishes[i]["iforder"]==1?"checked":"")+" type='checkbox'/>";
					              }
					        	desktop.order = json.data[0];
					        	$(".order-dish-spend").html(desktop.order.orderSpend+"￥");
					        	$(".order-dish-discount").html(desktop.order.orderDiscount+"￥");
					        	$(".order-dish-give").html(desktop.order.orderGive+"￥");
					        	$(".order-dish-pay").html((desktop.order.orderSpend-desktop.order.orderDiscount-desktop.order.orderGive)+"￥");
					            return json.data[0].orderDishes;
				        	}else{
				        		$(".order-dish-spend").html("0￥");
					        	$(".order-dish-discount").html("0￥");
					        	$(".order-dish-give").html("0￥");
					        	$(".order-dish-pay").html("0￥");
				        		desktop.order = {memberId:0};
				        	}
				           return [];
					    } 				     
			        }, 
			        "drawCallback": function( settings ) {
			        	orderTableTRClick();   
			        	
			        	$("#order-dish-tb .dish-add").click(function(e){
			        		var tr = $(this).closest("tr");
			        		var tmpData = desktop.orderDishTb.row(tr).data();  
			        		dishCount(e,tmpData,1,true);
			        	});
			        	$("#order-dish-tb .dish-minus").click(function(e){
			        		var tr = $(this).closest("tr");
			        		var tmpData = desktop.orderDishTb.row(tr).data();  
			        		dishCount(e,tmpData,-1,true);
			        	});
			        	
			        	$("#order-dish-tb").find("tbody tr").each(function(){  
			        		if(!desktop.orderDishTb) return;
			        		var tmpData = desktop.orderDishTb.row($(this)).data();  
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
		$("#pay-order-num").html(desktop.order.orderNum);
		$("#pay-info").html(desktop.order.orderTicketName+" "+desktop.order.orderCustomerCount+" 可供["+$("#title-desk-seats").html()+"人]");
		$("#pay-phone").html(desktop.order.phone); 
		
		if(desktop.orderPayTb!=null){//初始化方式来 
		    desktop.orderPayTb.ajax.reload();
		}else{			
			desktop.orderPayTb = $('#order-pay-tb').DataTable({
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
					        			desktop.tmpOrderData[tmpKey] = true;  
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
					        	$("#pay-total-spend").html(desktop.order.orderSpend+"");
					        	$("#pay-order-pay").val(Math.floor(parseFloat(desktop.order.orderSpend)-parseFloat(desktop.order.orderDiscount)));
					        	$("#pay-dish-discount").html(desktop.order.orderDiscount+"");
					        	$("#pay-order-discount").html("0");
					        	$("#pay-dish-zero").html((desktop.order.orderSpend -Math.floor(desktop.order.orderSpend)).toFixed(2));
//					        	$("#pay-had-pay").html((desktop.order.orderSpend-desktop.order.orderDiscount-desktop.order.orderGive)+"");
					        	$("#pay-order-result").html(Math.floor(parseFloat(desktop.order.orderSpend)-parseFloat(desktop.order.orderDiscount)));
					        	$("#pay-order-payer").val(Math.floor(parseFloat(desktop.order.orderSpend)-parseFloat(desktop.order.orderDiscount)));
					        	
					        	return json.data[0].orderDishes;
				        	}else{
				        		$("#pay-total-spend").html("0");
					        	$("#pay-dish-discount").html("0");
					        	$("#pay-order-discount").html("0");
					        	$("#pay-dish-zero").html("0");
					        	$("#pay-order-pay").val("0");
					        	$("#pay-order-result").html("0");
				        		desktop.order = {memberId:0};
				        	}
				           return [];
					    } 				     
			        }, 
			        "drawCallback": function( settings ) { 
			        	$("#order-pay-tb").find("tbody tr").each(function(){  
			        		if(!desktop.orderDishTb) return;
			        		var tmpData = desktop.orderDishTb.row($(this)).data();  
			    			  if(!!tmpData && tmpData.index.indexOf("i")>0) {
			    				  $(this).css("background-color","#eee");
			    			  }
			    		 });
			        	$("#order-pay-tb").find("tbody").unbind("click");
			        	$("#order-pay-tb").find("tbody").click(function(e){   
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
			        		var tmpData = desktop.orderDishTb.row(tr).data();
			        		var thisDiscount = tmpData.dishCount * tmpData.dishUnitPrice * parseFloat($(this).val());
			        		tmpData.dishDiscount=thisDiscount
			        		desktop.orderDishTb.row(tr).data()
			        		//todo update discount
			    			var allData = desktop.orderDishTb.data();
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
		    	desktop.dishTypeData = dishTypes;
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
		$('.recipes-classify-content-left-set').empty();
		if($("#title-member_id").val()=='' || $("#title-member_id").val()==null){return;}
		var request = {"method":"memberController.qryMemberDishList" ,"order_id":'',"desk_id":$("#title-desk-id").html()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code == 100) {
		    	var dishes = data.data,dishStr ="";   
		    	var dishesUnits={11:'只',10:'串',9:'千克',8:'克',7:'打',6:'盘',5:'瓶',4:'个',3:'根',2:'份',1:'斤'};
		    	for(var i in dishes){ 
		    		if(dishes[i] && dishes[i].dishCount<=0) continue;
		    		var bgcolor  ="";
		    		if(dishes[i].ifPay == 2) bgcolor = "style='background:#FFEFD5'";
		    		dishStr +="<div "+bgcolor+" class='item fl' index="+i+"><div style='display: inline-block;margin-top: 3px;'>["+((typeof(dishes[i]['relaDishTypeName'])=='undefined')?'赠送':dishes[i]['relaDishTypeName'])+"--</div><div style='display: inline-block;'>"+dishes[i]["dishName"]+"]</div><div style='color: #888;display: inline-table;margin: 0 20px;'>剩余："+dishes[i]['dishCount']+dishesUnits[dishes[i]["dishUnit"]]+"</div><div style='color: #888;position: relative;clear: both;display: inline-block;margin-top: 3px;float: right;margin-right: 6px;'><a class='dish-minus dish-operate' style='font-size:12px'>减存</a></div></div>";
		        }
		    	desktop.memberDishesData = dishes;
		    	
	    		$('.recipes-classify-content-left-set').append(dishStr); 
	    		$(".recipes-classify-content-left-set .item").click(move2Order);   
	        	$("#order-dish-tb .dish-minus").click(function(e){
	        		var index =  $(this).parent().parent().attr("index");
	    			var tmpData = desktop.memberDishesData[index];
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
			var typeSet = desktop.dishTypeData[index]['dishTypeSet'];
			var dishTypeId = desktop.dishTypeData[index]['dishTypeId'];	
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
		    	desktop.dishesData = dishes;
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
//		    		if(desktop.order && desktop.order.memberId<=0){//必须在后台执行 
//						 continue;
//					}
		    		dishStr +="<div class='item fl' type='set' index='"+i+"'><div>"+dishes[i]['dishTypeName']+"</div><div style='margin-top: 20px;float: right;color: #888;'>单价："+dishes[i]['dishUnitPrice']+"￥</div></div>"; 
				}
		    	desktop.dishesSetData = dishes;
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
		if(desktop.orderDishTb.data().length >100)
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
			var dishTypeId = desktop.dishesSetData[index].dishTypeId;
			var dishTypeName = desktop.dishesSetData[index].dishTypeName;
			var dishPrice = desktop.dishesSetData[index].dishUnitPrice;  
			$("#order-dish-tb tr").each(function(){
				  var tmpDishData = desktop.orderDishTb.row($(this)).data();
				  tmpKey = 2 + "-"+1 + '-'+(1000000+dishTypeId)+"-";
				  if( typeof(tmpDishData)!="undefined" && tmpDishData.index.indexOf(tmpKey)>= 0 && tmpDishData.iforder==2 && tmpDishData.parentDetailId==0 && tmpDishData.dishCount!=0) {  
					  orderDishDetailId = tmpDishData.orderDishDetailId;
					  dishCount = tmpDishData.dishCount+addCount; 
				  }
			});
			var request = {"method":"orderController.editOrderDish",
					   "order_dish_detail_id":orderDishDetailId,
					   "order_id":((typeof(desktop.order)=="undefined"||desktop.order==null)?'':desktop.order.orderId),
					   "desk_id":$("#title-desk-id").html(),
					   "dish_id":dishTypeId,
					   "dish_name":dishTypeName,
					   "dish_type_id":dishTypeId,
					   "dish_count":dishCount,
					   "member_id":$("#title-member_id").val(),
					   "isset":1
			};
			
		}else{
			var dishId = desktop.dishesData[index].dishId;
			var dishTypeId = desktop.dishesData[index].dishId;
			var dishName = desktop.dishesData[index].dishName;
			var dishPrice = desktop.dishesData[index].dishPrice;   
			var dishUnit =  desktop.dishesData[index].dishUnit;
			$("#order-dish-tb tr").each(function(){
				  var tmpDishData = desktop.orderDishTb.row($(this)).data();
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
					   "order_id":((typeof(desktop.order)=="undefined"||desktop.order==null)?'':desktop.order.orderId),
					   "desk_id":$("#title-desk-id").html(),
					   "dish_id":dishId,
					   "dish_name":dishName,
					   "dish_type_id":dishTypeId,
					   "dish_count":dishCount,
					   "member_id":$("#title-member_id").val(),
					   "dish_unit":dishUnit,
					   "isset":2
			};
		}
		comm.jsonRequest(request, function (ret){ 		
		    var data = JSON.parse(ret);
		    if (data.code !== 100) {  
		    	desktop.orderDishTb.ajax.reload(); 
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
			var tmpTypeData = desktop.orderDishTb.row(tr).data();
			$(".my-drowdown-menu").hide(); 
			
			if($(this).hasClass("expand")){
				$(this).html("▼"); 
				$("#order-dish-tb").find("tbody tr").each(function(){  
						var tmpData = desktop.orderDishTb.row($(this)).data();   
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
				$("#order-dish-tb").find("tbody tr").each(function(){   
						var tmpData = desktop.orderDishTb.row($(this)).data();   
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
		
		$("#order-dish-tb tr").unbind('click');
		$("#order-dish-tb tr").click(function(e){ 
			
			if(e.pageY+$(".my-drowdown-menu").height()>$(document).height()){
				$(".my-drowdown-menu").css("top",e.pageY-(e.pageY+$(".my-drowdown-menu").height()-$(document).height())-10);
			}else{
				$(".my-drowdown-menu").css("top",e.pageY);
			} 
			$(".my-drowdown-menu").show(); 
			var tmpData = desktop.orderDishTb.row($(this)).data();
			$("#order-dish-tb tr").each(function(){
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
	
	function menuItemClick(itemElem)
	{
		if(itemElem.hasClass("disabled")){return;}
		if(itemElem.attr("type")=='memberDishMove'){
			var tr = $("#order-dish-tb tbody tr[currentTr=true]");
			var dishes = desktop.orderDishTb.row(tr).data();
			if(dishes.dishCount==dishes.dishStorage){
				alert("该菜品已转存完成");
				return;
			}
			var request = {"method":"orderController.move2Storage","detail_id":dishes.orderDishDetailId};
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.code !== 100) { 
			    	freshMemberDish();  
			    	desktop.orderDishTb.ajax.reload(); 
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    });   
		}else if(itemElem.attr("type")=='dishTurntable'){
			var request = {"method":"dineController.qryDineTableList", "store_id":$("#store-select").val()};
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
			var tr = $("#order-dish-tb tbody tr[currentTr=true]");
			var dishes = desktop.orderDishTb.row(tr).data();
			if(dishes.ifOrder==1){alert("已下单，不能删除")}
			var request = {"method":"orderController.deleteOrderDish","detail_id":dishes.orderDishDetailId};
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.code !== 100) { 
			    	freshMemberDish();  
			    	desktop.orderDishTb.ajax.reload(); 
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    });    
		}else if(itemElem.attr("type")=='dishRetreat'){
			var tr = $("#order-dish-tb tbody tr[currentTr=true]");
			var dishes = desktop.orderDishTb.row(tr).data();
			if(dishes.ifOrder==2){alert("为下单菜品,请选择退菜")}
			var request = {"method":"orderController.deleteOrderDish","detail_id":dishes.orderDishDetailId,"retreat":true};
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.code !== 100) { 
			    	freshMemberDish();  
			    	desktop.orderDishTb.ajax.reload(); 
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    });    
		} else if(itemElem.attr("type")=='dishDemand'){
			var tr = $("#order-dish-tb tbody tr[currentTr=true]");
			var dishes = desktop.orderDishTb.row(tr).data();
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
							    	desktop.orderDishTb.ajax.reload(); 
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
	
	function turnDesk()
	{
		var deskId = $(this).attr("desk");
		var deskName = $(this).find(".desk-name").html()
		var request = {"method":"dineController.turnDesk" ,"source_dine_id":$("#title-desk-id").html(),"target_desk_id":deskId}; 
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.content.code == 100) {  
				$("#title-desk-name").html(deskName); 
				$("#title-desk-seats").html($(this).find(".desk-consumed").attr("seats")); 
				
				$(".close-desk-btn").click();
				freshOrderTable();
				freshDishType(); 	  
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });
	}
	
		
    function move2Order()
    { 
    	var index = $(this).attr("index");
    	var memberDish = desktop.memberDishesData[index]
		var request = {"method":"orderController.move2Order","member_dish_id":memberDish.memberDishId,"order_id":((typeof(desktop.order)=="undefined"||desktop.order==null)?'':desktop.order.orderId)};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code !== 100) { 
		    	freshMemberDish(); 
		    	desktop.orderDishTb.ajax.reload();
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });   
    }
	
	function confirmOrder()
	{
		if(desktop.orderDishTb.data().length <1)
		{
			alert("顾客还未点菜!?");
			return false;
		}
		var hasNewOrderDish = false;
		$("#order-dish-tb tr").each(function(){
			var tmpData = desktop.orderDishTb.row($(this)).data();
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
				   "order_id":((typeof(desktop.order)=="undefined"||desktop.order==null)?'':desktop.order.orderId) 
			    }; 
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) { 
			    	comm.message("管理信息","保持门店失败！",true);
			    	var dishes = desktop.orderDishTb.data();
			    	desktop.orderDishTb.ajax.reload();
			    	$(".order-back-btn").click();
			    	var orderNum = desktop.order.orderNum;
			    	desktop.order = null;
			    	//$("#order-dish-div").printArea({mode:'iframe'});  
			    	var check = $(".user-print-btn .print-cls").is(':checked');
			    	if(check){
			    		doPrint(dishes,orderNum);
			    	}
			    	doPrint(dishes,orderNum);
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
		    			tmpObj = {"value":retObj[i][keyName],"data":{"id":retObj[i][valName],"third":retObj[i][thirdArr[0]],"check":retObj[i]['check']}};
		    		}else{
		    			tmpObj = {"value":retObj[i][keyName],"data":{"id":retObj[i][valName],"check":retObj[i]['check']}};
		    		}
		    		
		    		obj.suggestions.push(tmpObj);
		    	}     
		    	if($(keyElem).data() && $(keyElem).data().autocomplete) {
		    		$(keyElem).data().autocomplete.options.lookup= obj.suggestions;
		    	} 
		    	else{
		    		desktop.comp = $(keyElem).autocomplete({
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
						    if(!suggestion.data.check){ 
						    	$(keyElem).val(typeof($(keyElem).attr("old"))!='undefined'?$(keyElem).attr("old"):'');
						    	$(valElem).val("");
						    	if(thirdArr && thirdArr.length==2){
					            	$(thirdArr[1]).val(''); 
					    		}
						    	alert("该会员已开桌!");
						    } 
				            $(valElem).change()
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
			if(data.parentDetailId>0 || data.ifgive==4){  
				if(data.dishStorage+count<0) {e.stopPropagation();return;} 
				var request = {"method":"orderController.move2Storage","detail_id":data.orderDishDetailId,"update_count":count};
				comm.jsonRequest(request, function (ret){ 
				    var data = JSON.parse(ret); 
				    if (data.code !== 100) {  
				    	desktop.orderDishTb.ajax.reload(); 
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
					    	desktop.orderDishTb.ajax.reload(); 
					    }
					    comm.message("管理信息","保持门店成功！",true);			  
				    })
				}else{
					var request = {"method":"orderController.editOrderDish",
							   "order_dish_detail_id":data.orderDishDetailId,
							   "order_id":((typeof(desktop.order)=="undefined"||desktop.order==null)?'':desktop.order.orderId),
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
					    	desktop.orderDishTb.ajax.reload(); 
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
		var request = {"method":"orderController.orderNopayLeave" ,'order_dish_discount':$("#pay-dish-discount").html(),'order_all_discount':$("#pay-order-discount").html(),"remarks":$("payremarks").text(),"order_should_pay":realPay,"order_num":"","order_id":((typeof(desktop.order)=="undefined"||desktop.order==null)?'':desktop.order.orderId),"order_ticket_id":$("#title-desk-id").html()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.content.code == 100) { 
		    	$(".pay-close").click();
		    	$(".nav-item[type=desktop]").click();
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
		var request = {"method":"orderController.orderCheckpay" ,'order_pay':realPay,'pay_type':$("#pay_type").val(),'order_dish_discount':$("#pay-dish-discount").html(),'order_dish_discount':$("#pay-dish-discount").html(),'order_all_discount':$("#pay-order-discount").html(),"remarks":$("payremarks").text(),"order_should_pay":$("#pay-order-pay").val(),"order_num":"","order_id":((typeof(desktop.order)=="undefined"||desktop.order==null)?'':desktop.order.orderId),"order_ticket_id":$("#title-desk-id").html()};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.content.code == 100) { 
		    	var dishes = desktop.orderPayTb.data();
		    	doPrint(dishes,desktop.order.orderNum,{'realPay':realPay,'dishDiscount':$("#pay-dish-discount").html(),'orderAllDiscount':$("#pay-order-discount").html(),"orderShouldPay":$("#pay-order-pay").val()});
		    	$(".pay-close").click();
		    	$(".nav-item[type=desktop]").click();
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    });
	}
	function cancelOrder()
	{
		var index = $(this).parent().attr("index");
		var dineId = desktop.data[index]['currentDineId'];
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
        $(".report-name").html("<蚝功夫枫亭旗舰店>"+(check?'外送单':'内用单'));
		$(".deskNum").html($("#title-desk-name").html())
		$(".deskCount").html($("#title-customer-count").html())
		$(".orderNum").html(orderNum);
		$(".orderserver").html($(".user").attr("username"));
		$(".deskTime").html(new Date().format('yyyy-MM-dd hh:mm:ss'))
		$(".print-time").html(new Date().format('yyyy-MM-dd hh:mm:ss'))
		$(".report-list").append(str);
		var height = 0.9 * len;
		demoPrint({html:$("#dishPrinter").html(),prview:false,printName:'MyPrinter','height':600+(payRet?190:0)+height*100})
	}
})