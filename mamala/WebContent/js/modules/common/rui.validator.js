/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
表单验证控件
初始化参数列表:
isZh	:{String }是否中文，默认true
checkFuns : {Object} 拓展验证方法
fields : {Array} 验证的字段及规则
onValid ： {Function} 每次验证成功后触发事件
onInvalid ：{Function} 每次验证失败后触发事件
styleInvalid: {String } 字段验证无效时的样式
formId :{String} form的ID，可为空，当不为空时，初始化会将该form中所有rule属性不为空的字段进行注册
autoCheck :{Boolean} 是否焦点离开（checkbox和radiobutton 使用click事件）校验，默认true
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

if(!window.rui){
	window.rui = {};
}
;(function(rui,$){
    
	rui.Validator = function(opt){		
		var defOpt = {
			 //是否中文
			 isZh : true,			
			 onValid     : function(field, opts){},			 
			 onInvalid   : function(field, opts){},			
             styleInvalid : "rui-validator-input-fail",
			 autoCheck	: true
			 
		};
		this.option = $.extend(defOpt,opt);		
		//拓展验证方法
		if(this.option.checkFuns){
			this.extendCheckFun(this.option.checkFuns);
			this.option.checkFuns = null;
		}
		this.validations = [];
		//注册需要验证的字段
		if(this.option.fields){
				for(var i=0;i<this.option.fields.length;i++){
				var options = this.option.fields[i];
				this.register(options);
			}
			this.option.fields = null;
		}
		this.create();		
	}

	rui.Validator.prototype = {		
		_ruleNum : 0,//验证规则数量
		create : function(){
			//异步校验全部验证完毕回调方法
			this.onAsyComplete = null;	
			//将注册在dom中的规则注册到验证器中，注意：此方法不支持规则的beforeCheck属性
			if(this.option.formId){
				var form = document.getElementById(this.option.formId);
				for(var i = 0 ;i < form.elements.length; i++){
					var ele = $(form.elements[i]),options = $.trim(ele.attr("rValidate")||'');
					if(options){
						if(options.indexOf("{") == 0){//传入对象Json
							eval('var _options ='+options);	//使用_options防止压缩后被改名
							if(!_options){
								continue;
							}	
							options = _options;		
						}else if(options.indexOf("[") == 0 ){//传入规则数组Json
							eval('var rules = '+options);
							options = {rules:rules};
						}else{//传入规则字符串，多个用逗号隔开
							options = {rules:options.split(",")};							
						}						
						options.field = ele;
						this.register(options);	
												
					}
				}
			}				
		},
		
		//中英文提示信息,英文填在|后面
		_messages :  {
			required	: "该字段不能为空|This field is required",
			minlen 		: "长度不能小于{0}|Length can not be less than {0}",
			maxlen 		: "长度不能超过{0}|Length can not exceed {0}",
			maxByteLen 	: "字节长度不能超过{0}|Byte Length can not exceed {0}",
			rangeLen 	: "长度不能小于{0}大于{1}|Length must be greater than {0} and less than {1}",
			max 		: "值不能大于{0}|Value can not be greater than {0}",
			min 		: "值不能小于{0}|Value can not be less than {0}",
			range 		: "值不能小于{0}大于{1}|Value must be greater than {0} and less than {1}",
			email 		: "邮箱格式错误|Please enter a valid email",
			url 		: "URL地址格式错误|Please enter a valid url",
			integer 	: "必须为整数|Please enter a valid integer",
			pinteger	: "必须为正整数|Please enter a valid positive integer",
			floatNum 	: "必须为数字|Please enter a valid number",
			phone		: "电话格式错误|Please enter a valid phone",
			mobile		: "手机号码格式错误|Please enter a valid mobile",
			hasZh		: "必须含有中文|Must contains chinese word",
			isZh 		: "必须是中文|Please enter a valid chinese word",
			ip 			: "IP地址格式错误|Please enter a valid IP address ",
			strictIp	: "IP地址格式错误|Please enter a valid IP address",
			muchIp		: "IP地址格式错误|Please enter valid IP addresses",
			mac			: "MAC地址格式错误|Please enter a valid MAC",
			word		: "必须是字母、数字或下划线|Please enter a valid word",
			//subnet		: "跟掩码{0}不匹配|",
			unicastIP	: "不是有效的单播地址|Please enter a valid unicast address",
			ipBetween   : "不在网段{0}-{1}|Not in the network segment {0}-{1}",
			confirm		: "两次输入的值不一致|Two input values ​​are inconsistent",
			maskCode	: "子网掩码格式错误|Please enter a valid maskcode",
			ipv6		: "IPV6格式错误|Please enter a valid IPV6 address",
			ipv6WithMask: "IPV6格式错误|Please enter a valid IPV6 address",
			noSpecialChar:"不能包含特殊字符~`!$%^&*?+·< |Value can not contain~`!$%^&*?+·<",
			noSpace:"不能含有空格|Value can not contain space"
		},
		
		//获取提示信息
		_getRuleMsg : function(rule){
			var type = rule.type,msg = rule.msg || this._messages[type] || '';
			msg = msg.split("|")[this.option.isZh ? 0 : 1];
			switch(type){
				case "minlen":
					msg = msg.format(rule.len);
					break;
				case "maxlen":
					msg = msg.format(rule.len);
					break;
				case "maxByteLen":
					msg = msg.format(rule.len);
					break;
				case "rangeLen":
					msg = msg.format(rule.minL,rule.maxL);
					break;	
				case "max":
					msg = msg.format(rule.max);
					break;	
				case "min":
					msg = msg.format(rule.min);
					break;	
				case "range":
					msg = msg.format(rule.min,rule.max);
					break;
				/*case "subnet":
					msg = msg.format(rule.mask);
					break;*/
				case "ipBetween":
					msg = msg.format(rule.startIp,rule.endIp);
					break;	
				default :break;					
			}
			return msg;
		},
		
		//默认验证方法
		_check : {
			required : function(str){return !ValidateRules.isEmpty(str)},
			//最小长度
			minlen : function(val,rule){return ValidateRules.minLen(val,rule.len||0)},
			//最大长度
			maxlen : function(val,rule){return ValidateRules.maxLen(val,rule.len||0)},
			//长度范围
			rangeLen : function(val,rule){return ValidateRules.inRangeLen(val,rule.minL,rule.maxL)},
			//最大值
			max : function(val,rule){return ValidateRules.max(val,rule.max)},
			//最小值
			min : function(val,rule){return ValidateRules.min(val,rule.min)},
			//值范围
			range : function(val,rule){return ValidateRules.inRange(val,rule.min,rule.max)},
			//邮箱
			email : ValidateRules.isEmail,
			//网址校验
			url : ValidateRules.isUrl,
			//整数
			integer : ValidateRules.isInteger,
			//正整数
			pinteger : ValidateRules.isPinteger,
			//整数或小数
			floatNum : ValidateRules.isFloat,
			//固话
			phone : ValidateRules.isPhone,
			//移动电话
			mobile : ValidateRules.isMobile,
			//是否含有中文
			hasZh : ValidateRules.hasZh,
			//必须是中文
			isZh : ValidateRules.isZh,
			//IP
			ip : ValidateRules.isIP,
			//严格IP校验
			strictIp : ValidateRules.isStrictIP,
			//多IP
			muchIp : ValidateRules.isMuchIP,
			//MAC地址
			mac : ValidateRules.isMAC,
			//单词：数字，字母 下划线
			word : ValidateRules.isWord,
			//验证网段 与掩码是否匹配
			/*subnet: function(val,rule){
				if(!ValidateRules.isIP(val)){
					return false;
				}
				return ValidateRules.ipInSubnet(val,rule.mask)
			},*/
			//单播地址
			unicastIP : ValidateRules.isUnicastIP,
			//验证一个IP是否在一个IP段内
			ipBetween : function(val,rule){
				if(!ValidateRules.isIP(val)){
					return false;
				}
				return ValidateRules.ipBetween(val,rule.startIp,rule.endIp,rule.include)
			},
			//判断2个字段值是否一样
			confirm : function(val,rule){return ($("#"+rule.confirmField ).val() == val);},
			//判断子网掩码格式是否正确
			maskCode :ValidateRules.isMaskCode,
			//IPV6，如2:14:58:a1:23:34:43:9
			ipv6 : ValidateRules.isIPV6,
			//IPV6+掩码，如2:14:58:a1:23:34:43:9/64
			ipv6WithMask : ValidateRules.isIPV6WithMask,
			//不含特殊字符：不能包含~`!$%^&*?+·< 
			noSpecialChar:ValidateRules.validateInput,
			//不能含有空格
			noSpace : function(val){return !ValidateRules.containSpace(val);},
			//最大字节全角字符算2个
			maxByteLen : function(val,rule){return ValidateRules.maxByteLen(val,rule.len||0)}
		},
		
		/**
		 * 拓展验证方法
		 * @param funs {Object} 验证方法集合 key-验证类别，value-验证方法 
		 */
		extendCheckFun : function(funs){
			$.extend(this._check,funs);				
		},
		
		/**
		注册
		{
			field : {String|Dom Object|Jquery Object} 验证字段,ID或者dom 对象或者Jquery对象
			rules : {Array} 验证类型
			[{	type:验证类型
				msg : 错误消息
				beforeCheck : {Function} 验证前判断函数
				其他判断条件参数：
				confirmField : {String}如果type是confirm，该字段为要比对的字段ID
				isAsy:是否异步验证，默认false
			}...]
			x:{int} 提示层相对于字段的X 位移
			y :{int} 提示层相对于字段的Y 位移			
			focusText:{String} 文本域聚焦时的提示文本信息，只用于text和textarea域，如需双语支持，中文在前，英文在后，用|隔开
		}
		*/
		register : function(options){
			//规则无参数时可以用string，支持多个，用逗号隔开
			if(Util.isString(options.rules)){
				options.rules = options.rules.split(",");
			}else if(Util.isObject(options.rules)){
				options.rules = [options.rules];
			}			
			for(var i = 0;i < options.rules.length; i++){
				var rule = options.rules[i];
				if(Util.isString(rule)){
					options.rules[i] = rule = {type:rule};
				}
				rule.msg = this._getRuleMsg(rule);
				rule.isValid = true;//设置验证初始值
				this._ruleNum++;
			}		
			
			var  self = this,field ;
			if(Util.isJQuery(options.field)){//jq对象
				field = options.field;
			}else if(Util.isString(options.field)){//ID
				field = $("#"+options.field);
			}else{//对象
				field = $(options.field);
			}
			options.field = field;			
			//聚焦文本
			if(options.focusText){
				options.focusText = options.focusText.split("|")[this.option.isZh ? 0 : 1];
			}			
			//验证是否已经注册过
			for(var i = 0;i< this.validations.length; i++){
				var item = this.validations[i];
				if(item.field[0] == options.field[0]){
					alert(options.field[0].id+'字段重复注册');
					return;
				}
			}
			this.validations.push(options);		
			if(this.option.autoCheck){//验证事件绑定
				if(this._isChildType(field)){// radio/check 点击进行验证
					var nlButtonGroup = document.getElementsByName(field[0].name);
					for(var i = 0; i < nlButtonGroup.length; i++) {
						$(nlButtonGroup[i]).click(function(){				
							self._validateChildField(options);			
						});
					}								
				}else{//其他焦点离开时验证
					field.blur(function(){				
						self._validateField(options);			
					});
					var elType = field[0].type.toLowerCase();
					if(elType == 'text' || elType == 'textarea' || elType == 'password' ){
						field.focus(function(){
							if(options.focusText){
								self._bubbleTip(options,options.focusText,true);
							}else{
                                                            self._renderField(options,true);
                                                        }
							
						});
					}
				}
			}		
					
		},

		_isChildType: function(el) {
			var elType = el[0].type.toLowerCase();		
			if((elType == "radio") || (elType == "checkbox")) return true;
			return false;
		},

		/**
		 * 校验全部
		 */
		_validateAll : function(){			
			var self = this;
			$.each(this.validations,function(i,options) {				
				var ele = options.field;
				if(self._isChildType(ele)) self._validateChildField(options);
				else self._validateField(options);
			});
		},
		
		/**
		同步校验所有注册的字段		
		*/
		validate : function(){	
			var isValid = true;
			this._validateAll();	
			for(var i=0;i< this.validations.length; i++){
				var options = this.validations[i];
				for(var j=0;j<options.rules.length;j++){
					var rule = options.rules[j];
					if(!rule.isValid){
						return false;
					}
				}
			}	
			return true;			
		},

		/**
		异步校验所有注册的字段		
		*/
		asyValidate : function(onAsyComplete){
			this.onAsyComplete = onAsyComplete;
			for(var i=0;i< this.validations.length;i++){
					var options = this.validations[i];
					for(var j=0;j< options.rules.length; j++){
						var rule = options.rules[j];
						rule.isFinish = false;							
					}
			}
			this._validateAll();			
		},
		
		/**
		校验单个字段		
		*/
		_validateField : function(options){			
			var field = options.field,val = '';
			if(field[0].type.toLowerCase().indexOf("select") != -1){//取select值时直接调用原生方法
				val = field[0].value;
			}else{
				val = field.val();
			}
			if(options.beforeCheck && !options.beforeCheck()){//字段验证前的判断函数
				this._resetField(options);					
				return;
			}
			val = $.trim(val);
			//当字段为空时，如果不是必填字段不校验
			if(ValidateRules.isEmpty(val)){
				var isReq = false;
				for(var i=0; i < options.rules.length; i++){
					var rule = options.rules[i];
					if(rule.type == "required"||rule.mustExec){
						isReq = true;
						break;
					}
				}
				if(!isReq){
					this._resetField(options);					
					return;
				}		
			}
			
			
			//逐个规则验证
			for(var i=0; i < options.rules.length; i++){
				var rule = options.rules[i];
				//验证前置条件判断
				if(rule.beforeCheck && !rule.beforeCheck()){
					this._msgRemove(options,rule);
					continue;
				}
				//获取验证函数校验				
				var chkFun = this._check[rule.type];
				if(!chkFun){
					alert('找不到对应的验证规则!');
					return;
				}	
				if(!rule.isAsy){//同步验证
					var ret = chkFun(val,rule);
					this._checkBack(options,rule,ret);
				}else{//异步验证
					chkFun(val,options,rule,$.proxy(this._checkBack,this));
				}
			}
			
		},		
		
		//单个验证规则回调方法
		_checkBack :function(options,rule,isValid){						
			if(isValid){
				this._msgRemove(options,rule);
			}else{
				this._msgInject(options,rule);
			}	
			//全部验证完成时调用回调方法		
			if(this.onAsyComplete != null){
				rule.isFinish = true;
				var completeNum = 0;//已完成校验的数量
				for(var i=0;i< this.validations.length;i++){
					var options = this.validations[i];
					for(var j=0;j< options.rules.length; j++){
						var rule = options.rules[j];
						if(rule.isFinish){
							completeNum++;	
						}
					}
				}	
				if(completeNum == this._ruleNum){//已完成所有验证 调用回调方法
					var ret = this.getErrors();				
					this.onAsyComplete(ret.length ==0,ret); 
					this.onAsyComplete = null;
				}				
			}			
		},
		
		
		/**
		radio和checkbox的验证，仅支持required的校验
		*/
		_validateChildField: function(options) {
			var child = options.field,rule = options.rules[0];
			//验证条件判断			
			if(rule.beforeCheck && !rule.beforeCheck()){
				this._msgRemove(options,rule);
				return;
			}		
			var nlButtonGroup = document.getElementsByName(child[0].name);
			var cbCheckeds = 0;
			var isValid = true;
			for(var i = 0; i < nlButtonGroup.length; i++) {
				if(nlButtonGroup[i].checked) {
					cbCheckeds++;					
				}
			}
			if(cbCheckeds == 0 && rule.type == "required") isValid = false;			
			this._checkBack(options,rule,isValid);
			
		},

		/**
		显示指定字段的错误信息
		
		injectMsg : function(fieldId){	
			var self = this,ele = document.getElementById(fieldId) ;		
			$.each(self.validations,function(i,n){
				if(ele == n.field){
					self._msgInject(n);
					return false;
				}				
			});
			self = null;
			ele = null;
		},*/

		
		/**
		显示错误信息
		*/
		_msgInject : function(options,rule){			
			var field = options.field;
			rule.isValid = false ;		
			if(this.option.autoCheck){	
				this._renderField(options,false);		
				this.option.onInvalid && this.option.onInvalid(field,rule.type,rule.msg);
			}
		},

		/**
		重置某个字段
		*/
		resetField : function(fieldId){	
			var self = this;		
			$.each(self.validations,function(i,n){
				if(fieldId == n.field[0].id){					
					self._resetField(n);
					return false;
				}				
			});
			self = null;
			ele = null;
		},
		
		//判断字段的所有规则是否全部验证通过
		_fieldIsValid : function(options){
			for(var i=0;i< options.rules.length;i++){
				var r = options.rules[i];
				if(!r.isValid){
					return false;
				}
			}
			return true;
		},
		
		/**
		删除某个规则的错误信息
		*/
		_msgRemove : function(options,rule){
			var field = options.field;
			rule.isValid = true ;
			if(this.option.autoCheck){	
				var fieldValid = this._fieldIsValid(options);
				this._renderField(options,fieldValid);
				this.option.onValid && this.option.onValid(field,rule.type);
			}
		},
		
		/**
		 * 字段验证通过和不通过的外观显示
		 */
		_renderField : function(options,isFieldValid){			
			var field = options.field;
			if(isFieldValid){			
				this._hideTip(field,options);	
				field.removeClass(this.option.styleInvalid);
			}else{
				this._showTip(options);
				if(!this._isChildType(field)){				
					field.addClass(this.option.styleInvalid);		
				}	
			}			
		},
		
		/**
		 * 重置一个字段
		 */
		_resetField : function(options){
			for(var i=0;i< options.rules.length;i++){
				var r = options.rules[i];
				r.isValid = true ;
				r.isFinish = false;
			}		
			this._renderField(options,true);	
		},
		/**
		显示弹出层信息
		<div class="rui-validator-tip">
		   <span class="rui-validator-tip-arrow"></span>
		   <span class="rui-validator-tip-txt"></span>
		</div>
		*/
		_showTip :function(options){	
			//只显示第一条错误消息
			var msg,type;
			for(var i = 0;i < options.rules.length; i++){
				var rule = options.rules[i];
				if(!rule.isValid){
					msg = rule.msg,type=rule.type;
					break;
				}
			}	
			this._bubbleTip(options,msg);
					
		},
		
		_bubbleTip : function(options,msg,isFocus){
			var field = options.field;
			if(!options.tip){				
				if(options.tipId){//插入到指定的位置
					options.tip = this._createTip($("#"+options.tipId),msg).addClass("rui-validator-tip-rela");
				}else{//浮动层					
					var offset = field.offset(),x = offset.left + field[0].offsetWidth+ (options.x || 18),y= offset.top +(options.y || 0);
					options.tip = this._createTip($("<div>"),msg).css({
						left : (x+"px"),
						top : (y+"px")
					}).addClass("rui-validator-tip-abs").appendTo(document.body);
				}				
			}else{
				options.tip.find(".rui-validator-tip-txt").text(msg);
				options.tip.show();			
			}	
			if(isFocus){
				options.tip.addClass("rui-validator-tip-focus");
				field.removeClass(this.option.styleInvalid);
			}else{
				options.tip.removeClass("rui-validator-tip-focus");
			}
			
		},
		//创建提示层
		_createTip : function(div,msg){			
	
			var arrow = $("<span>").addClass("rui-validator-tip-arrow"),
				txt = $("<span>").addClass("rui-validator-tip-txt").text(msg);
				div.addClass("rui-validator-tip").append(arrow).append(txt);
						
			return div;
		},

		/**
		隐藏弹出层信息
		*/
		_hideTip: function(field,options){			
			options.tip && options.tip.hide();
		 },
	
		/**
		重置状态
		*/
		reset : function(){
			this.onAsyComplete = null;
			for(var i=0;i< this.validations.length;i++){
				var options = this.validations[i];
				this._resetField(options);
			}			
		},

		setOption : function(key,val){
			var self = this;
			switch(key){
				case "onValid" :break;
				case "onInvalid" :break;
				default: return;	
			}
			this._setOpt(key,val);
		},
		_setOpt : function(key,val){
			this.option[key] = val;		
		},
		
		/**
		获取全部验证错误提示信息
		*/
		getErrors : function(){
			var ret = [];
			for(var i=0;i< this.validations.length; i++){
				var options = this.validations[i];
				for(var j=0;j<options.rules.length;j++){
					var rule = options.rules[j];
					if(!rule.isValid){
						ret.push({
							type : rule.type,
	                        msg : rule.msg,
							fieldId : options.field[0].id					
						});
					}
				}
			}			
			return ret;
		},
		
		/**
		销毁方法
		*/
		destroy : function(){
			$.each(this.validations,function(i,item){
				if(item.tip){
					var tmp = item.tip; 
					item.tip = null;
					Util.removeElement(tmp[0]);
				}	
				item.field.unbind();
				item.field = null;
			});		
			this.validations = null;	
		}
	
	}
})(rui,jQuery);
