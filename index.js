var express = require('express');
var app = express();
require('dotenv').config();
var clientSecret =process.env.CLIENT_SECRET;
var clientId = process.env.CLIENT_ID;
var port = process.env.PORT;
var domainName = process.env.DOMAIN_NAME;
var path = require('path'); 
app.use(express.static('public'));
var router = express.Router();
const fetch = require("node-fetch");
var ogUrl=""
var theCode=undefined;
var refreshToken="";
var redirectUrl="https://www.strava.com/oauth/authorize?client_id="+clientId+"&response_type=code&redirect_uri="+domainName+"&approval_prompt=force&scope=read_all&scope=activity:read_all";


function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

app.get('/', (req, res, next) => {
    console.log("In Root");
    res.sendFile(path.join(__dirname, '/views', 'index.html'));
    theCode=req.query.code;
    console.log("the Code"+theCode);
    return theCode;
});

/*app.get('/calldomain', (req, res) => {
    res.send(redirectUrl);
});*/
app.get('/callstrava', (req, res) => { 

    //res.sendFile(path.join(__dirname, '/views', 'index.html'));
    var redirectUrl="https://www.strava.com/oauth/authorize?client_id="+clientId+"&response_type=code&redirect_uri=https://staging.alexanderjames.dev&approval_prompt=force&scope=read_all&scope=activity:read_all";
         //CHECK IF SENT FROM OAUTH OR NOT
    if(theCode===undefined){
            console.log("In Redirect");
            //let reDirMsg={reDirMsg:redirectUrl};
            //res.send(reDirMsg);
            console.log(redirectUrl);
            let message={message:redirectUrl};
            res.redirect(message);

            //res.send(message);
         }else{
             
    console.log("In callStrava");
    let callUrl='https://www.strava.com/oauth/token?client_id='+clientId+'&client_secret='+clientSecret+'&code='+theCode+'&grant_type=authorization_code&scope=read_all&scope=activity:read_all';
    fetch(callUrl,{ method: 'POST', body: 'a=1' })
    .then(handleErrors)
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        refreshToken=myJson.refresh_token;
        return refreshToken;
    })
    .then(function(refreshToken){
        var runs=[];
        var url="https://www.strava.com/oauth/token?client_id="+clientId+"&client_secret="+clientSecret+"&grant_type=refresh_token&refresh_token="+refreshToken;
        return fetch(url,{ 
            method: 'POST', body: 'a=1' 
        })
        .then(handleErrors)
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            runs.push(myJson);
            let currentAccessToken = runs[0].access_token;
            url='https://www.strava.com/api/v3/athlete/activities/?access_token='+currentAccessToken+'&page=1&per_page=200';
            runs=[];
            return url;
        })
    })
    .then (function(url){
        fetch(url)
        .then(handleErrors)
        .then(function(response){
        return response.json();
        })
        .then(function(myJson) {
            res.send(myJson);
        })
    }).catch(function(error) {
        let message={message:"Didn't work"};
        res.send(message);
       /* if(theCode===undefined){
            let message={message:redirectUrl};
            res.send(message);
        }else{
            let message={message:redirectUrl};
            res.send(message);
        }*/
    });
}
});

app.listen(port, () => console.log())