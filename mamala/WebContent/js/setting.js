define(function(require, setting, module){
	var comm = require('../js/modules/common/common.js');

	function init() {
		//$('.content').load($(this).attr('url')+"?"+new Date().getTime());
		$('.right-box').css("width",($(".content").width()-300)+"px");
		initEvent();
	}
	setting.init = init;
	
	function initEvent()
	{ 
		$(".edit-staff-form").validate(); 
		$(".edit-store-form").validate(); 
		$(".print-form").validate(); 
		
		var user = $.cookie("loginUser");
		var data = JSON.parse(user);
		if(data.content.loginUser.roleID!=0){
			$("#set-box-menu li[target=setting-store]").removeClass("header");
			$("#set-box-menu li[target=setting-store]").hide();
			$("#set-box-menu li[target=setting-staff]").css("margin-top","41px");
			$("#set-box-menu li[target=setting-staff]").addClass("header");  
			if(data.content.loginUser.roleID==4){
				$(".role-li-admin").remove();
				$(".stafftype-li-admin").remove();
			}
		}
		$("#set-box-menu" ).menu();
		$("#set-box-menu li").bind('click',function(){  
			$("#set-box-menu li").removeClass("ui-menu-click");
			$(this).addClass("ui-menu-click"); 
			$(".setting-box").css('display','none');
			$("#"+$(this).attr("target")).css("display",'block');
			
		});
		$(".header").click();
		$(".new-staff-btn").click(function(){ 
			$(".msg-error").remove();
		    $("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		       })  
			$(".edit-staff-form")[0].reset();
		    initAutocomplete()
		})
		$(".new-store-btn").click(function(){ 
			$(".msg-error").remove();
		    $("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		       })  
			$(".edit-store-form")[0].reset();
		})
		
		$(".edit-print-btn").click(function(){
			$(".msg-error").remove();
		       $(".print-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".print-form").find("input, select, textarea").focus();
			$(".print-form").find("input, select, textarea").blur(); 
			var ok = ($(".msg-error").length<=0); 
			if(!ok) return ok;
			
			var ipIdVal = ($("#ip_id").val()==''||$("#ip_id").val()==null)?0:$("#ip_id").val();
			var printVal = ($("#print_attr_id").val()==''||$("#print_attr_id").val()==null)?0:$("#print_attr_id").val();
			var bprintVal = ($("#bprint_attr_id").val()==''||$("#bprint_attr_id").val()==null)?0:$("#bprint_attr_id").val();
			var request = {"method":"sysAttrManage.updateSysAttr",
					   attrs:"{"+
				          "'printIp':{id:"+ipIdVal+",attr:'printer',attrName:'printIp',attrValue:'"+$("#printer-ip").val()+"',attrTypeId:"+$("#store-select").val()+",attrType:'store'},"
				          +"'printName':{id:"+printVal+",attr:'printer',attrName:'printName',attrValue:'"+$("#print_name").val()+"',attrTypeId:"+$("#store-select").val()+",attrType:'store'},"
				          +"'bprintName':{id:"+bprintVal+",attr:'printer',attrName:'bprintName',attrValue:'"+$("#bprint_name").val()+"',attrTypeId:"+$("#store-select").val()+",attrType:'store'}"
				          +"}"
				    };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) {
			    	console.log('保存顾客画像失败.'+data.desc);
			    	comm.message("管理信息","保持门店失败！",true);	
			    	setting.dishStoreTb.ajax.reload();
			    	return;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		   });
		})
		$("#set-box-menu li[target=setting-staff]").bind('click',function(){
			$("#setting-staff").find('th:eq(1)').click();//调节表格头部长度
		})
		
		$("#set-box-menu li[target=setting-print]").bind('click',function(){
			$(".print-form")[0].reset();
			var request = {"method":"sysAttrManage.getSysAttr" ,"attr_type_id":$("#store-select").val(),"attr":"printer"};
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) {
			    	var attrs = data.list;
			    	for(var i in attrs){
			    		var attr = attrs[i];
			    		$(".print-form input[name="+attr.attrName+"]").val(attr.attrValue);
			    		$(".print-form input[name="+attr.attrName+"Id]").val(attr.id);
			    	}
			    	return;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		   });
		})
		
		newTables();
		editStoreClick();
		editStaffClick();
		initAutocomplete()
	}
		
	function editStoreClick()
	{
		$(".edit-store-btn").click(function(){  
			var data = setting.dishStoreTb.data();
			 for(var i in data){
				 if(data[i].storeName == $("#store_name").val() ){
					 if(setting.currentStore && setting.currentStore.storeName ==  $("#store_name").val()){
					 }else{
						 alert("门店已存在!");
						 return false;
					 }
					
				 }
			 }
			 
			$(".msg-error").remove();
		       $(".edit-store-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".edit-store-form").find("input, select, textarea").focus();
			$(".edit-store-form").find("input, select, textarea").blur(); 
			var ok = ($(".msg-error").length<=0); 
			if(!ok) return ok;
			var request = {"method":"sysMananger.editStoreInfo",
						   "store_id":$("#store_id").val(),
						   "store_name":$("#store_name").val(),
						   "store_grade":$("#store_grade").val(),
						   "store_address":$("#store_address").val(),
						   "store_leader":$("#store_leader").val(),
						   "store_phone":$("#store_phone").val(),
						   "store_open":$("#store_open").val(),
						   "store_close":$("#store_close").val(),
					    };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) {
			    	console.log('保存顾客画像失败.'+data.desc);
			    	comm.message("管理信息","保持门店失败！",true);	
			    	setting.dishStoreTb.ajax.reload();
			    	return;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		   });
		})
	}
	
	function editStaffClick()
	{ 
		$(".edit-staff-btn").click(function(){ 
			 var data = setting.dishStaffTb.data();
			 for(var i in data){
				 if(data[i].staffAccount == $("#staff_account").val() ){
					 if(setting.currentStaff && setting.currentStaff.staffAccount ==  $("#staff_account").val()){
					 }else{
						 alert("用户账号已存在!");
						 return false;
					 }
					
				 }
			 }
			 
			$(".msg-error").remove();
		       $(".edit-staff-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".edit-staff-form").find("input, select, textarea").focus();
			$(".edit-staff-form").find("input, select, textarea").blur(); 
			var ok = ($(".msg-error").length<=0); 
			if(!ok) return ok;
			var request = {"method":"sysMananger.editStaff",
						   "staff_id":$("#staff_id").val(),
						   "staff_name":$("#staff_name").val(),
						   "staff_account":$("#staff_account").val(),
						   "staff_type":$("#staff_type").val(),
						   "staff_role":$("#staff_role").val(),
						   "store_id":$("#staff_store_id").val(),
						   "store_name":$("#staff_store_name").val(),
						   "staff_phone":$("#staff_phone").val() 
					    };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) { 
			    	comm.message("管理信息","保持员工失败！",true);	
			    	setting.dishStaffTb.ajax.reload();
			    	return;
			    }
			    comm.message("管理信息","保持员工成功！",true);			  
		   });
		})
	}
	

    function newTables()
    { 
    	setting.dishStaffTb = $('#setting-staff-tb').DataTable({
    		"minHeight":"500px",
			 "scrollY": "540px", 
		     "scrollCollapse": true,
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
		        	"url": comm.jsonServer()+"/sysMananger/qryStaffList",   
			        "contentType": "application/json",
			        "type": "POST",
			        "data": function ( d ) { 
		        	  d.store_id=$("#store-select").val();
			          return JSON.stringify( d );
			        } ,
			        "dataSrc": function ( json ) { 
			        	var tmpRole = {4:'店长',3:'员工',2:'收银',1:'快递',0:'管理员'}
			        	var tmpType = {3:'超级管理员',2:'管理员',1:'普通用户'}
			        	for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
			                if(json.data[i]['staffType'] == 3){
			                	json.data[i]['oper'] = "" ;	
			                	json.data[i]['staffRole'] = 0;
			                	json.data[i]['storeName'] = "所有者" ;	
			                	json.data[i]['staffPhone'] = "" ;	
			                }else{ 
			                	json.data[i]['oper'] = "<a style='margin-left:5px' data-toggle='modal' data-target='#edit-staff-panel' data-keyboard='false'  href='javascript:void()' class='save-staff-row'>修改</a><a style='margin-left:5px' href='javascript:void()' class='del-staff-row'>删除</a>" 
			                }
			                json.data[i]['sRole'] = tmpRole[json.data[i]['staffRole']];  
			                json.data[i]['sType'] = tmpType[json.data[i]['staffType']];  
			              }
			              return json.data;
				    } 
			       
		        },
		        "drawCallback": function( settings ) {
		        	 $(".del-staff-row").click(function(){
		        		 var rowData = setting.dishStaffTb.row($(this).parents('tr') ).data(); 
		        		 var request = {"method":"sysMananger.deleteStaff",
								   "staff_id":rowData.staffId, 
						     };
							comm.jsonRequest(request, function (ret){ 
							    var data = JSON.parse(ret);
							    if (data.code !== 100) { 
							    	comm.message("管理信息","保持员工失败！",true);	
							    	setting.dishStaffTb.ajax.reload();
							    	return;
							    }
							    comm.message("管理信息","保持员工成功！",true);			  
						   });
				       });
		        	 $(".save-staff-row").click(function(){
		        		 $(".msg-error").remove();
		     		     $("input, select, textarea").each(function(){
		     		    	   $(this).removeClass("input-error")
		     		       })   
			              $(".edit-staff-form")[0].reset();
		     		    initAutocomplete()
		        		 var rowData = setting.dishStaffTb.row($(this).parents('tr') ).data(); 
		        		  comm.loadData(rowData); 
			        	  setting.currentStaff=rowData;
				       });
		        },
		        "columns": [
                   { "data": "staffId" },
                   { "data": "staffAccount" },
                   { "data": "staffName" },
                   { "data": "sRole" },
                   { "data": "storeName" },
                   { "data": "sType" },
                   { "data": "staffPhone" },
                   { "data": "oper"}
               ]
		 }); 
		
    	var request = {};    
		setting.dishStoreTb = $('#setting-store-tb').DataTable({
			 "minHeight":"500px",
			 "scrollY": "540px", 
		     "scrollCollapse": true,
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
		        	"url": comm.jsonServer()+"/sysMananger/qryStoreInfoList",   
			        "contentType": "application/json",
			        "type": "POST",
			        "data": function ( d ) { 
			          return JSON.stringify( d );
			        } ,
			        "dataSrc": function ( json ) { 
			        	var tmpGrade = {2:'高',1:'较高',0:'一般'}
			        	for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
			                json.data[i]['oper'] = "<a style='margin-left:5px' data-toggle='modal' data-target='#edit-store-panel' data-keyboard='false'  href='javascript:void()' class='save-row'>修改</a><a style='margin-left:5px' href='javascript:void()' class='del-row'>删除</a>" 
			                json.data[i]['openAndClose'] = json.data[i]['open']+"--"+json.data[i]['close'];
			                json.data[i]['stGrade'] = tmpGrade[json.data[i]['grade']];                                                                   
			              }
			              return json.data;
				    } 
			       
		        },
		        "drawCallback": function( settings ) {
		        	 $(".del-row").click(function(){
		        		 var rowData = setting.dishStoreTb.row($(this).parents('tr') ).data(); 
		        		 var request = {"method":"sysMananger.deleteStoreInfo",
								   "store_id":rowData.storeId, 
						     };
							comm.jsonRequest(request, function (ret){ 
							    var data = JSON.parse(ret);
							    if (data.code !== 100) {
							    	console.log('保存顾客画像失败.'+data.desc);
							    	comm.message("管理信息","保持门店失败！",true);	
							    	setting.dishStoreTb.ajax.reload();
							    	return;
							    }
							    comm.message("管理信息","保持门店成功！",true);			  
						   });
				       });
		        	 $(".save-row").click(function(){
		        		 $(".msg-error").remove();
		     		    $("input, select, textarea").each(function(){
		     		    	   $(this).removeClass("input-error")
		     		       })  
		     			$(".edit-store-form")[0].reset();
		        		 var rowData = setting.dishStoreTb.row($(this).parents('tr') ).data(); 
		        		 comm.loadData(rowData);
		        		 setting.currentStore=rowData;
				       });
		        },
		        "columns": [
                    { "data": "storeId" },
                    { "data": "storeName" },
                    { "data": "stGrade" },
                    { "data": "address" },
                    { "data": "leader" },
                    { "data": "phone" },
                    { "data": "openAndClose" },
                    { "data": "oper"}
                ]
		 }); 
    }
    
    function initAutocomplete()
	{
    	var request = {"method":"sysMananger.qryStoreInfoList" };
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) {
			    	var obj = {"query":'a'};
			    	obj.suggestions = [];
			    	retObj = data.data;
			    	for(var i in retObj){
			    		tmpObj = {"value":retObj[i]["storeName"],"data":{"id":retObj[i]["storeId"]}};
			    		obj.suggestions.push(tmpObj);
			    	}  
			    	$('#staff_store_name').autocomplete({
				        lookup:   obj.suggestions,
					    minChars: 0,
				        onSelect: function (suggestion) {
				            $("#staff_store_id").val(suggestion.data.id);
				        }
				    });
			    	return;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		}); 
	}
})