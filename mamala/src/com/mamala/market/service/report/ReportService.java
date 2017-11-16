package com.mamala.market.service.report;

import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mamala.market.mapper.report.ReportMapper;
import com.mamala.market.pojo.report.BusinessCreditReport;
import com.mamala.market.pojo.report.BusinessDayReport;
import com.mamala.market.pojo.report.BusinessDishReport;
import com.mamala.market.pojo.report.BusinessEarnReport;
import com.mamala.market.pojo.report.BusinessPayReport;
import com.mamala.market.pojo.report.BusinessTotalReport;
 
@Service
public class ReportService {
	private static Logger logger = Logger.getLogger(ReportService.class);
	 
    @Autowired
    private ReportMapper reportMapper;

	public BusinessTotalReport qryTotalList(long storeId,String startTime,String endTime) {
		// TODO Auto-generated method stub
		return reportMapper.qryTotalList(storeId,startTime,endTime);
	}

	public List<BusinessDayReport> qryDayReportList(long storeId,String startTime,String endTime) {
		// TODO Auto-generated method stub
		return reportMapper.qryDayReportList(storeId,startTime,endTime);
	}

	public BusinessEarnReport qryEarnReportList(long storeId,String startTime,String endTime) {
		// TODO Auto-generated method stub
		return reportMapper.qryEarnReportList(storeId,startTime,endTime);
	}

	public BusinessPayReport qryPayReportList(long storeId,String startTime,String endTime) {
		// TODO Auto-generated method stub
		return reportMapper.qryPayReportList(storeId,startTime,endTime);
	}

	public BusinessCreditReport qryCreditReportList(long storeId,String startTime,String endTime) {
		// TODO Auto-generated method stub
		return reportMapper.qryCreditReportList(storeId,startTime,endTime);
	}

	public List<BusinessDishReport> qryDishReportList(long storeId,String startTime,String endTime) {
		// TODO Auto-generated method stub
		return reportMapper.qryDishReportList(storeId,startTime,endTime);
	}
}
