define(function(require, exports, module) {
	/**
	 * datas:[{color, text, proportion, data}, {color, text, proportion, data}]
	 */
	exports.makeLegend = function(tip, datas, callback) {
		var cache = new Object();
		var element = "";
		if (typeof cache.legend == 'undefined') {
			cache.legend = {};
			cache.legend.item = [];
			cache.legend.callback = callback || function (data){}
		}
		cache.legend.item.length = 0;
		element = $("#"+tip).get(0);
		$("#"+tip).empty();
		var legendHtml = '<ul class="legend">';
		for (var i = 0; i < datas.length; i++) {
			legendHtml += '<li class="legend-item" style="opacity:1;">';
			/* 生成文字提示 */
			legendHtml += '<div class="legend-item-text">';
			legendHtml += '<div style="float:left;">'+datas[i].text+'</div>';
			datas[i].showProp = (datas[i].showProp == undefined?true:datas[i].showProp);
			legendHtml += '<div style="float:right;">'+(datas[i].showProp?(datas[i].proportion):"")+'</div>'
			legendHtml += '</div>';
			/* 生成占比条 */
			datas[i].proportion = (datas[i].showText == true)?"100%":datas[i].proportion;
			legendHtml += '<div class="legend-item-bar">';
			legendHtml += '<div class="legend-item-bar-mark" itemColor='+datas[i].color+' style="width:'+datas[i].proportion+';background-color:'+datas[i].color+'"></div>';
			legendHtml += '</div>';
			legendHtml += '</li>'
			datas[i].select = true;
			cache.legend.item.push(datas[i]);
		}
		legendHtml += '</ul>';
		/* 将legend添加到网页 */
		$("#"+tip).append(legendHtml);
		/* 重新添加click事件 */
		$('.legend-item').unbind()
		$(".legend-item").click(function(){
			var select;
			var callBackData = [];
			if ($(this).css("opacity") == "1") {
				$(this).css("opacity","0.65");
				select = false;
			} else {
				$(this).css("opacity","1");
				select = true;
			}
			var thisColor = $(this).children().next().children().attr("itemColor");
			for (var i = 0; i < cache.legend.item.length ; i++) {
				if (cache.legend.item[i].color == thisColor) {
					cache.legend.item[i].select = select;
				}
				if (cache.legend.item[i].select) {
					callBackData.push(cache.legend.item[i]);
				}
			}
			cache.legend.callback(callBackData);
		})
	}

	/*
	var test=[
		{'color':'#7AB900','text':'进入区域数[1]','proportion':'20%','data':'dfaff11'},
		{'color':'#FF5500','text':'进入区域数[1-5]','proportion':'70%','data':'dfaff22'},
		{'color':'#B848FF','text':'进入区域数[5-10]','proportion':'45%','data':'dfaff33'},
		{'color':'#FF4848', 'text':'进入区域数[10-15]', 'proportion':'35%', 'data':"adsdf44"}];
	makelegend("tip",test,function (datas){
		console.log(JSON.stringify(datas));
	});
	*/
})
