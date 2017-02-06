/*
	Zhihu People Finder
	getTopics.js - grab user's topics.

	[Soha King](https://soha.moe) from
		[Tianhai IT](http://tianhai.info)
*/

const request=require('request');
const diskdb=require('diskdb');
const cheerio=require('cheerio');
const async=require('async');

const requestHeaders={
	'Connection': 'keep-alive',
	'User-Agent': 'ZhihuFinder/1.0.0 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.19 Safari/537.36'
};
const baseUrl="https://www.zhihu.com";

let db=diskdb.connect('./db',['listWithTopic','list']);

process.on('uncaughtException',function (err){
	console.log(err);
});

function crawlTopics(userid,cb){
	request({
		url: baseUrl+'/people/'+userid+'/following/topics',
		headers: requestHeaders
	},function (err,res,data){
		if(res && res.statusCode==200){
			let $=cheerio.load(data);
			try{
				let dataState=JSON.parse($('div#data').attr('data-state'));
				let topicData=dataState.entities.topics;
				let topics=[];
				for(var i in topicData){
					if(topicData.hasOwnProperty(i)){
						topics.push({
							id: topicData[i].id,
							name: topicData[i].name
						});
					}
				}
				if(cb){
					cb(topics);
				}
			}catch(err){
				console.log(err);
				console.log('Met error when processing \''+userid+'\'');
				if(cb){
					cb([],0);
				}
			}
		}else{
			console.log('No user (banned or deleted): '+userid);
			if(cb){
				cb([]);
			}
		}
	});
}

let allQueue=db.list.find();
console.log('The collection \'list\' has '+allQueue.length+' objects.');
var count=0;
async.whilst(function (){
	return(count<allQueue.length);
},function (callback){
	let now=allQueue[count];
	crawlTopics(now.username,function (topicdata){
		if(db.listWithTopic.find({
			username: now.username
		}).length==0){
			let nn=now;
			delete nn._id;
			nn.topics=topicdata;
			db.listWithTopic.save(nn);
		}
		count++;
		callback(null,count);
	});
},function (err,n){
	console.log(n+' objects\'s topics exported.');
});