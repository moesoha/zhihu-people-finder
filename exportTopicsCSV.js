/*
	Zhihu People Finder
	exportCSV.js - export collection list to CSV

	[Soha King](https://soha.moe) from
		[Tianhai IT](http://tianhai.info)
*/

const diskdb=require('diskdb');
const json2csv=require('json2csv');
const fs=require('fs');
let db=diskdb.connect('./db',['listWithTopic']);

const dataorigin=db.listWithTopic.find();
let fileout=process.argv.splice(2)[0];
if(fileout){
	var data=dataorigin;
	for(var j in data){
		let topicNamesArray=[];
		let topicIdsArray=[]; 
		for(var i in dataorigin[j].topics){
			if(dataorigin[j].topics.hasOwnProperty(i)){
				topicIdsArray.push(dataorigin[j].topics[i].id);
				topicNamesArray.push(dataorigin[j].topics[i].name);
			}
		}
		for(var i in dataorigin[j].numbers){
			if(dataorigin[j].numbers.hasOwnProperty(i)){
				data[j]['numbers_'+i]=dataorigin[j].numbers[i];
			}
		}
		data.topics_name=topicNamesArray.join(',');
		data.topics_id=topicIdsArray.join(',');
		delete data[j]._id;
		delete data[j].topics;
		delete data[j].numbers;
	}
	fields=[];
	for(var i in data[0]){
		if(data[0].hasOwnProperty(i)){
			fields.push(i);
		}
	}
	
	try{
		let result=json2csv({
			data: data,
			fields: fields
		});
		fs.writeFileSync(fileout,result);
	}catch(err){
		console.error(err);
	}
}else{
	console.log('usage: node exportTopicsCSV.js <exportFilename>');
}