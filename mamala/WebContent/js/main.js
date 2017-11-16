define(function(require, exports, module){
	var comm = require('../js/modules/common/common.js');

	function init() {
		//$('.content').load($(this).attr('url')+"?"+new Date().getTime());
		initEvent();
	}
	
	function initEvent()
	{
		var user = $.cookie("loginUser");
		var data = JSON.parse(user);
		if(data.content.loginUser.roleID!=0 && data.content.loginUser.roleID!=4){
			$(".setting").hide(); 
			$(".nav-item[type=cookbook]").hide(); 
			$(".nav-item[type=member]").hide(); 
			$(".nav-item[type=report]").hide(); 
		}
		$('.nav-item').click(function(){ 
			$('.nav-item').removeClass('select');   
			$('.nav-item').removeClass('unselect');
			$('.nav-item').addClass('unselect');
			$(this).addClass('select'); $(this).removeClass('unselect'); 
			//$.cookie("menuSel", $(this).attr('url'));
			$('.content').load($(this).attr('url')+"?"+new Date().getTime());
		})
		
		$(".quit").click(function() {
	            comm.jsonRequest({"method":"userManage.userLogout"},
	                function (){
	                    $.cookie("loginUser" ,"",{ expires: -1 });
	                    window.location.href = "../login.html";
	                });
	    });
		$(".setting").click(function() {
			$('.content').load("./setting.html?"+new Date().getTime());
			$(".nav-item").removeClass("select");
			$(".nav-item").removeClass("unselect");
			$(".nav-item").addClass("unselect");
         });
		$(".help").click(function() {
			var back =  $.confirm({
			      body: "<iv style='margin: 30px'>版权所有：Mamala餐饮营销公司 2016-2020</div>"
			      ,hasfoot:false
			      ,height: 10
			      ,width: 400
			      ,title:"版权声明"
			});
         });
		$(".passwd").click(function() {
			$(".password-form")[0].reset();
			$(".msg-error").remove();
		    $(".password-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
         });
		$('.confirm-pwd').click(function(){ 
			var oldPass= $('#oldPass').val();
	        var newPass= $('#newPass').val();
	        var confirmPass= $('#confirmPass').val();
	        var newName= $('#newName').val();
	        $(".msg-error").remove();
		       $(".password-form").find("input, select, textarea").each(function(){
		    	   $(this).removeClass("input-error")
		     })
			$(".password-form").find("input, select, textarea").focus();
			$(".password-form").find("input, select, textarea").blur();
			var ok = ($(".msg-error").length>0);
			if(ok) return !ok;
			
//	        if(newName==""||newName==undefined){
//	            $('#errorMsg').html($.i18n.prop('error_input_username_please'));
//	            return;
//	        } 
	        var request = {
	            method : "userManage.updatePassword",
	           // userName:newName,
	            oldPass:$.md5(oldPass),
	            newPass:$.md5(newPass)
	        }
	        comm.jsonRequest(request,function(){return true;});
	        
		})
		$(document).bind("click",function(){
			$(".user-center").hide();
		})
		$('.content').css("height",($(document.body).height()-$('.nav-box').height()-2)+"px");
		$('.content').css("width",$(document.body).width()+"px");
		$('.nav-box').css("width",$(document.body).width()+"px");
		var navWidth = $('.nav-box').width();
		if(navWidth<1000){
		   $(".user").css("position","absolute");
		   $(".user").css("margin-top","5px");
		   $(".user").css("margin-left","-36px"); 
		   $(".nav-bar .nav-item").css("width","100px");
		}
		
		loadUserInfo();
		loadStoreInfo()
		
	}
	exports.init = init;
	function loadUserInfo()
	{
		var user = $.cookie("loginUser");
		var data = JSON.parse(user);
		$(".user").html("<a href='#' class='' style='color:#fff;text-decoration: underline;'>欢迎您:"+data.content.loginUser.name+"<lable>▼</lable></a> 来到");
		$(".user").attr("username",data.content.loginUser.name);
		$(".user").click(function(e){ 
	    	$(".user-center").css("top",$(e.target).offset().top+15);
	    	$(".user-center").css("left",$(e.target).offset().left);
	    	$(".user-center").show();
	    	e.stopPropagation(); 
	    })
	}
	function loadStoreInfo()
	{
		var request = {"method":"sysMananger.qryStoreInfoList"}
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret);
			    if (data.code !== 100) { 
			    	comm.message("管理信息","保持员工失败！",true);	
			    	$(".store").empty();
			    	var storeStr ="<select id='store-select'  >";
			    	var store = data.data;
			    	for(var i in store){
			    		storeStr += "<option value='"+store[i]['storeId']+"'>"+store[i]['storeName']+"</otpion>";
			    	}
			    	storeStr+="</select>";
			    	$(".store").append(storeStr);
			    	$('.content').load("./desktop.html?"+new Date().getTime());
			    	$("#store-select").change(function(){
			    		$('.content').load($(".nav-bar .select").attr('url')+"?"+new Date().getTime());
			    	})
			    	return;
			    }
			    comm.message("管理信息","保持员工成功！",true);			  
		});
	}
})