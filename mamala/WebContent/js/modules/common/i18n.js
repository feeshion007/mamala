
var app = angular.module("i18n", []);  
    function loadProperties($scope) {  
         var i18n = $.cookie("i18n");
        $scope.rbisMsg = null;  
        jQuery.i18n.properties({// 加载资浏览器语言对应的资源文件  
 	       name : 'rbis-messages', // 资源文件名称  
 	       language : i18n, //默认为英文当改为zh_CN时页面显示中文语言  
 	       path : '../js/i18n/', // 资源文件路径  
 	      // path : '../WEB-INF/classes/conf/i18n/', // 资源文件路径 
 	       mode : 'map', // 用 Map 的方式使用资源文件中的值  
 	       callback : function() {// 加载成功后设置显示内容  
 	           $scope.rbisMsg = $.i18n.map;  
 	       }  
 	   });   
    }  