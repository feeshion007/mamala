define(function(require, cookbook, module){
	var comm = require('../js/modules/common/common.js');

	function init() { 
		initEvent();
		initTable();
		initAutocomplete();
		
	}
	cookbook.init = init;
	
	function initEvent()
	{  
		$('.cookbook-list-box').css("width",($(".content").width()-305)+"px");
		$('.cookbook-type-box').css("height",($(".content").height())+"px");
		$('.cookbook-list-box').css("height",($(".content").height()-20)+"px"); 
		cookbook.dishSetDishRelations={};
		
		$(".edit-dishType-btn").click(function(){
			var data = cookbook.dishTypeTb.data(); 
			 for(var i in data){
				 if(data[i].dishTypeName == $("#dish_type_name").val() ){
					 if(cookbook.currentDishType && cookbook.currentDishType.dishTypeName ==  $("#dish_type_name").val()){
					 }else{
						 alert("菜品类型名称已存在，请重新命名!");
						 return false;
					 } 
				 }
			 }
			 
			$(".msg-error").remove();
		    $(".edit-dishType-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
		    
			$(".edit-dishType-form").find("input, select, textarea").focus();
			$(".edit-dishType-form").find("input, select, textarea").blur();
			 if($("#dish_type_set").val()!=2){
				 $("#dish_unit_price").parent().find(".msg-error").remove();
		    	 $("#dish_unit_price").removeClass("input-error")
		     }
			$(".dropdown-menu").hide();
			 
			var ok = ($(".msg-error").length<=0); 
			if(!ok) return ok;
			
			
			var request = {"method":"dishController.editDishType",
					   "dish_type_id":$("#dish_type_id").val(),
					   "dish_type_name":$("#dish_type_name").val(),
					   "dish_type":$("#dish_type").val(),
					   "dish_type_set":$("#dish_type_set").val(),
					   "dish_using_range":$("#dish_using_range").val(),
					   "dish_unit_price":$("#dish_unit_price").val(),
					   "status":$("#dish_status").val(),
					   "store_id" : $("#store-select").val(),
					   "relations":cookbook.dishSetDishRelations
				    };
				comm.jsonRequest(request, function (ret){ 
				    var data = JSON.parse(ret);
				    if (data.code !== 100) {
				    	console.log('保存顾客画像失败.'+data.desc);
				    	comm.message("管理信息","保持门店失败！",true);	
				    	cookbook.dishTypeTb.ajax.reload();
				    	return;
				    }
				    comm.message("管理信息","保持门店成功！",true);			  
			   });
		})
		$(".edit-dish-btn").click(function(){
			var data = cookbook.dishTb.data(); 
			 for(var i in data){
				 if(data[i].dishName == $("#dish_name").val() ){
					 if(cookbook.currentDish && cookbook.currentDish.dishName ==  $("#dish_name").val()){
					 }else{
						 alert("菜品名称已存在，请重新命名!");
						 return false;
					 }
					
				 }
			 }
			  
			$(".msg-error").remove();
		       $(".edit-dish-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".edit-dish-form").find("input, select, textarea").focus();
			$(".edit-dish-form").find("input, select, textarea").blur();
			$(".dropdown-menu").hide();
			var ok = ($(".msg-error").length<=0); 
			if(!ok) return ok;
			var request = {"method":"dishController.editDish",
					   "dish_id":$("#dish_id").val(),
					   "dish_name":$("#dish_name").val(),
					   "dish_name_pinyin":$("#dish_name_pinyin").val(),
					   "dish_name_eng":$("#dish_name_eng").val(),
					   "dish_type_id":$("#dish_dish_type_id").val(),
					   "dish_type_name":$("#dish_dish_type_name").val(),
					   "dish_alias":$("#dish_alias").val(),
					   "dish_price":$("#dish_price").val(),
					   "dish_unit":$("#dish_unit").val(),
					   "dish_cost":$("#dish_cost").val(),
					   "dish_taste":$("#dish_taste").val(),
					   "dish_canbe_set":$("#dish_canbe_set").val(),
					   "dish_canbe_discount":$("#dish_canbe_discount").val(),
					   "dish_canbe_give":$("#dish_canbe_give").val(),
					   "dish_disabled":$("#dish_disabled").val(),
					   "dish_remarks":$("#dish_remarks").val(),
					   "store_id" : $("#store-select").val()
				    };
				comm.jsonRequest(request, function (ret){ 
				    var data = JSON.parse(ret);
				    if (data.code !== 100) {
				    	console.log('保存顾客画像失败.'+data.desc);
				    	comm.message("管理信息","保持门店失败！",true);	
				    	cookbook.dishTb.ajax.reload();
				    	return;
				    }
				    comm.message("管理信息","保持门店成功！",true);			  
			   });
		})	
		$(".sui-tag li").click(function(){  
			if($(this).attr("value")==2){
	    		$(".dish-price-line").show();
	    	}else {
	    		$(".dish-price-line").hide();
	    	}
		    if($(this).attr("value")==2 || $(this).attr("value")==4){ 
		    	$(".sui-tag li").removeClass("tag-selected")
		    	$(this).toggleClass("tag-selected","");
		    	$("#dish_using_range").val($(this).attr("value")); 
		    	comm.loadData({"dishTypeSet":$(this).attr("value")}); 
		    	
		    	cookbook.dishSetDishRelations ={}
		    	$("#dish-setdish-div").show();
		    	$("#edit-dishType-panel").css("margin-left","-370px");
		    	if(cookbook.setDishTb.ajax)cookbook.setDishTb.ajax.reload();		    	
		    }else if($(this).attr("value")==1 || $(this).attr("value")==3){
		    	$(".sui-tag li[value=2]").removeClass("tag-selected");
		    	$(".sui-tag li[value=4]").removeClass("tag-selected");
		    	if($(this).hasClass("tag-selected")){
		    	   var val = $(this).attr("value")==1?3:1;
		    	   if($(".sui-tag li[value="+val+"]").hasClass("tag-selected")){
		    		   $("#dish_using_range").val(val); 
		    	   }else{
		    		   $("#dish_using_range").val(''); 
		    	   }
		    	}else{
		    		var val = $(this).attr("value")==1?3:1;
		    	    if($(".sui-tag li[value="+val+"]").hasClass("tag-selected")){
		    		    $("#dish_using_range").val(13); 
		    	    }else{
		    		    $("#dish_using_range").val($(this).attr("value")); 
		    	    }
		    	}
		    	$(this).toggleClass("tag-selected",""); 
		    	comm.loadData({"dishTypeSet":1}); 
		    	$("#edit-dishType-panel").css("margin-left","-300px")
		    	$("#dish-setdish-div").hide();
		    	
		    } 
		}) 
		$(".edit-dishType-form").validate(); 
		$(".edit-dish-form").validate(); 
		$(".new-dish-btn").click(function(){
			$(".edit-dish-form")[0].reset();
			$(".msg-error").remove();
			cookbook.currentDish = null;
		       $("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		       }) 
		     $(".edit-dish-form")[0].reset();
		     initAutocomplete("dishController.qryDishTypeList","dishTypeName","dishTypeId","#dish_dish_type_name","#dish_dish_type_id",0) 
      		 
		});
		
		$(".new-dishType-btn").click(function(){
			$(".edit-dishType-form")[0].reset();
			$(".msg-error").remove();
			cookbook.currentDishType = null;
		       $("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		       }) 
			$(".edit-dishType-form")[0].reset();
			$("#dish-setdish-div").hide();
			$(".sui-tag li").removeClass("tag-selected"); 
	    	$(".sui-tag li[value=1]").addClass("tag-selected");
	    	$(".sui-tag li[value=3]").addClass("tag-selected");
	    	$("#dish_using_range").val("13");
	    	comm.loadData({"dishTypeSet":1}); 
		}); 
	}
	  
	
	function initTable()
	{
		cookbook.dishTypeTb =$('#dish-type-tb').DataTable({
			 "minHeight":"500px",
			 "scrollY": ($(".content").height()-100)+"px", 
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
		        	"url": comm.jsonServer()+"/dishController/qryDishTypeList",   
			        "contentType": "application/json",
			        "type": "POST",
			        "data": function ( d ) { 
		        	  d.store_id = $("#store-select").val();
			          return JSON.stringify( d );
			        } ,
			        "dataSrc": function ( json ) {  
			        	var tmpTypeSet = {2:"套餐",1:"普通",4:"赠送",3:"普通"}
			        	for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
			                json.data[i]['oper'] = "<a style='margin-left:5px' data-toggle='modal' data-target='#edit-dishType-panel' data-keyboard='false'  href='javascript:void()' class='save-dishType-row'>修改</a><a style='margin-left:5px' href='javascript:void()' class='del-dishType-row'>删除</a>" 
			                json.data[i]['typeAndName'] =  json.data[i]['dishTypeName'];
			                json.data[i]['setOrgive'] = tmpTypeSet[json.data[i]['dishTypeSet']]; 
			        	}
			              return json.data;
				    } 
			       
		        },
		        "drawCallback": function( settings ) {
		        	 $(".del-dishType-row").click(function(){
		        		 var rowData = cookbook.dishTypeTb.row($(this).parents('tr') ).data(); 
		        		 var request = {"method":"dishController.deleteDishType",
								   "dish_type_id":rowData.dishTypeId, 
						     };
							comm.jsonRequest(request, function (ret){ 
							    var data = JSON.parse(ret);
							    if (data.code !== 100) { 
							    	comm.message("管理信息","保存菜单类型失败！",true);	
							    	cookbook.dishTypeTb.ajax.reload();
							    	return;
							    }
							    comm.message("管理信息","保存菜单类型成功！",true);			  
						   });
				       });
		        	 $(".save-dishType-row").click(function(){  
		        		 $(".msg-error").remove();
		  		         $("input, select, textarea").each(function(){
		  		    	     $(this).removeClass("input-error")
		  		         }) 
		        		 var rowData = cookbook.dishTypeTb.row($(this).parents('tr') ).data();  
		  		         cookbook.currentDishType =rowData
		        		 comm.loadData(rowData);
		        		 $(".sui-tag li").removeClass("tag-selected");
		        		 if(rowData.dishUsingRange == 13 || rowData.dishUsingRange==31){
		        			 $(".sui-tag li[value=1]").click();
		        			 $(".sui-tag li[value=3]").click();
		        		 }else{
		        			 $(".sui-tag li[value="+rowData.dishUsingRange+"]").click();
		        		 }  
				     });
		        },
		        "columns": [
                   { "data": "typeAndName" },
                   { "data": "setOrgive" },
                   { "data": "oper"}
               ]
		 });  
		
		cookbook.dishTb = $('#dish-tb').DataTable({
			 "minHeight":"500px",
			 "scrollY": ($(".content").height()-120)+"px", 
			 "scrollX": true,
		     "scrollCollapse": true,
		     "searching": false, 
		     "lengthChange": false,
		     "pageLength":50,
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
		        	"url": comm.jsonServer()+"/dishController/qryDishList",    
			        "contentType": "application/json",
			        "type": "POST",
			        "data": function ( d ) { 
		        	 d.store_id = $("#store-select").val();
			          return JSON.stringify( d );
			        } ,
			        "dataSrc": function ( json ) { 
			        	var tmpDishTaste = {5:'麻',4:'重辣',3:'辣',2:'不辣',1:'微辣'}
			        	var tmpDishUnit ={11:'只',10:'串',9:'千克',8:'克',7:'打',6:'盘',5:'瓶',4:'个',3:'根',2:'份',1:'斤'};
			        	var tmpDishCanbeSet = {2:'可套餐',1:'不可套餐'}
			        	var tmpDishCanbeGive = {2:'可赠送',1:'不可赠送'}
			        	var tmpDishCanbeDiscount = {2:'可打折',1:'不可打折'}
			        	var tmpDishDisabled = {2:'启用',1:'禁用'}
			        	for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
			                json.data[i]['oper'] = "<a style='margin-left:5px' data-toggle='modal' data-target='#edit-dish-panel' data-keyboard='false'  href='javascript:void()' class='save-staff-row'>修改</a><a style='margin-left:5px' href='javascript:void()' class='del-staff-row'>删除</a>" 
			                json.data[i]['tmpDishTaste'] = tmpDishTaste[json.data[i]['dishTaste']];
			                json.data[i]['tmpDishUnit'] = tmpDishUnit[json.data[i]['dishUnit']];
			                json.data[i]['tmpDishCanbeSet'] = tmpDishCanbeSet[json.data[i]['dishCanbeSet']];
			                json.data[i]['tmpDishCanbeGive'] = tmpDishCanbeGive[json.data[i]['dishCanbeGive']];
			                json.data[i]['tmpDishCanbeDiscount'] = tmpDishCanbeDiscount[json.data[i]['dishCanbeDiscount']];
			                json.data[i]['tmpDishDisabled'] = tmpDishDisabled[json.data[i]['dishDisabled']];
			                json.data[i]['dishDishTypeId'] = json.data[i]['dishTypeId'];
			                json.data[i]['dishDishTypeName'] = json.data[i]['dishTypeName'];
			              }
			              return json.data;
				    } 
			       
		        },
		        "drawCallback": function( settings ) {
		        	 $(".del-staff-row").click(function(){
		        		 var rowData = cookbook.dishTb.row($(this).parents('tr') ).data(); 
		        		 var request = {"method":"dishController.deleteDish",
								   "dish_id":rowData.dishId, 
						     };
							comm.jsonRequest(request, function (ret){ 
							    var data = JSON.parse(ret);
							    if (data.code !== 100) { 
							    	comm.message("管理信息","保持员工失败！",true);	
							    	cookbook.dishTb.ajax.reload();
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
			  		     initAutocomplete();
		        		 var request = {"method":"dishController.qryDishTypeList" ,"dish_type_set":1};
			 				comm.jsonRequest(request, function (ret){ 
			 				    var data = JSON.parse(ret);
			 				    if (data.code !== 100) {
			 				    	var obj = {"query":'a'};
			 				    	obj.suggestions = [];
			 				    	retObj = data.data;
			 				    	for(var i in retObj){
			 				    		tmpObj = {"value":retObj[i]["dishTypeName"],"data":{"id":retObj[i]["dishTypeId"]}};
			 				    		obj.suggestions.push(tmpObj);
			 				    	}  
			 				    	$('#dish_dish_type_name').autocomplete({
			 					        lookup:   obj.suggestions,
			 						    minChars: 0,
			 					        onSelect: function (suggestion) {
			 					            $("#dish_dish_type_id").val(suggestion.data.id);
			 					        }
			 					    });
			 				    	return;
			 				    }
			 				    comm.message("管理信息","保持门店成功！",true);			  
			 			   }); 
		        		 var rowData = cookbook.dishTb.row($(this).parents('tr') ).data(); 
		        		 comm.loadData(rowData);
		        		 cookbook.currentDish =rowData
				       });
		        },
		        "columns": [
		           { "data": "oper"},
                   { "data": "dishId" },
                   { "data": "dishName" },
                   { "data": "dishNameEng" },
                   { "data": "dishNamePinyin"},
                   { "data": "dishTypeName" },
                   { "data": "dishAlias" },
                   { "data": "dishPrice" },
                   { "data": "tmpDishUnit" },
                   { "data": "dishCost" }, 
                   { "data": "tmpDishTaste" },
                   { "data": "tmpDishCanbeSet" },
                   { "data": "tmpDishCanbeDiscount" },
                   { "data": "tmpDishCanbeGive" },
                   { "data": "tmpDishDisabled" },
                   { "data": "dishRemarks" }                  
               ] 
		 });
		cookbook.setDishTb = $('#dish-setdish-tb').DataTable({
			 "minHeight":"300px",
			 "scrollY": "460px", 
			 "scrollX": true,
		     "scrollCollapse": true,
		     "searching": false, 
		     "lengthChange": false,
		     "paging": false,"ordering": false,
		     "info": false,
		        "processing": true, 
		        "serverSide": true,//打开后台分页  
		        "ajax":{
		        	"url": comm.jsonServer()+"/dishController/qrySetDishRelation",    
			        "contentType": "application/json",
			        "type": "POST",
			        "data": function ( d ) { 
			          d.set_id = '';
			          d.dish_type_id = $("#dish_type_id").val(); 
			          d.dish_type_set = $("#dish_type_set").val();
			          d.dish_canbe_give = ($("#dish_type_set").val()==4)? 2 :0;
			          d.dish_canbe_set = ($("#dish_type_set").val()==2)? 2 :0;
			          d.store_id = $("#store-select").val();
			          return JSON.stringify( d );
			        } ,
			        "dataSrc": function ( json ) {  
			        	for ( var i=0, ien=json.data.length ; i<ien ; i++ ) {
			                json.data[i]['oper'] = "<a style='margin-left:5px' href='javascript:void()' class='add-setdish-row'>增加</a><a style='margin-left:5px' href='javascript:void()' class='del-setdish-row'>减少</a>" 
			                json.data[i]['tmpCount'] =(json.data[i]['count']<1)?'未选择':json.data[i]['count']; 
			        	}
			            return json.data;
				    }  
		        },
		        "drawCallback": function( settings ) {
		        	 $(".add-setdish-row").click(function(){  
		        		 var tr = $(this).closest("tr");
		        		 fillSetDishRelations(tr,true);
				      });
		        	 $(".del-setdish-row").click(function(){ 
		        		 var tr = $(this).closest("tr");
		        		 fillSetDishRelations(tr);//cookbook.setDishTb.row( tr ).data( d ).draw(); 
				      });
		        	 
		        },
		        "columns": [ 
                  { "data": "dishName" },
                  { "data": "tmpCount" },
                  { "data": "oper"}
              ] 
		 });

		$("#dish-setdish-div .dataTables_scrollHead th").css("background-color","#e6e6e6");
		$("#dish-setdish-div .dataTables_scrollHead th").css("border-left","solid 2px #dedede");
		$("#dish-setdish-div .dataTables_scrollBody td").css("border-left","solid 2px #dedede");
	    
		$('.cookbook-list-box .dataTables_wrapper').css("height",($(".content").height()-20)+"px"); 
		$('.cookbook-list-box .dataTables_scrollBody').css("height",($(".content").height()-100)+"px"); 
		      
	}   
	function fillSetDishRelations(tr,isAdd)
	{
		 var relation = cookbook.setDishTb.row( tr ).data(); 
		 if(isAdd){
			 if(ValidateRules.isInteger(relation.count)) {
				 relation.count+=1; 
			 }else{
				 relation.count=1;  
			 }			
		 }else{
			 if(ValidateRules.isInteger(relation.count)) {
				 if(relation.count<=1){
					 relation.count ='未选择'
				 }else{
					 relation.count-=1; 
				 }
			 } 
		 }
		 tr.find("td:eq(1)").text(relation.count) 		
		 
		var dishTypeId=($("#dish_type_id").val()==""||$("#dish_type_id").val()==null)?0:$("#dish_type_id").val(); 
		if(relation.count=='未选择'){
			cookbook.dishSetDishRelations[relation.dishId]={setId:relation.setId,dishId:0,dishName:'',dishTypeId:0,count:0};
		}else{
			cookbook.dishSetDishRelations[relation.dishId]={setId:relation.setId,dishId:relation.dishId,dishName:relation.dishName,dishTypeId:dishTypeId,count:relation.count};
		}
		                                                                          
		
//		var request = {"method":"dishController.addSetDishRelation" ,"dish_type_set":1};
//		comm.jsonRequest(request, function (ret){ 
//		    var data = JSON.parse(ret);
//		    if (data.code !== 100) { 
//		    	return;
//		    }
//		    comm.message("管理信息","保持门店成功！",true);			  
//	   }); 
	}

	function initAutocomplete(method,keyName,valName,keyElem,valElem,selfval)
	{
		var request = {"method":method ,"dish_type_set":1, "store_id" : $("#store-select").val()}; 
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
		    		cookbook.comp = $(keyElem).autocomplete({
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
	
	function editSetDishRelation(data)
	{
		var request = {"method":"dishController.editSetDishRelation" };
		comm.jsonRequest(request, function (ret){ 
		    var data = JSON.parse(ret);
		    if (data.code !== 100) {
		    	 
		    	return;
		    }
		    comm.message("管理信息","保持门店成功！",true);			  
	   }); 
	}
})