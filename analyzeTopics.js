/*
	Zhihu People Finder
	analyzeTopics.js - analyze collection list to CSV

	[Soha King](https://soha.moe) from
		[Tianhai IT](http://tianhai.info)
*/

const diskdb=require('diskdb');
const fs=require('fs');
let db=diskdb.connect('./db',['listWithTopic']);

const dataorigin=db.listWithTopic.find();
let fileout=process.argv.splice(2)[0];
let count233=0;
let allTopics={
	id: {},
	name: {},
	data:{}
};
if(fileout){
	var data=dataorigin;
	for(var j in data){
		let topicNamesArray=[];
		let topicIdsArray=[]; 
		for(var i in dataorigin[j].topics){
			if(dataorigin[j].topics.hasOwnProperty(i)){
				count233++;
				topicIdsArray.push(dataorigin[j].topics[i].id);
				topicNamesArray.push(dataorigin[j].topics[i].name);
				if(allTopics.id.hasOwnProperty(dataorigin[j].topics[i].id)){
					allTopics.id[dataorigin[j].topics[i].id]++;
				}else{
					allTopics.id[dataorigin[j].topics[i].id]=1;
				}
				if(allTopics.name.hasOwnProperty(dataorigin[j].topics[i].name)){
					allTopics.name[dataorigin[j].topics[i].name]++;
				}else{
					allTopics.name[dataorigin[j].topics[i].name]=1;
				}
				allTopics.data[dataorigin[j].topics[i].id]=dataorigin[j].topics[i].name;
			}
		}
		for(var i in dataorigin[j].numbers){
			if(dataorigin[j].numbers.hasOwnProperty(i)){
				data[j]['numbers_'+i]=dataorigin[j].numbers[i];
			}
		}
		data[j].topics_name=topicNamesArray.join(',');
		data[j].topics_id=topicIdsArray.join(',');
		delete data[j]._id;
		delete data[j].topics;
		delete data[j].numbers;
	}
	fields=[];
	let outputData="";
	for(var i in allTopics.id){
		if(allTopics.id.hasOwnProperty(i)){
			if(allTopics.id[i]>1){
				outputData+=allTopics.data[i]+"\t"+allTopics.id[i]+"\r\n";
			}
		}
	}
	fs.writeFileSync(fileout,outputData);
	console.log(JSON.stringify(allTopics));
}else{
	console.log('usage: node analyzeTopics.js <exportFilename>');
}