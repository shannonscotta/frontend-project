// const date = new Date();
const form = document.getElementById("city-input-container");
const cityNameDiv = document.querySelector(".city-name");
const container = document.querySelector(".container");


const mainImage = document.querySelector(".main-image");
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




 /* -----------------------------------------Create easy to work with weather array from JSON-------------------------------------------------------------*/
      let weatherArr = [];

      for (let timeObj of data.list) {
        let weatherObj = {};

        let date = timeObj.dt_txt.slice(5, 10);
        let time = timeObj.dt_txt.slice(11, 16);
        let description = timeObj.weather[0].description;
        let temp = timeObj.main["temp"];

        weatherObj["date"] = date;
        weatherObj["time"] = time;
        weatherObj["description"] = description;
        weatherObj["temp"] = `${celsiusToFahrenheit(temp)}°`;

        weatherArr.push(weatherObj);
      }



      
/* ----------------------------------------- Append todays forecast items to todays forecast card-------------------------------------------------------------*/

      // remove all tf items before appending new ones 
      removeAllChildren(tfContainer);
      
      //grab the next 6 entries of weather data
      for (let i = 0; i < 6; i++){

        let tfObj = weatherArr[i]
   
         let tfItem = document.createElement('div');
         tfItem.classList = 'tf-item';

       //add time, image, and temp to tf item
       tfItem.innerHTML = `${militaryToNormalTime(tfObj.time)} <img src="${getWeatherImage(tfObj.description)}" alt="weather icon" class="tf-image"/> <p>${
         tfObj.temp
       }</p>`;
       
       tfContainer.appendChild(tfItem)
      }


      /* -----------------------------------------Main weather data-------------------------------------------------------------*/
      //main weather: city
      cityNameDiv.textContent = `${data["city"].name}, ${data["city"].country}`;

      //main weather: temp
      let currentTemp = data.list[0].main["temp"];
      mainTemp.textContent = `${celsiusToFahrenheit(currentTemp)}°`;

      //main weather: description
      let currentDescription = data.list[0].weather[0].description;
      mainDescription.textContent = capitalizeFirstLetter(currentDescription);

      //main weather: image
      if (currentDescription) {
        mainImage.src = getWeatherImage(currentDescription);
      }

     /* -----------------------------------------Air conditions card-------------------------------------------------------------*/

      //Air Conditions: chance of rain
      let chanceOfRain = data.list[0].pop;
      acBottomLeft.innerHTML = `<img src="icons/rain-drop.svg" alt="rain icon"/> Chance of rain<p>${
        chanceOfRain * 100
      }%</p>`;

      //Air Conditions: feels like
      let feelsLike = data.list[0].main["feels_like"];
      if (feelsLike > 0) {
        acTopLeft.innerHTML = `<img src="icons/thermostat.svg" alt="thermostat icon"/> Real feel <p>${celsiusToFahrenheit(
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

function celsiusToFahrenheit(celsius) {
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
      return "images/cloud-snow.png";
    case (description.includes("lightning") ||
      description.includes("thunder")) &&
      description.includes("rain"):
      return "images/cloud-lightning-rain.png";

    case description.includes("lightning") || description.includes("thunder"):
      return "images/cloud-lightning.png";

    case description.includes("sun") && description.includes("cloud"):
      return "images/sun-cloud.png";

    case description.includes("rain"):
      return "images/cloud-rain.png";

    case description.includes("cloud"):
      return "images/cloud.png";

    case description.includes("sun"):
      return "images/sun.png";

    default:
      // console.log(`potential error.... does "${description}" match the image?\n`);
      return "images/sun.png";
  }
}

function convertKPHtoMPH(kph) {
  let result = kph * 0.6214;
  return Math.round(result);
}

function militaryToNormalTime(militaryTime) {
  // Split the military time into hours
  const hours = parseInt(militaryTime, 10);
  const period = hours < 12 ? "AM" : "PM";

  // Handle the special case of midnight (00:00)
  if (hours === 0) return "12:00 AM";

  // Convert hours to 12-hour format
  let clockHours = hours;

  if (hours >= 13) clockHours -= 12;
  
  return  clockHours + ":00 " + period;
}

function removeAllChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}