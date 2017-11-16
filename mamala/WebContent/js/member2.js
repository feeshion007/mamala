define(function(require, member, module){
	var comm = require('../js/modules/common/common.js');

	function init() { 
		initEvent();
		initTable();
		initAutocomplete();
	}
	member.init = init;
	
	function initEvent()
	{  
		$('.member-list-box').css("width",($(".content").width()-320)+"px");
		$('.member-type-box').css("height",($(".content").height())+"px");
		$('.member-list-box').css("height",($(".content").height()-20)+"px"); 
		$(".edit-memberGroup-btn").click(function(){
			var request = {"method":"memberController.editMemberGroup",
					   "group_id":$("#group_id").val(),
					   "group_name":$("#group_name").val(),
					   "up_group_id":$("#up_group_id").val(),
					   "up_group_name":$("#up_group_name").val(),
					   "rebate":$("#rebate").val()
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
			var request = {"method":"memberController.editMember",
					   "member_id":$("#member_id").val(),
					   "member_name":$("#member_name").val(),
					   "group_id":$("#member_group_id").val(),
					   "group_name":$("#member_group_name").val(),
					   "card_number":$("#card_number").val(),
					   "remain_money":$("#remain_money").val(),
					   "disabled":$("#disabled").val(),
					   "phone":$("#phone").val(),
					   "sex":$("#sex").val(),
					   "address":$("#address").val(),
					   "weixin":$("#weixin").val(),
					   "remarks":$("#remarks").val(),
					   "birthday":$("#birthday").val()
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
			initAutocomplete("memberController.qryMemberGroupList","groupName","groupId","#member_group_name","#member_group_id")
		});
		$(".new-memberGroup-btn").click(function(){
			$(".edit-memberGroup-form")[0].reset();
			initAutocomplete("memberController.qryMemberGroupList","groupName","groupId","#up_group_name","#up_group_id",0)
		});
		$(".member-list-box").off('click','.member-recharge');
		$(".member-list-box").on('click','.member-recharge',function(){
			$('.recharge').css('visibility','visible');
			$('.give-away').css('visibility','hidden');
			$('.give-away').removeClass('effect-show');
			$('.recharge').addClass('effect-show');
		});
		$(".member-list-box").off('click','.member-give-away');
		$(".member-list-box").on('click','.member-give-away',function(){
			$('.give-away').css('visibility','visible');
			$('.recharge').css('visibility','hidden');
			$('.recharge').removeClass('effect-show');
			$('.give-away').addClass('effect-show');
		});
		/* 会员充值，菜品赠送面板关闭按钮 */
		$('.title i').click(function(){
			$('.recharge').css('visibility','hidden');
			$('.recharge').removeClass('effect-show');
			$('.give-away').css('visibility','hidden');
			$('.give-away').removeClass('effect-show');
		});
		/* 赠送菜品 */
		$('.give-away-list .item').unbind();
		$('.give-away-list .item').bind('click',function() {
			alert(1);
			$('.give-away-already').append("<div class='item fl'>已赠送菜一</div>");
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
			 "scrollY": "540px", 
			 "scrollX": true,
		     "scrollCollapse": true,
		     "searching": false, 
		     "lengthChange": false,
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
			          return JSON.stringify( d );
			        } ,
			        "dataSrc": function ( json ) {  
			        	var tmpSex = {2:'男',1:'女'}
			        	var tmpDisabled = {2:'启用',1:'禁用'}
			        	for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
			                json.data[i]['oper'] = "<a style='margin-left:5px' href='javascript:void();' class='member-give-away'>菜品赠送</a><a style='margin-left:5px' href='javascript:void();' class='member-recharge'>会员充值</a><a style='margin-left:5px' data-toggle='modal' data-target='#edit-member-panel' data-keyboard='false'  href='javascript:void()' class='save-member-row'>修改</a><a style='margin-left:5px' href='javascript:void()' class='del-member-row'>删除</a>" 
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
		        		 var request = {"method":"memberController.deletemember",
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
		        		 $(".edit-member-form")[0].reset();
		     			 initAutocomplete("memberController.qryMemberGroupList","groupName","groupId","#member_group_name","#member_group_id")
		        		 var rowData = member.memberTb.row($(this).parents('tr') ).data(); 
		        		 comm.loadData(rowData);
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
		$('.member-list-box .dataTables_scrollBody').css("height",($(".content").height()-100)+"px"); 
		      
	}   
	function initAutocomplete(method,keyName,valName,keyElem,valElem,selfval)
	{
		var request = {"method":method };
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
				        }
				    });
		    	}
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	   });  
		
	}
})