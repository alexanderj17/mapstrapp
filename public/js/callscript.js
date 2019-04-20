var runArray=[];
var encodedRoutes=[];
var savedNames=[];
var savedRoutes=[];
var curDomain=[];

//ON PAGE LOAD
function loadcall(){
  document.getElementById('change').innerHTML = "Accessing Strava API...";
    //CALL SERVER TO CALL API
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        runArray=xhr.response;
        if(runArray.messageTwo!=null){
          document.getElementById('change').innerHTML = "Redirecting to Strava";
          let theUrl=runArray.messageTwo;
          window.location.href=theUrl;
        }
        else if(runArray.message!=null){
          document.getElementById('change').innerHTML = runArray.message;
        }
          //LOAD PAGE ELEMENTS
        else{
          document.getElementById('change').innerHTML = "Strava data has been succesfully retrieved";
        document.getElementById('dataprintbtn').innerHTML =
        "<button id='saverun' type='button' class='btn btn-success'>Save this run</button><button id='clearsavedruns' type='button' class='btn btn-success'>Clear saved runs</button>";
        //POPULATE DROP-DOWN MENU
        allTheNames();
        //EVENT LISTENERS
        document.getElementById('saverun').addEventListener("mousedown",function(event){
          let current = getCurrentID();
          if(runArray[current].map.summary_polyline==null){
            alert("No map for this run");
          }else{
            savedRoutes.push(runArray[current].map.summary_polyline);
          }
        });
        document.getElementById('clearsavedruns').addEventListener("mousedown",function(event){
          savedRoutes.length=0;
          let current = getCurrentID();
          drawMapOfCurrent(current);
        });
      }
    }
    }
    
    var urlToCall='/callstrava/';
    xhr.open('GET', '/callstrava', true);
    xhr.send(null);
    //INITIALISE MAP
    drawMap();
  }

//CREATE ACTIVITY STRING
function activityString(menuNum){
  var latestType=runArray[menuNum].type;
  var latestName=runArray[menuNum].name;
  var latestDistance=runArray[menuNum].distance;
  var nameString="Selected activity is a "+latestType+", named "+latestName+", over a distance of "+latestDistance+"m.";
  document.getElementById('results').innerHTML = nameString;
}

//MANAGE DROP DOWN MENU
function allTheNames(){
  if(runArray===[]){
    document.getElementById('change').innerHTML = "data not loaded";
  }else{
    var nameArray=[];
    for(let i=0;i<runArray.length;i++){
      nameArray.push(runArray[i].name);
    }
    var select = document.getElementById("selectNumber"); 
    for(var i = 0; i < nameArray.length; i++) {
      var opt = nameArray[i];
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      select.appendChild(el);
    }
    select.addEventListener('change', function() {
      var selected = document.getElementById("selectNumber").selectedIndex-1; 
      if(selected>=0){
        activityString(selected);
        drawMapOfCurrent(selected);
      }
    }, false);
  }
}

//TO GET CURRENT ID
function getCurrentID(){
  let current = document.getElementById("selectNumber").selectedIndex-1; 
  return current;
}

//DRAW EMPTY MAP
function drawMap(){
  document.getElementById('contmap').innerHTML = "<div id='map' style='width: 100%; height: 100%;'></div>";
  var map=null;
  if(map===null){ 
    map = L.map('map').setView([-36.85, 174.76], 13);
  }else{
  }
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 50,}).addTo(map);
}

//DRAW MAP WITH POLYLINES
function drawMapOfCurrent(actNumber){
  if(runArray[actNumber].map.summary_polyline==null){
    alert("No map for this run");
  }else{
  document.getElementById('contmap').innerHTML = "<div id='map' style='width: 100%; height: 100%;'></div>";
  var map=null;
  if(map===null){ 
    map = L.map('map').setView([-36.85, 174.76], 13);
  }else{
  }
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 50,}).addTo(map);
  var results=null;
  var polyline=null;  
  encodedRoutes.push(runArray[actNumber].map.summary_polyline);
  for (let saved of savedRoutes) {
    let coordinates = L.Polyline.fromEncoded(saved).getLatLngs();
    let theline=L.polyline(
    coordinates,
    {
      color: '#EF4708',
      weight: 3,
      opacity: 0.8,
      lineJoin: 'round'
    }
    ).addTo(map);
    }
  
  for (let encoded of encodedRoutes) {
    let coordinates = L.Polyline.fromEncoded(encoded).getLatLngs();
    let theline=L.polyline(
    coordinates,
    {
      color: '#088DEF',
      weight: 3,
      opacity: 0.8,
      lineJoin: 'round'
    }
    ).addTo(map);
    encodedRoutes.pop();
    map.fitBounds(theline.getBounds());
    }
  } 
}      



