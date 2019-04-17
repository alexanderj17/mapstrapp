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
var theCode="";
var refreshToken="";
var redirectUrl="https://www.strava.com/oauth/authorize?client_id="+clientId+"&response_type=code&redirect_uri="+domainName+"&approval_prompt=force&scope=read_all&scope=activity:read_all";


app.get('/getdomain', (req, res) => {
    res.send(redirectUrl);
 });

app.get('/', (req, res) => {
   let currentQuery=req.query;
        res.sendFile(path.join(__dirname, '/views', 'index.html'));
        theCode=req.query.code;
});
function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

app.get('/callstrava', (req, res) => { 
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
        let message={message:"Unable to reach Strava API"};
        res.send(message);
    });
});

app.listen(port, () => console.log())