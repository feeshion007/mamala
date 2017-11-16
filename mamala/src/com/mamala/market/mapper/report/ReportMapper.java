package com.mamala.market.mapper.report;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.mamala.market.pojo.report.BusinessCreditReport;
import com.mamala.market.pojo.report.BusinessDayReport;
import com.mamala.market.pojo.report.BusinessDishReport;
import com.mamala.market.pojo.report.BusinessEarnReport;
import com.mamala.market.pojo.report.BusinessPayReport;
import com.mamala.market.pojo.report.BusinessTotalReport;

public interface ReportMapper {

	public BusinessTotalReport qryTotalList(@Param("storeId")long storeId,@Param("startTime")String startTime,@Param("endTime")String endTime);

	public List<BusinessDayReport> qryDayReportList(@Param("storeId")long storeId,@Param("startTime")String startTime,@Param("endTime")String endTime);

	public BusinessEarnReport qryEarnReportList(@Param("storeId")long storeId,@Param("startTime")String startTime,@Param("endTime")String endTime);

	public BusinessPayReport qryPayReportList(@Param("storeId")long storeId,@Param("startTime")String startTime,@Param("endTime")String endTime);

	public BusinessCreditReport qryCreditReportList(@Param("storeId")long storeId,@Param("startTime")String startTime,@Param("endTime")String endTime);

	public List<BusinessDishReport> qryDishReportList(@Param("storeId")long storeId,@Param("startTime")String startTime,@Param("endTime")String endTime);

}
