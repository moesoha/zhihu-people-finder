/*
	Zhihu People Finder
	exportCSV.js - export collection list to CSV

	[Soha King](https://soha.moe) from
		[Tianhai IT](http://tianhai.info)
*/

const diskdb=require('diskdb');
const json2csv=require('json2csv');
const fs=require('fs');
let db=diskdb.connect('./db',['list']);

const dataorigin=db.list.find();
let fileout=process.argv.splice(2)[0];
if(fileout){
	var data=dataorigin;
	for(var j in data){
		for(var i in dataorigin[j].numbers){
			if(dataorigin[j].numbers.hasOwnProperty(i)){
				data[j]['numbers_'+i]=dataorigin[j].numbers[i];
			}
		}
		delete data[j].numbers;
		delete data[j]._id;
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
	console.log('usage: node exportCSV.js <exportFilename>');
}