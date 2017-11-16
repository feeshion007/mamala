/**
 * 定义地图类
 * @author Cwy
 * 
 * @param mapSvgUrl 地图Svg Url
 * @param mapId     地图容器Div ID
 * @param hasCanvas 地图是否有画板 默认false
 * @param hasHeatmap 地图是否有热力图 默认为ture
 * @param mapLegendId 地图图例Div ID
 * @param loadedFunc  加载完毕后的回调接口
 * 
 * 对外接口：
 * init() 初始化Map
 * changeMapSvg() 切换Svg背景
 */
Map = function(opt) {
	this.opt = opt;
	this.initParam();
};

Map.prototype = {
	/**
	 * 初始化地图
	 */
	init : function() {
		var self = this;
		$("<img/>").attr("src", self.mapSvgUrl).load(function() {
			// 初始化页面表现
			self._initView(this);

			// 地图初始化事件
			self._initEvent();
		});
	},
	
	/**
	 * 初始化参数 
	 */
	initParam: function() {
		// 地图的尺寸用于缩放
		this._sourceWidth = 0;
		this._sourceHeight = 0;
		this._nowScale = 0;
		this._mapSize = 0;
		
		// 地图Svg背景地址
		this.mapSvgUrl = "";
		
		// 地图ID
		this.mapId = "map_contain_div";
		
		// map中是否含有canvas
		this.hasCanvas = false;
		
		// map中是否有热力图
		this.hasHeatmap = false;
		
		// map中图例的块、宽高
		this.mapLegendId = "";
		
		 // 回调函数接口
	    this.loadedFunc = null;
		
		// 地图现在的宽度
		this.nowWidth = 0;
		
		// 地图现在的高度
		this.nowHeight = 0;
		
		// 地图现在的放大系数
		this.nowMultiple = 1;
		
		// map中的Canvas默认ID为private_map_canvas
		this.mapCanvasId = "private_map_canvas";
		
		// 地图中图例的宽和高
		this.mapLegendWidth = this.opt.legendWidth||185;
		this.mapLegendHeight = this.opt.legendHeight||130;
		
		// 热力图对象
	    this.heatmap = null;
	    
	    // 热力图中的半径参数
	    this.heatradius = 10;
	    
	    // 是否全屏
	    this.zoom2FullScreen = false;
	    
		this.opt = this.opt || {};
		$.extend(this, this.opt);
	},

	/**
	 * 初始化地图的页面表现
	 */
	_initView : function(image) {
		// 初始化框架的页面元素
		$("#" + this.mapId).css({"position":"relative","overflow":"hidden"});
		$("#private_map_div").remove();
		$("#" + this.mapId).append("<div id='private_map_div' class='ui-widget-content'></div>");
		
		// 根据地图容器DIV初始的宽高、SVG图片的宽高确定下放大的系数和实际显示宽高大小
		var mapDivWidth = $("#" + this.mapId).width();
		var mapDivHeight = $("#" + this.mapId).height();
		var multiple = mapDivWidth/image.width; 
		if(multiple >2){
			multiple = 1;
		}else if(multiple < 0.5){
			multiple = 1;
		}
		
		// 确定宽、高、Top、Left等位置参数
	    var width = image.width * multiple;
		var height = image.height * multiple;
		var mapTop = 0;
		var mapLeft = (mapDivWidth - width) / 2;
							
		// 设定地图Div的宽和高
		this._sourceWidth = this.nowWidth = width;
		this._sourceHeight = this.nowHeight = height;
		$("#private_map_div").width(this.nowWidth);
		$("#private_map_div").height(this.nowHeight);
			
		// 设定地图Div的背景；设定地图Div的Top、Left
		this._mapSize =  this.nowWidth + "px " + this.nowHeight + "px";
		$("#private_map_div").css({'background':'url('+ this.mapSvgUrl + ')', 'background-size':this._mapSize, 'background-repeat':'no-repeat', 'top':mapTop,'left':mapLeft});

		// 设定地图Div中热力图画板的大小和位置
	    $("#private_map_div").append("<canvas id='private_map_area_canvas'></canvas>");
		$("#private_map_area_canvas").attr("width", this.nowWidth);
	    $("#private_map_area_canvas").attr("height", this.nowHeight);
		$("#private_map_area_canvas").css({'position': 'absolute','z-index': 1000});
		
		// 如果有画布，则增加画布，设定下画布的大小
		if (this.hasCanvas) {
			$("#private_map_div").append("<canvas id='private_map_canvas'></canvas>");
			$("#private_map_canvas").attr("width", this.nowWidth);
		    $("#private_map_canvas").attr("height", this.nowHeight);
			$("#private_map_canvas").css({'position': 'absolute','z-index': 100});
		}
		
		// 如果有SVG
		if (this.hasSvg) {
            $("#private_map_div").append('<svg currentScale="1" width='+this.nowWidth+' height='+this.nowHeight+' version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>');
        }
		
		// 如果有热力图
		if (this.hasHeatmap) {
			this.heatmap = h337.create({
				element: $("#private_map_div")[0], 
				"radius":this.heatradius, 
				"visible":true, 
				gradient:{ "0.05": "#000",  "0.25": "rgb(0,255,255)", "0.50": "rgb(0,255,0)", "0.75": "yellow", "1": "rgb(255,0,0)"}
		    });
		}

		// 如果有图例
		if (this.mapLegendId != "") {
			var mapLegendHtml = $("#" + this.mapLegendId).html();
			// 将页面上这个图例内容这个节点删除
			$("#" + this.mapLegendId).remove();
			 
			$("#" + this.mapId).append("<div id='map_legend_div' class='map-legend-backgroud'></div>"
					+ "<div id='map_legend_content_div' class='map-legend-content'></div>");
			$("#map_legend_content_div").html(mapLegendHtml);
					
			// 得到显示地图的块的宽和高
			var mapDivWidth = $("#" + this.mapId).width();
			var mapDivHeight = $("#" + this.mapId).height();
			
		    // 初始化地图图例样式
			var mapLegendLeft = mapDivWidth - this.mapLegendWidth;
			var mapLegendTop = mapDivHeight - this.mapLegendHeight;
			$('#map_legend_div').css({'width':this.mapLegendWidth, 'height':this.mapLegendHeight, 'position':'absolute', 'top':0, 'right':0, 'background-color':'black'});
			$('#map_legend_content_div').css({'width':this.mapLegendWidth, 'height':this.mapLegendHeight, 'position':'absolute', 'top':0, 'right':0});
		}
		
		// 是否有全屏操作
		if(this.zoom2FullScreen){
			$("#zoom2FullScreen").remove(); 
			$("#"+this.mapId).append("<div id='zoom2FullScreen' class='map-zoom-backgroud'></div>"); 
		}
		
		// 如果回调函数
		if (null != this.loadedFunc) {
			this.loadedFunc();
		}
	},
	
	/**
	 * @description  初始化地图事件
	 */
	_initEvent : function() {
		var self = this;
		
		// 可以拖动，需JqueryUI支持
		$("#private_map_div").draggable();
		
		// 可以缩放。缩放级别从-5 到 10。
		$("#private_map_div").mousewheel(function(event, delta) {
			// 放大
			if (delta > 0) { 
				if (self._nowScale < 10) {
					self._nowScale += 1;
				}
			//缩小
			} else if (delta < 0) {
				if (self._nowScale > -5) {
					self._nowScale -= 1;
				}
			}
			self._resizeMap(self._nowScale);
			event.stopPropagation();
			event.preventDefault();
		});
	},
	
	/**
	 * @description  缩放地图的大小
	 * 
	 * @param scale 地图缩放级别。缩放级别从-5 到 10。
	 */
	_resizeMap : function(scale) {
		if (scale > 0) {
			this.nowMultiple = 1 + (scale) * 0.1;
		} else {
			this.nowMultiple = 1 + (scale) * 0.1;
		}
		
		this.nowWidth = this._sourceWidth * this.nowMultiple;
		this.nowHeight = this._sourceHeight * this.nowMultiple;
		$("#private_map_div").width(this.nowWidth);
		$("#private_map_div").height(this.nowHeight);
		this._mapSize = this.nowWidth + "px " + this.nowHeight + "px";
		$("#private_map_div").css({'background-size':this._mapSize, 'background-repeat':'no-repeat'});

		$("#map_contain_div canvas").width(this.nowWidth);
		$("#map_contain_div canvas").height(this.nowHeight);
		
		if (this.hasSvg) {
            $("#private_map_div").find('svg').attr('width',this.nowWidth);            
            $("#private_map_div").find('svg').attr('height',this.nowHeight);
        }
	},
	 
	/**
	 * @description  改变地图的SVG背景
	 * 
	 * @param mapSvgUrl 地图SVG背景的URL
	 */
	changeMapSvg : function(mapSvgUrl) {
		// 初始化基本参数
		this.initParam();
		
		// 切换地图
		this.mapSvgUrl = mapSvgUrl;
		
		// 初始化
		this.init();
	},
	
	/**
	 * @description 绘制地图上的点
	 * 
	 * @param ret 所需绘制点的信息，格式如下：
	 *            {id: {coordX, coordX}}
	 */
	drawMapPoint : function(ret) {
		if(Util.isObjectEmpty(ret)){
	       	return;
	   	}    
		var cvs = $("#private_map_area_canvas")[0];
		var ctx = cvs.getContext("2d");
		ctx.clearRect(0,0,cvs.width,cvs.height);
		for(var id in ret){
	    	var area = ret[id];
	        var x = parseInt(this.nowWidth * area.coordX / this.nowMultiple);
	        var y = parseInt(this.nowHeight * area.coordY / this.nowMultiple);
	       //画点
	        ctx.fillStyle="red";
	        ctx.beginPath();
	        ctx.arc(x,y,2,0,Math.PI*2,true);
	        ctx.closePath();
	        ctx.fill();
	        //填充文字
	        ctx.font="10px Arial";
	        ctx.fillText(area.areaName,x+4,y+3);
		}   
	},
	clear : function(){
			if (this.hasSvg) {
				$("#private_map_div svg").html("");
			}
			if(this.hasHeatmap && this.heatmap){
				this.heatmap.clear();
			}
			if(this.hasCanvas){
				if($("#private_map_canvas")[0]){
					$("#private_map_canvas")[0].getContext("2d").clearRect(0,0,100000,100000);
				}
				
			}
	},
	hide:function(){
		$("#private_map_div").hide();
	},	
	show:function(){
		$("#private_map_div").show();
	}
};