var inputObject = document.getElementsByName("inputBox")[0];
var analyseObject = document.getElementsByName("analyseResultBox")[0];
/**
 * 0:CREATE TABLE
 * 1:(
 * 2:.
 * 3:[
 * 4:]
 * 5:空格
 * 6:,
 * 7:?
 * 8:CONSTRAINT
 * 9:)
 * 10:MS_Description
 */
var keyWords = ["CREATE TABLE","(",".","[","]"," ",",","?","CONSTRAINT",")","MS_Description"]
inputObject.onchange=inputFunction;

function inputFunction(){
	var inputContent = inputObject.value;
	
	var result = dealwithInputContent(inputContent);
	var output="表名：";
	output += result.tableName;
	output+="\n\n字段名\t\t\t\t\t\t字段类型\t\t\t\t\t可空\n";
	var fieldInfo = result.fieldInfo;
	if(fieldInfo!=undefined){
		for (let index = 0; index < fieldInfo.length; index++) {
			const element = fieldInfo[index];
			element.fieldName = addBlackSpace(element.fieldName);
			element.fieldType = addBlackSpace(element.fieldType);
			output=output+"\n"+ element.fieldName+element.fieldType+element.fieldIsNullAble;
		}
	}
	
	analyseObject.value=output;
}

function addBlackSpace(fieldName){
	var totalLength = 6;
	var now = fieldName.length/8;
	var needToAdd=totalLength-now;
	for (let index = 0; index < needToAdd; index++) {
		fieldName += "\t";
	}
	return fieldName;
}

function dealwithInputContent(content){
	var analyseMap = getTableName(content);
	analyseMap.fieldInfo=[];
	analyseMap = getFieldInfo(analyseMap);
	
	return analyseMap;
}

function getTableName(content){
	var map = {tableName:undefined,restContent:undefined};
	var tableKeyWordStartIndex = content.toUpperCase().indexOf(keyWords[0]);
	var tableKeyWordEndIndex = content.indexOf(keyWords[1]);
	var tableName = content.substring(tableKeyWordStartIndex + keyWords[0].length, tableKeyWordEndIndex).trim();
	var pointIndex = tableName.indexOf(keyWords[2]);
	if(pointIndex >0){
		tableName = tableName.substring(pointIndex + keyWords[2].length).trim();
	}
	tableName = tableName.replace("[","");
	tableName = tableName.replace("]","");
	tableName = tableName.trim();
	map.tableName=tableName;
	map.restContent=content.substring(tableKeyWordEndIndex+keyWords[1].length).trim();
	return map;
}
function getFieldInfo(analyseMap){
	var content = analyseMap.restContent;
	
	var fieldInfo={
		fieldName:"",
		fieldType:""
	}
	if(content[0]==keyWords[3]){
		var rightEndIndex = content.indexOf(keyWords[4]);
		fieldInfo.fieldName= content.substring(1,rightEndIndex);
		content = content.substring(rightEndIndex+1).trim();
		if(content[0]==keyWords[3]){
			rightEndIndex = content.indexOf(keyWords[4]);
			fieldInfo.fieldType= content.substring(1,rightEndIndex);
			content = content.substring(rightEndIndex+1).trim();
		}else{
			rightEndIndex = content.indexOf(keyWords[5]);
			fieldInfo.fieldType= content.substring(1,rightEndIndex);
			content = content.substring(rightEndIndex+1).trim();
		}
	}else{
		rightEndIndex = content.indexOf(keyWords[5]);
		fieldInfo.fieldName= content.substring(1,rightEndIndex);
		content = content.substring(rightEndIndex+1).trim();
	}
	var commaIndex = content.indexOf(keyWords[6]);
	if(commaIndex>-1){
		var number = content.substring(commaIndex+1).trim()[0];
		// 如果是数字则表示这个逗号不是这个字段的结尾而是类似decimal(18,4)中的逗号
		if(number>='0'&&number<='9'){
			content = content.substring(commaIndex+2).trim();
			commaIndex = content.indexOf(keyWords[6]);
			if(commaIndex>-1){
				fieldInfo.fieldIsNullAble = fieldIsNULLAble(content.substring(0,commaIndex));
			}
		}else{
			fieldInfo.fieldIsNullAble = fieldIsNULLAble(content.substring(0,commaIndex));
		}
	}
	analyseMap.fieldInfo.push(fieldInfo);
	analyseMap.restContent=content.substring(commaIndex+1).trim();
	if(analyseMap.restContent.toUpperCase().indexOf(keyWords[8])===0 || analyseMap.restContent.indexOf(keyWords[9])===0){
		return analyseMap;
	}else{
		return getFieldInfo(analyseMap);
	}
}

function getDescription(content){

	var descriptionInfo = {
		description:"",
		fieldName:"",
		isColumnOrTable:""
	};
	var firstDescription = content.indexOf(keyWords[10]);
	content = content.substring(firstDescription+keyWords[10].length).trim();
	var secondDescription = content.length;
	var description = content;
	if(firstDescription>-1){
		secondDescription = content.indexOf(keyWords[10]);
		description = content.substring(0, secondDescription).trim();
		// 从注释行中获取字段描述
		
		descriptionInfo.description="";

		content = content.substring(secondDescription).trim();
	}
}

function fieldIsNULLAble(content){
	indexOfNOTNULL = content.indexOf("NOT NULL");
	if(indexOfNOTNULL>-1){
		return false;
	}else{
		return true;
	}
}