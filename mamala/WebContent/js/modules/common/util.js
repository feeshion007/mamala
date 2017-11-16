/**
 * @author chu
 * @constructor Util
 * @description 工具类提供的方法是静态的
 * @example Util.xx
 * @since version 1.0
 */

var Util = {
	/**
	 * 
	 */
	isObjectEmpty : function(ret){
	   for (var name in ret) {
	        return false;
	    }
	    return true;
	},
	/**
	 * 判断是否是IE
	 * 
	 * @return {boolean} .
	 */
	getIsIE : function() {
		var ua = navigator.userAgent.toLowerCase();
		var isOpera = /opera/.test(ua);
		var isie = /msie/.test(ua);
		return !isOpera && isie;
	},
	/**
	 * @return {boolean} 返回组件名对应的组件类.
	 */
	apply : function(o, c, defaults) {
		if (defaults) {
			Util.apply(o, defaults);
		}
		if (o && c && typeof c == 'object') {
			for ( var p in c) {
				o[p] = c[p];
			}
		}
		return o;
	},
	/**
	 * 扩展对象属性列表，已存在的属性将不进行覆盖.
	 * 
	 * @param {Object}
	 *            o 待扩展的对象
	 * @param {Object}
	 *            c 扩展的属性列表对象
	 * @return {Object} 返回扩展后的对象.
	 */
	applyIf : function(o, c) {
		if (o) {
			for ( var p in c) {
				if (!Util.isDefined(o[p])) {
					o[p] = c[p];
				}
			}
		}
		return o;
	},
	/**
	 * 扩展对象属性列表 已存在的属性将 进行覆盖
	 * 
	 */
	extend : function() {
		var io = function(o) {
			for ( var m in o) {
				this[m] = o[m];
			}
		};
		var oc = Object.prototype.constructor;
		return function(sb, sp, overrides) {
			if (typeof sp == 'object') {
				overrides = sp;
				sp = sb;
				sb = overrides.constructor != oc ? overrides.constructor
						: function() {
							sp.apply(this, arguments);
						};
			}
			var F = function() {
			}, sbp, spp = sp.prototype;

			F.prototype = spp;
			sbp = sb.prototype = new F();
			sbp.constructor = sb;
			sb.superclass = spp;
			if (spp.constructor == oc) {
				spp.constructor = sp;
			}
			sb.override = function(o) {
				Util.override(sb, o);
			};
			sbp.superclass = sbp.supr = (function() {
				return spp;
			});
			sbp.override = io;
			Util.override(sb, overrides);
			sb.extend = function(o) {
				return Util.extend(sb, o);
			};
			return sb;
		};
	}(),
	/**
	 * 重写类的属性列表.
	 * 
	 * @param {Function}
	 *            origclass 待重写的类.
	 * @param {Object}
	 *            overrides 重写的属性列表.
	 */
	override : function(origclass, overrides) {
		if (overrides) {
			var p = origclass.prototype;
			Util.apply(p, overrides);
			if (Util.isIE && overrides.hasOwnProperty('toString')) {
				p.toString = overrides.toString;
			}
		}
	},
	/**
	 * 判断传入的参数是否存在.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否存在的布尔值.
	 */
	isDefined : function(obj) {
		return typeof obj !== 'undefined';
	},
	/**
	 * 判断传入的参数是否为函数.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否为函数的布尔值.
	 */
	isFunction : function(obj) {
		return Object.prototype.toString.apply(obj) === '[object Function]';
	},
	/**
	 * 判断传入的参数是否为Object对象.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否为Object对象的布尔值.
	 */
	isObject : function(obj) {
		return !!obj
				&& Object.prototype.toString.call(obj) === '[object Object]';
	},
	/**
	 * 判断传入的参数是否为数组对象.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否为数组对象的布尔值.
	 */
	isArray : function(obj) {
		return Object.prototype.toString.apply(obj) === '[object Array]';
	},
	/**
	 * 判断传入的参数是否为日期对象.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否为日期对象的布尔值.
	 */
	isDate : function(obj) {
		return Object.prototype.toString.apply(obj) === '[object Date]';
	},
	/**
	 * 判断传入的参数是否为JQuery对象.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否为JQuery对象的布尔值.
	 */
	isJQuery : function(obj) {
		return obj instanceof jQuery;
	},

	/**
	 * 判断传入的参数是否为空(null、undefined、空数组、空串).
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @param {Boolean}
	 *            allowBlank (optional) 是否允许空串，允许时空串不为空.
	 * @return {Boolean} 返回该变量是否存在的布尔值.
	 */
	isEmpty : function(obj, allowBlank) {
		return obj === null || obj === undefined
				|| ((Util.isArray(obj) && !obj.length))
				|| (!allowBlank ? obj === '' : false);
	},
	/**
	 * 判断传入的参数是否为数值.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @param {Boolean}
	 *            isString (optional) 是否验证字符串只包含数字.
	 * @return {Boolean} 返回该变量是否为数值的布尔值.
	 */
	isNumber : function(obj, isString) {
		if (isString) {
			var d = parseInt(obj).toString();
			return d == obj;
		} else {
			return typeof obj === 'number' && isFinite(obj);
		}
	},
	/**
	 * 判断传入的参数是否为布尔值.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否为布尔值.
	 */
	isBoolean : function(obj) {
		return typeof obj === 'boolean';
	},
	/**
	 * 判断传入的参数是否为字符串.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否为字符串的布尔值.
	 */
	isString : function(obj) {
		return typeof obj === 'string';
	},
	/**
	 * 判断传入对象是否是集合
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否为字符串的布尔值.
	 */
	isIterable : function(obj) {
		if (Util.isArray(obj) || obj.callee) {
			return true;
		}
		if (/NodeList|HTMLCollection/.test(toString.call(obj))) {

			return true;
		}
		return ((typeof obj.nextNode != 'undefined' || obj.item) && Util
				.isNumber(obj.length));
	},
	/**
	 * 判断传入的参数是否为原始类型，如：字符串、数值、布尔值.
	 * 
	 * @param {Object}
	 *            obj 待验证的变量.
	 * @return {Boolean} 返回该变量是否为原始类型.
	 */
	isPrimitive : function(obj) {
		return Util.isString(obj) || Util.isNumber(obj) || Util.isBoolean(obj);
	},
	/**
	 * 去除一个字符串前后所有空白字符，或者一个数组、json对象所有成员前后的空白字符.
	 * 
	 * @param {String/Array/Object}
	 *            obj 待去除空白字符的变量.
	 * @return {String/Array/Object} 返回去除空白字符后的变量.
	 */
	trim : function(obj) {
		if (Util.isString(obj)) {
			return $.trim(obj);
		} else if (Util.isArray(obj)) {
			for ( var i = 0; i < obj.length; i++) {
				if (Util.isString(obj[i])) {
					obj[i] = $.trim(obj[i]);
				}
			}
			return obj;
		} else if (Util.isObject(obj)) {
			for ( var i in obj) {
				if (Util.isString(obj[i])) {
					obj[i] = $.trim(obj[i]);
				}
			}
			return obj;
		}
	},
	/**
	 * 比较两个时间的大小，专门给AdvForm使用
	 * 
	 * @param {String}
	 *            t1 t2 待比较的对象.
	 * @return {int} t1 == t2 0 t1 > t2 1 t1 < t2 -1.
	 */
	compareTime : function(t1, t2) {
		if (t1.d == t2.d && t1.h == t2.h) {
			return 0;
		}

		var d1 = t1.d.split('-'), d2 = t2.d.split('-');
		d1[0] = parseInt(d1[0], 10);
		d1[1] = parseInt(d1[1], 10);
		d1[2] = parseInt(d1[2], 10);
		d2[0] = parseInt(d2[0], 10);
		d2[1] = parseInt(d2[1], 10);
		d2[2] = parseInt(d2[2], 10);
		if (d1[0] > d2[0]
				|| (d1[0] == d2[0] && d1[1] > d2[1])
				|| (d1[0] == d2[0] && d1[1] == d2[1] && d1[2] > d2[2])
				|| (d1[0] == d2[0] && d1[1] == d2[1] && d1[2] == d2[2] && t1.h > t2.h)) {
			return 1;
		}

		return -1;
	},
	/**
	 * 验证一个字符串是否含有字符
	 * 
	 * @param {String}
	 *            str 待验证的用户名字符串.
	 * @return {Boolean} 返回字符串是否通过验证的布尔值.
	 */
	hasFw : function(str) {
		return /[\uFF00-\uFFFF]/.test(str);
	},
	/**
	 * IP地址转换成整型
	 * 
	 * @param {String}
	 *            str 待验证的用户名字符串.
	 * @return {Long} 返回整型
	 * 
	 */
	ipToLong : function(ipstr) {
		var iplong;
		var ipArr = new Array();
		ipArr = ipstr.split(".");
		iplong = parseInt(ipArr[0]) * 256 * 256 * 256 + parseInt(ipArr[1])
				* 256 * 256 + parseInt(ipArr[2]) * 256 + parseInt(ipArr[3]);
		return iplong;
	},
	/**
	 * 获取格式为"xxx.xxx.xxx.xxx/xx"的IP字符串的掩码字符串。
	 * 
	 * @param {String}
	 *            ip IP字符串。
	 * @return {String} 返回掩码字符串。
	 */
	getMask : function(ip) {
		var i = ip.indexOf('/');
		if (i == -1)
			return "255.255.255.255";
		var mask = parseInt($.trim(ip.substring(i + 1)));
		if (mask) {
			var v = 0xffffffff;
			v = v << (32 - mask);
			return Util.longToIP(v);
		} else {
			return "0.0.0.0";
		}
	},
	/**
	 * 整型转换成IP地址
	 * 
	 * @param {Long}
	 *            iplong 待转换的整数.
	 * @return {String} 返回IP格式的地址
	 * 
	 */
	longToIP : function(iplong) {
		var ips = new Array(4);
		ips[0] = parseInt((iplong >> 24) & 0xff);
		ips[1] = parseInt((iplong >> 16) & 0xff);
		ips[2] = parseInt((iplong >> 8) & 0xff);
		ips[3] = parseInt(iplong & 0xff);
		return ips[0] + "." + ips[1] + "." + ips[2] + "." + ips[3];
	},
	/*
	 * 得到可变子网掩码的掩码地址 @param vlsm 可变子网掩码, 例 192.168.197.0/27 中的27 @return 掩码地址
	 * 255.255.255.224
	 */
	vlsm2SubnetMask : function(vlsm) {
		// 2^32 - 2^(32-vlsm)
		var iplong = (2 << 31) - (2 << (32 - vlsm - 1));
		if (vlsm == 32) {
			iplong -= 1;
		}
		return this.longToIP(iplong);
	},
	/**
	 * 获取IP的网段地址
	 * 
	 * @param {string}
	 *            ip IP地址如192.168.23.5
	 * @param {string}
	 *            mask 子网掩码地址 255.255.255.0
	 * @return {string} 网络标识，如192.168.23.0
	 */
	getNetCode : function(ip, mask) {
		var ipNum = Util.ipToLong(ip);
		var maskNum = Util.ipToLong(mask);
		var netNum = ipNum & maskNum;
		return Util.longToIP(netNum);
	},
	/**
	 * 遍历数组.
	 * 
	 * @param {Array}
	 *            v 待遍历的数组.
	 * @param {Function}
	 *            fn 遍历所执行的回调函数.
	 * @param {Object}
	 *            scope (optional) 回调函数的域变量，默认为被遍历到的元素.
	 */
	each : function(arr, fn, scope) {
		if (Util.isEmpty(arr, true)) {
			return;
		}
		if (!Util.isIterable(arr) || Util.isPrimitive(arr)) {
			arr = [ arr ];
		}
		for ( var i = 0, len = arr.length; i < len; i++) {
			if (fn.call(scope || arr[i], arr[i], i, arr) === false) {
				return i;
			}
			;
		}
	},
	/**
	 * 生成随机的ID字符串.
	 * 
	 * @param {String}
	 *            prefix (optional) 生成ID的前缀字符串.
	 * @return {String} 返回随机生成的ID字符串.
	 */
	id : function(prefix) {
		return (prefix || "") + new Date().getTime()
				+ parseInt(Math.random() * 1000);
	},
	/**
	 * 将字符串转换为首字母大写.
	 * 
	 * @param {String}
	 *            str 待转换的字符串.
	 * @return {String} 返回转换后的字符串.
	 */
	capitalize : function(str) {
		return !str ? str : str.charAt(0).toUpperCase()
				+ str.substr(1).toLowerCase();
	},
	/**
	 * 判断是中文还是英文
	 * 
	 * @retrun {boolean} 返回true or false
	 */
	isZh : function() {
		var o = window.navigator;
		var lan = o.userLangeage || o.language || o.systemLanguage
				|| o.browserLanguage;
		__isZh = lan == 'zh-cn' || lan == 'zh-CN';
		return __isZh;
	},
	/**
	 * 对一个浮点数的小数位进行截断位数,并且四舍五入.
	 * 
	 * @param {Object}
	 *            number 待截断的浮点数，该参数可为任何类型.
	 * @param {Number}
	 *            digit 保留的小数位数.
	 * @return {Number} 返回截断后的数值.
	 */
	fixTo : function(number, digit) {
		var num = parseFloat(number) || 0;
		var d = Math.pow(10, parseInt(digit, 10));
		if (!d) {
			return Math.round(num);
		} else {
			return Math.round(num * d) / d;
		}
		return 0;
	},
	/**
	 * 获取URL中的查询参数
	 * 
	 * @param {String}
	 *            URL字符串,如果不指定，则使用当前页面的URL.
	 * @return {Object} URL中的参数对象.
	 */
	getQueryPars : function(url) {
		var searchStr, pars = {};
		if (url) {
			var splitIndex = url.indexOf("?");
			searchStr = splitIndex == -1 ? "" : url.substring(splitIndex);
		} else {
			searchStr = window.location.search;
		}
		if (searchStr == "") {
			return pars;
		} else {
			var str = searchStr.substring(1, searchStr.length), arry = str
					.split("&");
			for ( var r = 0; r < arry.length; r++) {
				// 将值对拆开并输出
				var item = arry[r].split("=");
				pars[item[0]] = item[1];
			}
		}
		return pars;
	},
	/**
	 * 杜绝页面中的alert
	 * 
	 * @param {String}
	 *            str打印的字符串.
	 */
	print : function(str) {
		alert(str.toString());
	},
	/**
	 * 删除节点，防止内存泄露
	 */
	removeElement : function(ele) {
		var garbage = window._garbageEle;
		if (!garbage) {
			garbage = document.createElement("div");
			window._garbageEle = garbage;
		}
		garbage.appendChild(ele);
		garbage.innerHTML = '';
	},
	clone : function(myObj){
		if(typeof(myObj) != 'object') return myObj;
		if(myObj == null) return myObj;

		var myNewObj = new Object();

		for(var i in myObj)
		myNewObj[i] = Util.clone(myObj[i]);

		return myNewObj;
	}
};
//打开这段代码会对Array产生影响for(var i in arr)
//Util.applyIf(Array.prototype, {
//	/**
//	 * 检查一个对象是否存在于数组中.
//	 * 
//	 * @param {Object}
//	 *            o 待检查的对象
//	 * @param {Number}
//	 *            from (Optional) 查询起始位置的索引值
//	 * @return {Number} 返回对象在数组中的索引值(如果没有找到则返回-1)
//	 */
//	indexOf : function(o, from) {
//		var len = this.length;
//		from = from || 0;
//		from += (from < 0) ? len : 0;
//		for (; from < len; ++from) {
//			if (this[from] === o) {
//				return from;
//			}
//		}
//		return -1;
//	},
//	/**
//	 * 从数组中删除指定对象，如果没有在数组中找到该对象则不做任何操作.
//	 * 
//	 * @param {Object}
//	 *            o 要找到并将其删除的对象
//	 * @return {Array} 返回数组本身
//	 */
//	remove : function(o) {
//		var index = this.indexOf(o);
//		if (index != -1) {
//			this.splice(index, 1);
//		}
//		return this;
//	},
//	/**
//	 * 合并两个数组，并保持数组中元素的唯一性
//	 * 
//	 * @param {Array}
//	 *            arr 要找到并将其删除的对象
//	 * @return {Array} 返回合并后的数组
//	 */
//
//	unique : function(arr) {
//		if (!Util.isArray(arr)) {
//			arr = [];
//		}
//		for ( var i = 0; i < arr.length; i++) {
//			if ($.inArray(arr[i], this) == -1) {
//				this.push(arr[i]);
//			}
//		}
//		return this;
//	},
//	/**
//	 * 根据传入参数获取数组中元素，碰到第一个为true的参数时返回与其位置对应的数组元素 arguments 可变参，每个都是boolean值
//	 * 
//	 * @return 返回取得的元素，默认返回最后一个元素
//	 */
////	get : function() {
////		var arg = arguments, l = arg.length < this.length ? arg.length
////				: this.length, res;
////		for ( var i = 0; i < l; i++) {
////			if (!!arg[i]) {
////				res = this[i];
////				break;
////			}
////		}
////		return res || this[this.length - 1];
////	}
//});

/**
 * @class String
 */
Util.applyIf(String, {
	/**
	 * 对字符串中 ' 和 \ 字符进行转译
	 * 
	 * @param {String}
	 *            string 待转译的字符串
	 * @return {String} The 转译后的字符串
	 * @static
	 */
	escape : function(string) {
		return string.replace(/('|\\)/g, "\\$1");
	},
	/**
	 * 在字符串的左侧填充指定字符.这对于规范编号和日期字符串特别有用.例程:
	 * 
	 * <pre><code>
	 * var s = String.leftPad('123', 5, '0');
	 * 现在包含了这样的字符串: '00123'
	 * </code></pre>
	 * 
	 * @param {String}
	 *            string 原始字符串
	 * @param {Number}
	 *            size 输出字符串的总长度
	 * @param {String}
	 *            char (optional) 用于填充原始字符串的字符(默认为空格" ")
	 * @return {String} 填充后的字符串
	 * @static
	 */
	leftPad : function(val, size, ch) {
		var result = String(val);
		if (!ch) {
			ch = " ";
		}
		while (result.length < size) {
			result = ch + result;
		}
		return result;
	}
});

Util.applyIf(String.prototype, {
	/**
	 * @param {reallyDo}
	 *            要搜索字符
	 * @param {replaceWith}
	 *            要替换成的字符
	 * @return {ignoreCase} 是否忽略大小写
	 * @static
	 */
	replaceAll : function(reallyDo, replaceWith, ignoreCase) {
		if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
			return this.replace(
					new RegExp(reallyDo, (ignoreCase ? "gi" : "g")),
					replaceWith);
		} else {
			return this.replace(reallyDo, replaceWith);
		}
	},
	/**
	 * 去除字符串前后的空白字符.例如:
	 * 
	 * <pre><code>
	 * var s = '  foo bar  ';
	 * alert('-' + s + '-'); //提示 &quot;- foo bar -&quot;
	 * alert('-' + s.trim() + '-'); //提示 &quot;-foo bar-&quot;
	 * </code></pre>
	 * 
	 * @return {String} 去除空白字符后的字符串
	 */
	trim : function() {
		var re = /^\s+|\s+$/g;
		return function() {
			return this.replace(re, "");
		};
	}(),

	/**
	 * 通过占位符对字符串进行格式化.占位符的键值可以为数值索引，也可以使关键字字符串{0}, {1}, {key} 等.
	 * 占位符可以设置默认值:{key:value},当占位符没有被指定替代时将被替换为默认值value.
	 * 占位符可以带有前缀字符串:{prefix=>key},当占位符被匹配时将被替换为"prefix
	 * value"的字符串，该格式主要用于CLI命令拼接.
	 * 替换占位符的参数列表可以采用可选参数形式，参数匹配关键字为由0开始增长的索引值，也可以是JSON对象形式的键值对.例程:
	 * 
	 * <pre><code>
	 * var cls = 'my-class', text = 'Some text', src = '&lt;div class=&quot;{0}&quot;&gt;{1}&lt;/div&gt;';
	 * var s = src.format(cls, text);
	 * // s现在包含的字符串为: '&lt;div class=&quot;my-class&quot;&gt;Some text&lt;/div&gt;'
	 * 
	 * var hello1 = &quot;hello {key:world}&quot;, hello2 = &quot;hello {0:world}&quot;;
	 * var r = hello1.format(); // r现在包含的字符串为: 'hello world'
	 * r = hello1.format({
	 * 	key : &quot;Mary&quot;
	 * }); // r现在包含的字符串为: 'hello Mary'
	 * r = hello2.format(&quot;Mary&quot;); // r现在包含的字符串为: 'hello Mary'
	 * 
	 * // 使用前缀拼接命令
	 * var cmd = &quot;flow-rule {id} session-limit {session:8000} action {action:pass} {in-channel=&gt;in} {out-channel=&gt;out}&quot;;
	 * var t = cmd.format({
	 * 	id : 1,
	 * 	&quot;in&quot; : &quot;inside&quot;,
	 * 	&quot;out&quot; : &quot;outside&quot;
	 * });
	 * // t现在包含的字符串为: 'flow-rule 1 session-limit 8000 action pass in-channel inside out-channel outside'
	 * </code></pre>
	 * 
	 * @param {String/Object}
	 *            value1 替换索引值为0占位符的字符串，或者是包含占位符替换信息列表的对象.
	 * @param {String}
	 *            value2 Etc...
	 * @return {String} 格式化后的字符串
	 */
	format : function() {
		var params = {}, result = this.toString(), index = -1;
		if (arguments.length) {
			if (Util.isObject(arguments[0]) || Util.isArray(arguments[0])) {
				params = arguments[0];
			} else {
				for ( var i = 0; i < arguments.length; i++) {
					params[i] = arguments[i];
				}
			}
		}

		while ((index = result.indexOf("{")) != -1) {
			var holder = result.substring(index, result.indexOf("}") + 1);
			var key = holder.substring(1, holder.indexOf(":") != -1 ? holder
					.indexOf(":") : holder.length - 1);
			var prefix = key;
			key = (key.indexOf("=>") != -1) ? key.split("=>")[1] : key;
			prefix = (prefix.indexOf("=>") != -1) ? prefix.split("=>")[0] : "";
			var value = holder.indexOf(":") != -1 ? holder.substring(holder
					.indexOf(":") + 1, holder.length - 1) : "";
			if (key.indexOf("(") == -1) {
				var c = Util.isDefined(params[key]) && params[key] !== "";
				if (c) {
					value = params[key];
				}
				// alert(holder + " " + (c ? prefix + " " : "") + value)
				result = result
						.replace(holder, (c ? prefix + " " : "") + value);
			} else {
				words = key.substring(key.indexOf("[") + 1, key.indexOf("]"));
				words = words.split(",");
				var res = "";
				if (key.indexOf("has") != -1) {
					for ( var i = 0; i < words.length; i++) {
						if (Util.isDefined(params[words[i]])
								&& params[words[i]] !== "") {
							res = value;
							break;
						}
					}
					result = result.replace(holder, res);
				}
			}
		}
		return result;
	},
	/**
	 * 计算字符串长度，英文、半角字符算1位，中文、全角字符算2位
	 * 
	 * @return {int} 返回字符串长度
	 */
	lengthW : function() {
		return this.replace(/[^\x00-\xff]/g, '||').length;
	}
});

Util.applyIf(Date.prototype, {
	/**
	 * 对Date的扩展，将 Date 转化为指定格式的String 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2
	 * 个占位符， 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 例子： 
	 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	 * (new Date()).format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
	 */
	format : function(fmt) {
		// author: meizz
		var o = {
			"M+" : this.getMonth() + 1, // 月份
			"d+" : this.getDate(), // 日
			"h+" : this.getHours(), // 小时
			"m+" : this.getMinutes(), // 分
			"s+" : this.getSeconds(), // 秒
			"q+" : Math.floor((this.getMonth() + 3) / 3), // 季度
			"S" : this.getMilliseconds()
		// 毫秒
		};

		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
					.substr(4 - RegExp.$1.length));
		}

		for ( var k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
						: (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
	}
});

/**
 * =========== 跟时间相关的几个工具方法 ==============
 */
var TimeUtil = {

	/**
	 * 根据传入的值dayNum，取前第N天的时间参数
	 */
	getPreDate : function(dayNum){
		var timeOfPreDate = new Date().getTime() - 86400 * 1000 * dayNum ;
		return new Date(timeOfPreDate);
	}, 
	
	/**
	 * 根据传入的值temp，取前第N周的时间文字
	 */
	getPreWeekText : function(weekNum){
		var now = new Date();
		var nowYearWeek = this.getYearWeek(now);  
		return now.getFullYear() + $.i18n.prop('common_year') + (nowYearWeek - weekNum - 1) + $.i18n.prop('common_week');
	},
	
	/**
	 * 根据传入的值temp，取前第N周的时间时间对象
	 */
	getPreWeekValue : function(weekNum){
		var now = new Date();
		var time = (now.getTime()) - (weekNum * 86400000 * 7);
		return new Date(time);
	},
	
	/**
	 * 根据传入的值，返回传入时间是本年的第几周。
	 */
	getYearWeek : function(date){  
		// 获取参数时间的所在年的第一天
	    var firstDateOfYear = new Date(date.getFullYear(), 0, 1);  
	    
	    // 获取今年第一天附近与参数时间星期数一样的时间，如同样是周一的那天
	    var day = date.getDay();  
	    if(day == 0) { day = 7; }  
	    var dayOfFirstDateOfYear = firstDateOfYear.getDay();  
	    if (dayOfFirstDateOfYear == 0) { dayOfFirstDateOfYear = 7; }  
	    var timeWithSameDay = firstDateOfYear.getTime() + (dayOfFirstDateOfYear - day) * 86400000;
	    
	    // 这一天与当前天数的差值天数
	    var dayNums = Math.round((date.getTime() - timeWithSameDay) / 86400000);    
	    return Math.ceil(dayNums /7) + 1;   
	}, 
	
	/**
	 * 根据传入的值temp，取前第N月的时间参数
	 */
	getPreMonthText : function(monthNum){
		var now = new Date();
		var nowMonth = now.getMonth() + 1;
		var nowMyDate = now.getFullYear() + $.i18n.prop('common_year') + (nowMonth - monthNum) + $.i18n.prop('common_month');
		
		return nowMyDate;
	},
	
	/**
	 * 根据传入的值temp，取前第N月的时间参数
	 */
	getPreMonthValue : function(monthNum){
		var now = new Date();
		var month = now.getMonth() - monthNum;
		if (month >= 0) {
			return new Date(now.getFullYear(), month, 1);
		} else {
			return new Date(now.getFullYear() - 1, 12 + month, 1);
		}
	}
};

// 校验规则
var ValidateRules = {
	// 验证必填
	isEmpty : function(str) {
		return $.trim(str) == '';
	},
	// 验证最小长度
	minLen : function(str, len) {
		return str.length >= len;
	},
	// 验证最大长度
	maxLen : function(str, len) {
		return str.length <= len;
	},
	// 验证最大字节长度不超过多少
	maxByteLen : function(str, len) {
		return str.lengthW() <= len;
	},
	// 验证长度的区间
	inRangeLen : function(str, minL, maxL) {
		return str.length >= minL && str.length <= maxL;
	},
	// 验证最大值
	max : function(str, val) {
		var number = parseFloat(str);
		return str && !isNaN(str) && number <= val;
	},
	// 验证最大值
	min : function(str, val) {
		var number = parseFloat(str);
		return str && !isNaN(str) && number >= val;
	},
	// 验证值的范围
	inRange : function(str, min, max) {
		var number = parseFloat(str);
		return str && !isNaN(str) && number >= min && number <= max;
	},
	// 验证URL
	isUrl : function(str) {
		var reg = new RegExp("^https?://([\w-]+\.)+[\w-]+(/[\w ./?%&=-]*)?");
		return reg.test(str);
	},
	// 验证整数
	isInteger : function(str) {
		return str == '0' || /^-?[1-9]\d*$/.test(str);
	},
	// 验证正整数
	isPinteger : function(str) {
		return /^[1-9]\d*$/.test(str);
	},
	// 验证数字 0-9的数字
	isNumberStr : function(str) {
		return /^[0-9]*$/.test(str);
	},
	// 浮点数 整数或小数
	isFloat : function(str) {
		return !isNaN(str);
	},
	// 固话 格式010-8745698 或 0591-8784587
	isPhone : function(str) {
		return (/^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/
				.test(str));
	},
	// 移动电话
	isMobile : function(str) {
		return (/^1[3|4|7|9|5|8]\d{9}$/.test(str));
	},
	// 验证邮箱
	isEmail : function(str) {
		return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/.test(str);
	},
	// 全部中文
	isZh : function(str) {
		return /^[\u4e00-\u9fa5]$/.test(str);
	},
	/**
	 * 验证一个字符串是否含有中文
	 * 
	 * @param {String}
	 *            str 待验证的用户名字符串.
	 * @return {Boolean} 返回字符串是否通过验证的布尔值.
	 */
	hasZh : function(str) {
		return /[\u4E00-\u9FA5]/.test(str);
	},
	// 单词：数字，字母 下划线
	isWord : function(str) {
		return /^\w+$/.test(str);
	},
	/*
	 * 判断字符串中是否包含空格 @param {String} str_in 待检查的字符串 @return {Boolean}
	 * 返回true,不包含返回false
	 */
	hasSpace : function(str_in) {
		return str_in.indexOf(" ") != -1;
	},
	/**
	 * 验证一个字符串是否含有中文和全角字符
	 * 
	 * @param {String}
	 *            str 待验证的用户名字符串。
	 * @return {Boolean} 返回字符串是否通过验证的布尔值。
	 */
	hasZhEncod : function(str) {
		return /[^\x00-\xff]/.test(str);
	},
	/**
	 * 验证一个字符串是否为合法的用户名格式.
	 * 
	 * @param {String}
	 *            username 待验证的用户名字符串.
	 * @return {Boolean} 返回字符串是否通过验证的布尔值.
	 */
	validateName : function(username) {
		var reg = /[~`!$%^&*?+·<" ]/;
		return !reg.test(username);
	},
	/**
	 * 验证一个字符串是否为合法，所有输入框都要经过此验证
	 * 
	 * @param {String}
	 *            str 待验证的用户名字符串.
	 * @return {Boolean} 返回字符串是否通过验证的布尔值.
	 */
	vInput : function(str) {
		// 不能含有 & ? % 和 空格
		return !/[&?% ]/.test(str);
	},
	/**
	 * 严格验证一个字符串是否为合法.
	 * 
	 * @param {String}
	 *            str 待验证的用户名字符串.
	 * @return {Boolean} 返回字符串是否通过验证的布尔值.
	 */
	validateInput : function(str) {
		var reg = /[~`!$%^&*?+·< ]/;
		return !reg.test(str);
	},
	/**
	 * 验证一个字符串是否符合有效IP的格式.
	 * 
	 * @param {String}
	 *            ip 待验证的字符串.
	 * @return {Bool} 返回字符串是否通过验证的布尔值.
	 */
	isIP : function(ip) {
		if (ValidateRules.isEmpty(ip)) {
			return false;
		}
		var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/g;
		if (re.test(ip)) {
			if (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256
					&& RegExp.$4 < 256) {
				// CJL 增加每个数值的长度判定
				if (RegExp.$1.length < 4 && RegExp.$2.length < 4
						&& RegExp.$3.length < 4 && RegExp.$4.length < 4)
					return true;
			}
		}
		return false;
	},
	/**
	 * 验证一个字符串是否符合有效的 多IP 的格式.
	 * 
	 * @param {String}
	 *            str 待验证的字符串.
	 * @return {Bool} 返回字符串是否通过验证的布尔值.
	 */
	isMuchIP : function(str) {
		if (ValidateRules.isEmpty(str)) {
			return false;
		}
		var ips = str.split(',');
		for ( var i = 0, l = ips.length; i < l; i++) {
			if (!ValidateRules.isIP(ips[i])) {
				return false;
			}
		}
		return true;
	},
	/*
	 * 对输入的IP地址进行严格校验,格式为xx.xx.xx.xx @param {String} IPstr 待验证的IP串. @return
	 * {Boolean} 返回true or false
	 */
	isStrictIP : function(IPstr) {
		// 有效性校验
		var IPPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
		if (!IPPattern.test(IPstr)) {
			return false;
		}
		// 检查域值
		var IPArray = IPstr.split(".");
		if (IPArray.length != 4) {
			return false;
		}
		var tInt = 0;
		var iInt = 0;
		for (iInt = 0; iInt < 4; iInt++) {
			// 每个域值范围0-255
			tInt = parseInt(IPArray[iInt]);
			if (tInt < 0 || tInt > 255) {
				return false;
			}
			if ((tInt == 0 || tInt == 255) && iInt == 3) {
				return false;
			}
		}
		return true;
	},
	/**
	 * 判断是否单播地址
	 * 
	 * @param {String}
	 *            IPstr
	 * @return true or false
	 */
	isUnicastIP : function(IPstr) {
		/* 有效性校验 */
		var IPPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
		if (!IPPattern.test(IPstr)) {
			return false;
		}
		/* 检查域值 */
		var IPArray = IPstr.split(".");
		if (IPArray.length != 4) {
			return false;
		}
		var tInt = 0;
		var iInt = 0;
		for (iInt = 0; iInt < 4; iInt++) {
			/* 每个域值范围1-255 */
			tInt = parseInt(IPArray[iInt]);
			if (tInt < 0 || tInt > 255) {
				return false;
			}
			/* 子网或广播ip都不行 */
			if ((tInt == 0 || tInt == 255) && iInt == 3) {
				return false;
			}
			/* 0.0.0.*不可以返回false A B C类的判断 */
			if (iInt == 0 && (tInt < 1 || tInt > 223)) {
				return false;
			}
			/* 127.*.*.*不合法 */
			if (iInt == 0 && tInt == 127) {
				return false;
			}
		}
		return true;
	},
	/**
	 * 验证一个IP是否在一个IP段内
	 * 
	 * @param {String}
	 *            ip 待验证的IP.
	 * @param {String}
	 *            startIp 起始IP.
	 * @param {String}
	 *            endIp 结束IP.
	 * @param {Boole}
	 *            include 是否包含起始和结束IP.
	 * @return {Boolean} 在IP段之间则返回true.
	 */
	ipBetween : function(ip, startIp, endIp, include) {
		var vip = Util.ipToLong(ip);
		var sip = Util.ipToLong(startIp);
		var eip = Util.ipToLong(endIp);
		if (include) {
			return (vip >= sip && vip <= eip);
		} else {
			return (vip > sip && vip < eip);
		}
	},
	/**
	 * 验证IP 是否在某个网段内
	 * 
	 * @param {String}
	 *            ip IP地址如192.168.23.25
	 * @param {String}
	 *            mask IP所处的掩码，如255.255.255.0
	 * @param {String}
	 *            netCode 网段地址，如192.168.23.0
	 * @return {Boolean}
	 */
	ipInSubnet : function(ip, mask, netCode) {
		var net = Util.getNetCode(ip, mask);
		// 通过掩码计算IP的网段，判断是否一致
		return net == netCode;
	},
	/**
	 * 验证2个IP是否同属一个网段
	 */
	inSameNet : function(ip1, ip2, mask) {
		var net1 = Util.getNetCode(ip1, mask);
		var net2 = Util.getNetCode(ip2, mask);
		return net1 == net2;
	},
	/**
	 * 对输入的Mac地址进行校验.
	 * 
	 * @param {String}
	 *            MACstr 待验证的mac字符串.
	 * @return {Boolean} 掩码是否正确的布尔值.
	 */
	isMAC : function(MACstr) {
		var MACPattern = /^[0-9,a-f,A-F]{4}\.[0-9,a-f,A-F]{4}\.[0-9,a-f,A-F]{4}$/;
		if (MACstr == "0000.0000.0000") {
			return false;
		}
		if (!MACPattern.test(MACstr))
			return false;
		var unicastPattern = /^[0-9,a-f,A-F]{1}[1,3,5,7,9,b,d,f]{1}.*$/;
		if (unicastPattern.test(MACstr))
			return false;
		return true;
	},
	/**
	 * 校验是否合法的掩码地址.
	 * 
	 * @param {String}
	 *            maskCode 待验证的掩码字符串.
	 * @return {Boolean} 掩码是否正确的布尔值.
	 * @auth zhongcj at 20130106
	 */
	isMaskCode : function(maskCode) {
		// 首先判断是否合法的IP
		if (!ValidateRules.isIP(maskCode)) {
			return false;
		}
		// 二进制码要相邻，即形如111...11000...0的形式
		// 将掩码转化成32无符号整型，取反为000...00111...1，然后再加1为00...01000...0，此时为2^n，如果满足就为合法掩码
		var num = Util.ipToLong(maskCode);
		num = ~num + 1;
		// 判断是否为2^n
		return (num & (num - 1)) == 0;
	},
	/**
	 * 校验是否合法的IPV6地址，如2:14:58:a1:23:34:43:9 或缩写 20::33
	 * 
	 * @param {String}
	 *            ip 待验证的ipv6字符串.
	 * @return {Boolean} 掩码是否正确的布尔值. IPV6 格式：
	 *         8段4位16进制数字，中间用:隔开，每段中前面的0可以省略，连续的0可省略为"::"
	 * @auth zhongcj at 20130109
	 */
	isIPV6 : function(ip) {
		if (!/:/.test(ip)) {// 必须包含":"号
			return false;
		}
		if (/::/.test(ip)) {// 包含"::"号
			if (ip.match(/::/g).length > 1) {// "::"只能有一个
				return false;
			}
			return (/^::$|^(::)?([\da-f]{1,4}(:|::)){0,6}[\da-f]{1,4}$/i
					.test(ip));
		} else {// 8组4位十六进制字符串 中间用":"号隔开
			return /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(ip);
		}
	},
	/**
	 * 验证携带掩码的IPV6地址，格式2:14:58:a1:23:34:43:9/64 或缩写 20::33/64
	 */
	isIPV6WithMask : function(ip) {
		if (ip.indexOf("/") == -1) {
			return false;
		}
		var arr = ip.split("/");
		if (arr.length != 2) {
			return false;
		}
		return ValidateRules.isIPV6(arr[0])
				&& ValidateRules.inRange(arr[1], 0, 128);
	},
	/**
	 * 验证字符串是否包含空格
	 * 
	 * @return 包含空格返回true
	 */
	containSpace : function(str) {
		return / /.test(str);
	}
};


