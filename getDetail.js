/*
	Zhihu People Finder
	getDetail.js - grab user detail info.

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

let db=diskdb.connect('./db',['list','queue']);

function extractInformation(theuser){
	return({
		username: theuser.urlToken,
		name: theuser.name,
		description: theuser.description ? theuser.description.replace(new RegExp('<br>','g'),"\n") : theuser.description,
		headline: theuser.headline ? theuser.headline.replace(new RegExp('<br>','g'),"\n") : theuser.headline,
		gender: theuser.gender,
		url: theuser.url,
		avater: theuser.avatarUrl,
		numbers: {
			answers: parseInt(theuser.answerCount),
			posts: parseInt(theuser.pinsCount),
			questions: parseInt(theuser.questionCount),
			collections: parseInt(theuser.favoritedCount),
			articles: parseInt(theuser.articlesCount),
			voteup: parseInt(theuser.voteupCount),
			thanks: parseInt(theuser.thankedCount),
			faviorited: parseInt(theuser.favoritedCount),
			publicEditing: parseInt(theuser.logsCount),
			following: parseInt(theuser.followingCount),
			follower: parseInt(theuser.followerCount),
			followingColumns: parseInt(theuser.followingColumnsCount),
			followingCollections: parseInt(theuser.followingFavlistsCount),
			followingTopics: parseInt(theuser.followingTopicCount),
			followingQuestions: parseInt(theuser.followingQuestionCount)
		}
	});
}

function analyzeUserData(usersArray,thisuser){
	var retData=[];
	retData.push(extractInformation(usersArray[thisuser]));
	delete usersArray[thisuser];
	for(var i in usersArray){
		if(usersArray.hasOwnProperty(i)){
			retData.push(extractInformation(usersArray[i]));
		}
	}
	return(retData);
}

function crawl(userid,page,cb){
	request({
		url: baseUrl+'/people/'+userid+'/following'+'?page='+page,
		headers: requestHeaders
	},function (err,res,data){
		if(res.statusCode==200){
			let $=cheerio.load(data);
			let dataState=JSON.parse($('div#data').attr('data-state'));
			let usersArray=dataState.entities.users;
			let usersdata=analyzeUserData(usersArray,userid);
			let pages=parseInt($('button.PaginationButton:not(.PaginationButton-next)').last().text());
			pages=(pages>0) ? pages : 1;
			if(cb){
				cb(usersdata,pages);
			}
		}else{
			console.log('No user (banned or deleted): '+userid);
			if(cb){
				cb([],0);
			}
		}
	});
}

let allQueue=db.queue.find();
console.log('The collection \'queue\' has '+allQueue.length+' objects.');
var count=0;
async.whilst(function (){
	return(count<allQueue.length);
},function (callback){
	let now=allQueue[count];
	crawl(now.username,1,function (userdata){
		if(db.list.find({
			username: now.username
		}).length==0 && userdata.length>0){
			db.list.save(userdata[0]);
		}
		count++;
		callback(null,count);
	});
},function (err,n){
	console.log(n+' objects exported.');
});