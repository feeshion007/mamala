//增加对不支持console.log的浏览器(IE8以下)的保护
/**
 * 使用json向后台发出请求.
 * 
 * @param {String}
 *            request    请求参数.
 *            callback   请求成功后的回调处理函数.
 *            syncFlag   是否同步.
 *            requestURL 请求地址.
 * 说明 ： 如果syncFlag不填写，默认为true
 *         如果requestURL不填写，默认获取本机服务地址
 */
define(function(require,exports,module){
    var common = {
    	/**
        * 获取服务器svg的URL
        */
		svgServer : function (){
    		var str=location.href; //获取本页url地址
            var arr=str.split("/");
            var ip ;
        
            ip = arr[2];

            var url = "http://"+ip+"/images/svg/bi/";
            return url;
        } ,

        jsonRequest: function(request, callback, syncFlag, requestURL) {
                                //不输入异步参数时异步
                                if(syncFlag == undefined){
                                    syncFlag = true;
                                }
                                if(syncFlag == 'false'){
                                    syncFlag = false;
                                }
                                /* 将method提值URL中，配合spring mvc */
                                var _url=requestURL||this.jsonServer();
                                if(typeof(request.method) =='undefined') return;
                                var suffix = (request.method).split('.');
                                _url = _url+'/'+suffix[0]+'/'+suffix[1];
                                delete request.method;

                                $.ajax({
                                        type:"post",
                                        url:_url,
                                        dataType:"text",                
                                        data : JSON.stringify(request),
                                        timeout:60000,
                                        contentType: "application/json; charset=utf-8",
                                        success: callback,
                                        async : !!syncFlag,
                                        error:  function(data) {
                                             console.error("请求出错:"+JSON.stringify(data));                                    
                                             if(data.statusText ==  'Forbidden'){
                                                if(window.parent){
                                                    window.parent.location.href ='../login.html'
                                                    return;
                                                }
                                                window.location.href ='../login.html';                            

                                              }
                                                           
                                                }
                                     });
                            },

         requestWithLoading :function(loadingId,request, callback, syncFlag, requestURL){
              //不输入异步参数时异步
                                if(syncFlag == undefined){
                                    syncFlag = true;
                                }
                                if(syncFlag == 'false'){
                                    syncFlag = false;
                                }
                                /* 将method提值URL中，配合spring mvc */
                                var _url=requestURL||this.jsonServer();
                                var suffix = (request.method).split('.');
                                _url = _url+'/'+suffix[0]+'/'+suffix[1];
                                delete request.method;

                                //生成loading状态
                                var position =$("#"+loadingId).position();                              
                                var width = $("#"+loadingId).width();
                                var height = $("#"+loadingId).height();
                                $("#"+loadingId).parent().append('<div id="request-loading" style="width:'+width+'px;height:'+height+'px;background-color: white;position: absolute;top: '+position.top+'px;left:'+position.left+'px;text-align: center;background-image: URL(../images/loading.gif);background-repeat: no-repeat;background-position: center;"> </div>')
                                
                                
                                $.ajax({
                                        type:"post",
                                        url:_url,
                                        dataType:"text",                
                                        data : JSON.stringify(request),
                                        timeout:60000,
                                        contentType: "application/json; charset=utf-8",
                                        success: function(param){
                                            //结束loading
                                            $("#request-loading").remove();
                                            callback(param)  ;
                                        } ,
                                        async : !!syncFlag,
                                        error:  function(data) {
                                             console.error("请求出错:"+JSON.stringify(data));
                                             $("#request-loading").remove();
                                             if(data.statusText ==  'Forbidden'){
                                                if(window.parent){
                                                    window.parent.location.href ='../login.html'
                                                    return;
                                                }
                                                window.location.href ='../login.html';                            

                                              }
                                                           
                                                }
                                     });
        },

        ajaxRequestByJSON: function () {
                                        $.ajax({
                                                type:"post",
                                                url:requestURL||jsonServer(),
                                                dataType:"json",                
                                                data : JSON.stringify({"appId":"null", 
                                                                       "version":"1.0",
                                                                       "sign":"null" ,
                                                                       "content":request}),
                                                timeout:10000,
                                                success: callback,
                                                async : true,
                                                error: function(a) {
                                                            console.log("error log:"+a);
                                                        }
                                             });
                                    },

        /**
         * 获取URL
         */
        jsonServer :function (param){

                var str=location.href; //获取本页url地址
                var arr=str.split("/");
                var ip ;

                ipAndPort=arr[2]+"/"+arr[3];        
                ip = ipAndPort;
                if(param){
                    var url = "http://"+ip+"/"+param;
                    return url;
                }
                var url = "http://"+ip;
                return url;
                //console.log("URL:"+url);
                
        },

        loadPage:function (arg, url,target){
            target.empty();
            try {
                target.load(url+"?"+new Date().getTime(),function(response,status,xhr){
                    if(xhr && xhr.status == "403"){
                        console.log("超时跳转到登录页面");
                        location.href = '../login.html'
                    }
                });
            }catch(err){
                alert(err);
            }
        },
        /**
         * 判断某个对象是否为空
         */
        isObjectEmpty: function (object){
           for (var name in object)
            {
                return false;
            }
            return true;
        },

        /**
         * 根据趋势值,生成上下方向箭头
         */
        trendFormat:function (growth){
                var imgStr = "";
                if(growth > 0){
                    imgStr = "<img src='../img/updown/up10.png'/>"+growth;                      
                }
                if(growth < 0){
                    imgStr = "<img src='../img/updown/down10.png'/>"+Math.abs(growth);          
                }
                if(growth == 0){
                    imgStr = 0;
                }       
                return imgStr;

        },

        /**
         * 在字符串前补零 eg: 9->09
         */
        addZero:function (num,len){
            var str = num + "";
            return (str.length === len) ? str: '0'+str;
        },

        /*获取当前日期*/
        getCurrentDate: function (){
            var nowDate = new Date();
            var year = nowDate.getFullYear(); 
            var month = (nowDate.getMonth()+1)>=10 ? (nowDate.getMonth()+1):"0"+(nowDate.getMonth()+1);
            var day = nowDate.getDate();
				day = day>=10?day:'0'+day;
            var date = year + "-"+ month + "-"+day;
            return date
        },

        /*判断是否支持canvas*/
        isSupportCanvas: function (){
            var elem = document.createElement('canvas');
            return !!(elem.getContext && elem.getContext('2d'));
        },

        //把小数转换为百分比
        //float:待转换的小数
        //toFixed: 转换为百分比后保留的小数
        toPercent:function (float,toFixed){
            var toFixed = toFixed || 2;
            var num = parseFloat(float);
            num = (num*100).toFixed(toFixed);
            if(num == 0){
                return "极小"
            }
            return num+"%";
        },

        //字符串截断
        //str:字符串 length:保留长度
        cutString:function (str,length){
            if(typeof str != 'string' || str.length <= length){
                return str;
            }
            var newStr = str.slice(0,length) + "...";
            return newStr;

        },
        //短暂提示框
        message: function (title, info , autoHide) {
            //清除旧的msg
            $(".msg").remove();
            if (!info) {
                info = '';
            }
            var msg = $('<div class="msg-item"><div class="msg-title">' + title + '</div><div class="msg-info">' + info + '</div>');            
            var mdl = document.getElementById('rui_msg');
            if (!mdl) {
                mdl = document.createElement('div');
                mdl.id = 'rui_msg';
                mdl.className = 'msg';
                $(".content-body-nav").append(mdl);
            }
            $(mdl).append(msg);
            $(".msg").append("<div id='shut_msg' class='shut'></div>");  
            $("#shut_msg").click(function(){
                    $("#rui_msg").hide(1000);
                });
            if(!!autoHide){
                 $(".msg").show(1000);
                 setTimeout(function(){$(".msg").hide(1000)},5000);
            }else{
                $(".msg").show(1000);
            }
            
        },
        //TODO 遮罩层
        buildingDataReady:function(bulidingID){
        	var me = this;
        	var req = {
        			method:'commonInfo.getBuildingCreateDate',
        			buildingId:parseInt(bulidingID)
        	}
        	function callBack(ret){
        		var data = JSON.parse(ret);
        		if(data.content.code != 100) {
        			console.log('Query building create failure');
        			return;
        		}
        		if (data.content.createDate == '0000-00-00') {
        			me.message("提示","<p>暂时未生成该商户数据...</p>");
        		} else {
        			var interval = 15-parseInt(data.content.intervalNow);
        			if (interval>0) {
        				me.message("提示","<p>正在采集数据分析...<br/>预计需要<span style='font-size:18px;font-weight:bold;color:red'>"+interval+"</span>天才能生成预测结果</p>")
        			}
        		}
        	}
        	me.jsonRequest(req,callBack);
        },
        loadData:function(obj){ 
        	  var key,value,tagName,type,arr;
        	  for(x in obj){
        	    key = x;
        	    value = obj[x];
        	    
        	    $("[name='"+key+"'],[name='"+key+"[]']").each(function(){
        	      tagName = $(this)[0].tagName;
        	      type = $(this).attr('type');
        	      if(tagName=='INPUT'){
        	        if(type=='radio'){
        	          $(this).attr('checked',$(this).val()==value);
        	        }else if(type=='checkbox'){
        	          arr = value.split(',');
        	          for(var i =0;i<arr.length;i++){
        	            if($(this).val()==arr[i]){
        	              $(this).attr('checked',true);
        	              break;
        	            }
        	          }
        	        }else{
        	          $(this).val(value);
        	          if(type=='hidden'){
        	        	  var html = $("."+key+"-select-menu [value='"+value+"']").html();
        	        	  $("."+key+"-select-menu [value='"+value+"']").addClass("active")
        	        	  $("."+key+"-select-context").html(html);
        	          }
        	        }
        	      }else if(tagName=='SELECT' || tagName=='TEXTAREA'){
        	        $(this).val(value);
        	      }
        	      
        	    });
        	  }
        	}
    }
    return common;
    //module.exports = common;
   
    //暴露单个接口 与 module.exports 不能同时使用 
    // exports.test = function(){
    //     alert('test');
    // }

});