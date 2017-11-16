<%@ page contentType="text/html; charset=GBK"%>
<%
String url="#";
%>
<html>
<style media="print">
     .noPrint { display: none }
   </style>
   <style media="screen">
      .print { display: none }
</style>
<script language="javascript" >
         function pageSetup()
         {
                 factory.printing.PageSetup();
         }
         function preview()
         {
                 setPageInfo();
                 factory.printing.Preview();
         }
         function print()
         {
                 setPageInfo();
                 factory.printing.Print(true);
         }
         function setPageInfo(){
                 //factory.printing.header = "&b&b第&p页/共&P页"
                 //factory.printing.footer = "&b&b时间：&D&T"
                 factory.printing.footer = ""
                 factory.printing.leftMargin = 10
                 factory.printing.topMargin = 20
                 factory.printing.rightMargin = 10
                 factory.printing.bottomMargin = 20
         }
</script>
<title></title>
<body>
<jsp:include page="<%=url%>" />
<table width="100%" class="noPrint" border="0" cellspacing="0" cellpadding="0">
<tr>
<td height="60" align="center">
<input type=button name=button_show value="打     印" onclick="print();">
<input type=button name=button_show value="打印预览" onclick="preview();">
<input type=button name=button_setup value="打印设置" onclick="pageSetup();">
</td>
</tr>
</table>
</body>
<object id="factory" style="display:none" viewastext
classid="clsid:1663ed61-23eb-11d2-b92f-008048fdd814"
codebase="/etsc/ActiveX/ScriptX.zip#Version=6,1,430,5">
</object>

</html>
