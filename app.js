const express = require('express');
const superagent = require('superagent');
const DeviceDetector = require('node-device-detector');


const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/:city?', (req, res) => {
    const detector = new DeviceDetector;
    const userAgent = req.headers['user-agent'];
    // const userAgent = 'ozilla/5.0 (Linux; Android 5.0; NX505J Build/KVT49L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.78 Mobile Safari/537.36';
    const result = detector.detect(userAgent);
    let isMobile;
    if (result.device.type === 'smartphone') {
        isMobile = true;
    } else {
        isMobile= false
    }
    // console.log('result parse', result);
    // console.log(`Is mobile: ${isMobile}`);
    // console.log(req.headers['user-agent']);

    let city = "";
    let searchedCityList=['Kandy','Galle',"Jaffna",'Matara'] ;

    if (isMobile && !req.params.city) {
       return getHomePageMobile(res);
    }
   
    if (!req.params.city) {
        city="Colombo"
    } else {
        
        city = req.params.city.charAt(0).toUpperCase() + req.params.city.slice(1);
        
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.API_KEY}`;

    
    
     getWeatherData(url,res,searchedCityList);
    
   
});

const getHomePageMobile = async (res) => {
    // getWeatherDataList('Sigiriya', 'Jaffna', 'Galle', 'Matara');
    const weatherData = getWeatherDataList('kandy', 'galle', 'jaffna');
    const awaitedData = await Promise.all((await weatherData).map(el => {
        return el;
    }));
    console.log(weatherData);
    res.render('home', { data:awaitedData });
}

const getWeatherDataList = async(...cities) => {
    const weatherObjects = cities.map(async el => {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${el}&units=metric&appid=${process.env.API_KEY}`;
            const data = await superagent.get(url);
            const condition = data.body.weather[0].description.split(' ');
            const firstCapital = condition.map(el => {
                return el.charAt(0).toUpperCase() + el.slice(1);
            });
            let dayOrNight = '';
            const capitalCondition = firstCapital.join(' ');
            const city = el.charAt(0).toUpperCase() + el.slice(1);
            const timeString = prepareWorldTime(data.body.timezone);
            const ampm = timeString.split('.');
            
            if (ampm[0] >= 12) {
                dayOrNight = 'pm';
            } else {
                dayOrNight='am'
            }

            const returnDataObj = {
                city,
                time: prepareWorldTime(data.body.timezone),
                temp: data.body.main.temp,
                condition: capitalCondition,
                amOrpm:dayOrNight
                
            }
            return returnDataObj;
        } catch (error) {
            console.log(error);
            const returnDataObj = {
                city: "N/A",
                time: "N/A",
                temp: "N/A",
                condition: "N/A",
                amOrpm:"N/A"
                
            }
            return returnDataObj;
        }
    });
    const all= await Promise.all(weatherObjects)
    return all;
}


const getWeatherData = async (url,res,cityList) => {
    try {
        const data = await superagent.get(url);
        const condition = data.body.weather[0].description.split(' ');
        const firstCapital = condition.map(el => {
            return el.charAt(0).toUpperCase() + el.slice(1);
        });

        const capitalCondition = firstCapital.join(' ');
        
        // console.log(firstCapital.join(' '));
        console.log(data.body);
        
        const backImg=selectBackgroundImage(data.body.weather[0].main, data.body.weather[0].icon);
        
        const returnData= {
            city: data.body.name,
            temp: data.body.main.temp,
            condition: capitalCondition,
            feelsLike: data.body.main.feels_like,
            humidity: data.body.main.humidity,
            wind: data.body.wind.speed,
            cloudy: data.body.clouds.all,
            searchList:cityList,
            dateString: prepareDateString(data.body.timezone),
            image: backImg,
            iconName:selectWeatherIcon(data.body.weather[0].main),
            timeOfDay: "d",
            timeMobile:prepareWorldTime(data.body.timezone)
        }
        res.render('main', returnData);
        return returnData;
        
    } catch (err) {
        res.render('main', {
            city: "N/A",
            temp: "N/A",
            condition: "N/A",
            feelsLike: "N/A",
            humidity: "N/A",
            wind: "N/A",
            cloudy: "N/A",
            searchList: cityList,
            error: "Not Found !",
            dateString: "N/A",
            image:'cloudy-1.jpg',
            iconName:"filter-outline",
            timeOfDay: "d",
            timeMobile:"N/A"
        });
        return null;
        console.log(err);
    }
    
    
}

const prepareDateString = (timeZone) => {
    let d = new Date();
    
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let weekDay = 'Sunday';
    const date = d.getDate();
    let month = 'January';
    const year =d.getFullYear().toString().charAt(2)+d.getFullYear().toString().charAt(3);

    const timeString=prepareWorldTime(timeZone);

    switch (d.getDay()) {
        case 0:
            weekDay='Sunday'
            break;
        case 1:
            weekDay='Monday'
            break;
        case 2:
            weekDay='Tuesday'
            break;
        case 3:
            weekDay='Wednesday'
            break;
        case 4:
            weekDay='Thursday'
            break;
        case 5:
            weekDay='Friday'
            break;
        case 6:
            weekDay='Saturday'
            break;
    
        default:
            break;
    }
    switch (d.getMonth()) {
        case 0:
            month='January'
            break;
        case 1:
            month='February'
            break;
        case 2:
            month='March'
            break;
        case 3:
            month='April'
            break;
        case 4:
            month='May'
            break;
        case 5:
            month='June'
            break;
        case 6:
            month='July'
            break;
        case 7:
            month='August'
            break;
        case 8:
            month='September'
            break;
        case 9:
            month='October'
            break;
        case 10:
            month='November'
            break;
        case 11:
            month='December'
            break;
    
        default:
            break;
    }

    const dateTime = `${timeString}-${weekDay},${date}    ${month} '${year}`
    
    return dateTime;
}

const prepareWorldTime = (timeZone) => {
    d = new Date()
    localTime = d.getTime();
    localOffset = d.getTimezoneOffset() * 60000
    utc = localTime + localOffset
    var atlanta = utc + (1000 * timeZone)
    nd = new Date(atlanta)
    // console.log(nd);
    let timeString = ``;
    // console.log(nd);
    // console.log(nd.toString().split(' ')[4].split(':'));
    const hours = nd.toString().split(' ')[4].split(':')[0];
    const minutes = nd.toString().split(' ')[4].split(':')[1];
    timeString = `${hours}.${minutes}`;
    // console.log(timeString);
    return timeString;
}

const selectBackgroundImage = (main, icon) => {
    
    const time = icon.charAt(2);
    const imgName = `${main}-${time}.jpg`
    console.log(imgName);
    return imgName;
    
}

const selectWeatherIcon = (main) => {
    let iconName = "";
    switch (main) {
        case "Thunderstorm":
            iconName="thunderstorm-outline"
            break;
        case "Drizzle":
            iconName="umbrella-outline"
            break;
        case "Rain":
            iconName="rainy-outline"
            break;
        case "Snow":
            iconName="snow-outline"
            break;
        case "Clear":
            iconName="sunny-outline"
            break;
        case "Clouds":
            iconName="partly-sunny-outline"
            break;
        
        default:
            iconName="filter-outline"
            break;
    }
    return iconName;
}

module.exports = app;

// thunderstorm 200-232 - <ion-icon name="thunderstorm-outline"></ion-icon>
// drizzle 300-321      - <ion-icon name="umbrella-outline"></ion-icon>
// Rain    500-531      - <ion-icon name="rainy-outline"></ion-icon>
// snow    600-622      - <ion-icon name="snow-outline"></ion-icon>
// atmosphere  700 - 781    <ion-icon name="filter-outline"></ion-icon>
// clear sky   800 -     <ion-icon name="sunny-outline"></ion-icon>
// clouds      801-804  - <ion-icon name="partly-sunny-outline"></ion-icon>