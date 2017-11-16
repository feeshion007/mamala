package com.mamala.web.support; /**
 * Created by OA on 2015/5/28.
 */
import com.alibaba.fastjson.JSONException;
import com.alibaba.fastjson.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class JsonBodyParse {

    //检测前端请求的json数据，是否完整。
    public static void argumentExitsTest(JSONObject jsonObject, String[] args) throws JSONException{
        for(int i=0; i<args.length; i++){
            if(!jsonObject.containsKey(args[i])){
                throw new JSONException("Illegal parameter: JSON String not found [" + args[i] + "]");
            }
        }
    }

    //字符串转int
    public static int StringToInteger(String key, String val) throws NumberFormatException{
        try{
            return Integer.parseInt(val);
        }catch (NumberFormatException e){
            throw new NumberFormatException("Illegal parameter, NumberFormathException--> [" + key + "]");
        }
    }

    //字符串转date
    public static Date StringToDate(String key, String val, String format) throws ParseException{

        SimpleDateFormat dateFormat = new SimpleDateFormat(format);
        try{
            return dateFormat.parse(val);
        }catch (ParseException e){
            throw new ParseException("Illegal parameter, ParseException -->argument:" + key + val + " ,format:" + format, 0);
        }
    }
}
