function demoPrint(print) {  
	 LODOP.PRINT_INIT("点菜详单");//如果是使用pdf打印机的话 会另存为成“准考证.pdf”  
     LODOP.SET_PRINT_PAGESIZE(1, 550, print.height,"点菜详单打印");   
     LODOP.ADD_PRINT_HTM(2,2,"100%","100%",print.html);   
	
	if (print.prview)
		LODOP.PREVIEW();
	else
		LODOP.PRINT();
};
function demoCreatePrinterList() {
	CLODOP.Create_Printer_List(document.getElementById('Select01'));
	demoCreatePagSizeList();
};
function demoCreatePagSizeList() {
	var oSelect = document.getElementById('Select02');
	var iPrintIndex = document.getElementById("Select01").value;
	CLODOP.Create_PageSize_List(oSelect, iPrintIndex);
};
function demoCreateCLodopJSscript(strSrc) {
	var ScriptSS = document.getElementsByTagName("script");
	for ( var i in ScriptSS) {
		if (ScriptSS[i].src && (ScriptSS[i].src.indexOf("CLodopfuncs.js") >= 0)) {
			if (ScriptSS[i].parentNode)
				ScriptSS[i].parentNode.removeChild(ScriptSS[i]);
		}
		;
	}
	;
	var oscript = document.createElement("script");
	if (strSrc.indexOf("=") >= 0) {
		strSrc = strSrc.match(/=[\',\"][^\',^\"].*(?=[\',\"])/i);
		strSrc = strSrc[0].slice(2);
	}
	oscript.src = strSrc;
	var head = document.head || document.getElementsByTagName("head")[0]
			|| document.documentElement;
	head.insertBefore(oscript, head.firstChild);
	return oscript;
};
function demoSetClodopJS(strSrc) {
	var oscript = demoCreateCLodopJSscript(strSrc);
	oscript.onload = oscript.onreadystatechange = function() {
		if ((!oscript.readyState || /loaded|complete/.test(oscript.readyState)))
			demoCreatePrinterList();
	};
};