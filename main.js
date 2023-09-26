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
      console.log("data", data);

      // AC "chance of rain"
      let chanceOfRain = data.list[0].pop;
      acBottomLeft.innerHTML = `<img src="icons/rain-drop.svg" alt="rain icon"/> Chance of rain<p>${
        chanceOfRain * 100
      }%</p>`;

      //AC "feels like"
      let feelsLike = data.list[0].main["feels_like"];
      if (feelsLike > 0){
        acTopLeft.innerHTML = `<img src="icons/thermostat.svg" alt="thermostat icon"/> Real feel <p>${celsiusToFarenheit(
          feelsLike
        )}°</p>`;
      }
     
      //AC "wind"
      let windSpeed = data.list[0].wind["speed"];
      acTopRight.innerHTML = `<img src="icons/wind.svg" alt="wind icon"/> Wind <p>${convertKPHtoMPH(
        windSpeed
      )} mph </p>`;

      //AC "humidity"
      let humidity = data.list[0].main["humidity"];
      acBottomRight.innerHTML = `<img src="icons/humidity.svg" alt="humidity icon"/> Humidity <p>${humidity}%</p>`;



      //display city and country
      cityNameDiv.textContent = `${data["city"].name}, ${data["city"].country}`;

      //get and display temp
      let currentTemp = data.list[0].main["temp"];
      mainTemp.textContent = `${celsiusToFarenheit(currentTemp)}°`;

      //get and display description
      let currentDescription = data.list[0].weather[0].description;
      mainDescription.textContent = capitalizeFirstLetter(currentDescription);

      // paint main weather image
      img.src = "images/sun.png";

      if (currentDescription) {
        getWeatherImage(currentDescription);
      }
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
