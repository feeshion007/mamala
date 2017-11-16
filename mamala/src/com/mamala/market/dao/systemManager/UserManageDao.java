package com.mamala.market.dao.systemManager;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import org.apache.log4j.Logger; 

import com.mamala.common.util.StrUtil;
import com.mamala.market.pojo.common.SystemFunction;
import com.mamala.market.pojo.common.User;
import com.mamala.market.pojo.common.UserRole;
import com.mamala.market.pojo.Const;

@Repository
public class UserManageDao {
//    private static final Log logger = LogFactory.getLog(UserManageDao.class.getName());
    private static Logger logger = Logger.getLogger(UserManageDao.class);
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private DataSourceTransactionManager transactionManager;
    
/*    //事务管理器
    public void setTransactionManager(PlatformTransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }*/

    /* 计算funcStr相对于funcList需要增加/减少的功能id */
    private String functionCalc(List<SystemFunction> funcList, String funcStr, boolean is_add) {
        StringBuffer funcListStr = new StringBuffer("");
        String tempStr = "";
        
        /* 将List转换为Map */
        StringBuffer funcStrRet = new StringBuffer("");
        Map<String, SystemFunction> sysFuncMap = new TreeMap<String,SystemFunction>();
        for (int i = 0; i < funcList.size(); i++) {
            funcListStr.append(tempStr).append(funcList.get(i).getFuncID());
            tempStr = ",";
            
            sysFuncMap.put(String.valueOf(funcList.get(i).getFuncID()), funcList.get(i));
        }
        
        /* 判断funcStr集合与funcList集合的关系 */
        tempStr = "";
        String[] funcArray = funcStr.split(",");
        if (is_add) {
            for (int i = 0; i < funcArray.length; i++) {
                if (!sysFuncMap.containsKey(funcArray[i].trim())) {
                    funcStrRet.append(tempStr).append(funcArray[i].trim());
                    tempStr = ",";
                }
            }
            logger.info("[functionCalc-ADD]OldFuncStr=" + funcListStr.toString()
                    + "| NewFuncStr=" + funcStr 
                    + "| AddFuncStr=" + funcStrRet.toString());
        } else {
            for (int i = 0; i < funcArray.length; i++) {
                if (sysFuncMap.containsKey(funcArray[i].trim())) {
                    sysFuncMap.remove(funcArray[i].trim());
                }
            }
            
            for (String str: sysFuncMap.keySet()) {
                funcStrRet.append(tempStr).append(str);
                tempStr = ",";
            }
            
            logger.info("[functionCalc-DEL]OleFuncStr=" + funcListStr.toString()
                    + "| NewFuncStr=" + funcStr 
                    + "| DelFuncStr=" + funcStrRet.toString());
        }
        
        return funcStrRet.toString();
    }
    
    /* 基本的用户数据联合查询, getUserInfoFromResultSet() 会使用到里面的基本信息,并且被多个函数调用 */
    private String userInfoBaseDataSql =
        "SELECT DISTINCT * " +
        "FROM " +
        " (SELECT " +
        "   t1.user_id, t2.user_name AS user_name, t2.password, t2.store_id storeId," +
        "   t2.name, t2.state, t2.position, t2.phone, t2.gender, " +
        "   t1.role_id, t3.role AS role_name, " +
        "   t1.merchant_id, t4.merchant_name, t1.level, t1.parent_id AS building_id" +
        "  FROM t_user_relate_info t1" +
        "  LEFT OUTER JOIN t_user     t2 ON t1.user_id = t2.user_id" +
        "  LEFT OUTER JOIN t_role_info     t3 ON t1.role_id = t3.role_id" +
        "  LEFT OUTER JOIN t_merchant_info t4 ON t1.merchant_id = t4.merchant_id" +
        " ) AS temp ";
    
    /* 根据基础结果集整理获取user的进一步相关信息 */
    private User getUserInfoFromResultSet(ResultSet rs, String funDebugName) throws SQLException {
        User user = new User();
        
        List<SystemFunction> funcList = null;
        
        //基础信息
        user.setUserId(rs.getInt("user_id"));
        user.setUserName(rs.getString("user_name"));
        user.setUserPass(rs.getString("password"));
        user.setName(rs.getString("name"));
        user.setPosition(rs.getString("position"));
        user.setPhoneNum(rs.getString("phone"));
        user.setGender(rs.getString("gender"));
        user.setRoleID(rs.getInt("role_id"));
        user.setRoleName(rs.getString("role_name"));
        user.setStoreId(rs.getLong("storeId"));
        
         
        //功能信息
        String userFunctionSql = 
            "SELECT t1.user_id, t1.func_id, t2.func_name, t2.page_url, t2.page_arg ,t2.func_name_eng " +
            "FROM t_user_func_info t1 " +
            "LEFT OUTER JOIN t_func_info t2 ON t1.func_id = t2.func_id " +
            "WHERE user_id = ?";
        logger.info("获取账号信息[2]-账号功能列表-" + funDebugName + "SQL:" + userFunctionSql + "Argument" + new Object[]{user.getUserID()}.toString());
        funcList = jdbcTemplate.query(userFunctionSql, new Object[]{user.getUserID()}, new RowMapper<SystemFunction>(){
            @Override
            public SystemFunction mapRow(ResultSet rs, int index) throws SQLException {
                SystemFunction func = new SystemFunction();
                
                func.setFuncID(rs.getInt("func_id"));
                func.setFuncName(rs.getString("func_name"));
                func.setPageUrl(rs.getString("page_url"));
                func.setPageArg(rs.getInt("page_arg"));
                func.setFuncNameEng(rs.getString("func_name_eng"));
                
                return func;
            }
        });
        logger.info(funDebugName + " funcList.size=" + String.valueOf(funcList.size()));
        
        user.setFunctionTreeMap(funcList);
         
        
        logger.info(Const.newLine);
        return user;
    }
    
    /**
     *  
     * <p>Description:</p>
     * <p>Create Time: 2014-10-09   </p>
     * @author liupeng@ruijie.com.cn
     * @param userName       用户名
     * @param password       用户密码(MD5加密密文)
     * @return User/null
     */
    public User userLogin(String userName, String password) {
        String userLoginSql = userInfoBaseDataSql +
                              "WHERE level IN (0, 1) AND BINARY user_name = ? AND password = ?  AND state=1"; //level=0: ADMIN, =1: buildingID
        final StringBuffer logTemp = new StringBuffer();
        logger.info("获取账号信息[0]-基本信息-userLogin" + "SQL:" + userLoginSql + "Argment:" + new Object[]{userName, password}.toString());
        List<User> userList = jdbcTemplate.query(userLoginSql, new Object[]{userName, password}, new RowMapper<User>(){
            @Override
            public User mapRow(ResultSet rs, int index) throws SQLException {
                return getUserInfoFromResultSet(rs, "userLogin");
            }
        });
        logger.info("userLogin list.size=" + userList.size());
        return userList.size() > 0 ? userList.get(0) : null; 
    }
    
    /**
     *  
     * <p>Description:更新用户登录日志</p>
     * <p>Create Time: 2014-10-09   </p>
     * @author liupeng@ruijie.com.cn
     * @param user          用户
     * @return void
     */
    public void insertLoginLog(User user){
        //boolean dbgPrintInFun = dbgPrintInClass;//默认取dbgPrintInClass,例外情况可自行赋值
        String logLoginSql = 
            "INSERT INTO t_login_log(userID, ip, login_time) " +
            "VALUES(?, ?, ?)";
        logger.info("更新用户登录日志-insertLoginLog" + "SQL:" + logLoginSql + new Object[]{user.getUserID(), user.getIpAddr(), new Date()}.toString());
        jdbcTemplate.update(logLoginSql, new Object[]{user.getUserID(), user.getIpAddr(), new Date()});
    }
    
    /**
     *  
     * <p>Description:判断用户名是否存在</p>
     * <p>Create Time: 2014-08-27   </p>
     * @author liupeng@ruijie.com.cn
     * @param userName       用户名
     * @return 存在     :TRUE
     *         不存在:FALSE
     * 
     * - 用户ID,用户名唯一
     */
    public boolean userNameIsExist(String userName) {
        //ObjArray objArr = new ObjArray();
        List<Object> objArr = new ArrayList<Object>();
        String qryUserNameIsExistString =
            "SELECT DISTINCT user_name " +
            "FROM t_user " +
            "WHERE BINARY user_name = ? ";
        
        objArr.add(userName);
        logger.info("判断账号名是否存在-userNameIsExist" + "SQL:" + qryUserNameIsExistString + "Argument:" + objArr.toArray().toString());

        List<String> listUserName = jdbcTemplate.query(qryUserNameIsExistString, objArr.toArray(), new RowMapper<String>(){
            @Override
            public String mapRow(ResultSet rs, int index) throws SQLException{
                return rs.getString("user_name");
            }
        });
        
        logger.info("userNameIsExist list.size=" + String.valueOf(listUserName.size()));
        if (listUserName.size() > 0) {
            return true;
        }
        return false;
    }
    
    /**
     *  
     * <p>Description:判断用户ID是否存在</p>
     * <p>Create Time: 2014-08-27   </p>
     * @author liupeng@ruijie.com.cn
     * @param userID       用户ID
     * @return 存在     :TRUE
     *         不存在:FALSE
     * 
     * - 用户ID,用户名唯一
     */
    public boolean userIDIsExist(int userID) {
        //ObjArray objArr = new ObjArray();
        List<Object> objArr = new ArrayList<Object>();

        String qryUserIDIsExistString = 
            "SELECT user_id " +
            "FROM t_user " +
            "WHERE user_id = ?";
        
        objArr.add(userID);
        logger.info("判断账号ID是否存在-userIDIsExist" + "SQL:" + qryUserIDIsExistString + " Argument:" + objArr.toArray().toString());
        List<Integer> listUserID = jdbcTemplate.query(qryUserIDIsExistString, objArr.toArray(), new RowMapper<Integer>(){
            @Override
            public Integer mapRow(ResultSet rs, int index) throws SQLException{
                return rs.getInt("user_id");
            }
        });
        
        logger.info("userIDIsExist list.size="+String.valueOf(listUserID.size()));
        if (listUserID.size() > 0) {
           return true;
        }
        
        return false;
    }
    
    /**
     *  
     * <p>Description:判断用户密码是否正确</p>
     * <p>Create Time: 2014-08-27   </p>
     * @author liupeng@ruijie.com.cn
     * @param userID       用户ID
     * @param password      用户密码(MD5加密密文)
     * @return 正确     :TRUE
     *         不正确:FALSE
     */
    public boolean userPassIsCurrent(int userID, String password) {
        //ObjArray objArr = new ObjArray();
        List<Object> objArr = new ArrayList<Object>();

        String qryUserPassIsCurrent = 
            "SELECT password " +
            "FROM t_user " +
            "WHERE user_id = ? AND password = ? ";
        
        objArr.add(userID);
        objArr.add(password);
        logger.info("判断账号密码是否正确-userPassIsCurrent" + "SQL:" + qryUserPassIsCurrent + " Argument:" + objArr.toArray().toString());
        List<String> listUserPass = jdbcTemplate.query(qryUserPassIsCurrent, objArr.toArray(), new RowMapper<String>(){
            @Override
            public String mapRow(ResultSet rs, int index) throws SQLException{
                return rs.getString("password");
            }
        });
        
        logger.info("userPassIsCurrent list.size="+String.valueOf(listUserPass.size()));
        if (listUserPass.size() > 0) {
           return true;
        }
        
        return false;
    }
    
    /**
     *  
     * <p>Description:获取一个有效的用户ID</p>
     * <p>Create Time: 2014-08-27   </p>
     * @author liupeng@ruijie.com.cn
     *
     * @return 用户ID
     */
    private int getNewUserId() {
        String qryMaxUserId = 
            "SELECT MAX(user_id) as maxUserID " +
            "FROM t_user";
        
        logger.info("获取有效的新账号ID-qryMaxUserId" + "SQL:" + qryMaxUserId + " Argument:" + new Object[]{}.toString());
        List<Integer> listUserID = jdbcTemplate.query(qryMaxUserId, new Object[]{}, new RowMapper<Integer>(){
            @Override
            public Integer mapRow(ResultSet rs, int index) throws SQLException{
                return new Integer(rs.getInt("maxUserID"));
            }
        });
        
        logger.info("getNewUserId list.size="+String.valueOf(listUserID.size()));
        if (listUserID.size() == 0) {
            logger.info("getNewUserId Get new userID = 0 (no any data in table at now)");
            return 0;
        } 
        
        if (listUserID.get(0) < Integer.MAX_VALUE) {
            logger.info("getNewUserId Get new userID = " + String.valueOf(listUserID.get(0).intValue() + 1));
            return listUserID.get(0).intValue() + 1;
        }
        
        //失败
        return User.INVALID_USER_ID;
    }
    
    /**
     *  
     * <p>Description:获取当前登录账号可见的所有用户的列表</p>
     * <p>Create Time: 2014-11-19   </p>
     * @author liupeng@ruijie.com.cn
     * @return 用户列表
     */
    public List<User> qryForUserList(User user) {
        //ObjArray objArray = new ObjArray();
        List<Object> objArray = new ArrayList<Object>();
        String subUserListSql = userInfoBaseDataSql +
                                "WHERE level IN (0, 1) "; //level=0: ADMIN, =1: buildingID, roleID:1,2,3
        
        if (user.getRoleID() == User.USER_ROLE_SYSTEM_ADMIN) {
            subUserListSql += " AND role_id <= ? " +
                              " ORDER BY user_id DESC ";
            objArray.add(User.USER_ROLE_MERCHANT_ADMIN);//系统管理员只可见门店管理员和自己
        } else if (user.getRoleID() == User.USER_ROLE_MERCHANT_ADMIN) {
            subUserListSql += " AND ((user_id = ?) OR (role_id > ? AND merchant_id = ?)) " +
                              " ORDER BY user_id DESC ";
            objArray.add(user.getUserID());             //门店管理员可见门店用户和自己(不可见本商户其他门店管理员)
            objArray.add(User.USER_ROLE_MERCHANT_ADMIN); 
        } else if (user.getRoleID() == User.USER_ROLE_MERCHANT_USER){
            subUserListSql += " AND ((user_id = ?) OR (role_id > ? )) " +
                    " ORDER BY user_id DESC ";
            objArray.add(user.getUserID());             //门店用户和自己
            objArray.add(User.USER_ROLE_MERCHANT_USER);
            //logger.error("qryForUserList user roleID is " + String.valueOf(user.getRoleID()));
            //return null;
        }
        final StringBuffer logTemp = new StringBuffer();
        logger.info("获取可见账号列表信息[0]-基本信息-qryForUserList" + " SQL:" + subUserListSql);
        List<User> users = jdbcTemplate.query(subUserListSql, objArray.toArray(), new RowMapper<User>(){
            @Override
            public User mapRow(ResultSet rs, int index) throws SQLException {
                return getUserInfoFromResultSet(rs, "qryForUserList");
            }
        });
        logger.info("qryForUserList list.size=" + users.size());
        
        return users;
    }
    
    /**
     *  
     * <p>Description:获取当前登录用户可管理的用户ID列表</p>
     * <p>Create Time: 2014-11-19   </p>
     * @author liupeng@ruijie.com.cn
     * @return 成功/失败
     */
    public List<Integer> qryForSubUserIDList(User user) {
        String qryForSubUserIDListSql = null;
        //ObjArray objArray = new ObjArray();
        List<Object> objArray = new ArrayList<Object>();

        if (user.getRoleID() == User.USER_ROLE_SYSTEM_ADMIN) {
            //只能管理门店管理员
            qryForSubUserIDListSql = 
                "SELECT user_id " +
                "FROM t_user_relate_info " +
                "WHERE role_id = ? ";
            objArray.add(User.USER_ROLE_MERCHANT_ADMIN);
        } else if (user.getRoleID() == User.USER_ROLE_MERCHANT_ADMIN) {
            //门店管理员的merchant_id对应的门店用户  - 列表目前不包含门店管理员自身
            qryForSubUserIDListSql = 
                "SELECT DISTINCT user_id " +
                "FROM t_user_relate_info t1 " +
                "INNER JOIN " +
                " (SELECT" +
                "   t1.merchant_id " +
                "  FROM  t_user_relate_info t1" +
                "  WHERE user_id = ? " +
                " ) AS temp " +
                "ON t1.merchant_id = temp.merchant_id " +
                "WHERE user_id != ? AND role_id > ? ";
            objArray.add(user.getUserID());
            objArray.add(user.getUserID());
            objArray.add(User.USER_ROLE_MERCHANT_ADMIN);
        } else {
            logger.error("[ERROR]Merchant user should not call this interface");
            return null;
        }
        
        logger.info("获取账号可管理的用户ID列表-qryForSubUserIDList" + " SQL:" + qryForSubUserIDListSql + " Argument:" + objArray.toArray().toString());
        List<Integer> subUserIDList = jdbcTemplate.query(qryForSubUserIDListSql, objArray.toArray(), new RowMapper<Integer>(){
            @Override
            public Integer mapRow(ResultSet rs, int index) throws SQLException {
                return Integer.valueOf(rs.getInt("user_id"));
            }
        });
        
        logger.info("qryForSubUserIDList list.size=" + subUserIDList.size());
        return subUserIDList;
    }
    
    /**
     *  
     * <p>Description:增加新用户</p>
     * <p>Create Time: 2014-11-19   </p>
     * @author liupeng@ruijie.com.cn
     * @param newUser       新用户信息
     * @param funcStr       功能字符串
     * @return UserID:成功
     *         -1    :失败
     */
    public int addUser(User newUser, String funcStr) {
        final List<Object> userObjArray = new ArrayList<Object>();
        final List<Object> userRelateObjArray = new ArrayList<Object>();
        final List<Object> userFuncArray = new ArrayList<Object>();
        
        String userTypeDebugStr = "";
        int userID = getNewUserId();
        if (userID == User.INVALID_USER_ID) {
            return userID;
        }
        
        //t_user
        final String addNewUserSql = 
            "INSERT INTO t_user(user_ID, user_Name, password, name, position, phone, gender) " +
            "VALUES(?, ?, ?, ?, ?, ?, ?)";
        userObjArray.add(userID);
        userObjArray.add(newUser.getUserName());
        userObjArray.add(newUser.getUserPass());
        userObjArray.add(newUser.getName());
        userObjArray.add(newUser.getPosition());
        userObjArray.add(newUser.getPhoneNum());
        userObjArray.add(newUser.getGender());
//        userObjArray.add(DateOperate.formatDateToString(new Date(), "yyyy-MM-dd HH:mm:ss"));
//        userObjArray.add(DateOperate.formatDateToString(new Date(), "yyyy-MM-dd HH:mm:ss"));
        
        
        //t_user_relate_info
        final String addNewUserRelateSql = 
            "INSERT INTO t_user_relate_info(user_id, merchant_id, role_id, level, parent_level, parent_id) " +
            "VALUES(?, ?, ?, ?, ?, ?)";
        if (newUser.getRoleID() == User.USER_ROLE_SYSTEM_ADMIN) {
            userRelateObjArray.add(userID);
            userRelateObjArray.add(newUser.getRoleID());
            userRelateObjArray.add(0);//系统管理员三个数据位0
            userRelateObjArray.add(0);
            userRelateObjArray.add(0);
            userTypeDebugStr = "系统管理员";
        } else if (newUser.getRoleID() == User.USER_ROLE_MERCHANT_ADMIN) {
            userRelateObjArray.add(userID); 
            userRelateObjArray.add(newUser.getRoleID());
            userRelateObjArray.add(1);//门店管理员三个数据位1 - 其表示可见级别为building, 父级别building, id不关心
            userRelateObjArray.add(1);
            userRelateObjArray.add(1);
            userTypeDebugStr = "门店管理员";
        } else {
            userRelateObjArray.add(userID);
             userRelateObjArray.add(newUser.getRoleID());
            userRelateObjArray.add(1);                      //level = 1       : 表示查看整个建筑
            userRelateObjArray.add(1);                      //parent_level = 1: 表示level的父基本为整个建筑
             userTypeDebugStr = "门店用户";
        }


        //t_user_func_info
        final StringBuffer addNewUserFuncSql = new StringBuffer();
        addNewUserFuncSql.append("INSERT INTO t_user_func_info(user_id, func_id) VALUES");
        String tempStr = "";
        String[] funcArray = funcStr.split(",");

/*         //门店用户不拥有用户管理权限，funcList需要过滤掉, 2015-10-12 添加
        String userManageIdsql = "select func_id from t_func_info where func_name=\"用户管理\" limit 1";
        int userManageId = jdbcTemplate.queryForObject(userManageIdsql, Integer.class);
        if(newUser.getRoleID() == User.USER_ROLE_MERCHANT_USER ){
            List<String> funcList = new ArrayList<String>();
            for(int i=0; i<funcArray.length; i++){
                if(userManageId != Integer.parseInt(funcArray[i]))
                    funcList.add(funcArray[i]);
            }
            funcList.toArray(funcArray);
        }*/
        // end


        for (int i = 0; i < funcArray.length; i++) {
            addNewUserFuncSql.append(tempStr).append("(?,?)");
            tempStr = ",";
            userFuncArray.add(userID);
            userFuncArray.add(funcArray[i]);
        }
        
        final String userType = userTypeDebugStr;
        final StringBuffer logTemp = new StringBuffer();
        Boolean exeStatusBoolean = new TransactionTemplate(transactionManager).execute(new TransactionCallback<Boolean>() {
            public Boolean doInTransaction(TransactionStatus status) {
                int row = 0;
                boolean retStatus = false;
                
                logTemp.append("增加新用户[1]-基本信息-addUser" + addNewUserSql).append(Const.newLine);
                row = jdbcTemplate.update(addNewUserSql, userObjArray.toArray());
                logTemp.append("INSERT t_user row = " + String.valueOf(row)).append(Const.newLine);
                
                logTemp.append("增加新用户[2]-用户关系-" + userType + "-addUser" + addNewUserRelateSql).append(Const.newLine);
                row = jdbcTemplate.update(addNewUserRelateSql, userRelateObjArray.toArray());
                logTemp.append("INSERT t_user_relate_info row = " + String.valueOf(row)).append(Const.newLine);
                
                logTemp.append("增加新用户[3]-用户功能-addUser" +  addNewUserFuncSql.toString()).append(Const.newLine);
                row = jdbcTemplate.update(addNewUserFuncSql.toString(), userFuncArray.toArray());
                logTemp.append("INSERT t_user_func_info row = " + String.valueOf(row)).append(Const.newLine);
               
                retStatus = true;
                logTemp.append("增加新用户-success").append(Const.newLine);
                
                return new Boolean(retStatus);
            }
        });

        logger.info(logTemp.toString());
        return exeStatusBoolean.booleanValue() ? userID : -1;
    }
    
    /**
     *  
     * <p>Description:根据用户ID删除用户</p>
     * <p>Create Time: 2014-11-19   </p>
     * @author liupeng@ruijie.com.cn
     * @return 成功/失败
     */
    public boolean deleteUser(List<Integer> userIDList) {
        String tempStr = "";
        final StringBuffer userIDStringBuffer = new StringBuffer("");
        for (int i = 0; i < userIDList.size(); i++) {
            userIDStringBuffer.append(tempStr).append(userIDList.get(i).intValue());
            tempStr = ",";
        }
        final StringBuffer logTemp = new StringBuffer();
        Boolean exeStatusBoolean = new TransactionTemplate(transactionManager).execute(new TransactionCallback<Boolean>() {
            public Boolean doInTransaction(TransactionStatus status) {
                int row = 0;
                boolean retBoolean = false;
                
                StringBuffer deleteUser = new StringBuffer();
                StringBuffer deleteUserRelate = new StringBuffer();
                StringBuffer deleteUserFunc = new StringBuffer();
                
                deleteUser.append("DELETE FROM t_user WHERE user_id IN (").append(userIDStringBuffer.toString()).append(")");
                logTemp.append("删除用户-账号-delUser" + deleteUser.toString()).append(Const.newLine);
                row = jdbcTemplate.update(deleteUser.toString(), new Object[]{});
                logTemp.append("DELETE t_user row = " + String.valueOf(row)).append(Const.newLine);
                
                deleteUserRelate.append("DELETE FROM t_user_relate_info WHERE user_id IN (").append(userIDStringBuffer.toString()).append(")");
                logTemp.append("删除用户-关联-delUser" + deleteUserRelate.toString()).append(Const.newLine);
                row = jdbcTemplate.update(deleteUserRelate.toString(), new Object[]{});
                logTemp.append("DELETE t_user_relate_info row = " + String.valueOf(row)).append(Const.newLine);
                
                deleteUserFunc.append("DELETE FROM t_user_func_info WHERE user_id IN (").append(userIDStringBuffer.toString()).append(")");
                logTemp.append("删除用户-功能-delUser" + deleteUserFunc.toString() ).append(Const.newLine);
                row = jdbcTemplate.update(deleteUserFunc.toString(), new Object[]{});
                logTemp.append("DELETE t_user_func_info row = " + String.valueOf(row)).append(Const.newLine);
                
                retBoolean = true;
                logTemp.append("删除用户-success").append(Const.newLine);
                
                return new Boolean(retBoolean);
            }
        });
        
        logger.info(logTemp.toString());
        return exeStatusBoolean.booleanValue();
    }
    
    /**
     *  
     * <p>Description:修改用户信息</p>
     * <p>Create Time: 2014-11-19   </p>
     * @author liupeng@ruijie.com.cn
     * @param newUser   新用户信息
     * @param newFuncStr    新用户功能字符串
     * @return 成功/失败
     */
    public boolean changeUser(User user, User newUser, String newFuncStr) {
        int userID = newUser.getUserID();
        
        boolean needChangeUserTemp           = false;
        boolean needChangeUserFuncAddTemp    = false;
        boolean needChangeUserFuncDelTemp    = false;
        boolean needChangeSubUserFuncDelTemp = false;
        boolean needChangeUserBuildingTemp   = false;
        
        final List<Object> changeUserObjArray = new ArrayList<Object>();
        final StringBuffer changeUserSql = new StringBuffer();
        
        final List<Object> changeUserFuncAddObjArray = new ArrayList<Object>();
        final StringBuffer changeUserFuncAddSql = new StringBuffer();

        final List<Object> changeUserFuncDelObjArray = new ArrayList<Object>();
        final StringBuffer changeUserFuncDelSql = new StringBuffer();
        
        final List<Object> changeSubUserFuncDelObjArray = new ArrayList<Object>();
        final StringBuffer changeSubUserFuncDelSql = new StringBuffer();
        
        final List<Object> changeUserBuildingObjArray = new ArrayList<Object>();
        final StringBuffer changeMerUserBuildingSql = new StringBuffer();
        
        String tempStr = "";
        
        //[1]更新t_user_info
        changeUserSql.append("UPDATE t_user SET ");
        if (newUser.getName() != null) {
            changeUserSql.append(tempStr).append("name = ? ");
            changeUserObjArray.add(newUser.getName());
            tempStr = ",";
            needChangeUserTemp = true;
        }
        if (newUser.getPosition() != null) {
            changeUserSql.append(tempStr).append("position = ? ");
            changeUserObjArray.add(newUser.getPosition());
            tempStr = ",";
            needChangeUserTemp = true;
        }
        if (newUser.getPhoneNum() != null) {
            changeUserSql.append(tempStr).append("phone = ? ");
            changeUserObjArray.add(newUser.getPhoneNum());
            tempStr = ",";
            needChangeUserTemp = true;
        }
        if (newUser.getGender() != null) {
            changeUserSql.append(tempStr).append("gender = ? ");
            changeUserObjArray.add(newUser.getGender());
            needChangeUserTemp = true;
        }
        changeUserSql.append("WHERE user_id = ? ");
        changeUserObjArray.add(userID);
        
        
        //[2]t_user_func_info 修改funcList, 先在原有基础上增加新的功能,再在增加后的功能列表中删除需要删除的
        StringBuffer funcStrAfterAdd = new StringBuffer();
        if (newFuncStr != null) {
            String funcAddStr = null, funcDelStr = null;
            List<SystemFunction> funcList;
            
            //增加功能操作
            tempStr = "";
            funcList = qryForFunctionList(newUser);
            for (SystemFunction sysFunc : funcList) {
                funcStrAfterAdd.append(tempStr).append(sysFunc.getFuncID());
                tempStr = ",";
            }
            
            funcAddStr = functionCalc(funcList, newFuncStr, true); //获取需要增加的功能
            logger.info("funcAddStr=" + funcAddStr);
            if (!funcAddStr.isEmpty()) {
                tempStr = "";
                
                //Add userID's new funcList
                changeUserFuncAddSql.append("INSERT INTO t_user_func_info(user_id, func_id) VALUES");
                String[] funcArray = funcAddStr.split(",");
                for (int i = 0; i < funcArray.length; i++) {
                    funcStrAfterAdd.append(",").append(funcArray[i].trim());
                    changeUserFuncAddSql.append(tempStr).append("(?,?)");
                    tempStr = ",";
                    changeUserFuncAddObjArray.add(userID);
                    changeUserFuncAddObjArray.add(funcArray[i].trim());
                }
                needChangeUserFuncAddTemp = true;
            }
            
            //减少功能操作
            //获取增加操作(假设)执行成功后的新的功能列表
            String[] funcStrAfterAddArray = funcStrAfterAdd.toString().split(",");
            List<SystemFunction> funcListAfterAdd = new ArrayList<SystemFunction>();
            for (String funcStr: funcStrAfterAddArray) {
            	if(StrUtil.isEmpty(funcStr)) {
            		continue;
            	}
                SystemFunction systemFunction = new SystemFunction();
                systemFunction.setFuncID(Integer.parseInt(funcStr));
                funcListAfterAdd.add(systemFunction);
            }
            //获取需要减少的功能
            funcDelStr = functionCalc(funcListAfterAdd, newFuncStr, false);
            logger.info("funcDelStr=" + funcDelStr);
            if (!funcDelStr.isEmpty()) {
                tempStr = "";
                String[] funcArray = funcDelStr.split(",");
                StringBuffer tempDelFunIDBuffer = new StringBuffer("");
                for (int i = 0; i < funcArray.length; i++) {
                    tempDelFunIDBuffer.append(tempStr).append(funcArray[i].trim());
                    tempStr = ",";
                }
                
                //Delete userID's old funcList
                changeUserFuncDelSql.append("DELETE FROM t_user_func_info WHERE user_id = ? AND func_id IN(")
                                 .append(tempDelFunIDBuffer.toString())
                                 .append(")");
                changeUserFuncDelObjArray.clear();
                changeUserFuncDelObjArray.add(userID);
                needChangeUserFuncDelTemp = true;
                
                /* 系统管理员删除门店管理员的funcList后,导致门店管理员对应门店用户的funcList被同步删除 */
                logger.info("user.getRoleID()=" + String.valueOf(user.getRoleID()) + "|newUser.getRoleID()=" + String.valueOf(newUser.getRoleID()));
                if (user.getRoleID() == User.USER_ROLE_SYSTEM_ADMIN && newUser.getRoleID() == User.USER_ROLE_MERCHANT_ADMIN) {
                    List<Integer> subUserIDList = qryForSubUserIDList(newUser);
                    if (subUserIDList != null && subUserIDList.size() > 0) {
                        tempStr = "";
                        changeSubUserFuncDelSql.append("DELETE FROM t_user_func_info WHERE ");
                        for (int i = 0; i < subUserIDList.size(); i++) {
                            changeSubUserFuncDelSql.append(tempStr).append("(user_id = ? AND func_id IN(")
                                                   .append(tempDelFunIDBuffer.toString())
                                                   .append("))");;
                            tempStr = " OR ";
                            changeSubUserFuncDelObjArray.add(subUserIDList.get(i).intValue());
                        }
                        needChangeSubUserFuncDelTemp = true;
                        logger.info("needChangeSubUserFuncDelTemp = true");
                    }
                }
            }
        }
        
        
        
        final StringBuffer logTemp = new StringBuffer();
        final boolean needChangeUser           = needChangeUserTemp;
        final boolean needChangeUserFuncAdd    = needChangeUserFuncAddTemp;
        final boolean needChangeUserFuncDel    = needChangeUserFuncDelTemp;
        final boolean needChangeSubUserFuncDel = needChangeSubUserFuncDelTemp;
        final boolean needChangeUserBuilding   = needChangeUserBuildingTemp;
        Boolean exeStatusBoolean = new TransactionTemplate(transactionManager).execute(new TransactionCallback<Boolean>() {
            public Boolean doInTransaction(TransactionStatus status) {
                int rows = 0;
                boolean retBoolean = false;
                
                if (needChangeUser == true) {
                    logTemp.append("更新用户信息[1]-基本信息-changeUser" + changeUserSql.toString()).append(Const.newLine);
                    rows = jdbcTemplate.update(changeUserSql.toString(), changeUserObjArray.toArray());
                    logTemp.append("UPDATE t_user_info rows = " + String.valueOf(rows)).append(Const.newLine);
                }
                
                if (needChangeUserFuncAdd == true) {
                    logTemp.append("更新用户信息[2.1]-增加新功能-changeUser" + changeUserFuncAddSql.toString()).append(Const.newLine);
                    rows = jdbcTemplate.update(changeUserFuncAddSql.toString(), changeUserFuncAddObjArray.toArray());
                    logTemp.append("ADD t_user_func_info row = " + String.valueOf(rows)).append(Const.newLine);
                }
                
                if (needChangeUserFuncDel == true) {
                    logTemp.append("更新用户信息[2.2]-减少旧功能-changeUser" + changeUserFuncDelSql.toString()).append(Const.newLine);
                    rows = jdbcTemplate.update(changeUserFuncDelSql.toString(), changeUserFuncDelObjArray.toArray());
                    logTemp.append("DELETE t_user_func_info rows = " + String.valueOf(rows)).append(Const.newLine);
                }
                
                if (needChangeSubUserFuncDel == true) {
                    logTemp.append("更新用户信息[2.3]-减少子用户功能-changeUser" + changeSubUserFuncDelSql.toString()).append(Const.newLine);
                    rows = jdbcTemplate.update(changeSubUserFuncDelSql.toString(), changeSubUserFuncDelObjArray.toArray());
                    logTemp.append("DELETE t_user_func_info rows = " + String.valueOf(rows)).append(Const.newLine);
                }
                
                if (needChangeUserBuilding == true) {
                    logTemp.append("更新用户信息[3]-更新管理建筑信息-changeUser" + changeMerUserBuildingSql.toString()).append(Const.newLine);
                    rows = jdbcTemplate.update(changeMerUserBuildingSql.toString(), changeUserBuildingObjArray.toArray());
                    logTemp.append("UPDATE t_user_relate_info rows = " + String.valueOf(rows)).append(Const.newLine);
                }
                
                retBoolean = true;
                logTemp.append("更新用户信息-success").append(Const.newLine);
                
                return new Boolean(retBoolean);
            }
        });
        
        logger.info(logTemp.toString());
        return exeStatusBoolean.booleanValue();
    }
    
    public List<SystemFunction> qryForFunctionList(User newUser) {
		// TODO Auto-generated method stub
		return null;
	}

	/**
     *  
     * <p>Description:更新用户密码</p>
     * <p>Create Time: 2014-11-19   </p>
     * @author liupeng@ruijie.com.cn
     * @param userID       用户名
     * @param newPass        新用户密码
     * @return 成功/失败
     */
    public boolean updateUserPass(int userID, String newPass) {
        int rows = 0;
        //ObjArray objArr = new ObjArray();
        List<Object> objArr = new ArrayList<Object>();
        String updateUserPassword = 
            "UPDATE t_user " +
            "SET password = ? " +
            "WHERE user_id = ?";
        
        objArr.add(newPass);
        objArr.add(userID);
        
        logger.info("更新账号密码-updateUserPass" + " SQL:" + updateUserPassword + " Argument:" + new Object[]{newPass, userID}.toString());
        rows = jdbcTemplate.update(updateUserPassword, objArr.toArray());
        
        logger.info("updateUserPass rows = " + String.valueOf(rows));
        if (rows > 0) {
            return true;
        } else {
            return false;
        }
    }

    //更新用户名和密码
    public boolean updateUser(int userID, String userName, String newPass) {
        int rows = 0;
        //ObjArray objArr = new ObjArray();
        List<Object> objArr = new ArrayList<Object>();
        String updateUser =
            "UPDATE t_user " +
            " SET password = ?, user_name=? " +
            " WHERE user_ID = ?";

        objArr.add(newPass);
        objArr.add(userName);
        objArr.add(userID);

        logger.info("更新账号密码-updateUserPass" + " SQL:" + updateUser + " Argument:" + new Object[]{newPass, userName, userID}.toString());
        rows = jdbcTemplate.update(updateUser, objArr.toArray());

        logger.info("updateUserPass rows = " + String.valueOf(rows));
        if (rows > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *  
     * <p>Description:复位用户密码</p>
     * <p>Create Time: 2014-11-19   </p>
     * @author liupeng@ruijie.com.cn
     * @param userID       用户名
     * @param newPass        新用户密码
     * @return 成功/失败
     */
    public boolean resetUserPass(int userID, String newPass) {
        int rows = 0;
        //ObjArray objArr = new ObjArray();
        List<Object> objArr = new ArrayList<Object>();
        String resetUserPass =
            "UPDATE t_user " +
            "SET password = ? " +
            "WHERE user_ID = ?";
        
        objArr.add(newPass);
        objArr.add(userID);
        
        logger.info("重置账号密码-resetUserPass" + " SQL:" + resetUserPass + " Argument:" + new Object[]{newPass, userID}.toString());
        rows = jdbcTemplate.update(resetUserPass, objArr.toArray());
        
        logger.info("resetUserPass rows = " + String.valueOf(rows));
        if (rows > 0) {
            return true;
        } else {
            return false;
        }
    }
    
    /**
     *  
     * <p>Description:获取系统管理员的数量</p>
     * <p>Create Time: 2014-11-19   </p>
     * @author liupeng@ruijie.com.cn
     * @return 成功/失败
     */
    public int qryForSystemAdminCount() {
        String qryForSystemAdminCountSql = 
                "SELECT DISTINCT user_id " +
                "FROM t_user_relate_info " +
                "WHERE role_id = 1 " +
                "ORDER BY user_id ";
        
        logger.info("获取系统管理员数量-qryForMerchantAdminCount" + " SQL:" + qryForSystemAdminCountSql + " Argument" + new Object[]{}.toString());
        List<Integer> systemAdminList = jdbcTemplate.query(qryForSystemAdminCountSql, new Object[]{}, new RowMapper<Integer>(){
            @Override
            public Integer mapRow(ResultSet rs, int index) throws SQLException {
                return Integer.valueOf(rs.getInt("user_id"));
            }
        });
        
        logger.info("qryForSystemAdminCount list.size=" + systemAdminList.size());
        return systemAdminList.size();
    }

	public List<UserRole> qryForRoleList(User user) {
		// TODO Auto-generated method stub
		return null;
	}

	public User qryForUserInfo(int userID) {
		// TODO Auto-generated method stub
		return null;
	}
}
