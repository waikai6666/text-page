var inputObject = document.getElementsByName("inputBox")[0];
var analyseObject = document.getElementsByName("analyseResultBox")[0];
var keyWords = ["CREATE TABLE","(","."]
inputObject.onchange=inputFunction;

function inputFunction(){
	var inputContent = inputObject.value;
	
	var result = dealwithInputContent(inputContent);
	analyseObject.value=result;
}

function dealwithInputContent(content){
	var analyseMap = getTableName(content);


	return analyseMap;
}

function getTableName(content){
	var map = {tableName:undefined,restContent:undefined};
	var tableKeyWordStartIndex = content.indexOf(keyWords[0]);
	var tableKeyWordEndIndex = content.indexOf(keyWords[1]);
	var tableName = content.substring(tableKeyWordStartIndex + keyWords[0].length, tableKeyWordEndIndex).trim();
	var pointIndex = tableName.indexOf(keyWords[2]);
	if(pointIndex >0){
		tableName = tableName.substring(pointIndex + keyWords[2].length, tableName.length-1).trim();
	}
	tableName = tableName.replace("[","");
	tableName = tableName.replace("]","");
	tableName = tableName.trim();
	map.tableName=tableName;
	map.restContent=content.substring(tableKeyWordEndIndex, content.length-1).trim();
	return map;
}
function getFieldInfo(content){
	var pointIndex = tableName.indexOf(keyWords[2]);

}