//package com.mamala.web.controller.fileUpload;
//
///**
// * Created by OA on 2015/5/28.
// */
//
//import com.alibaba.fastjson.JSONObject;
//import com.mamala.market.pojo.common.User;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.RequestMapping;
//
//import org.apache.log4j.Logger;
//import org.dom4j.DocumentException;
//import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.multipart.MultipartFile;
//import org.springframework.web.multipart.MultipartHttpServletRequest;
//import org.springframework.web.multipart.commons.CommonsMultipartResolver;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import javax.servlet.http.HttpSession;
//import java.io.*;
//import java.net.MalformedURLException;
//import java.util.ArrayList;
//import java.util.Enumeration;
//import java.util.Iterator;
//import java.util.List;
//import java.text.SimpleDateFormat;
//
//import com.mamala.market.pojo.fileUpload.CustomerSaleFormat;
//import com.mamala.market.dao.fileUpload.CustomerSaleUploadDao; 
//@Controller
//@RequestMapping(value = "/upload")
//public class UploadController {
//    private static Logger logger = Logger.getLogger(UploadController.class);
//
//    @Autowired
//    private CustomerSaleUploadDao customerSaleUploadDao;
//    @Autowired
//    private SvgUploadDao svgUploadDao;
//
//    @RequestMapping(value = "/customerSale",method = RequestMethod.POST)
//    public void CustomerSale(HttpServletRequest request, HttpServletResponse response) throws IOException{
//
//        JSONObject resJson = new JSONObject();
//        JSONObject contentJson = new JSONObject();
//        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
//
//         // 定义解析器去解析request
//        CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver(request.getSession().getServletContext());
//        //判断request是否有文件上传
//        if(!multipartResolver.isMultipart(request)){
//            String resultJson = "{\"content\":\"{'code':'105','desc':'未选择文件，请选择文件上传...'}\"}";
//            //web回复
//            response.setCharacterEncoding("utf-8");
//            response.setContentType("text/plain");
//            response.getWriter().write(resultJson);
//            return;
//        }
//        try {
//            List<CustomerSaleFormat> customerSaleFormatList = new ArrayList<CustomerSaleFormat>();
//            //MultipartHttpServletRequest
//            MultipartHttpServletRequest multiRequest = (MultipartHttpServletRequest) request;
//            //获取文件名
//            Iterator<String> it = multiRequest.getFileNames();
//            while (it.hasNext()) {
//                //获取MultipartFile类型文件
//                MultipartFile fileDetail = multiRequest.getFile(it.next());
//                if (fileDetail != null) {
//                    logger.info("file name:" + fileDetail.getName());
//                    logger.info("file size:" + fileDetail.getSize());
//
//                    if(fileDetail.getName().isEmpty()){
//                        throw new Exception("文件名称为空，请设置为建筑物ID");
//                    }
//                    int building = Integer.parseInt(fileDetail.getName());
//                    //获取文件的字节
//                    InputStream inputStream = fileDetail.getInputStream();
//                    BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream, "UTF-8"));
//                    String line = null;
//                    while ((line = bufferedReader.readLine()) != null) {
//                        //System.out.println(line);
//                        CustomerSaleFormat customerSaleFormat = new CustomerSaleFormat();
//                        //文本格式为：日期，销售量，销售额
//                        String[] str = line.split(",");
//                        simpleDateFormat.parse(str[0]);
//                        customerSaleFormat.setBuildingID(building);
//                        customerSaleFormat.setDate(str[0]);
//                        customerSaleFormat.setTradeNum(Integer.parseInt(str[1]));
//                        customerSaleFormat.setSaleVolumn(Double.parseDouble(str[2]));
//                        customerSaleFormatList.add(customerSaleFormat);
//                    }
//                    bufferedReader.close();
//                }
//                customerSaleUploadDao.insertUploadData(customerSaleFormatList);
//            }
//        }catch (Exception e){
//            logger.error(e.getMessage());
//            contentJson.put("code", "105");
//            contentJson.put("desc", "文件导入失败，请检查文件格式是否正确");
//            resJson.put("sign", "null");
//            resJson.put("content", contentJson);
//            //web回复
//            response.setCharacterEncoding("UTF-8");
//            response.setContentType("text/plain");
//            response.getWriter().write(resJson.toString());
//            return;
//        }
//        contentJson.put("code", "100");
//        contentJson.put("desc", "文件导入成功");
//        resJson.put("sign", "null");
//        resJson.put("content", contentJson);
//
//        //web回复
//        response.setCharacterEncoding("UTF-8");
//        response.setContentType("text/plain");
//        response.getWriter().write(resJson.toString());
//    }
//
//    @RequestMapping(value = "/svgInfo",method = RequestMethod.POST)
//    public void svgInfo(HttpServletRequest request, HttpServletResponse response) throws IOException{
//
//        JSONObject resJson = new JSONObject();
//        JSONObject contentJson = new JSONObject();
//        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
//        String fileName = "";
//        //获取用户名，如果不是admin，禁止访问
//        HttpSession session = request.getSession();
//        //账号已登陆,获取账号信息
//        User user = (User)session.getAttribute(User.USER_SESSIONG_KEY);
//        logger.info("loginUserName :" + user.getName());
//        if(!"admin".equals(user.getName().trim())){
//            contentJson.put("code", "107");
//            contentJson.put("desc", "非admin用户，禁止上传svg图信息");
//            resJson.put("sign", "null");
//            resJson.put("content", contentJson);
//            //web回复
//            response.setCharacterEncoding("UTF-8");
//            response.setContentType("text/plain");
//            response.getWriter().write(resJson.toString());
//            return;
//        }
//
//         // 定义解析器去解析request
//        CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver(request.getSession().getServletContext());
//        //判断request是否有文件上传
//        if(!multipartResolver.isMultipart(request)){
//            String resultJson = "{\"content\":\"{'code':'105','desc':'未选择文件，请选择文件上传...'}\"}";
//            //web回复
//            response.setCharacterEncoding("utf-8");
//            response.setContentType("text/plain");
//            response.getWriter().write(resultJson);
//            return;
//        }
//        try {
//            //MultipartHttpServletRequest
//            MultipartHttpServletRequest multiRequest = (MultipartHttpServletRequest) request;
//            //获取文件名
//            Iterator<String> it = multiRequest.getFileNames();
//            int merchantID = Integer.parseInt(request.getParameter("merchantID"));
//            logger.info("merchantid: " + merchantID);
//            while (it.hasNext()) {
//                //获取MultipartFile类型文件
//                MultipartFile fileDetail = multiRequest.getFile(it.next());
//                if (fileDetail != null) {
//                    logger.info("file origin name:" + fileDetail.getOriginalFilename());
//                    logger.info("file contentType:" + fileDetail.getContentType());
//                    logger.info("file name:" + fileDetail.getName());
//                    logger.info("file size:" + fileDetail.getSize());
//                    fileName += fileDetail.getName() + ",";
//                   //获取文件的字节
//                    String appPath = request.getSession().getServletContext().getRealPath("");
//                    logger.info("appPath: " + appPath);
//                    InputStream inputStream = fileDetail.getInputStream();
//                    logger.info("解析，并插入数据库中");
//                    String svgName = svgUploadDao.svgParse(merchantID, inputStream);
//                    logger.info("svgname: " + svgName);
//                    String filePath = appPath + "/images/svg/" + svgName;
//                    OutputStream outputStream =new FileOutputStream(new File(filePath));
//                    byte buffer[]=new byte[4*1024];
//                    int len = 0;
//                    while((len = inputStream.read(buffer)) != -1){
//                        outputStream.write(buffer,0,len);
//                    }
//                    outputStream.flush();
//                    outputStream.close();
//                    inputStream.close();
///*                    BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream, "UTF-8"));
//                    String line = null;
//                    while ((line = bufferedReader.readLine()) != null) {
//                        //logger.info(line);
//                        //文本格式为：日期，销售量，销售额
//                    }
//                    bufferedReader.close();*/
//                }
//            }
//        }catch (MalformedURLException e){
//            logger.error(e.getMessage());
//            contentJson.put("code", "105");
//            contentJson.put("desc", "数据流接收失败，请重新上传。");
//            resJson.put("sign", "null");
//            resJson.put("content", contentJson);
//            //web回复
//            response.setCharacterEncoding("UTF-8");
//            response.setContentType("text/plain");
//            response.getWriter().write(resJson.toString());
//            return;
//        }catch (Exception e){
//            logger.error(e.getMessage());
//            contentJson.put("code", "105");
//            contentJson.put("desc", "文件上传成功, 但解析错误，请检查文件格式。");
//            resJson.put("sign", "null");
//            resJson.put("content", contentJson);
//            //web回复
//            response.setCharacterEncoding("UTF-8");
//            response.setContentType("text/plain");
//            response.getWriter().write(resJson.toString());
//            return;
//        }
//
//        contentJson.put("code", "100");
//        contentJson.put("desc", "文件导入成功");
//        resJson.put("sign", "null");
//        resJson.put("content", contentJson);
//
//        //web回复
//        response.setCharacterEncoding("UTF-8");
//        response.setContentType("text/plain");
//        response.getWriter().write(resJson.toString());
//    }
//}
