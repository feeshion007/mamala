	//模块化配置
  seajs.config({

            base:'../js',
            // 别名配置
            paths: {
                "common": "modules/common" //跨目录调用模块可以使用；获得当目录比较深时也可以使用
            },
            // 别名配置
            alias: {
                'main': 'modules/main',
                'common':'common/common.js',
				'resident':'modules/customer-flow/resident.js',
				'home':'modules/customer-flow/home.js',
                'customer-flow':'modules/customer-flow/customer-flow.js',
                'realtime-location':'modules/customer-flow/realtime-location.js',
				'shop-select':'common/shop-select.js',
                'time-sel':'common/time-sel.js',
                'customer-forecast':'modules/customer-forecast/customer-forecast.js',
                'activity': 'modules/customer-forecast/activity-indicators.js',
				'shop-correlation': 'modules/customer-scene/shop-correlation.js',
                },
           // preload: ['jquery'],//预先加载
           // base: '/script/src/', //基础路径
           // map: [[/^(.*\.(?:css|js))(.*)$/i, '$1?v=20131010']],  //map,批量更新时间戳
            charset: 'utf-8' // 文件编码
        });