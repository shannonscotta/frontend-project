// const date = new Date();
const form = document.getElementById("city-input-container");
const cityNameDiv = document.querySelector(".city-name");
const container = document.querySelector(".container");
const img = document.querySelector("img");
const mainTemp = document.querySelector(".main-temperature");
const mainDescription = document.querySelector(".main-description");

const acTopLeft = document.querySelector(".ac-top-left");
const acTopRight = document.querySelector(".ac-top-right");
const acBottomLeft = document.querySelector(".ac-bottom-left");
const acBottomRight = document.querySelector(".ac-bottom-right");

const tfContainer = document.querySelector(".tf-item-container");



// const weekContainer = document.querySelector(".week-forecast-container");

// const weekArr = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

// let currentDay = date.getDay();

// for (let i = currentDay; i <= weekArr.length; i++){

//   // let dayDiv = document.createElement('div');
//   // dayDiv.classList = 'day-div';
//   // dayDiv.textContent =  weekArr[i];

//   i = i % weekArr.length;
//   console.log('day   ', weekArr[i])

//   // weekContainer.appendChild(dayDiv)
// }

// api and query string, key "hidden" in config file that is ignored.
// You can still see the key in production through chrome dev tools in the Network tab
let api = `https://api.openweathermap.org/data/2.5/forecast`;
let city = "seattle";
let KEY = config.WEATHER_KEY;
let units = `units=metric`;

// listen to user city input and render city if entered
container.addEventListener("submit", (event) => {
  // console.log(event.target, event.target[0]);
  let userCity = event.target[0].value;

  if (typeof userCity === "string") {
    requestWeather(api, userCity, KEY, units);
  }
  event.preventDefault();
});

// hoisted and calls seattle on initial render
requestWeather(api, city, KEY, units);

// gets weather upon user request, kept at bottom and hoisted
function requestWeather(api, city, KEY, units) {
  $.get({
    url: `${api}?q=${city}&appid=${KEY}&${units}`,
    success: (data) => {
      // get weather data in a good format





      let weatherArr = [];

      for (let timeObj of data.list) {
        let weatherObj = {};

        let date = timeObj.dt_txt.slice(5, 10);
        let hour = timeObj.dt_txt.slice(11, 16);
        let description = timeObj.weather[0].description;
        let temp = timeObj.main["temp"];

        weatherObj["date"] = date;
        weatherObj["time"] = hour;
        weatherObj["description"] = description;
        weatherObj["temp"] = `${celsiusToFarenheit(temp)}°`;

        weatherArr.push(weatherObj);
      }

      console.log("weatherArr", weatherArr);

      //todays forecast: items
      let todaysForecastArr = weatherArr.slice(0, 6);
      
      for (let tfObj of todaysForecastArr){
        let tfItem = document.createElement('div');
        tfItem.classList = 'tf-item';

        let testing = tfObj.description;

        //TODO:// WHY ARE YOU UNDEFINED
        if (testing){
            console.log(getWeatherImage(testing) )
        }
        // console.log(testing)
        // console.log(getWeatherImage(testing))

        tfItem.textContent = `${militaryToNormalTime(tfObj.time)}`;

        let tfItemImage = document.createElement('a');

       

        // if (tfObj.description){
        //     tfItemImage.src = `${getWeatherImage(tfObj.description)}`;
        //     tfItem.appendChild(tfItemImage); 
        //     console.log(tfItemImage.src)
        // }
       

      

        //TODO:// creating duplicates, rethink how this is done
        tfContainer.appendChild(tfItem)



        // console.log('sdaf', tfObj)
      }



      //main weather: city
      cityNameDiv.textContent = `${data["city"].name}, ${data["city"].country}`;

      //main weather: temp
      let currentTemp = data.list[0].main["temp"];
      mainTemp.textContent = `${celsiusToFarenheit(currentTemp)}°`;

      //main weather: description
      let currentDescription = data.list[0].weather[0].description;
      mainDescription.textContent = capitalizeFirstLetter(currentDescription);

      //main weather: image
      if (currentDescription) {
        getWeatherImage(currentDescription);
      }




      //Air Conditions: chance of rain
      let chanceOfRain = data.list[0].pop;
      acBottomLeft.innerHTML = `<img src="icons/rain-drop.svg" alt="rain icon"/> Chance of rain<p>${
        chanceOfRain * 100
      }%</p>`;

      //Air Conditions: feels like
      let feelsLike = data.list[0].main["feels_like"];
      if (feelsLike > 0) {
        acTopLeft.innerHTML = `<img src="icons/thermostat.svg" alt="thermostat icon"/> Real feel <p>${celsiusToFarenheit(
          feelsLike
        )}°</p>`;
      }

      //Air Conditions: wind
      let windSpeed = data.list[0].wind["speed"];
      acTopRight.innerHTML = `<img src="icons/wind.svg" alt="wind icon"/> Wind <p>${convertKPHtoMPH(
        windSpeed
      )} mph </p>`;

      //Air Conditions: humidity
      let humidity = data.list[0].main["humidity"];
      acBottomRight.innerHTML = `<img src="icons/humidity.svg" alt="humidity icon"/> Humidity <p>${humidity}%</p>`;
    },
  });
}

function celsiusToFarenheit(celsius) {
  let result = celsius * 1.8 + 32;
  return Math.round(result);
}

function capitalizeFirstLetter(string) {
  let firstLetter = string[0];
  return `${firstLetter.toUpperCase()}${string.slice(1)}`;
}

function getWeatherImage(description) {
  description = description.toLowerCase();

  switch (true) {
    case description.includes("snow"):
      img.src = "images/cloud-snow.png";
      break;
    case (description.includes("lightning") ||
      description.includes("thunder")) &&
      description.includes("rain"):
      img.src = "images/cloud-lightning-rain.png";
      break;
    case description.includes("lightning") || description.includes("thunder"):
      img.src = "images/cloud-lightning.png";
      break;
    case description.includes("sun") && description.includes("cloud"):
      img.src = "images/sun-cloud.png";
      break;
    case description.includes("rain"):
      img.src = "images/cloud-rain.png";
      break;
    case description.includes("cloud"):
      img.src = "images/cloud.png";
      break;
    case description.includes("sun"):
      img.src = "images/sun.png";
      break;
    default:
      console.log("potential error.... does the description match the image?");
      return (img.src = "images/sun.png");
  }
}

function convertKPHtoMPH(kph) {
  let result = kph * 0.6214;
  return Math.round(result);
}

// function convertTime(string){

    
//     let hours = string.slice(0, 2);

//     let isEvening = (hours >= 12);


//     if (hours == 0 ) hours == 12;

//     let mafs = (hours < 12) ? hours :  hours -= 12;
    
//     return `${hours}:00 ${isEvening ? 'PM' : 'AM'}`

//     // if (string.slice(0, 2) == '12'){
//     //     return `${string} PM`;
//     // } else if (string[0] == 0){
//     //     return `${string.slice(1)} AM`;
//     // } else if (string[0] == 1 && string[1] != 2){
//     //     string = string.slice(1);
//     //     return `${string[0] - 2}${string.slice(1)} PM`
//     // } else {
//     //     console.log(string, 'check the string passed in convert time.. somethings wrong.')
//     // }
// }

function militaryToNormalTime(militaryTime) {
    
    // Split the military time into hours
    const hours = parseInt(militaryTime, 10);
  
    // Determine whether it's AM or PM
    const period = (hours < 12) ? 'AM' : 'PM';
  
    // Handle the special case of midnight (00:00)
    if (hours === 0) return '12:00 AM';
    
    // Convert hours to 12-hour format
    let clockHours = hours;
    
    if (hours >= 13) {
        clockHours -= 12;
    }
  
    // Format the time in normal time format
    const normalTime = clockHours + ':00 ' + period;
  
    return normalTime;
  }

