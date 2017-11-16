define(function(require,exports,module){
	function pathPrefix(){
		var str=location.href; //获取本页url地址
        var arr=str.split("/");
        var ip ;
    
        ip = arr[2];

        var url = "http://"+ip+"/"+arr[3]+"/";
        return url;
    }
	
	exports.pathPrefix = pathPrefix;
	function mapUrlPrefix(){
		var str=location.href; //获取本页url地址
        var arr=str.split("/");
        var ip ;
    
        ip = arr[2];

        var url = "http://"+ip+"/";
        return url;
    }
	exports.mapUrlPrefix = mapUrlPrefix;
	function send(request, callback, syncFlag, requestURL){
        //不输入异步参数时异步
        if(syncFlag == undefined){
            syncFlag = true;
        }
        if(syncFlag == 'false'){
            syncFlag = false;
        }
        var _url = pathPrefix()+requestURL;

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
                     if(data.statusText ==  'Forbidden'){
                    	alert("当前登录已超时，请按F5刷新当前页面，再设置配置。");
                     }
                }
             });
    }
	exports.send = send;
});