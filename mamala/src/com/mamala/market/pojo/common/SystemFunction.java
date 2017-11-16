package com.mamala.market.pojo.common;

public class SystemFunction {
    int    funcID;   /* 功能ID */
    String funcName; /* 功能名 */
    String funcNameEng;
    String pageUrl;  /* 功能的页面URL */
    int    pageArg;  /* 页面参数:数据分析的级别 */
    
    //get
    public int getFuncID() {
        return this.funcID;
    }
    
    public String getFuncName() {
        return this.funcName;
    }
    
    public String getPageUrl() {
        return this.pageUrl;
    }
    
    public int getPageArg() {
        return this.pageArg;
    }
    
    //set
    public void setFuncID(int funcID) {
        this.funcID = funcID;
    }
    
    public void setFuncName(String funcName) {
        this.funcName = funcName;
    }
    
    public void setPageUrl(String pageUrl) {
        this.pageUrl = pageUrl;
    }
    
    public void setPageArg(int pageArg) {
        this.pageArg = pageArg;
    }

	public String getFuncNameEng() {
		return funcNameEng;
	}

	public void setFuncNameEng(String funcNameEng) {
		this.funcNameEng = funcNameEng;
	}
}
