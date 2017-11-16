//package com.ruijie.web.controller.fileDownload;
//
///**
// * Created by OA on 2015/5/22.
// */
//import java.io.IOException;
//import java.io.OutputStream;
//import java.text.ParseException;
//import java.text.SimpleDateFormat;
//import java.util.Date;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import javax.servlet.http.HttpSession;
//
//import org.apache.log4j.Logger;
//import org.apache.poi.hssf.usermodel.HSSFWorkbook;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestMethod;
//
//import com.ruijie.rbis.dao.report.ReportDao;
//import com.ruijie.rbis.pojo.common.User;
//
//@Controller
//public class DownloadController {
//
//    private static Logger logger = Logger.getLogger(DownloadController.class);
//
//    @Autowired
//    private ReportDao reportDao;
//
//    //private ApplicationContext context = ContextLoader.getCurrentWebApplicationContext();
//
//    @RequestMapping(value = "/download", method = RequestMethod.GET)
//    public void excelDownload(HttpServletRequest request, HttpServletResponse response)throws IOException{
//    	HttpSession session = request.getSession(false);
//    	User user = (User) session.getAttribute(User.USER_SESSIONG_KEY);
//    	
//        StringBuffer log = new StringBuffer();
//
//       // String locationID = request.getParameter("locationID");
//        //String locationType = request.getParameter("locationType");
//        String beginDate = request.getParameter("beginDate");
//        String endDate   = request.getParameter("endDate");
//        String dateType = request.getParameter("dateType");
//        String index = request.getParameter("index");
//        String targetFile = "";
//        String formatPattern = "yyyy-MM-dd";
//        Date begin = null;
//        Date end = null;
//        try {
//            SimpleDateFormat dateFormat = new SimpleDateFormat(formatPattern);
//            begin    = dateFormat.parse(beginDate);
//            end     = dateFormat.parse(endDate);
//        } catch (ParseException e) {
//            e.printStackTrace();
//        }
//
//
//      //  logger.info("locationID" + locationID);
//      //  logger.info("locationType" + locationType);
//        logger.info("beginDate=" + beginDate);
//        logger.info("endDate=" + endDate);
//        logger.info("dateType" + dateType);
//        logger.info("index" + index);
//        try {
//            if (dateType.equalsIgnoreCase("day")) {
//                //Such as: [Day]2014-08-12-Report.xls
//                targetFile = "[Day]" + beginDate + "~" + endDate + "-Report.xls";
//            } else if (dateType.equalsIgnoreCase("month")) {
//                //Such as: [Month]2014-08-Report.xls
//                String beginMonth = beginDate.substring(0, 7);
//                String endMonth = endDate.substring(0,7);
//                targetFile = "[Month]" + beginMonth + "~" + endMonth + "-Report.xls";
//                //Debug.log(log, "month="+month+"|targetFile="+targetFile);
//            } else {
//                //Such as: [Year]2014-Report.xls
//                String beginYear = beginDate.substring(0, 4);
//                String endYear = endDate.substring(0, 4);
//                targetFile = "[Year]" + beginYear + "~" + endYear + "-Report.xls";
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        response.setContentType("application/vnd.ms-excel");        //改成输出excel文件
//        //response.setContentType("application/x-msdownload");
//        response.addHeader("Content-Disposition", "attachement; filename=\"" + targetFile + "\"");
//        response.setCharacterEncoding("UTF-8");
//        OutputStream os = response.getOutputStream();
//
//
//        //logger.info("exportReport=" + String.valueOf(report));
//        //HSSFWorkbook excel = report.getReportExcel(log, locationID, locationType, beginDate, endDate, dateType, index);
//        //HSSFWorkbook excel = reportDao.qryForExcelContent(locationID, locationType, begin, end, dateType, index);
//        HSSFWorkbook excel = reportDao.qryForExcelContentAll(user, begin, end, dateType, index);
//        logger.info("get success...");
//        if (excel != null) {
//            try {
//                excel.write(os);
//                //os.write(byteArry);
//                os.close();
//                response.flushBuffer();
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        }
//    }
//}
