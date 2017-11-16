package com.mamala.market.pojo.common;

/**
 * 授权对象类
 * 对应t_lic_info表
 */
public class LicenseInfo {
	private String productName;
	private String licFileName;
	private String licFilePath;
	
	public String getProductName() {
		return productName;
	}
	public void setProductName(String productName) {
		this.productName = productName;
	}
	public String getLicFileName() {
		return licFileName;
	}
	public void setLicFileName(String licFileName) {
		this.licFileName = licFileName;
	}
	public String getLicFilePath() {
		return licFilePath;
	}
	public void setLicFilePath(String licFilePath) {
		this.licFilePath = licFilePath;
	}
}
