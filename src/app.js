const requests = require('requests');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();

const port = process.env.port || 3000;
const header = "http://localhost";

var country ; //It will store country name
var city ;
var windSpeed ; //It will store wind speed
var temp ; //It will store temp
var weather ; //whether it is sunny or cloudy , etc
var obj ; //will store the objects
var code ; //It will check whether the api call is valid or not

app.use(bodyParser.urlencoded({extended: false}));



//Hosting the static Web Content
const staticPath = path.join(__dirname,'../public');
app.use(express.static(staticPath));


//For Setting the Dynamic Web Content
app.set('view engine','ejs');


//Home Page
app.get("/",(req,res) => {
    
    let filePath = path.join(__dirname,'../public/index.html');
    res.sendFile(filePath);
});



//Handling the Post
app.post("/",(req,res) => {
    city = (req.body.city).toUpperCase(); 

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=4a73e63bd6260a2f83367bc1280f5b23`;

    const api = requests(url);

    api.on('data',(chunk) => {
        obj = JSON.parse(chunk);

        code = obj.cod;

        console.log(chunk);   
        console.log(obj);
    });

    api.on('end',()=>{

         //Extracting the values if the api call is valid
        if(code == "200"){
            city = obj.name;
            temp = (obj.main.temp-273.15).toPrecision(2);
            country = obj.sys.country;
            weather = obj.weather[0].main;
            windSpeed = obj.wind.speed;

            console.log("end");

            console.log(city);
            console.log(temp);
            console.log(windSpeed);
            console.log(country);
            console.log(weather);

            res.redirect(302,'./weather');
        }

        else if(code == '404'){
            res.redirect(302,'/error')
        }
        
    });
   
});



//Handling the weather page
app.get('/weather',(req,res) => {
    let icon = giveFabIcon(weather);

    console.log(icon);
    console.log(typeof(icon));

    res.render("weather.ejs",{city,icon,weather,temp,windSpeed,country});
});

//CSS for weather page
app.get('/style.css',(req,res)=>{
    res.status(200);
    res.setHeader('Content-Type','text/css');

    let cssPath = path.join(__dirname,'./views/style.css'); 
    rstream = fs.createReadStream(cssPath);

    rstream.pipe(res);
});

//Css for error page
app.get('/err_style.css',(req,res) => {
    res.writeHead(200,{'Content-Type':'text/css'});
    let cssPath2 = path.join(__dirname,'./views/err_style.css');
    rstream = fs.createReadStream(cssPath2);

    rstream.pipe(res);
});


//For handling any other request
app.get('*',(req,res) => {
    res.status = 200;
    res.setHeader('Content-Type','text/html');
    let error_path = path.join(__dirname,'./views/error.html');
    res.sendFile(error_path);
});



//Server is listening
app.listen(port,() => {
    console.log(`Server is listening at port ${header}:${port}`);
});



//Function to generate the fab-icon
function giveFabIcon(weather){
    if(weather == 'Clear'){
        return 'fa-solid fa-sun';
    }

    else if(weather == 'Rain'){
        return 'fa-solid fa-cloud-rain';
    }

    else if(weather == 'Haze' || weather == 'Clouds'){
        return 'fa-solid fa-cloud';
    }

    else if(weather == 'Wind'){
        return 'fa-solid fa-wind';
    }

    else if(weather == 'Snow'){
        return 'fa-regular fa-snowflake';
    }

    else{
        return 'fa-solid fa-cloud-sun';
    }
}
