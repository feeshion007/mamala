define(function(require, member, module){
	var comm = require('../js/modules/common/common.js');
	var utils = require('../js/modules/common/util.js');

	function init() { 
		initEvent();
		initTable();
		initAutocomplete();
	}
	member.init = init;
	
	function initEvent()
	{  
		$('.member-list-box').css("width",($(".content").width()-305)+"px");
		$('.member-type-box').css("height",($(".content").height())+"px");
		$('.member-list-box').css("height",($(".content").height())+"px"); 
		$(".edit-memberGroup-btn").click(function(){
			$(".msg-error").remove();
		       $(".edit-memberGroup-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".edit-memberGroup-form").find("input, select, textarea").focus();
			$(".edit-memberGroup-form").find("input, select, textarea").blur();
			$(".dropdown-menu").hide();
			var ok = ($(".msg-error").length<=0); 
			if(!ok) return ok;
			
			var request = {"method":"memberController.editMemberGroup",
					   "group_id":$("#group_id").val(),
					   "group_name":$("#group_name").val(),
					   "up_group_id":$("#up_group_id").val(),
					   "up_group_name":$("#up_group_name").val(),
					   "rebate":$("#rebate").val(),
					   "store_id":$("#store-select").val()
				    };
				comm.jsonRequest(request, function (ret){ 
				    var data = JSON.parse(ret);
				    if (data.code !== 100) {
				    	console.log('保存顾客画像失败.'+data.desc);
				    	comm.message("管理信息","保持门店失败！",true);	
				    	member.memberGroupTb.ajax.reload();
				    	return;
				    }
				    comm.message("管理信息","保持门店成功！",true);			  
			   }); 
		})
		 
		$(".edit-member-btn").click(function(){
			var data = member.memberTb.data();
			 for(var i in data){
				 if(data[i].phone == $("#phone").val() ){
					 if(member.currentMember && member.currentMember.phone ==  $("#phone").val()){
					 }else{
						 alert("手机号码已存在!");
						 return false;
					 }
					
				 }
			 }
			 
			$(".msg-error").remove();
		       $(".edit-member-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".edit-member-form").find("input, select, textarea").focus();
			$(".edit-member-form").find("input, select, textarea").blur();
			$(".dropdown-menu").hide();
			var ok = ($(".msg-error").length<=0); 
			if(!ok) return ok;
			
			var request = {"method":"memberController.editMember",
					   "member_id":$("#member_id").val(),
					   "member_name":$("#member_name").val(),
					   "group_id":$("#member_group_id").val(),
					   "group_name":$("#member_group_name").val(),
					   "card_number":($("#card_number").val()==''||$("#card_number").val()==null)?$("#phone").val():$("#card_number").val(),
					   "disabled":$("#disabled").val(),
					   "phone":$("#phone").val(),
					   "sex":$("#sex").val(),
					   "address":$("#address").val(),
					   "weixin":$("#weixin").val(),
					   "remarks":$("#remarks").val(),
					   "birthday":$("#birthday").val(),
					   "store_id":$("#store-select").val()
				    };
				comm.jsonRequest(request, function (ret){ 
				    var data = JSON.parse(ret);
				    if (data.code !== 100) {
				    	console.log('保存顾客画像失败.'+data.desc);
				    	comm.message("管理信息","保持门店失败！",true);	
				    	member.memberTb.ajax.reload();
				    	return;
				    }
				    comm.message("管理信息","保持门店成功！",true);			  
			   });
		})	
		$(".new-member-btn").click(function(){
			$(".edit-member-form")[0].reset();
			member.currentMember = null;
			initAutocomplete("memberController.qryMemberGroupList","groupName","groupId","#member_group_name","#member_group_id")
			$(".msg-error").remove();
		       $("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		       }) 
		});
		$(".new-memberGroup-btn").click(function(){
			$(".edit-memberGroup-form")[0].reset();
			initAutocomplete("memberController.qryMemberGroupList","groupName","groupId","#up_group_name","#up_group_id",0)
			$(".msg-error").remove();
		       $("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		       }) 
		});
		
		$('.title i').click(function(){
			$('.recharge').hide();
			$('.recharge').removeClass('effect-show');
			$('.give-away').hide();
			$('.give-away').removeClass('effect-show');
		})
		$(".charge-close-btn").click(function(){
			$('.title i').click();
		})
		$(".edit-memberGroup-form").validate(); 
		$(".edit-member-form").validate(); 
		$(".member-charge-form").validate();
		$("#pay-money").keyup(function(){
			if(((!ValidateRules.isFloat($(this).val())) && $(this).val()!='-') || (parseFloat($(this).val())==0 && $(this).val()!='-')){
				$(this).val('').change();
				$("#add-money").val("")
				$("#remain-money").val(parseFloat($("#remain-money2").html()).toFixed(2))
				return;
			}
			if($(this).val()=='-') return;
			if((parseFloat($(this).val()) + parseFloat($("#remain-money2").html()))<0){
				$(this).val('').change();
				$("#add-money").val("")
				$("#remain-money").val(parseFloat($("#remain-money2").html()).toFixed(2))
				return;
			}
			if($(this).val() ==""){
				$("#add-money").val("")
				$("#remain-money").val(parseFloat($("#remain-money2").html()).toFixed(2))
			}else{
				$("#add-money").val($(this).val())
				$("#remain-money").val((parseFloat($("#remain-money2").html())+parseFloat($(this).val())).toFixed(2))
			} 
		})
		$("#pay-money").blur(function(){
			if(!ValidateRules.isFloat($(this).val()) || parseFloat($(this).val())==0){
				$(this).val('').change();
				$("#add-money").val("")
				$("#remain-money").val(parseFloat($("#remain-money2").html()).toFixed(2))
				return;
			}
			if($(this).val() ==""){
				$("#add-money").val("")
				$("#remain-money").val(parseFloat($("#remain-money2").html()).toFixed(2))
			}else{
				$("#add-money").val($(this).val())
				$("#remain-money").val((parseFloat($("#remain-money2").html())+parseFloat($(this).val())).toFixed(2))
			} 
		})
		
		$("#debay").keyup(function(){
			if(!ValidateRules.isFloat($(this).val())){
				$(this).val('').change();
				$("#add-money").val('')
				$("#remain-money").val(parseFloat($("#remain-money2").html()).toFixed(1))
				return;
			}
			if($(this).val()=='-') return;
			if($(this).val() ==""){
				$("#add-money").val(parseFloat($("#pay-money").val()))
				$("#remain-money").val((parseFloat($("#remain-money2").html())+parseFloat($("#pay-money").val())).toFixed(2))
			}else{
				$("#add-money").val((parseFloat($("#pay-money").val())+parseFloat($(this).val())).toFixed(2))
				$("#remain-money").val((parseFloat($("#remain-money2").html())+parseFloat($("#pay-money").val())+parseFloat($(this).val())).toFixed(2))
			} 
			 
		})
		$("#debay").blur(function(){
			if(!ValidateRules.isFloat($(this).val())){
				$(this).val('').change();
				$("#add-money").val("")
				$("#remain-money").val(parseFloat($("#remain-money2").html()).toFixed(2))
				return;
			}
			if($(this).val() ==""){
				$("#add-money").val(parseFloat($("#pay-money").val()))
				$("#remain-money").val((parseFloat($("#remain-money2").html())+parseFloat($("#pay-money").val())).toFixed(2))
			}else{
				$("#add-money").val((parseFloat($("#pay-money").val())+parseFloat($(this).val())).toFixed(2))
				$("#remain-money").val((parseFloat($("#remain-money2").html())+parseFloat($("#pay-money").val())+parseFloat($(this).val())).toFixed(2))
			} 
		})
		
		$(".check-charge-btn").click(function(){ 
			if($("#pay-money").val()==''|| $("#pay-money").val()==null) return;
			var payMoney = parseFloat($("#pay-money").val());
			if(payMoney>=1000){
				 $.confirm({
				      body: "<div style='margin:20px 40px;'>支付确认:确认要充值 <lable style='color:red'>"+$("#pay-money").val()+"</lable>吗?</div>"
				      ,height: 70
				      ,width: 200
				      ,title:"充值确认"
				      ,okHide:function(){
					    var chareType = $("input[name=rechagetype]:checked").val();
						var request = {"method":"memberController.memberRecharge",  "member_id":$("#charge-member-id").html(), "remain_money":$("#remain-money").val(),
								'charge_type':chareType,'recharge_money':$("#pay-money").val(),'discount_money':0,'remarks':$("#remarks").val()};
							comm.jsonRequest(request, function (ret){ 
							    var data = JSON.parse(ret);
							    if (data.code !== 100) { 
							    	comm.message("管理信息","保持员工失败！",true);
							    	$('.title i').click();
							    	member.memberTb.ajax.reload();
							    	return true;
							    }
							    comm.message("管理信息","保持员工成功！",true);			  
						   });
						  return true;
				       }
				  })
			}else{
				var chareType = $("input[name=rechagetype]:checked").val();
				var request = {"method":"memberController.memberRecharge",  "member_id":$("#charge-member-id").html(), "remain_money":$("#remain-money").val(),
						'charge_type':chareType,'recharge_money':$("#pay-money").val(),'discount_money':0,'remarks':$("#remarks").val()};
					comm.jsonRequest(request, function (ret){ 
					    var data = JSON.parse(ret);
					    if (data.code !== 100) { 
					    	comm.message("管理信息","保持员工失败！",true);
					    	$('.title i').click();
					    	member.memberTb.ajax.reload();
					    	return true;
					    }
					    comm.message("管理信息","保持员工成功！",true);			  
				   });
			}
		})

	}
	
	function initTable()
	{
		member.memberGroupTb =$('#member-group-tb').DataTable({
			 "minHeight":"500px",
			 "scrollY": "540px", 
		     "scrollCollapse": true,
		     "paging": false,
		     "info": false,
		     "searching": false,
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
		        "serverSide": true,//打开后台分页  
		        "ajax":{
		        	"url": comm.jsonServer()+"/memberController/qryMemberGroupList",   
			        "contentType": "application/json",
			        "type": "POST",
			        "data": function ( d ) {  
		        	  d.store_id=$("#store-select").val();
			          return JSON.stringify( d );
			        } ,
			        "dataSrc": function ( json ) {  
			        	var tmpTypeSet = {2:"套餐",1:""}
			        	for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
			                json.data[i]['oper'] = "<a style='margin-left:5px' data-toggle='modal' data-target='#edit-memberGroup-panel' data-keyboard='false'  href='javascript:void()' class='save-memberGroup-row'>修改</a><a style='margin-left:5px' href='javascript:void()' class='del-memberGroup-row'>删除</a>" 
			                json.data[i]['idAndName'] = json.data[i]['groupId']+"--"+json.data[i]['groupName']; 
			        	}
			              return json.data;
				    } 
			       
		        },
		        "drawCallback": function( settings ) {
		        	 $(".del-memberGroup-row").click(function(){
		        		 var rowData = member.memberGroupTb.row($(this).parents('tr') ).data(); 
		        		 var request = {"method":"memberController.deleteMemberGroup",
								   "group_id":rowData.groupId, 
						     };
							comm.jsonRequest(request, function (ret){ 
							    var data = JSON.parse(ret);
							    if (data.code !== 100) { 
							    	comm.message("管理信息","保存菜单类型失败！",true);	
							    	member.memberGroupTb.ajax.reload();
							    	return;
							    }
							    comm.message("管理信息","保存菜单类型成功！",true);			  
						   });
				       });
		        	 $(".save-memberGroup-row").click(function(){
		        		 $(".msg-error").remove();
		  		         $("input, select, textarea").each(function(){
		  		    	      $(this).removeClass("input-error")
		  		         }) 
		        		 var rowData = member.memberGroupTb.row($(this).parents('tr') ).data(); 
		        		 
		        		 $(".edit-memberGroup-form")[0].reset();
		     			 initAutocomplete("memberController.qryMemberGroupList","groupName","groupId","#up_group_name","#up_group_id",rowData.groupId) 
		        		 comm.loadData(rowData);
				       });
		        },
		        "columns": [
                   { "data": "idAndName" },
                   { "data": "rebate" },
                   { "data": "oper"}
               ]
		 });  
		
		member.memberTb = $('#member-tb').DataTable({
			 "minHeight":"500px",
			 "scrollY": "580px", 
			 "scrollX": true,
		     "scrollCollapse": true,
		     "searching": true, 
		     "lengthChange": false,
		     "pageLength":20,
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
		        	"url": comm.jsonServer()+"/memberController/qryMemberList",    
			        "contentType": "application/json",
			        "type": "POST",
			        "data": function ( d ) { 
		        	  d.check=false;
		        	  d.store_id=$("#store-select").val();
			          return JSON.stringify( d );
			        } ,
			        "dataSrc": function ( json ) {  
			        	var tmpSex = {2:'男',1:'女'}
			        	var tmpDisabled = {2:'启用',1:'禁用'}
			        	for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
			                json.data[i]['oper'] = "<a style='margin-left:5px' href='javascript:void();' class='member-give-away'>菜品赠送</a><a style='margin-left:5px' href='javascript:void();' class='member-recharge'>会员充值</a><a style='margin-left:5px' href='javascript:void();' class='member-detail'>消费明细</a><a style='margin-left:5px' data-toggle='modal' data-target='#edit-member-panel' data-keyboard='false'  href='javascript:void()' class='save-member-row'>修改</a><a style='margin-left:5px' href='javascript:void()' class='del-member-row'>删除</a>" 
			                json.data[i]['tmpDisabled'] = tmpDisabled[json.data[i]['disabled']];
			                json.data[i]['tmpSex'] = tmpSex[json.data[i]['sex']]; 
			                json.data[i]['memberGroupId'] = json.data[i]['groupId']; 
			                json.data[i]['memberGroupName'] = json.data[i]['groupName']; 
			              }
			              return json.data;
				    } 
			       
		        },
		        "drawCallback": function( settings ) {
		        	 $(".del-member-row").click(function(){
		        		 var rowData = member.memberTb.row($(this).parents('tr') ).data(); 
		        		 var request = {"method":"memberController.deleteMember",
								   "member_id":rowData.memberId, 
						     };
							comm.jsonRequest(request, function (ret){ 
							    var data = JSON.parse(ret);
							    if (data.code !== 100) { 
							    	comm.message("管理信息","保持员工失败！",true);	
							    	member.memberTb.ajax.reload();
							    	return;
							    }
							    comm.message("管理信息","保持员工成功！",true);			  
						   });
				       });
		        	 $(".save-member-row").click(function(){
		        		 $(".msg-error").remove();
		  		         $("input, select, textarea").each(function(){
		  		    	      $(this).removeClass("input-error")
		  		         })
		        		 $(".edit-member-form")[0].reset();
		     			 initAutocomplete("memberController.qryMemberGroupList","groupName","groupId","#member_group_name","#member_group_id")
		        		 var rowData = member.memberTb.row($(this).parents('tr') ).data(); 
		        		 comm.loadData(rowData);
		        		 member.currentMember = rowData;
				       }); 
		        	 $(".member-recharge").click(function(){
		        		 $('.recharge').show();
		     			 $('.give-away').hide();
		     			 $('.give-away').removeClass('effect-show');
		     			 $('.recharge').addClass('effect-show');
		        		 var rowData = member.memberTb.row($(this).closest('tr') ).data(); 
		        		 member.currentMember = rowData;
		        		 $("#charge-member-name").html(rowData.memberName)
		        		 $("#charge-member-id").html(rowData.memberId)
		        		 $("#charge-member-phone").html(rowData.phone)
		        		 $("#remain-money").val(rowData.remainMoney)
		        		 $("#remain-money2").html(rowData.remainMoney);
		        		 $("#pay-money").val('');
		        		 $("#add-money").val('');
		        	 })
		        	 $(".member-detail").click(function(){
//		        		 var request = {"method":"dishController.qrySetDishRelation",set_id:'',dish_type_id :0,dish_type_set:4,dish_canbe_give:2}; 
//			     		 comm.jsonRequest(request, function (ret){ 
//			     			    var data = JSON.parse(ret); 
//			     			    if (data.code !== 100) { 
//			     			    	var dishes = data.data,dishStr ="";  
//			     			    	for(var i in dishes){
//			     			    		dishStr +="<div class='item fl' type='' index='"+i+"'>"+dishes[i]['dishName']+"</div></div>"; 
//			     					}
//			     			    	member.dishesData = dishes;
//			     			    	member.currentMember = rowData;
//			     			    	$('.give-away-list').empty();
//			     		    		$('.give-away-list').append(dishStr); 
//			     		    		$(".give-away-list .item").click(fillMemberDishes);  
//			     					
//			     		    		$(".give-member-info").html("会员："+rowData.memberName+";手机号:"+rowData.phone)
//			     		    		freshMemberDish(rowData.memberId);
//			     		    		
//			     			    	return;
//			     			    }
//			     			    comm.message("管理信息","保持门店成功！",true);			  
//			     		    });   
		        	 })
		        	  
		     		 $('.member-give-away').click(function(){
		     			$('.give-away').show();
		     			$('.recharge').hide();
		     			$('.recharge').removeClass('effect-show');
		     			$('.give-away').addClass('effect-show');
		     			var rowData = member.memberTb.row($(this).closest('tr') ).data(); 
		     			var request = {"method":"dishController.qrySetDishRelation",set_id:'',dish_type_id :0,dish_type_set:4,dish_canbe_give:2}; 
		     			comm.jsonRequest(request, function (ret){ 
		     			    var data = JSON.parse(ret); 
		     			    if (data.code !== 100) { 
		     			    	var dishes = data.data,dishStr ="";  
		     			    	for(var i in dishes){
		     			    		dishStr +="<div class='item fl' type='' index='"+i+"'>"+dishes[i]['dishName']+"</div></div>"; 
		     					}
		     			    	member.dishesData = dishes;
		     			    	member.currentMember = rowData;
		     			    	$('.give-away-list').empty();
		     		    		$('.give-away-list').append(dishStr); 
		     		    		$(".give-away-list .item").click(fillMemberDishes);  
		     					
		     		    		$(".give-member-info").html("会员："+rowData.memberName+";手机号:"+rowData.phone)
		     		    		freshMemberDish(rowData.memberId);
		     		    		
		     			    	return;
		     			    }
		     			    comm.message("管理信息","保持门店成功！",true);			  
		     		    });   
		     		});
		        },
		        "columns": [
		           { "data": "oper"},
                   { "data": "memberId" },
                   { "data": "memberName" },
                   { "data": "groupName" },
                   { "data": "cardNumber"},
                   { "data": "remainMoney" },
                   { "data": "tmpDisabled" },
                   { "data": "phone" },
                   { "data": "tmpSex" },
                   { "data": "birthday" }                 
               ] 
		 });
		
		$('.member-list-box .dataTables_wrapper').css("height",($(".content").height()-20)+"px");  
		$('.member-list-box .dataTables_wrapper').css("margin-top","-27px");  
		$('.member-list-box .dataTables_wrapper').css("position","absolute");  
		$(".member-list-box .dataTables_scrollHead th").css("background-color","#e6e6e6");
		$(".member-list-box .dataTables_scrollHead th").css("border-left","solid 2px #dedede");
		$(".member-list-box .dataTables_scrollBody td").css("border-left","solid 2px #dedede");
		$('.member-list-box .dataTables_filter').css("margin-right","120px");
		$('.member-list-box .dataTables_scrollBody').css("height",($(".content").height())+"px"); 
		      
	}   
	 
	function freshMemberDish(memberId)
	{
		var request = {"method":"memberController.qryMemberDishList" ,"order_id":'',"desk_id":'','member_id':memberId};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.code == 100) {
		    	var dishes = data.data,dishStr ="";   
		    	var dishesUnits={11:'只',10:'串',9:'千克',8:'克',7:'打',6:'盘',5:'瓶',4:'个',3:'根',2:'份',1:'斤'};
		    	for(var i in dishes){ 
		    		if(dishes[i] && dishes[i].dishCount<=0) continue;
		    		var bgcolor  ="";
		    		if(dishes[i].ifPay == 2) bgcolor = "style='background:#FFEFD5'";
		    		if(dishes[i].dishUsingRange == 4) {
//		    			bgcolor = "style='background:#EEE'";
		    			dishStr +="<div "+bgcolor+" class='item fl' index="+i+"><div style='display: inline-block;margin-top: 3px;'>[赠送 --</div><div style='display: inline-block;'>"+dishes[i]["dishName"]+"]</div><div style='color: #888;display: inline-table;margin: 0 20px;'>剩余："+dishes[i]['dishCount']+dishesUnits[dishes[i]["dishUnit"]]+"</div><div style='color: #888;position: relative;clear: both;display: inline-block;margin-top: 3px;float: right;margin-right: 6px;'><a class='dish-minus dish-operate' style='font-size:12px'>减存</a></div></div>";  
			    	}else{
			    		dishStr +="<div "+bgcolor+" class='item fl' index="+i+"><div style='display: inline-block;margin-top: 3px;'>["+dishes[i]['relaDishTypeName']+"  --</div><div style='display: inline-block;'>"+dishes[i]["dishName"]+"]</div><div style='color: #888;display: inline-table;margin: 0 20px;'>剩余："+dishes[i]['dishCount']+dishesUnits[dishes[i]["dishUnit"]]+"</div></div>";	    		
		    		}
		    	} 
		    	
		    	$('.give-away-already').empty();
	    		$('.give-away-already').append(dishStr);    
	    		$(".dish-minus").click(minusMemberDishes);
	    		member.currentMemberDish = dishes;
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    }); 
	}
	function fillMemberDishes(e)
	{
		var index= $(this).attr("index");
		var dishes = member.dishesData[index]; 
		var request = {"method":"memberController.editMemberGiveDish" ,"member_dish_id":'',"member_id":member.currentMember.memberId,"dish_id":dishes.dishId,"dish_name":dishes.dishName,"dish_price":dishes.dishPrice,"dish_count":1,"status":1,"dish_type_id":dishes.realTypeId,"rela_dish_type_id":dishes.dishTypeId,"rela_dish_type_name":dishes.dishTypeName,"dish_using_range":4,"dish_unit":dishes.dishUnit};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.content.code == 100) {
		    	freshMemberDish(member.currentMember.memberId);
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    }); 
	}
	
	function minusMemberDishes()
	{
		var index= $(this).parent().parent().attr("index");
		var memberDish = member.currentMemberDish[index]; 
		var request = {"method":"memberController.editMemberGiveDish" ,"member_dish_id":memberDish.memberDishId,"member_id":member.currentMember.memberId,"dish_id":memberDish.dishId};
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret); 
		    if (data.content.code == 100) {
		    	freshMemberDish(member.currentMember.memberId)
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	    }); 
	}
	
	function initAutocomplete(method,keyName,valName,keyElem,valElem,selfval)
	{
		var request = {"method":method,"store_id":$("#store-select").val() };
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret);
		    if (data.code !== 100) {
		    	var obj = {"query":'a'};
		    	obj.suggestions = [];
		    	retObj = data.data;
		    	if(selfval>=0) obj.suggestions = [ {"value":'默认组',"data":{"id":0}}];
		    	for(var i in retObj){
		    		if(selfval && retObj[i][valName] == selfval) {
		    			continue;
		    		}
		    		tmpObj = {"value":retObj[i][keyName],"data":{"id":retObj[i][valName]}};
		    		obj.suggestions.push(tmpObj);
		    	}     
		    	if($(keyElem).data() && $(keyElem).data().autocomplete) {
		    		$(keyElem).data().autocomplete.options.lookup= obj.suggestions;
		    	} 
		    	else{
		    		member.comp = $(keyElem).autocomplete({
			    		lookup:   obj.suggestions,
					    minChars: 0, 
					    isLocal:true,
				        onSelect: function (suggestion) {
				            $(valElem).val(suggestion.data.id);
				            $(valElem).parent().find(".msg-error").remove();
				            $(valElem).parent().find("input, select, textarea").each(function(){
						    	   $(this).removeClass("input-error")
						       }) 
				        }
				    });
		    	}
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	   });   
	}
})