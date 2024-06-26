var inputObject = document.getElementsByName("inputBox")[0];
var analyseObject = document.getElementsByName("analyseResultBox")[0];
var entityObject = document.getElementsByName("entityResultBox")[0];
var repositoryObject = document.getElementsByName("repositoryResultBox")[0];
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
 * 11:@value
 * 12:@level2name
 * 13:'
 * 14:"[[Table]]"	标识这是表格相关信息
 * 15:_	表名的下划线分隔符
 * 16:Id
 */
var keyWords = ["CREATE TABLE","(",".","[","]"," ",",","?","CONSTRAINT",")","MS_Description","@value","@level2name","'","[[Table]]","_","Id"]
inputObject.onchange=inputFunction;
var type = { 
	
bigint: 'long',
binary: 'byte[]',
bit: 'bool',
char: 'string',
date: 'DateTime',
datetime: 'DateTime',
datetime2: 'DateTime',
datetimeoffset: 'DateTimeOffset',
decimal: 'decimal',
float: 'float',
image: 'byte[]',
int: 'int',
money: 'decimal',
nchar: 'char',
ntext: 'string',
numeric: 'decimal',
nvarchar: 'string',
real: 'double',
smalldatetime: 'DateTime',
smallint: 'short',
smallmoney: 'decimal',
text: 'string',
time: 'TimeSpan',
timestamp: 'DateTime',
tinyint: 'byte',
uniqueidentifier: 'Guid',
varbinary: 'byte[]',
varchar: 'string',
    

"bigint?": 'long?',
"binary?": 'byte[]?',
"bit?": 'bool?',
"char?": 'string',
"date?": 'DateTime?',
"datetime?": 'DateTime?',
"datetime2?": 'DateTime?',
"datetimeoffset?": 'DateTimeOffset?',
"decimal?": 'decimal?',
"float?": 'float?',
"image?": 'byte[]?',
"int?": 'int?',
"money?": 'decimal?',
"nchar?": 'char?',
"ntext?": 'string',
"numeric?": 'decimal?',
"nvarchar?": 'string',
"real?": 'double?',
"smalldatetime?": 'DateTime?',
"smallint?": 'short?',
"smallmoney?": 'decimal?',
"text?": 'string',
"time?": 'TimeSpan?',
"timestamp?": 'DateTime?',
"tinyint?": 'byte?',
"uniqueidentifier?": 'Guid?',
"varbinary?": 'byte[]?',
"varchar?": 'string'
}

inputFunction();
function inputFunction(){
	var inputContent = inputObject.value;
	
	var result = dealwithInputContent(inputContent);
	var output="表名：";
	output += result.tableName;
	output+="\n\n字段名\t\t\t\t\t\t字段类型\t\t\t\t\t可空\n";
	var fieldInfo = result.fieldInfo;
	var fieldDescription = result.fieldDescription;
	if(fieldInfo!=undefined){
		for (let index = 0; index < fieldInfo.length; index++) {
			const element = fieldInfo[index];
			var fieldName = addBlackSpace(element.fieldName);
			var fieldType = addBlackSpace(element.fieldType);
			output=output+"\n"+ fieldName+fieldType+element.fieldIsNullAble;
			output = output + "\n字段注释："+fieldDescription[element.fieldName];
		}
	}
	analyseObject.value=output;
	var fileName = result.tableName;
	var fileNameIndex = result.tableName.indexOf(keyWords[15]);
	if(fileNameIndex>-1){
		fileName = result.tableName.substring(fileNameIndex+keyWords[15].length);
	}
	// 生成实体类
	var fieldRegenerationInfo = getEntityCode(fileName,result.tableName, fieldInfo,fieldDescription);
	entityObject.value=fieldRegenerationInfo.entityCode;
	// 生成repository
	var repositoryCode = getRepositoryCode(fileName, result.tableName, fieldRegenerationInfo);
	repositoryObject.value=repositoryCode;
}

function getEntityCode(tableNameWithoutFrontWord,tableName, fieldInfo,fieldDescription,namespace="ZOS.Common.Entities"){
	var maxRowLength=120;
	var getNettRowStart = "\n\t\t\t\t";
	var addFieldSql=`${getNettRowStart}INSERT INTO ${tableName} (`;
	var addValueSql=`VALUES (`;
	var updateSql=`${getNettRowStart}UPDATE ${tableName} SET `;
	var querySql=`${getNettRowStart}SELECT `;
	var sqlCurrentRowLength ={
		addField:addFieldSql.length,
		addValue:addValueSql.length,
		update:updateSql.length,
		query: querySql.length
	} 
	var entityCode=`using System;
using ZOS.Common.Entities.Enums.ProduceManagement;
using ZOS.Data;

namespace ${namespace}
{
	/// <summary>
	/// ${fieldDescription[keyWords[14]]}
	/// </summary>
	public class ${tableNameWithoutFrontWord} : Entity
	{`;
	if(fieldInfo!=undefined){
		for (let index = 0; index < fieldInfo.length; index++) {
			var commaSign = index===fieldInfo.length-1?"":", ";
			const element = fieldInfo[index];
			var fieldName = element.fieldName;
			var fieldType = element.fieldType;
			var fieldIsNullAble = element.fieldIsNullAble;

			// 实体类字段
			if(fieldName !== keyWords[16]){
				entityCode=entityCode +`
			
		/// <summary>
		/// ${fieldDescription[fieldName] == undefined?"":fieldDescription[fieldName]}
		/// </summary>
		public ${type[fieldType+fieldIsNullAble] == undefined ? fieldType : type[fieldType+fieldIsNullAble]} ${fieldName} { get; set; }`;
			}

			// repository 内容
			var withSignField = `@${fieldName}${commaSign}`;
			var withoutSignField = `[${fieldName}]${commaSign}`;
			if(sqlCurrentRowLength.addField+withoutSignField.length>maxRowLength){
				sqlCurrentRowLength.addField = withoutSignField.length;
				addFieldSql+=getNettRowStart;
				addValueSql+=getNettRowStart;
			}else{
				sqlCurrentRowLength.addField += withoutSignField.length;
			}
			addFieldSql=addFieldSql+`${withoutSignField}`;
			addValueSql=addValueSql+`${withSignField}`;
			
			if(sqlCurrentRowLength.query+withoutSignField.length>maxRowLength){
				sqlCurrentRowLength.query = withoutSignField.length;
				querySql+=getNettRowStart;
			}else{
				sqlCurrentRowLength.query += withoutSignField.length;
			}
			querySql=querySql+`${withoutSignField}`;
			
			var updateField = `[${fieldName}] = @${fieldName}${commaSign}`;
			if(sqlCurrentRowLength.update+updateField.length>maxRowLength){
				sqlCurrentRowLength.update = updateField.length;
				updateSql+=getNettRowStart;
			}else{
				sqlCurrentRowLength.update += updateField.length;
			}
			updateSql=updateSql+`${updateField}`;
			
			
		}
	}
	addFieldSql+=`)${getNettRowStart}`;
	addValueSql+=`) `;
	updateSql+=`${getNettRowStart}WHERE [Id] = @Id `;
	querySql += `${getNettRowStart}FROM ${tableName} `
	entityCode=entityCode+`
	}
}`;
	var returnValue={
		entityCode:entityCode,
		addSql:addFieldSql+addValueSql,
		updateSql:updateSql,
		deleteSql:` DELETE FROM [${tableName}] WHERE [Id] = @Id `,
		queryAllSql:querySql,
		queryOneSql:querySql+`${getNettRowStart}WHERE [Id] = @Id `
	};
	return returnValue;
}

function getRepositoryCode(tableNameWithoutFrontWord, tableName, fieldRegenerationInfo,namespace="ZOS.Common.Repository"){
	
	outPutRepositoryCode=`using ZOS.Common.Entities.ProduceManagement.PlanMarking.ProductionPlan;
using ZOS.Common.IRepository.ProduceManagement.PlanMaking.ProductionPlanning;
using ZOS.Data;
using ZOS.Data.Repository;

namespace ${namespace}
{
    public class  ${tableNameWithoutFrontWord}Repository : RepositoryBase<${tableNameWithoutFrontWord}>, I${tableNameWithoutFrontWord}Repository
    {
        public static SqlStrings ${tableNameWithoutFrontWord}Sql = new SqlStrings
        {
            TableName = "${tableName}",
            Add = @"${fieldRegenerationInfo.addSql}",
            Update = @"${fieldRegenerationInfo.updateSql}",
            Delete = @"${fieldRegenerationInfo.deleteSql}",
            QueryAll = @"${fieldRegenerationInfo.queryAllSql}",
            QueryOne = @"${fieldRegenerationInfo.queryOneSql}"
        };

        public ${tableNameWithoutFrontWord}Repository(ISqlDatabaseProxy databaseProxy)
            : base(databaseProxy)
        {
            Sql = ${tableNameWithoutFrontWord}Sql;
        }
        protected sealed override SqlStrings Sql
        {
            get { return base.Sql; }
            set { base.Sql = value; }
        }
    }
}

	`;
	return outPutRepositoryCode;
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
	analyseMap.fieldDescription={};
	analyseMap = getFieldInfo(analyseMap);
	analyseMap = getDescription(analyseMap);
	
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
	//analyseMap.fieldInfo[fieldInfo.fieldName]=fieldInfo;
	analyseMap.fieldInfo.push(fieldInfo);
	analyseMap.restContent=content.substring(commaIndex+1).trim();
	if(analyseMap.restContent.toUpperCase().indexOf(keyWords[8])===0 || analyseMap.restContent.indexOf(keyWords[9])===0){
		return analyseMap;
	}else{
		return getFieldInfo(analyseMap);
	}
}

function getDescription(analyseMap){
	var content = analyseMap.restContent;
	var descriptionInfo = {
		description:"",
		fieldName:""
	};
	var firstDescription = content.indexOf(keyWords[10]);
	content = content.substring(firstDescription+keyWords[10].length).trim();
	var secondDescription = content.length;
	var description = content;
	if(firstDescription>-1){
		secondDescription = content.indexOf(keyWords[10]);
		if(secondDescription>-1){
			description = content.substring(0, secondDescription).trim();
			descriptionInfo.description="";
			analyseMap.restContent = content.substring(secondDescription).trim();
		}else{
			description = content;
			descriptionInfo.description="";
			analyseMap.restContent = "";
		}
		
	}else{
		return analyseMap;
	}

	// 从注释行中获取字段描述 description
	descriptionInfo.description = getSpecialFieldInfoFromDescription(description, keyWords[11]);
	if(descriptionInfo.description!=null){
		// 获取字段名
		descriptionInfo.fieldName = getSpecialFieldInfoFromDescription(description, keyWords[12]);
		if(descriptionInfo.fieldName == null){
			descriptionInfo.fieldName=keyWords[14];
		}
	}
	analyseMap.fieldDescription[descriptionInfo.fieldName]=descriptionInfo.description;
	analyseMap = getDescription(analyseMap);
	return analyseMap;
}

function getSpecialFieldInfoFromDescription(description, keyWord){
	var valueIndex = description.indexOf(keyWord);
	if(valueIndex>-1){
		var includeValueString = description.substring(valueIndex+keyWord.length).trim();
		var leftQuotationMarkIndex = includeValueString.indexOf(keyWords[13]);
		if(leftQuotationMarkIndex>-1){
			var onlyRightQuotationMarkString = includeValueString.substring(leftQuotationMarkIndex+keyWords[13].length);
			var rightQuotationMarkIndex = onlyRightQuotationMarkString.indexOf(keyWords[13]);
			if(rightQuotationMarkIndex>-1){
				return onlyRightQuotationMarkString.substring(0,rightQuotationMarkIndex);
			}
		}

	}
	return null;
}

function fieldIsNULLAble(content){
	indexOfNOTNULL = content.indexOf("NOT NULL");
	if(indexOfNOTNULL>-1){
		return "";
	}else{
		return "?";
	}
}