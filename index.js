var express = require('express');
var app = express();
require('dotenv').config();
var clientSecret =process.env.CLIENT_SECRET;
var clientId = process.env.CLIENT_ID;
var port = process.env.PORT;
var domainName = process.env.DOMAIN_NAME;
//sample data variables
var polyline1=process.env.PL1;
var polyline2=process.env.PL2;
var polyline3=process.env.PL3;
var polyline4=process.env.PL4;

var path = require('path'); 
app.use(express.static('public'));
var router = express.Router();
const fetch = require("node-fetch");
var theCode=undefined;
var refreshToken="";

function handleErrors(response) {
    if (!response.ok) {throw Error(response.statusText);}
    return response;
}

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '/views', 'index.html'));
    theCode=req.query.code;
    return theCode;
});

app.get('/callstrava', (req, res) => { 
    var redirectUrl="https://www.strava.com/oauth/authorize?client_id="+clientId+"&response_type=code&redirect_uri="+domainName+"&approval_prompt=force&scope=read_all&scope=activity:read_all";
    //SAMPLE DATA
    if(theCode==="sampledata"){
        let sampleData=[
            {
                "sample": "True",
                "name": "Evening Run",
                "distance": 7635.6,
                "moving_time": 1900,
                "elapsed_time": 1900,
                "total_elevation_gain": 54.5,
                "type": "Run",
                "map": {
                    
                    "summary_polyline": polyline1,
                   
                },
            },
            {
                "name": "Negative splits",
                "distance": 10012.9,
                "moving_time": 2749,
                "elapsed_time": 2753,
                "total_elevation_gain": 66.2,
                "type": "Run",
                "map": {
                    
                    "summary_polyline": polyline2,
                    
                },
            },
            {
                "name": "A Northern Orewa excursion",
                "distance": 17515.2,
                "moving_time": 5945,
                "elapsed_time": 6164,
                "total_elevation_gain": 320.5,
                "type": "Run",
                "map": {
                    "summary_polyline": polyline3,
                    "resource_state": 2
                },
            },
            {
                "name": "A West Auckland Climb",
                "distance": 7606.6,
                "moving_time": 2651,
                "elapsed_time": 2655,
                "total_elevation_gain": 206,
                "type": "Run",
                "map": {
                    "summary_polyline": polyline4,
                    
                },
            }

        ]
        res.send(sampleData);
    }
    //CHECK IF SENT FROM OAUTH OR NOT
    else if(theCode===undefined){
        let messageTwo={messageTwo:redirectUrl};
        res.send(messageTwo);
        messageTwo="";
    }else{
        let callUrl='https://www.strava.com/oauth/token?client_id='+clientId+'&client_secret='+clientSecret+'&code='+theCode+'&grant_type=authorization_code&scope=read_all&scope=activity:read_all';
        //MAKES SURE THE CODE IS NOT STORED BEYOND WHEN IT IS USED
        theCode=undefined;
        fetch(callUrl,{ method: 'POST', body: 'a=1'})
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
    }
});

app.listen(port, () => console.log())