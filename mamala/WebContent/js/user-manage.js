define(function(require, exports, module){
	window.pageUser = {};
	var loginUser;
	var comm = require('../../js/modules/common/common');
	pageUser.dom = {
		/* clkFeatureTd: 点击功能列表的单元格时保存的td对象 */
		clkFeatureTd: null
		/* mark 遮罩层 */
	};
	pageUser.base = {
		url: comm.jsonServer(),
		gridId: 'grid_dom',
		/*以下4个，需先查询一次, unionList可能是buildingList也可能是merchantList*/
		roleList: [],
		unionList: [],
		funcList: [],
		userList: [],
		postList: [],
		/*更新指定的字段，打桩的 */
		updRowField: ['', '', 'accountType', 'tenant', 'post', 'contact', 'featureList'],
		apiField: [
			{name: 'userID', caption: 'userID', isHide: true},
			{name: "userName", caption: "帐号名", width:50},
			{name: 'name', caption: '姓名', width: 50},
			{name: 'userPass', caption: '密码', width:100},
			{name: "roleID", caption: "帐号类别", formater: 'pageUser.grid.formater.roleList', className: 'select', width:120},
			{name: "roleName", caption: "帐号类别", width:120},
			{name: "unionID", caption: "门店名称", formater: 'pageUser.grid.formater.unionList', className: 'select', width:120},
			{name: "unionName", caption: "所属商户", width:120},
			{name: "position", caption: "职位", formater: 'pageUser.grid.formater.postList', className: 'select', width:120},
			{name: "phoneNum", caption: "联系方式", width:100},
			{name: "funcList", caption: "功能列表",  formater: 'pageUser.grid.formater.funcList', className: 'feature-list', userCss: 'account-func', userId: 'user_func_list', width:220}
			,{caption: "操作", name: "oper", formater: 'pageUser.grid.formater.operations', width:180}
		]
		/*exclude 排除的字段*/
		,rootExclude: ['userPass', 'roleID', 'unionID']
		,tenantExclude: ['userPass', 'roleID', 'unionID']
		/*createUser 排除的字段*/
		,rootCreateExclude: ['userID', 'roleName', 'unionName', 'oper']
		,tenantCreateExclude: ['userID', 'roleName', 'unionName', 'oper']
		,canEditField: [ 'phoneNum', 'userPass']
	};
	/* 打桩数据 */
	pageUser.demo = {
		userList: [
			{userID: 1, userName: 'admin', roleID: '1', unionID: '0', position: '总监', phoneNum: '13806008003', funcList: [{funcId: 0, funcName: '总体情况'}, {funcId: 1, funcName: '客流分析'}, {funcId: 2, funcName: '进店分析'}], oper: [] }
			,{userID: 2, userName: 'admin1', roleID: '0', unionID: '1', position: '总经理', phoneNum: '1331333133', funcList: [{funcId: 0, funcName: '总体情况'}, {funcId: 1, funcName: '客流分析'}, {funcId: 2, funcName: '进店分析'}], oper: [] }
			,{userID: 2, userName: 'admin1', roleID: '0', unionID: '1', position: '总经理', phoneNum: '1331333133', funcList: [{funcId: 0, funcName: '总体情况'}, {funcId: 1, funcName: '客流分析'}, {funcId: 2, funcName: '进店分析'}], oper: [] }
		]
		,roleList: [{roleID:0, roleName:'系统管理员'}, {roleID:1, roleName:'门店管理员'}]
		,unionList: [{merchantID: 0, merchantName: '中华城'}, {merchantID: 1, merchantName: '厦门T4'}] // 商户列表
		// ,unionList: [{buildingID: 0, buildingName: '中华城'}, {buildingID: 1, buildingName: '厦门T4'}] // 门店列表
		,funcList: [{funcId: 0, funcName: '总体情况'}, {funcId: 1, funcName: '客流分析'}, {funcId: 2, funcName: '进店分析'}, {funcId: 3, funcName: '驻留分析'}, {funcId: 4, funcName: '客流预测'}, {funcId: 5, funcName: '商铺关联'}, {funcId: 6, funcName: '单用户轨迹'}, {funcId: 7, funcName: '实时位置'} ]
	};

	pageUser.api = {
		ajaxSetup: function(content){
			var param = {
				type: 'post',
				url: pageUser.base.url,
				dataType: 'json',
				contentType: 'application/json',
				async: false,
				timeout: 5000
			};
			var apiData = {appId: 'null', version: '1.0', sign: 'null'};
			apiData.content = content;
			param.data = JSON.stringify(apiData);
			return param;
		},
		ajaxFail: function(data){
			if(data.statusText ==  'Forbidden'){
				if(window.parent){
					window.parent.location.href ='../../login.html';
					return;
				}
				window.location.href ='../../login.html';
			}
		},
		updRow: function(rowData, tr, changedData){
			if (!rowData.funcList || rowData.funcList.length == 0) {
				pageUser.alert('功能列表至少选择一个', '');
				tr.removeClass('ban').find('.ban').removeClass('ban');
				return false;
			}
			if(!!rowData.funcList){
				var aar=(rowData.funcList).split(',');

				/* NOTE: 暂时改为整行更新，待后台支持指定字段更新..*/
	            var result = [], hash = {};
	            for (var i = 0, elem; (elem = aar[i]) != null; i++) {
	                if (!hash[elem]&&elem!='0') {
	                    result.push(elem);
	                    hash[elem] = true;
	                }
	            }
	            rowData.funcList= result.toString();
			}
			var content = $.extend({method: 'userManage.changeUser'}, rowData);
			console.log('更新用户的数据:',pageUser.api.ajaxSetup(content));
			$.ajax(pageUser.api.ajaxSetup(content)).done(function(data){
				console.log('update user:', data);
				if (data.content.code != 100) {
					pageUser.message('服务器返回错误:'+data.content.code, data.content.desc);
				} else {
					pageUser.grid.updRow(changedData, tr);
					pageUser.message('更新用户'+rowData.userName+'成功', '')
				}
			}).fail(function(msg){
				pageUser.api.ajaxFail(msg);
				pageUser.message('服务器错误'+msg.statusText,'');
				tr.removeClass('ban');
				tr.find('.ban').removeClass('ban');
			});
		},
		delRow: function(userID, tr){
			var content = {method: 'userManage.deleteUser', userID: userID};
			$.ajax(pageUser.api.ajaxSetup(content)).done(function(data){
				console.log('delete user:', data);
				if (data.content.code != 100) {
					pageUser.message('服务器返回错误:'+data.content.code, data.content.desc);
					tr.removeClass('ban');
					tr.find('.ban').removeClass('ban');
				} else {
					/* 如果删除自己，返回登录页面 */
					if (loginUser.userID == userID) {
						pageUser.api.ajaxFail({statusText: 'Forbidden'});
					}
					pageUser.message('删除用户成功',data.content.desc);
					pageUser.api.getUserList({index:0,limit:pageUser.pagination.pageSize});
				}
			}).fail(function(msg){
				pageUser.api.ajaxFail(msg);
				pageUser.message('服务器错误'+msg.statusText,'删除用户失败');
				tr.removeClass('ban');
				tr.find('.ban').removeClass('ban');
			});
		},
		getUserList: function(params){
			//params = {index: 0, limit: 10, userName: 'admin', roleName: 'role', unionName: 'xxx'}
			var content = {method: 'userManage.userList'};
			$.extend(content, params);

			$.ajax(pageUser.api.ajaxSetup(content)).done(function(data){
				console.log('get userList:', data);
				if (data.content.code != 100) {
					pageUser.message('服务器返回错误:'+data.content.code, data.content.desc);
				} else {
					/*设置分页条数*/
					// page.pagination 此时还没生成，通过grid保存
					pageUser.grid.totalcount = data.content.totalNum;
					pageUser.base.userList = data.content.list;
					pageUser.grid.update(data.content.list);
					pageUser.pagination.totalCount = data.content.totalNum;
					pageUser.pagination.update();
					pageUser.Event.fixUpdEvent();
				}
			}).fail(function(msg){
				pageUser.api.ajaxFail(msg);
				pageUser.message('服务器错误'+msg.statusText,'请求用户列表数据失败');
			});
		},
		getRoleList: function(){
			var content = {method: 'userManage.roleList'};
			$.ajax(pageUser.api.ajaxSetup(content)).done(function(data){
				console.log('get roleList:', data);
				if (data.content.code != 100) {
					pageUser.message('服务器返回错误:'+data.content.code, data.content.desc);
				} else {
					pageUser.base.roleList = data.content.list;
				}
			}).fail(function(msg){
				pageUser.api.ajaxFail(msg);
				pageUser.message('服务器错误'+msg.statusText,'请求权限列表数据失败');
			});
		},
		getUnionList: function(){
			var content = {method: 'userManage.buildingList'};
			if (loginUser.roleName == '系统管理员'){
				content = {method:'userManage.merchantList'};
			}
			$.ajax(pageUser.api.ajaxSetup(content)).done(function(data){
				console.log('get unionList:', data);
				if (data.content.code != 100) {
					pageUser.message('服务器返回错误:'+data.content.code, data.content.desc);
				} else {
					pageUser.base.unionList = data.content.list;
				}
			}).fail(function(msg){
				pageUser.api.ajaxFail(msg);
				pageUser.message('服务器错误'+msg.statusText,'请求商户列表数据失败');
			});
		},
		getFuncList: function(){
			var content = {method: 'userManage.funcList'};
			$.ajax(pageUser.api.ajaxSetup(content)).done(function(data){
				console.log('get funcList:', data);
				if (data.content.code != 100) {
					pageUser.message('服务器返回错误:'+data.content.code, data.content.desc);
				} else {

                    var ret= data.content.list;
                    var list=[];

                    for(var i=0;i<ret.length;i++){
                        if(ret[i].pageUrl!=""){
                            ret[i].funcID=ret[i].funcID+","+ret[i].pageArg;
                            list.push(ret[i]);
                        }
                    }
					pageUser.base.funcList = list;
				}
			}).fail(function(msg){
				pageUser.api.ajaxFail(msg);
				pageUser.message('服务器错误'+msg.statusText,'请求功能列表数据失败');
			});
		},
		getPostList: function() {
			var content = {method: 'userManage.positionList'};
			$.ajax(pageUser.api.ajaxSetup(content)).done(function(data){
				console.log('get positionList:', data);
				if (data.content.code != 100) {
					pageUser.message('服务器返回错误:'+data.content.code, data.content.desc);
				} else {
					pageUser.base.postList = data.content.list;
				}
			}).fail(function(msg){
				pageUser.api.ajaxFail(msg);
				pageUser.message('服务器错误'+msg.statusText,'请求功能列表数据失败');
			});
		},
		updPwd: function(userID, tr) {
			var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
			var maxPos = chars.length;
			var pwd = '', i;
			for (i=0; i<6; i++) {
				pwd += chars.charAt(Math.floor(Math.random() * maxPos));
			}
			var newPwd = $.md5(pwd);
			var content = { method: 'userManage.resetPassword',
							userID: userID, newPass: newPwd };
			$.ajax(pageUser.api.ajaxSetup(content)).done(function(data){
				console.log('update password:', data);
				if (data.content.code != 100) {
					pageUser.message('服务器返回错误:'+data.content.code, data.content.desc);
				} else {
					pageUser.alert('您的新密码是：'+pwd);
					pageUser.message('用户密码重置成功',data.content.desc);
					tr.removeClass('ban');
					tr.find('.ban').removeClass('ban');
				}
			}).fail(function(msg){
				pageUser.api.ajaxFail(msg);
				pageUser.message('服务器错误'+msg.statusText,'用户密码重置失败');
				tr.removeClass('ban');
				tr.find('.ban').removeClass('ban');
			});
		},
		addUser: function() {
			$(".alert").remove();
			$('#submit_account').addClass('ban');
			var content = $('#add_count_form').serializeObject();
			if (!content.userName.trim()) {
				pageUser.alert('用户名不能为空', '');
				$('#submit_account').removeClass('ban');
				return false;
			}
			if (!content.password) {
				pageUser.alert('密码不能为空', '');
				$('#submit_account').removeClass('ban');
				return false;
			}
			if (!pageUser.grid.clean(content)) {
				$('#submit_account').removeClass('ban');
				return false;
			}
			content.password = $.md5(content.password);
			var funcList = $('#user_func_list').data('funcList');
			/*如果默认没改变，则选全部功能*/
			if (!funcList || funcList.length == 0) {
				if($('#user_func_list').html()==""){
					pageUser.alert('功能列表至少选择一个', '');
					$('#submit_account').removeClass('ban');
					return false;
				}
				funcList = pageUser.base.funcList.map(
                    function(l){
                        return l.funcID;
                    }).toString();
			}
			content.funcList = funcList;
            var aar=(content.funcList).split(',');

            /* NOTE: 暂时改为整行更新，待后台支持指定字段更新..*/
            var result = [], hash = {};
            for (var i = 0, elem; (elem = aar[i]) != null; i++) {
                if (!hash[elem]&&elem!='0') {
                    result.push(elem);
                    hash[elem] = true;
                }
            }
            content.funcList= result.toString();

			content.method = 'userManage.addUser';
			console.log('添加用户：', content);
			$.ajax(pageUser.api.ajaxSetup(content)).done(function(data){
				console.log('addUser:', data);
				if (data.content.code != 100) {
					pageUser.message('服务器返回错误:'+data.content.code, data.content.desc);
					$('#submit_account').removeClass('ban');
				} else {
					pageUser.message('成功添加用户:'+content.userName, '');
					pageUser.api.getUserList({index:0, limit: pageUser.pagination.pageSize});
					pageUser.hideUserPanel();
				}
			}).fail(function(msg){
				pageUser.api.ajaxFail(msg);
				pageUser.message('服务器错误'+msg.statusText,'添加用户:'+content.userName+'失败');
				$('#submit_account').removeClass('ban');
			});
		}
	};
	pageUser.createUserPanel = function () {
		var role = loginUser.roleName;
		var field = pageUser.base.apiField;
		var exclude = role == '系统管理员' ? pageUser.base.rootCreateExclude : pageUser.base.tenantCreateExclude;
		var html = '', i, f;
		for (i=0; i<field.length-1; i++) {
			f = field[i];
			if (exclude.indexOf(f.name) != -1){
				continue;
			}
			if (f.hasOwnProperty('formater')){
				if (f.name == 'unionID') {
					f.caption = role == '系统管理员' ? '所属商户' : f.caption;
				}
				var func = typeof f.formater == 'function' ? f.formater : eval(f.formater);
				html += '<label><span class="account-label">'+ f.caption +'</span>'
					+ '<span class="'+(f.userCss || '')+'" id="' + (f.userId || '')
					+'">'+func()+'</span></label>';
			}else if (f.name == 'userPass') {
				html += '<label><span class="account-label">'+ f.caption +'</span>'
					+ '<input type="text" name="password" onfocus="this.type='+"'password'"+'" autocomplete="off"/></label>';
			}else{
				html += '<label><span class="account-label">'+ f.caption +'</span>'
					+ '<input type="text" name="'+ f.name +'"></label>';
			}
		}
		pageUser.mark();
		$('#add_count_form').html(html).parent().show();
	};
	pageUser.hideUserPanel = function () {
		$(".alert").remove();
		$('#user_panel').hide();
		!!pageUser.dom.mark && pageUser.dom.mark.remove();
		$('#submit_account').removeClass('ban');
	};
	pageUser.mark = function() {
		pageUser.dom.mark = $('<div class="mark"></div>').appendTo($('body'));
	};
	pageUser.message = function (title, info) {
		var msg = $('<div class="msg-item"><h6>' + title + '</h6><p>' + info + '</p></div>');
		$('#msg').append(msg);
		msg.delay(3000).fadeOut(2000, function(){msg.remove()});
	};
	pageUser.alert = function (title, msg) {
		var t = title || '';
		var m = msg || '';
		var html = $('<div class="alert"><button type="button" class="close">'
             +'<span>&times;</span></button><b>' + t + '</b><p>' + m + '</p></div>');
		$('body').append(html);
		html.on('click', 'button.close', function(){html.remove();});
	};
	pageUser.resize = function () {
		var w = document.documentElement.clientWidth-160;
		var h = $('.main-menu-wrap').height()-160;
////		var w = $('.header').parent().width();
//		// if (w < 750) w = 750;
		$('#'+pageUser.base.gridId+'_tableContent').width((w-20)+'px');
		$('#'+pageUser.base.gridId+'_headerTable').width((w-20)+'px');
//		
		$('#grid_dom_scroller').height(h+'px');
//		$('#grid_dom_page').width(w+'px');
	};
	
	pageUser.Event = {
		/*行若有更新，则继续显示`保存`，否则显示`修改`*/
		rowChangeHandle: function(tr) {
			var changed = !!tr.children('.changed').length;
			if (changed) {
				tr.find('.oper-btn-edit').replaceWith('<span class="oper-btn oper-btn-sav">保存</span>');
			} else {
				tr.find('.oper-btn-sav').replaceWith('<span class="oper-btn oper-btn-edit">修改</span>');
			}
		},
		showUserTip: function() {
			var span = $(this);
			var features = span.text().split(',');
			// funcList ==  [{funcId: 0, funcName: '总体情况'}, ...]
			var funcList = pageUser.base.funcList;
			var html = '', chkCss, checked, isChecked, i;
			for (i=0; i < funcList.length; i++) {
				isChecked = features.indexOf(funcList[i].funcName) != -1;
				chkCss = checked = '';
				if (isChecked) {
					chkCss = 'sel-feature';
					checked = 'checked="checked"';
				}
				html += '<label class="normal ' + chkCss + '" value="'
					+ funcList[i].funcID + '"><span>' + funcList[i].funcName
					+ '</span></label>';
			}
			var h = span.height();
			var w = span.width();
			var o = span.offset();
			$('#user_tip_panel').html(html).css('width', w + 'px').show().offset({
				'top': o.top + h + 1,
				'left': o.left
			});
			return false;
		},
		handleUserTip: function() {
			var target = $('#user_func_list');
			var self = $(this);
			if (self.hasClass('sel-feature')) {
				self.removeClass('sel-feature');
				self.children('input').attr('checked', false);
				// var rowIndex = $('.rui-grid-row-selected').index();
			} else {
				self.addClass('sel-feature');
				self.children('input').attr('checked', true);
			}

			// funcList ==  [{funcId: 0, funcName: '总体情况'}, ...]
			var tipData = [];
			var tipText = [];
			$('#user_tip_panel').find('.sel-feature').each(function(){
				tipData.push(this.getAttribute('value'));
				tipText.push(this.textContent);
			});
			/*更新单元格*/
			target.text(tipText.toString());
			target.data('funcList', tipData.toString());
			return false;
		},

		/*显示功能列表面板*/
		showTip: function() {
			var td = $(this);
			pageUser.dom.clkFeatureTd = td;
			var features = td.text().split(',');
			// var features = pageUser.base.funcList;
			// funcList ==  [{funcId: 0, funcName: '总体情况'}, ...]
			var funcList = pageUser.base.funcList;
			var html = '', chkCss, checked, isChecked, i;
			for (i=0; i < funcList.length; i++) {
				isChecked = features.indexOf(funcList[i].funcName) != -1;
				chkCss = checked = '';
				if (isChecked) {
					chkCss = 'sel-feature';
					checked = 'checked="checked"';
				}
				html += '<label class="normal ' + chkCss + '"><input type="checkbox"'
					+ ' name="feature" value="' + funcList[i].funcID + '" ' + checked
					+ '><span>' + funcList[i].funcName + '</span></label>';
			}
			var h = td.height();
			var w = td.width();
			var o = td.offset();
			$('#grid_tip').html(html).css('width', w + 'px').show().offset({
				'top': o.top + h + 2,
				'left': o.left
			});
			pageUser.Event.rowChangeHandle(td.parent());
		},
		/* 功能列表弹出层的点击事件 */
		handleTip: function() {
			var self = $(this);
			/* 权限判断 */
			var rowData = pageUser.grid.getSelectedRows()[0];
			if (loginUser.roleName != '系统管理员') {
				if (loginUser.roleName == '门店管理员') {
					if (rowData.roleName == loginUser.roleName){
						//[{buildingID: 0, buildingName: '中华城'}, {buildingID: 1, buildingName: '厦门T4'}]
						return false;
					}
				} else {
					return false;
				}
			} else if (rowData.roleID == loginUser.roleID) {
				return false;
			}
			if (self.hasClass('sel-feature')) {
				self.removeClass('sel-feature');
				self.children('input').attr('checked', false);
				// var rowIndex = $('.rui-grid-row-selected').index();
			} else {
				self.addClass('sel-feature');
				self.children('input').attr('checked', true);
			}

			var tdData = pageUser.grid.getSelectedRows()[0].funcList;
			// funcList ==  [{funcId: 0, funcName: '总体情况'}, ...]
			var tipData = [];
			$('#grid_tip').find('input:checked').each(function(){
				tipData.push(this.value);
			});
			var tipText = [];
			$('#grid_tip').find('.sel-feature').each(function(){
				tipText.push(this.textContent);
			});
			/*更新单元格*/
			pageUser.dom.clkFeatureTd.children().text(tipText.toString());
			pageUser.dom.clkFeatureTd.data('funcList', tipData.toString());
			/*判断原始数据是否有改变*/
			var isChanged = false, i;
			if (tdData.length != tipText.length) {
				isChanged = true;
			} else {
				for (i = 0; i < tdData.length; i++) {
					if (tipText.indexOf(tdData[i].funcName) == -1) {
						isChanged = true;
						break;
					}
				}
			}

			if (isChanged) {
				pageUser.dom.clkFeatureTd.addClass('changed');
			} else {
				pageUser.dom.clkFeatureTd.removeClass('changed');
			}
			pageUser.Event.rowChangeHandle(pageUser.dom.clkFeatureTd.parent());
			return false;
		},
		/*取消弹出层，取消编辑状态*/
		hideTip: function() {
			$('#grid_tip').hide();
			$('#user_tip_panel').hide();
			$('#'+pageUser.base.gridId + '_tableContent').find('.td-focus').removeClass('td-focus');
		},
		/*操作按钮事件处理器*/
		// 读取不同类型的单元格数据
		getDataFromTd: function(td){
			if (!!td.find('select').length){
				return td.find('select').val();
			}
			if (!!td.find('.feature-list').length){
				/*返回[1,2,3,4]*/
				var d = td.data('funcList');//是否有选择功能列表，如果一次都没有则为空
				if (!d) {
					if(td.children().html()!=""){// 选择功能列表是否为空，不为空的时候表示初始化进入给予赋值不然，修改其他信息会出错
						 var ret = pageUser.base.userList[td.parent().index()].funcList;
						 for(var i=0;i<ret.length;i++){
		                      if(i=="0"){
		                          d=ret[i].funcID+","+ret[i].pageArg;
		                      }else{
		                          d=d+","+ret[i].funcID+","+ret[i].pageArg;
		                      }
		                  }
					}
                   
//					return pageUser.base.userList[td.parent().index()][td.index()];
					// return pageUser.gird.getGridData()[td.parent().index()][td.index()];
				}
				return d;
			}
			return td.text();
		},
		operHandle: function() {
			clear();
			/*1、停止二次点击，2、禁用行，3、提交服务器，4、提示成功或失败，5、启用行*/
			/*需获取操作类型：save delete， 控件行号*/
			var self = $(this);
			var oper = self.hasClass('oper-btn-sav') ? 'save'
			: self.hasClass('oper-btn-del') ? 'delete' : 'reset';
			var tr = self.parents('tr');
			self.addClass('ban');
			tr.addClass('ban');
			$('#grid_tip').hide();
			/*有变更的字段*/
			var tds = tr.children('.changed');
			var fieldData = {}, i, field;
			fieldData.userID = tr.children(':first').text();
			if (oper == 'delete'){
				var r=confirm("是否确认删除该用户？");
				if (r==true)
				  {
					pageUser.api.delRow(fieldData.userID, tr);
					return false;
				  }
				else
				  {
					tr.removeClass('ban');
					tr.find('.ban').removeClass('ban');
				    return false;
				}
				
			}
			if (oper == 'reset') {
				var r=confirm("是否确认初始化密码？");
				if (r==true)
				  {
					pageUser.api.updPwd(fieldData.userID, tr);
					return false;
				  }
				else
				  {
					tr.removeClass('ban');
					tr.find('.ban').removeClass('ban');
				    return false;
				}
				
			}
			for (i=0; i<tds.length; i++) {
				var index = $(tds[i]).index();
				field = pageUser.base.updRowField[$(tds[i]).index()];
				if (index == 2 || index == 3) {
						fieldData[field] = $(tds[i]).find(':selected').text();
				} else if (index == 6) {
					fieldData[field] = $(tds[i]).text().split(',');
				} else {
					fieldData[field] = $(tds[i]).text();
				}
			}
			/*取行数据*/
			field = pageUser.grid.columns;
			tds = tr.children();
			var rowData = {};
			for (i=0; i<tds.length-1; i++){
				/* NOTE: field 不同登录用户不同的字段*/
				if (field[i].name == 'unionName') {
					rowData[field[i].nick] = pageUser.Event.getDataFromTd($(tds[i]))
				} else {
					rowData[field[i].name] = pageUser.Event.getDataFromTd($(tds[i]))
				}
			}
			if (!pageUser.grid.clean(rowData)){
				tr.removeClass('ban').find('.ban').removeClass('ban');
				return false;
			}
			pageUser.api.updRow(rowData, tr, fieldData);
			return false;
		},
		/*判断td失去焦点时内容是否有改变*/
		isChangedTd: function() {
			var index = $(this).index();
			var rowData = pageUser.grid.getSelectedRows()[0];
			// var clmName = pageUser.base.apiField[index].name;
			var clmName = pageUser.grid.columns[index].name;
			if ($(this).text() == rowData[clmName]) {
				$(this).removeClass('changed');
			} else {
				$(this).addClass('changed');
			}
			pageUser.Event.rowChangeHandle($(this).parent());
		},
		/*判断下拉框是否有更改*/
		isChangedSlc: function() {
			var td = $(this).parents('td');
			/* Linux chrome select的chuange事件会先于click事件 */
			// var rowData = pageUser.grid.getSelectedRows()[0];
			var rowData = pageUser.grid.getRowData(td.parent().index() + 1);
			var clmName = pageUser.grid.columns[td.index()].name;
			if (td.find(':selected').val() == rowData[clmName]) {
				td.removeClass('changed');
			} else {
				td.addClass('changed');
			}
			pageUser.Event.rowChangeHandle(td.parent());
		},
		fixUpdEvent: function() {
			/*翻页的时候事件动态绑定被Grid控件阻止*/
			$('div').off('click', '.oper-btn-del');
			$('div').off('click', '.oper-btn-sav');
			$('div').off('click', '.oper-btn-rst');
			$('div').off('click', '.oper-btn-edit');
			$('div').on('click', '.oper-btn-del', this.operHandle);
			$('div').on('click', '.oper-btn-sav', this.operHandle);
			$('div').on('click', '.oper-btn-rst', this.operHandle);
			$('div').on('click', '.oper-btn-edit', this.inEdit);
			/*功能列表的td内容提示*/
			$('.rui-grid-body-td').on('blur', this.isChangedTd);
			$('.feature-list').parent().on('click', this.showTip);
			$.each(pageUser.grid.dataTableDOM.rows, function(){
				$(this.cells).each(function(index, td){
					var clm = pageUser.grid.columns[index];
					if (!clm.hasOwnProperty('formater')
						&& pageUser.base.canEditField.indexOf(clm.name) != -1){
						$(this).attr('contenteditable', true);
						$(this).on('focus', pageUser.Event.hideTip);
					}
				})
			})
		},
		inEdit: function() {
			$(this).parents('tr').children().each(function(index, td){
				var clmName = pageUser.grid.columns[index].name;
				if (pageUser.base.canEditField.indexOf(clmName) != -1) {
					$(this).addClass('td-focus');
				}
			})
		},
		init: function () {
			/*注册全局点击事件，取消编辑状态*/
			$(document).on('click', this.hideTip);
			/*Enter Event*/
			$('table').on('keypress', '.rui-grid-body-td', function (e) {
				if (e.which == 13) {
					$(this).blur();
					return false;
				}
			});

			/*功能列表弹出层点击事件 改到格式化函数里绑定事件 */
			$('#grid_tip').on('click', 'label', this.handleTip);
			$('#user_panel').on('click', 'span#user_func_list', this.showUserTip);
			$('#user_tip_panel').on('click', 'label', this.handleUserTip);

			/*行更新事件*/
			$('table').on('change', 'select', this.isChangedSlc);
			/* 添加账户 */
			$('#add_account').on('click', pageUser.createUserPanel);
			$('#submit_account').on('click', pageUser.api.addUser);
			$('#cancle_user_panel').on('click', pageUser.hideUserPanel);
			/* 搜索框 */
			$('#search_form').on({'submit': pageUser.search, 'reset': pageUser.grid.reset});

			this.fixUpdEvent();
			window.resizeContent = pageUser.resize;
		}
	};
	////////////////////////////*表格grid*/////////////////////////////
	pageUser.grid = new rui.Grid();
	/*给控件添加行更新函数，弃用grid.setRowData*/
	pageUser.grid.updRow = function (data, tr) {
		/*更新控件数据*/
		var r = pageUser.grid.gridData[tr.index()];
		$.extend(r, data);
		/*取消行锁定和变更背景色*/
		tr.find('.changed').removeClass('changed');
		/*`保存`按钮改为`修改`*/
		pageUser.Event.rowChangeHandle(tr);
		tr.removeClass('ban');
	};
	pageUser.grid.formater = {
		/* 获取formater函数对应的列名 */
		getFmtClmName: function (fmt) {
			/* 此处送耦合，因为Grid控件没传递列名，只能自己获取 */
			for (var j=0; j<pageUser.base.apiField.length; j++) {
				var f = pageUser.base.apiField[j].formater;
				if (!f) continue;
				if(typeof f == 'function') {
					if (f == fmt){
						return pageUser.base.apiField[j].name;
					}
				}else{
					if (eval(f) == fmt){
						return pageUser.base.apiField[j].name;
					}
				}
			}
		},
		/*账号类别*/
		roleList: function(rowIndex, cellValue, rowData) {
			// cellValue == roleID
			var roles = [];
			// roles = [{roleID:1, roleName:'管理员'}, ...]
			/* 如果么有cellValue 则为创建用户时候用，也只有管理员使用，只能创建商户帐号*/
			if (!cellValue) {
				pageUser.base.roleList.map(function(r) {
					if (loginUser.roleName == '系统管理员' && r.roleName == '门店管理员'){
						roles.push(r);
					} else if (loginUser.roleName == '门店管理员' && r.roleName == '门店用户'){
						roles.push(r);
					}
				});
			} else {
				 roles = pageUser.base.roleList;
			}
			var clmName = pageUser.grid.formater.getFmtClmName(pageUser.grid.formater.roleList);
			var select = '<select name="' + clmName + '">';
			for (var i = 0; i < roles.length; i++) {
				select += '<option value="' + roles[i].roleID + '"'
					+ (roles[i].roleID == cellValue ? 'selected' : '') + '>'
					+ roles[i].roleName + '</option>';
			}
			select += '</select>';
			return select;
		},
		/*职位*/
		postList: function(rowIndex, cellValue, rowData) {
			// cellValue == positionName
			var posts = pageUser.base.postList;
			var clmName = pageUser.grid.formater.getFmtClmName(pageUser.grid.formater.postList);
			var select = '<select name="' + clmName + '">';
			for (var i = 0; i < posts.length; i++) {
				select += '<option value="' + posts[i].positionName + '"'
					+ (posts[i].positionName == cellValue ? 'selected' : '') + '>'
					+ posts[i].positionName + '</option>';
			}
			select += '</select>';
			return select;
		},
		/* 所属商户 或者 门店名称 */
		unionList: function(id, value) {
			// var unionList = pageUser.base.unionList;
			// [{merchantID: 0, merchantName: '中华城'}, {merchantID: 1, merchantName: '厦门T4'}]
			var unionList = pageUser.base.unionList;
			// var clmName = pageUser.grid.formater.getFmtClmName(pageUser.grid.formater.unionList);
			// NOTE: 根据权限来选择merchantID，buildingID..
			var clmName;
			if (loginUser.roleName == '系统管理员') {
				clmName = 'merchantID';
			} else {
				clmName = 'buildingID';
			}
			var select = '<select name="'+ clmName +'">';
			for (var i = 0; i < unionList.length; i++) {
				/* 不知道这个是不是刘鹏说的 unionID, 如果是，
				为什么文档里还是merchantID、buildingID？ */
				var selected='', k, v, name;
				for (k in unionList[i]) {
					if (unionList[i].hasOwnProperty(k)) {
						if (k.match(/ID$/)) {
							v = unionList[i][k];
							selected = v == value ? 'selected' : '';
						} else {
							name = unionList[i][k];
						}
					}
				}
				select += '<option value="' + v + '"' + selected + '>' + name + '</option>';
			}
			select += '</select>';
			return select;
		},
		/*功能列表*/
		funcList: function(index, value, rowData) {
			// var funcList = pageUser.base.funcList;
			// value == [{funcID: 1, funcName: '客流分析'}, ...]

			/*新建用户调用时value == all*/
			if (value === undefined) {
				value = pageUser.base.funcList;
			}else{//加载列表进行过滤
				for (var i = 0; i < value.length; i++) {
					if(value[i].pageUrl==""){
						value.splice(i,1);
					}
				}
			}

			v = value.map(function(o){
				return o.funcName;
			});
			return v.toString();
		},
		/*操作*/
		operations: function(i, v, rowData) {
			var html =$('<span class="oper-btn oper-btn-edit">修改</span>'
					+ '<span class="oper-btn oper-btn-del">删除</span>'
					+ '<span class="oper-btn oper-btn-rst">初始密码</span>');
			if (loginUser.roleName == '系统管理员') {
				if (rowData.roleID == loginUser.roleID) {
					html.next().addClass('baned');
				}
			} else if (loginUser.roleName == '门店管理员') {
				if (loginUser.roleID == rowData.roleID && loginUser.userName != rowData.userName) {
					html.next().addClass('baned');
				}
			}
			if (loginUser.roleID == rowData.roleID) {
				html.eq(1).addClass('baned');
			}
			return html;
		}
	};

	pageUser.grid.getOption = function(role) {
		pageUser.pagination = new rui.Page({
			pageId:"grid_dom_page",
			pageSize:10,
			pageNumShown:5,
			pageCallBack: pageUser.pageCallback
		});
		var h = $('.main-menu-wrap').height()-160;
		var option = {
			height: h,
			gridData: [],
			gridId: pageUser.base.gridId,
			pageWidget: pageUser.pagination,
			// pageWidgetOptions: {pageSize: 10 },
			gridSelectedStyle: "",
			gridIntervalStyle: "",
			gridHoverStyle: "",
			gridDisabledStyle: "",
			isPage: true, //是否需要分页
			isMulti: false,
			isNeedInit: false,
			isIntervalColor: true
		};

		var apiField = pageUser.base.apiField,
			exclude = role == '系统管理员' ? pageUser.base.rootExclude : pageUser.base.tenantExclude;

		var unionName = role == '系统管理员' ? 'merchantName' : 'buildingName';
		var columns = [], i, clm;
		for (i=0; i<apiField.length; i++) {
			clm = apiField[i];
			if (exclude.indexOf(clm.name) != -1)
				continue;
			if (clm.name == 'unionName') {
				clm.nick = unionName;
				clm.caption = role == '系统管理员' ? '所属商户' : '门店名称';
			}
			columns.push(clm);
		}
		option.columns = columns;
		return option;
	};
	pageUser.search = function() {
		var filter = $('#search_form').serializeObject();
		$.extend(filter, {index:0, limit: pageUser.pagination.pageSize});
		console.log('搜索的数据：', filter);
		pageUser.api.getUserList(filter);
		pageUser.grid.update(pageUser.base.userList);
		// pageUser.pagination.totalcount = pageUser.grid.totalcount;
		pageUser.Event.fixUpdEvent();
		var f;
        if(f!=undefined){
		for (f in filter) {
			if (filter.hasOwnProperty(f) && !!filter[f].trim()) {
				$('#reply').show();
				break;
			}
		}
        }
		return false;
	};
	/* 搜索框  */
	pageUser.grid.search = function() {
		var filter = $('#search_form').serializeArray();
		var unionList = pageUser.base.unionList;
		// var id, name;
		var t = [], isMatch, i;
		for (i=0; i<pageUser.base.userList.length; i++) {
			isMatch = true;
			filter.map(function(q){
				if ((pageUser.base.userList[i][q.name] != q.value) && (!!q.value)) {
					if (q.name == 'unionName'){
						for (var j=0; j<unionList.length; j++) {
							name = '';
							id = '';
							for (var key in unionList[j]) {
								if (unionList[j].hasOwnProperty(key) && key.match(/ID$/)) {
									id = unionList[j][key];
								}
								if (unionList[j].hasOwnProperty(key) && key.match(/Name$/)){
									name = unionList[j][key];
								}
							}
							/*如果输入的字符对应上了一个unionObj，取出对应的ID*/
							if (name == q.value) {
								/*用输入数据转换到的id和数据unionID做比较*/
								if (id != pageUser.base.userList[i].unionID){
									isMatch = false;
								}
							}
						}
					}else{
						isMatch = false;
					}
				}
			});
			if (isMatch) {
				t.push(pageUser.base.userList[i]);
			}
		}
		pageUser.grid.update(t);
		pageUser.Event.fixUpdEvent();
		return false;
	};
	/* 搜索框重置，恢复表格原始数据 */
	pageUser.grid.reset = function() {
		pageUser.api.getUserList({index:0, limit: pageUser.pagination.pageSize});
		pageUser.grid.update(pageUser.base.userList);
		pageUser.Event.fixUpdEvent();
		$('#reply').hide();
	};

	/*修改的时候验证表格字段*/
	pageUser.grid.clean = function(rowData) {
		console.log('rowData: ', rowData);
		var r = /(^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
		if (!r.test(rowData.phoneNum.trim())) {
			pageUser.alert('电话号码格式错误', '请输入8位电话号码或11位手机号码，区号请用-分隔');
			return false;
		}
		return true;
	}

	/* 分页条回调 */
	pageUser.pageCallback = function (param) {
		/*请求服务器，获取分页数据*/
		pageUser.api.getUserList({index: (param.curPage-1) * pageUser.pagination.pageSize, limit: pageUser.pagination.pageSize});
		pageUser.grid.update(pageUser.base.userList);
		pageUser.pagination.totalCount = pageUser.grid.totalcount;
		pageUser.pagination.setCurPage(param.curPage);
		pageUser.pagination.update();
		pageUser.Event.fixUpdEvent();
		// event.preventDefault();
	};
	pageUser.initSearch = function () {
		var html = loginUser.roleName == '系统管理员'
			? '<label>帐号类别：<input type="text" name="roleName"></label>'
				+ '<label>所属商户：<input type="text" name="unionName"></label>'
			: '<label>门店名称：<input type="text" name="unionName"></label>';
		$('#search_form').children(':first').after(html);
	};
	
	function reloadData(){
		$("#search_form input[name='userName']").val("");
		$("#search_form input[name='roleName']").val("");
		$("#search_form input[name='unionName']").val("");
		pageUser.search();
	}
	
	function clear(){
		$(".alert").remove();
	}
	
	exports.init = function(){
		window.reloadData=reloadData;
		window.clearPage = clear;
		$.fn.serializeObject = function()
		{
			var o = {};
			var a = this.serializeArray();
			$.each(a, function() {
				if (o[this.name] !== undefined) {
					if (!o[this.name].push) {
						o[this.name] = [o[this.name]];
					}
					o[this.name].push(this.value || '');
				} else {
					o[this.name] = this.value || '';
				}
			});
			return o;
		};
		
		/*loginUser 全局变量*/
		loginUser = JSON.parse($.cookie("loginUser")).content.loginUser;
		// var loginUser = {roleName: '系统管理员'};
		pageUser.grid.init(pageUser.grid.getOption(loginUser.roleName));
		pageUser.grid.render();
		pageUser.resize();
		pageUser.api.getRoleList();
		pageUser.api.getUnionList(loginUser.roleName);
		pageUser.api.getFuncList();
		pageUser.api.getPostList();
		pageUser.api.getUserList({index:0, limit: pageUser.pagination.pageSize});

	//	 pageUser.grid.init(pageUser.grid.getOption('系统管理员'));
		//
		pageUser.initSearch();
		pageUser.Event.init();
	}
});