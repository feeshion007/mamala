define(function(require, exports, module){
	var comm = require('../js/modules/common/common.js');
	exports.init = function() {
//		var el = document.documentElement; 
//	     var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen; 
//	     if (typeof rfs != "undefined" && rfs) { 
//	              rfs.call(el); 
//	      } else if(typeof window.ActiveXObject != "undefined"){
//	         var wscript = new ActiveXObject("WScript.Shell");
//	         if (wscript!=null) { 
//	                wscript.SendKeys("{F11}"); 
//	         }
//	     }  
//	     
        window.onresize = function(){
        	
        };
		initEvent(); 
		if($.cookie("userName")!=null&&$.cookie("userName")!=undefined){
			$("#remember-me").attr("checked", true);
			$("#user_txt").val($.cookie("userName"));
			$("#pass_txt").val($.cookie("passWord"));
		}
	};
	function loginCallBack(ret) {
		var data = JSON.parse(ret);
		var loginUser = data.content.loginUser;
		var loginCode = data.content.code;
		if(loginCode == 100) {
            $.cookie("loginUser", ret);
            console.log(ret)
            $("#login-stat").html("");
            /*
            if (loginUser.userName == 'admin'){
            	document.location.href="page/uploader-svg.html";
            } else {
            	document.location.href="page/main.html";
            }
            */
            document.location.href="page/main.html";
            return true;
		} else {
			$.cookie("userName", '', { expires: -1 });
			$.cookie("passWord", '', { expires: -1 });
			$(".tipmessage").html("用户名或密码错误!");
		}
	};
	function initEvent() {
		//登录
		$(".login-btn").click( function() {
			var username = $("#user_txt").val();
			var password = $("#pass_txt").val();
			if($("#remember-me").prop('checked') ){
				$.cookie("userName", username, { expires: 7 }); // 存储一个带7天期限的 cookie
				$.cookie("passWord", password, { expires: 7 });
			} else {
				$.cookie("userName", username, { expires: -1 }); // 存储一个带7天期限的 cookie
				$.cookie("passWord", password, { expires: -1 });
			}
			var request = {"method":"userManage.userLogin",
						   "userName":username,
						   "password":$.md5(password),
						  };
			comm.jsonRequest(request, loginCallBack, false);
		});

		//回车事件
		$(document).keydown(function(e){					
			 var e = e || event,
			 keycode = e.which || e.keyCode;
			 if (keycode==13) {
			 	var act = document.activeElement;
			 	$(".login-btn").trigger("click");						  
			 }
		});
	} 
});