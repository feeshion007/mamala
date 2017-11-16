//package com.ruijie.rbis.service.openApi;
//
//import com.alibaba.fastjson.JSON;
//import com.alibaba.fastjson.JSONArray;
//import com.alibaba.fastjson.JSONObject;
//import com.ruijie.rbis.mapper.openApi.CommonStaticMapper;
//import com.ruijie.rbis.pojo.openApi.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.ArrayList;
//import java.util.List;
//
///**
// * Created by OA on 2015/11/3.
// */
//@Service
//public class CommonStaticService {
//
//    @Autowired
//    private CommonStaticMapper commonStaticMapper;
//
//
//    public int qryForUsername(String userName){
//        return commonStaticMapper.qryUserName(userName);
//    }
//
//    public int qryForUsernamePassword(String userName, String password){
//        return commonStaticMapper.qryUserPasswd(userName, password);
//    }
//
//    public List<Integer> getBuildingIdWithMerchant(int merchantId){
//        return commonStaticMapper.getBuildingIdWithMerchant(merchantId);
//    }
//
//    public UserSimple getUserInfo(String userName, String password){
//        return commonStaticMapper.getUserInfo(userName, password);
//    }
//
//    public JSONObject getLocationStatic(String userName, String password, String aptime, int type, int location){
//
//        UserSimple user = commonStaticMapper.getUserInfo(userName, password);
//
//        //获取该用户下的buildingIdl列表
//        List<Integer> buildingIdList = new ArrayList<Integer>();
//        //如果是系统管理员，获取全部的
//        if(user.getRoleId() == 1){
//            buildingIdList = getBuildingIdWithMerchant(-1);
//        }else if (user.getRoleId() == 2){//门店管理员
//            buildingIdList = getBuildingIdWithMerchant(user.getMerchantId());
//        }else{//门店用户
//            buildingIdList.add(user.getParentId());
//        }
//
//        //获取建筑物统计信息
//        List<BuildingStatic> buildingStatic = commonStaticMapper.getBuildingStatic(buildingIdList, type, aptime);
//        //获取楼层统计信息
//        List<FloorStatic> floorStatic = commonStaticMapper.getFloorStatic(buildingIdList, type, aptime);
//        //获取店铺统计信息
//        List<StoreStatic> storeStatic = commonStaticMapper.getStoreStatic(buildingIdList, type, aptime);
//
//        JSONObject jsonObject = new JSONObject();
//
//        if(location == 1)
//            jsonObject.put("buildingInfo", JSON.toJSON(buildingStatic));
//        else if(location == 2)
//            jsonObject.put("floorInfo", JSON.toJSON(floorStatic));
//        else if(location == 3)
//            jsonObject.put("storeInfo", JSON.toJSON(storeStatic));
//        else if(location == -1){
//            jsonObject.put("buildingInfo", JSON.toJSON(buildingStatic));
//            jsonObject.put("floorInfo", JSON.toJSON(floorStatic));
//            jsonObject.put("storeInfo", JSON.toJSON(storeStatic));
//        }
//
//        return jsonObject;
//    }
//}
