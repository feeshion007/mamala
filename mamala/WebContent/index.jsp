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
                 //factory.printing.header = "&b&b��&pҳ/��&Pҳ"
                 //factory.printing.footer = "&b&bʱ�䣺&D&T"
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
<input type=button name=button_show value="��     ӡ" onclick="print();">
<input type=button name=button_show value="��ӡԤ��" onclick="preview();">
<input type=button name=button_setup value="��ӡ����" onclick="pageSetup();">
</td>
</tr>
</table>
</body>
<object id="factory" style="display:none" viewastext
classid="clsid:1663ed61-23eb-11d2-b92f-008048fdd814"
codebase="/etsc/ActiveX/ScriptX.zip#Version=6,1,430,5">
</object>

</html>
