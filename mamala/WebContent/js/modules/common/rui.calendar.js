/***************************************************************************************
* element 			:	要应用到哪个DOM元素中（必填一项）
*
* initDate			:	设置初始化时间（默认为当前日期时间）
* hasWeekendColor	:	周六周天颜色与其他不同（true为有不同颜色，false为无不同颜色，默认为false）
* isDisable			:	是否禁用（默认为false不禁用，true为禁用）
* fromSelect		:	从哪个地方开始能选中（0为全部都能选中，默认为0）
* endSelect			:	从哪个地方开始不能选中（0为全部都能选中，默认为0）
* hasCurrentTime	:	显示当前时间，并允许设置（默认为false，即不显示；true为显示）
* onSelect			:	选中后的事件处理
* isEnglish			:	显示是否显示为英文（默认为false，为中文）
* format 			:	输出格式（默认yyyy-mm-dd）不能用空格来隔开
* weekStart 		:	一周的开始（默认周日，通过0-6值选择）
* canInput			:	是否可输入（默认为false，为不可输入）
* minDisable		：	分钟不可使用，只可调整小时
****************************************************************************************/

if(typeof rui == 'undefined'){
	this.rui = {}
}
;(function($){
	var Calendar = function(options){
		var self = this;
		this.element = $("#" + options.element);
		this.format = options ? (options.format ? DPGlobal.parseFormat(options.format) : DPGlobal.parseFormat('yyyy-mm-dd')) : DPGlobal.parseFormat('yyyy-mm-dd');
		this.picker = $(DPGlobal.template).appendTo('body');
		$(this.picker).click($.proxy(this.click, this));
		$(this.picker).mousedown($.proxy(this.mousedown, this));
		
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on') : false;
		if (this.isInput) {
			//$(this.element).focus($.proxy(this.show, this));
			//$(this.element).click($.proxy(this.show, this));
			$(this.element).bind('mousedown focus', function(e){
				e.stopPropagation();
				e.preventDefault();
				self.show();
			});
		} else {
			if (this.component){
				$(this.component).click($.proxy(this.show, this));
			} else {
				$(this.element).click($.proxy(this.show, this));
			}
		}
		
		this.viewMode = 0;
		this.weekStart = options ? (options.weekStart ? options.weekStart : 0) : 0;
		this.weekEnd = this.weekStart == 0 ? 6 : this.weekStart - 1;
		this.today = new Date();
		this.initDate = options ? (options.initDate ? options.initDate : new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0)) : new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0);
		this.hasWeekendColor = options ? (options.hasWeekendColor ? options.hasWeekendColor : false) : false;
		this.isDisable = options ? (options.isDisable ? options.isDisable : false) : false;
		this.fromSelect = options ? (options.fromSelect ? options.fromSelect : 0) : 0;
		this.endSelect = options ? (options.endSelect ? options.endSelect : 0) : 0;
		this.hasCurrentTime = options ? (options.hasCurrentTime ? options.hasCurrentTime : false) : false;
		this.minDisable = options ? (options.minDisable ? options.minDisable : false) : false;
		this.onSelect = options ? (options.onSelect ? options.onSelect : false) : false;
		this.isEnglish = options ? (options.isEnglish ? options.isEnglish : false) : false;
		this.canInput = options ? (options.canInput ? options.canInput : false) : false;
		this.defaultBlank = options ? (options.defaultBlank ? options.defaultBlank : false) : false;
		if (this.canInput != true) {
			$(this.element).attr("readonly", "readonly");
		}
		
		this.init();
	};
	Calendar.prototype = {
		constructor: Calendar,
		init	:	function(){
			this.fillTodayDate();
			this.fillDow();
			this.update();
		},
		/* 根据一周的开始填充星期 */
		fillDow	:	function(){
			var dowCnt = this.weekStart;
			var html = '<tr class="rui-calendar-header-week">';
			while (dowCnt < this.weekStart + 7) {
				if (this.isEnglish) {
					html += '<td class="dow">'+DPGlobal.dates.daysMin_en[(dowCnt++)%7]+'</td>';
				} else {
					html += '<td class="dow">'+DPGlobal.dates.daysMin[(dowCnt++)%7]+'</td>';
				}
			}
			html += '</tr>';
			this.picker.find('.rui-calendar-days thead').append(html);
		},
		/* 根据是否显示当前日期来填充当前小时和分钟 */
		fillTodayDate	:	function(){
			var htmlstr = '';
			if (this.isEnglish) {
				htmlstr += ' <input type="button" class="rui-calendar-button" value="Today"  />';
				htmlstr += ' <input type="button" class="rui-calendar-button-ok" value="OK"  />';
			} else {
				htmlstr += ' <input type="button" class="rui-calendar-button" value="今天" />';
				htmlstr += ' <input type="button" class="rui-calendar-button-ok" value="确定"/>';
			}
			this.picker.find('.rui-calendar-today').append(htmlstr);
			var hour = this.today.getHours() > 9 ? this.today.getHours() : "0" + this.today.getHours();
			var min = this.today.getMinutes() > 9 ? this.today.getMinutes() : "0" + this.today.getMinutes();
			if (this.minDisable == true) {
				min = '00';
			}
			this.picker.find('.select_hourandmin').append('<span class="rui-calendar-hour">'+hour+"</span>:<span class='rui-calendar-min'>"+min+"</span>");
			if (this.hasCurrentTime == false) {
				this.picker.find('.rui-calendar-time').css("display", "none");
			}
			if (this.minDisable == true) {
				this.picker.find('.rui-calendar-minusmin').css('background-color', '#e9f7ff');
				this.picker.find('.rui-calendar-plusmin').css('background-color', '#e9f7ff');
			}
		},
		/* 显示日期控件 */
		show	:	function(e){
			this.picker.find('.rui-calendar-month-pop').css("display", "none");
			this.picker.show();
			this.place();
			if (e) {
				e.stopPropagation();
				e.preventDefault();
			}
			if (!this.isInput) {
				$(document).mousedown($.proxy(this.hide, this));
			} else {
				$(document).mousedown($.proxy(this.hide, this));
			}
			this.element.trigger({
				type: 'show',
				date: this.date
			});
		},
		/* 隐藏日期控件 */
		hide	:	function(nofocus){
			this.picker.hide();
			this.viewMode = 0;
			if (!this.isInput) {
			}
			if (this.defaultBlank == false) {
				this.setValue();
			}
			if (this.onSelect != false) {
				this.onSelect();
			}
			this.element.trigger({
				type: 'hide',
				date: this.date
			});
			if(!nofocus) $('body').focus();
		},
		/* 设置日期值 */
		setValue: function() {
			if (this.isDisable == true) {
				return;
			}
			var formated = DPGlobal.formatDate(this.date, this.format);
			if (this.hasCurrentTime == true) {
				formated += " "+this.picker.find('.select_hourandmin').text();
			
			}
			if (!this.isInput) {
				if (this.component){
					this.element.find('input').attr('value', formated);
				}
				this.element.data('date', formated);
			} else {
				this.element.attr('value', formated);
			}
		},
		clearValue : function(){
			this.element.attr('value', "");
		},
		/* 将日期控件放在对应的位置 */
		place: function(){
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			var offset = this.component ? this.component.offset() : this.element.offset();
			this.picker.offset({
				top: offset.top + this.height,
				left: offset.left
			});
		},
		update: function(){
			this.date = this.parseDate(
				this.isInput ? this.element.attr('value') : this.element.data('date'),
				this.format
			);
			this.viewDate = new Date(this.date);
			this.fill();
		},
		fill: function() {
			var d = new Date(this.viewDate),
				year = d.getFullYear(),
				month = d.getMonth(),
				startDate = 0;
				endDate = 0;
				currentDate = this.date.valueOf();
			if (this.fromSelect != 0) {
				startDate = this.fromSelect;
				startDate = startDate.valueOf();
			}
			if (this.endSelect != 0) {
				endDate = this.endSelect;
				endDate = endDate.valueOf();
			}
			if (startDate > endDate) {
				startDate = endDate = 0;
			}
			if (this.isEnglish) {
				this.picker.find('.rui-calendar-days th:eq(1)')
						.html('<span class="month_class">'+DPGlobal.dates.months_en[month]+'</span> <span class="year_class">'+year+'</span>');
			} else {
				this.picker.find('.rui-calendar-days th:eq(1)')
						.html('<span class="month_class">'+DPGlobal.dates.months[month]+'</span> <span class="year_class">'+year+'</span>');
			}
			if (month == 0) {
				var prevMonth = new Date(year-1, 11, 28,0,0,0,0);
			} else {
				var prevMonth = new Date(year, month-1, 28,0,0,0,0);
			}
			var	day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
			prevMonth.setDate(day);
			prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setDate(nextMonth.getDate() + 42);
			nextMonth = nextMonth.valueOf();
			html = [];
			var clsName;
			while (prevMonth.valueOf() < nextMonth) {
				if (prevMonth.getDay() == this.weekStart) {
					html.push('<tr>');
				}
				clsName = '';
				if (prevMonth.getMonth() == 11 && month == 0) {
					clsName += ' rui-calendar-old';
				} else if (prevMonth.getMonth() == 0 && month == 11) {
					clsName += ' rui-calendar-new';
				} else {
					if (prevMonth.getMonth() < month) {
						clsName += ' rui-calendar-old';
					} else if (prevMonth.getMonth() > month) {
						clsName += ' rui-calendar-new';
					}
				}
				if (this.hasWeekendColor == false) {
					if (prevMonth.getDay() == 0 || prevMonth.getDay() == 6) {
						clsName += ' rui-calendar-weekend';
					}
				}
				if (startDate != 0) {
					if (prevMonth.valueOf() < startDate) {
						clsName += ' rui-calendar-disable';
					}
				}
				if (endDate != 0) {
					if (prevMonth.valueOf() > endDate) {
						clsName += ' rui-calendar-disable';
					}
				}
				if (prevMonth.valueOf() == currentDate) {
					clsName += ' rui-calendar-selected';
				}
				html.push('<td class="rui-calendar-day'+clsName+'">'+prevMonth.getDate() + '</td>');
				if (prevMonth.getDay() == this.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setDate(prevMonth.getDate()+1);
			}
			this.picker.find('.rui-calendar-days tbody').empty().append(html.join(''));
		},
		click: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var target = $(e.target).closest('span, td, th, div, input');
			if (this.picker.find('.rui-calendar-month-pop').css("display") == "inline") {
				this.picker.find('.rui-calendar-month-pop').css("display", "none");
			}
			if (target.length == 1) {
				switch(target[0].nodeName.toLowerCase()) {
					case 'th':
						switch(target[0].className) {
							case 'rui-calendar-prev':
							case 'rui-calendar-next':
								this.viewDate['set'+DPGlobal.modes[this.viewMode].navFnc].call(
									this.viewDate,
									this.viewDate['get'+DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate) + 
									DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'rui-calendar-prev' ? -1 : 1)
								);
								this.fill();
								break;
						}
						break;
					case 'span':
						if (target.is('.month_class')) {
							this.showMonth();
						} else if (target.is('.year_class')) {
							this.showYear();
						} else {
							if (target.is('.rui-calendar-minushour')) {
								this.minusHour();
							} else if (target.is('.rui-calendar-plushour')) {
								this.plusHour();
							} else if (target.is('.rui-calendar-minusmin')) {
								if (this.minDisable == false) {
									this.minusMin();
								}
							} else if (target.is('.rui-calendar-plusmin')) {
								if (this.minDisable == false) {
									this.plusMin();
								}
							}
						}
						break;
					case 'td':
						if (target.is('.rui-calendar-day')){
							if (target.is('.rui-calendar-disable')) {
								return;
							}
							var day = parseInt(target.text(), 10)||1;
							var month = this.viewDate.getMonth();
							var year = this.viewDate.getFullYear();
							
							if (target.is('.rui-calendar-old')) {
								if (month == 0) {
									year -= 1;
									month = 11;
								} else {
									month -= 1;
								}
							} else if (target.is('.rui-calendar-new')) {
								if (month == 11) {
									year += 1;
									month = 0;
								} else {
									month += 1;
								}
							}
							this.date = new Date(year, month, day,0,0,0,0);
							this.viewDate = new Date(year, month, day,0,0,0,0);
							this.fill();
							this.setValue();
							if (!target.is('.rui-calendar-old') && !target.is('.rui-calendar-new')) {
								this.hide();
							}
							this.element.trigger({
								type: 'changeDate',
								date: this.date
							});
						}
						break;
					case 'input':
						var startDate = 0;
						var endDate = 0;
						if (this.fromSelect != 0) {
							startDate = this.fromSelect;
							startDate = startDate.valueOf();
						}
						if (this.endSelect != 0) {
							endDate = this.endSelect;
							endDate = endDate.valueOf();
						}
						if (startDate > endDate) {
							startDate = endDate = 0;
						}
						if (target.is('.rui-calendar-button')) {
							if ((startDate == 0 && endDate == 0)
								|| (startDate == 0 && endDate != 0 && this.today.valueOf() <= endDate) 
								|| (startDate != 0 && endDate == 0 && this.today.valueOf() >= startDate) 
								|| (startDate != 0 && endDate != 0 && this.today.valueOf() >= startDate && this.today.valueOf() <= endDate)) {
								this.viewDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 0, 0, 0, 0);
								this.date = this.viewDate;
								this.fill();
								this.setValue();
							} else {
								alert("今日日期不可选");
							}
						} else if (target.is('.rui-calendar-button-ok')) {
							/*if ((startDate == 0 && endDate == 0)
								|| (startDate == 0 && endDate != 0 && this.today.valueOf() <= endDate) 
								|| (startDate != 0 && endDate == 0 && this.today.valueOf() >= startDate) 
								|| (startDate != 0 && endDate != 0 && this.today.valueOf() >= startDate && this.today.valueOf() <= endDate)) {*/
								this.setValue();
								this.hide();
							//}
						}
						break;
				}
			} else {
				this.hide();
			}
		},
		mousedown: function(e){
			e.stopPropagation();
			e.preventDefault();
		},
		minusHour	:	function(){
			var hour = this.picker.find('.rui-calendar-hour').html();
			if (hour <= 0) {
				hour = 24;
			}
			hour -= 1;
			hour = (hour > 9) ? hour : ("0"+hour);
			this.picker.find('.rui-calendar-hour').html(hour);
		},
		plusHour	:	function(){
			var hour = this.picker.find('.rui-calendar-hour').html();
			if (hour >= 23) {
				hour = -1;
			}
			hour = hour - 0 + 1;
			hour = (hour > 9) ? hour : ("0"+hour);
			this.picker.find('.rui-calendar-hour').html(hour);
		},
		minusMin	:	function(){
			var min = this.picker.find('.rui-calendar-min').html();
			if (min <= 0) {
				min = 60;
			}
			min -= 1;
			min = (min > 9) ? min : ("0"+min);
			this.picker.find('.rui-calendar-min').html(min);
		},
		plusMin		:	function(){
			var min = this.picker.find('.rui-calendar-min').html();
			if (min >= 59) {
				min = -1;
			}
			min = min - 0 + 1;
			min = (min > 9) ? min : ("0"+min);
			this.picker.find('.rui-calendar-min').html(min);
		},
		showMonth	:	function(){
			var str = "<table>"
			for (var i = 0; i < 12; i++) {
				if (this.isEnglish) {
					str += "<tr class='rui-calendar-month-row'><td class='rui-calendar-month-td'>"+DPGlobal.dates.months_en[i]+"</td></tr>";
				} else {
					str += "<tr class='rui-calendar-month-row'><td class='rui-calendar-month-td'>"+DPGlobal.dates.months[i]+"</td></tr>";
				}
			}
			str += "</table>";
			this.picker.find('.rui-calendar-month-pop').css("display", "inline");
			
			this.picker.find('.rui-calendar-month-pop').html(str);
			this.picker.find('.rui-calendar-month-pop').css("top", "23px");
			this.month_position = this.picker.find(".month_class").position().left;
			this.picker.find('.rui-calendar-month-pop').css("left", this.month_position);
			$('.rui-calendar-month-row').bind("mouseover", function(){
				$(this).addClass('rui-calendar-month-row-hover');
			});
			$('.rui-calendar-month-row').bind("mouseout", function(){
				$(this).removeClass('rui-calendar-month-row-hover');
			});
			var that = this;
			$('.rui-calendar-month-row').bind("click", function(){
				that.picker.find('.rui-calendar-month-pop').css("display", "none");
				that.viewDate.setMonth(this.rowIndex);
				that.fill();
			});
		},
		showYear	:	function(){
			var target = this.picker.find('.year_class').text();
			var str = "<table><tr class='rui-calendar-year-row'><td class='rui-calendar-month-td rui-calendar-year-button'><</td></tr>"
			for (var i = 0; i < 12; i++) {
				var year = target-target%10-1+i;
				str += "<tr class='rui-calendar-year-row'><td class='rui-calendar-month-td'>"+year+"</td></tr>"
			}
			str += "<tr class='rui-calendar-year-row'><td class='rui-calendar-month-td rui-calendar-year-button'>></td></tr></table>";
			this.picker.find('.rui-calendar-month-pop').css("display", "inline");
			this.picker.find('.rui-calendar-month-pop').html(str);
			this.picker.find('.rui-calendar-month-pop').css("top", "23px");
			this.year_position = this.picker.find(".year_class").position().left;
			this.picker.find('.rui-calendar-month-pop').css("left", this.year_position);
			$('.rui-calendar-year-row').bind("mouseover", function(){
				$(this).addClass('rui-calendar-month-row-hover');
			});
			$('.rui-calendar-year-row').bind("mouseout", function(){
				$(this).removeClass('rui-calendar-month-row-hover');
			});
			var that = this;
			$('.rui-calendar-year-row').bind("click", function(e){
				e.stopPropagation();
				e.preventDefault();
				if (this.childNodes[0].innerHTML == '&lt;' || this.childNodes[0].innerHTML == '&gt;') {
					if (this.childNodes[0].innerHTML == '&lt;') {
						var target = that.picker.find('.rui-calendar-year-row:eq(2)').text()-10;
					} else {
						var target = that.picker.find('.rui-calendar-year-row:eq(2)').text()-1+11;
					}
					if (target <= 100 || target >= 3000) {
						return;
					}
					for (var i = 1; i < 13; i++) {
						var year = target-target%10-2+i;
						that.picker.find('.rui-calendar-year-row:eq('+i+')').html("<td class='rui-calendar-month-td'>"+year+"</td>");
					}
				} else {
					that.picker.find('.rui-calendar-month-pop').css("display", "none");
					that.viewDate.setFullYear(parseInt(this.childNodes[0].innerHTML, 10)||0);
					that.fill();
				}
			});
		},
		parseDate	: function(date, format) {
			var parts = date.split(format.separator),
				time_part = date.split(" "),
				date = this.initDate,
				val;
			if (parts.length == format.parts.length) {
				for (var i=0, cnt = format.parts.length; i < cnt; i++) {
					val = parseInt(parts[i], 10)||1;
					switch(format.parts[i]) {
					case 'dd':
					case 'd':
						date.setDate(val);
						break;
					case 'mm':
					case 'm':
						date.setMonth(val - 1);
						break;
					case 'yy':
						date.setFullYear(2000 + val);
						break;
					case 'yyyy':
						date.setFullYear(val);
						break;
					}
				}
			}
			if (time_part.length == 2) {
				var parts = time_part[1].split(":");
				if (parts.length == 2) {
					this.picker.find('.rui-calendar-hour').html(parts[0]);
					this.picker.find('.rui-calendar-min').html(parts[1]);
				}
			}
			return date;
		}
	};
	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		dates:{
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin_en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
			months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			months_en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
		},
		isLeapYear: function (year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
		},
		getDaysInMonth: function (year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
		},
		parseFormat: function(format){
			var separator = format.match(/[.\/-].*?/),
				parts = format.split(/\W+/);
			if (!separator || !parts || parts.length == 0){
				throw new Error("Invalid date format.");
			}
			return {separator: separator, parts: parts};
		},
		
		formatDate: function(date, format){
			var val = {
				d: date.getDate(),
				m: date.getMonth() + 1,
				yy: date.getFullYear().toString().substring(2),
				yyyy: date.getFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			var date = [];
			for (var i=0, cnt = format.parts.length; i < cnt; i++) {
				date.push(val[format.parts[i]]);
			}
			return date.join(format.separator);
		},
		headTemplate: '<thead>'+
							'<tr class="rui-calendar-header">'+
								'<th class="rui-calendar-prev"><</th>'+
								'<th colspan="5" class="rui-calendar-switch"></th>'+
								'<th class="rui-calendar-next">></th>'+
							'</tr>'+
						'</thead>'
	};
	DPGlobal.template = '<div class="rui-calendar">'+
							'<div class="rui-calendar-days">'+
								'<table class="rui-calendar-condensed" >'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
								'</table>'+
								'<div class="rui-calendar-time"><span class="rui-calendar-minushour">-</span>'+
									'<span class="rui-calendar-plushour">+</span>'+
									'<span class="select_hourandmin"></span>'+
									'<span class="rui-calendar-minusmin">-</span>'+
									'<span class="rui-calendar-plusmin">+</span></div>'+
								'<div class="rui-calendar-today"></div>'+
								'<div class="rui-calendar-month-pop">'+
								'</div>'+
							'</div>'+
						'</div>';
	rui.Calendar = Calendar; 
})(jQuery);
