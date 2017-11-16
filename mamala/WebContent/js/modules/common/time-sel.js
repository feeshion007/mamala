define(function(require,exports,module){

	/* rbis 日期控件 */

	/* 使用方式
	 * @element : 日期控件绑定到哪个div
	 * @callback : 日期控件发生变化时的回调函数，函数的参数包括类型与时间.
	 * var rbtm = new rbistime({"element":"rbisTM",
								"callback":function(type, tm){
											console.log(type+" : "+tm);
											}
								});
	   
	  初始化之后，使用getCurrent()接口获取当前类型与时间 
	   console.log(rbtm.getCurrent());
	 *
	 */
	rbistime = function rbistime(config){
		var _ = {
			element:{},
				callback:function(type,time){},
			};
			this.set = function(key,val){
				_[key] = val;
			};
			this.get = function(key) {
				return _[key];
			};
			this.configure(config);
			this.set("now", new Date());
			this.createView();
			this.init();
		}

		rbistime.prototype = {
			configure:function(config){
				this.set("element", (config.element instanceof Object)?config.element:document.getElementById(config.element));
				this.set("callback", config.callback||function(type,time){});
			},
			eventFun:function (){

			},
			eventBind:function(target) {
				var me = this;
				if(window.addEventListener){ // Mozilla, Netscape, Firefox 
				    target.addEventListener('change', 
				    	function(){me.change(this);me.notifyTime();},false); 
				} else { //IE
				    target.attachEvent('onchange',
				    	function(){me.change(this);me.notifyTime();}); 
				}
			},
			createView:function(){
				var element = this.get("element");
				var type = document.createElement("select");
				type.setAttribute("id","tm-type-sel");
				type.setAttribute("class","sel-large");
				this.eventBind(type);
				element.appendChild(type);

				var year = document.createElement("select");
				year.setAttribute("id","tm-year");
				year.setAttribute("class","sel-normal");
				this.eventBind(year);
				element.appendChild(year);

				var month = document.createElement("select");
				month.setAttribute("id","tm-month");
				month.setAttribute("class","sel-small");
				this.eventBind(month);
				element.appendChild(month);

				var day = document.createElement("select");
				day.setAttribute("id","tm-day");
				day.setAttribute("class","sel-small");
				this.eventBind(day);
				element.appendChild(day);
			},
			init:function(){
				var now = this.get("now");
				this.type();
				this.year(now.getFullYear());
				this.month(now.getFullYear());
				this.day(now.getFullYear(), now.getMonth()+1);
			},
			type:function(){
				var type = document.getElementById("tm-type-sel");
				type.options.add(new Option($.i18n.prop('common_month_find_today_analysis'),"day"));
				type.options.add(new Option($.i18n.prop('common_month_find_this_month_analysis'),"month"));
				type.options.add(new Option($.i18n.prop('common_month_find_this_year_analysis'),"year"));
			},
			day:function(year,month){
				var now = this.get("now");
				var daySel = document.getElementById("tm-day");
				daySel.options.length=0;
				var days = now.getDate();
				if (now.getFullYear() != year || (now.getMonth()+1) != month) {
					days = new Date(year,month,0).getDate();
				}
				for (var i=1; i<=days;i++) {
					daySel.options.add(new Option(i,i<10?"0"+i:i));
				}
				i = i-1;
				daySel.value = i<10?("0"+i):i;
			},
			month:function(year){
				var now = this.get("now");
				var months = now.getFullYear()==year?now.getMonth():11;
				var monthSel = document.getElementById("tm-month");
				monthSel.options.length=0;
				for (var i=0; i<=months;i++) {
					monthSel.options.add(new Option(i+1,(i+1)<10?"0"+(i+1):(i+1)));
				}
				monthSel.value = i<10?("0"+i):i;
				this.day(year, monthSel.options[monthSel.selectedIndex].text);
			},
			year:function(){
				var now = this.get("now");
				var yearSel = document.getElementById("tm-year");
				yearSel.options.add(new Option(now.getFullYear(),now.getFullYear()));
				yearSel.options.add(new Option(now.getFullYear()-1,now.getFullYear()-1));
				this.month(yearSel.options[yearSel.selectedIndex].value);
			},

			change:function(sel){
				if (sel.id == "tm-type-sel") {
					if (sel.value == "day") {
						document.getElementById("tm-year").style.display = '';
						document.getElementById("tm-month").style.display = '';
						document.getElementById("tm-day").style.display = '';
					} else if (sel.value == "month") {
						document.getElementById("tm-year").style.display = '';
						document.getElementById("tm-month").style.display = '';
						document.getElementById("tm-day").style.display = 'none';
					} else {
						document.getElementById("tm-year").style.display = '';
						document.getElementById("tm-month").style.display = 'none';
						document.getElementById("tm-day").style.display = 'none';
					}
				} else if (sel.id == "tm-year") {
					this.month(sel.options[sel.selectedIndex].value);
				} else if (sel.id == "tm-month") {
					var yearVal = document.getElementById("tm-year").value;
					this.day(yearVal, sel.options[sel.selectedIndex].text);
				}
			},
			notifyTime:function() {
				var tm = document.getElementById("tm-year").value+"-";
				tm += document.getElementById("tm-month").value+"-";
				tm += document.getElementById("tm-day").value;
				this.get("callback")(document.getElementById("tm-type-sel").value, tm);
			},
			getCurrent:function() {
				var tm = document.getElementById("tm-year").value+"-";
				tm += document.getElementById("tm-month").value+"-";
				tm += document.getElementById("tm-day").value;
				var tmType = document.getElementById("tm-type-sel").value;
				return {"type":tmType, "time":tm};
			}	
		}

   exports.init = function (config){return new rbistime(config)};
})