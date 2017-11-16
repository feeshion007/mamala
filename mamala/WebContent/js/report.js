define(function(require, report, module){
	var comm = require('../js/modules/common/common.js');
	var util = require('../js/modules/common/util.js');

	function init() {
		//$('.content').load($(this).attr('url')+"?"+new Date().getTime());
		$('.right-box').css("width",($(".content").width()-300)+"px");
		initEvent();
	}
	report.init = init;
	
	function initEvent()
	{ 
		$("#dine_start_time").val(TimeUtil.getPreDate(1).format('yyyy-MM-dd hh:mm'));
		$("#dine_end_time").val(new Date().format('yyyy-MM-dd hh:mm'));
		$( "#box-menu" ).menu();
		$("#box-menu li").click(function(){  
			$("#box-menu li").removeClass("ui-menu-click");
			$(this).addClass("ui-menu-click"); 
			$(".reports").css('display','none');
			var currentTab = "#"+$(this).attr("target")
			$(currentTab).css("display",'block');
						
			var request = {"method":"reportController."+$(this).attr("target"),"store_id":$("#store-select").val(),'start_time':$("#dine_start_time").val(),'end_time':$("#dine_end_time").val()};
			comm.jsonRequest(request, function (ret){ 
			    var data = JSON.parse(ret); 
			    if (data.code == 100) {
			    	if(currentTab=="#qryDayReportList"){
			    		$(".report-remove").remove();
			    		var dayDebay=0,dayPay = 0,dayTotal =0;
			    		for(var i in data.data){
			    			var report = data.data[i];
			    			var tr = "<div class='report-day-tr report-remove'>"+
							              "<span>"+report.day+"</span>"+
							              "<span>"+report.debayMoney+"</span>"+
							              "<span>"+report.payMoney+"</span>"+
							              "<span>"+report.totalMoney+"</span>"+
							           "</div>";
			    			dayDebay+=report.debayMoney;
			    			dayPay+=report.payMoney;
			    			dayTotal+=report.totalMoney;
			    			$(currentTab).find(".report-center").append(tr)
			    		}
			    		$("#day-debay").html(dayDebay)
			    		$("#day-pay").html(dayPay)
			    		$("#day-total").html(dayTotal)
			    	}else if(currentTab=="#qryDishReportList"){
			    		$(".report-remove").remove();
			    		for(var i in data.data){
			    			var report = data.data[i];
			    			var tr = "<div class='report-dish-tr report-remove'>"+
							              "<span style='width:106px;text-align:left;padding-left:10px;'>"+report.dishName+"</span>"+
							              "<span>"+report.totalCount+"</span>"+
							              "<span>"+report.totalBackCount+"</span>"+
							              "<span>"+report.totalGiveCount+"</span>"+
							           "</div>";
			    			$(currentTab).find(".report-list").append(tr)
			    		}
			    	}else{
			    		$(currentTab).find("em").each(function(){
				    		$(this).html(Math.abs(data.data[$(this).attr("id")]));
				    	})
			    	}
			    	$(currentTab).find(".print-time").html(new Date().format('yyyy-MM-dd hh:mm:ss'))
			    	$(".start-time").html($("#dine_start_time").val())
			    	$(".end-time").html($("#dine_end_time").val())
			    	return;
			    }
			    comm.message("管理信息","保持门店成功！",true);			  
		    }); 
		});
		
		$(".header").click();
		$(".order-qry-btn").click(function(){
			$(".ui-menu-click").click();
		})
		
	} 
})