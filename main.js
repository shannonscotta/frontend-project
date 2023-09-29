const parentContainer = document.querySelector(".container");

const cityNameDiv = document.querySelector(".city-name");
const mainDescription = document.querySelector(".main-description");
const form = document.getElementById("city-input-container");
const mainTemp = document.querySelector(".main-temperature");
const mainImage = document.querySelector(".main-image");

const tfContainer = document.querySelector(".tf-item-container");

let api = `https://api.openweathermap.org/data/2.5/forecast`;
let city = "seattle";
let KEY = config.WEATHER_KEY;
let units = `units=metric`;

// listen to user city input and render city if entered
parentContainer.addEventListener("submit", (event) => {
  let userCity = event.target[0].value;

  if (typeof userCity === "string") {
    requestWeather(api, userCity, KEY, units);
  }
  event.preventDefault();
});

// calls seattle on initial render
requestWeather(api, city, KEY, units);

// gets weather upon user request
function requestWeather(api, city, KEY, units) {
  $.get({
    url: `${api}?q=${city}&appid=${KEY}&${units}`,
    success: (data) => {
      /* -----------------------------------------Create weather array from JSON data-------------------------------------------------------------*/
      let allWeatherArr = [];

      for (let timeObj of data.list) {
        // console.log('timeObj', timeObj);
        let allWeatherObj = {};

        let day = timeObj.dt_txt;
        let date = timeObj.dt_txt.slice(5, 10);
        let time = timeObj.dt_txt.slice(11, 16);
        let description = timeObj.weather[0].description;
        let temp = timeObj.main["temp"];
        let tempMin = timeObj.main["temp_min"];
        let tempMax = timeObj.main["temp_max"];

        allWeatherObj["date"] = date;
        allWeatherObj["time"] = time;
        allWeatherObj["description"] = description;
        allWeatherObj["temp"] = celsiusToFahrenheit(temp);
        allWeatherObj["minTemp"] = celsiusToFahrenheit(tempMin);
        allWeatherObj["maxTemp"] = celsiusToFahrenheit(tempMax);
        allWeatherObj["day"] = getDayOfWeek(day);

        allWeatherArr.push(allWeatherObj);
      }
      // console.log(allWeatherArr)

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

      /* ----------------------------------------- Append todays forecast items-------------------------------------------------------------*/

      // remove all tf items before appending new ones
      removeAllChildren(tfContainer);

      //grab the next 6 entries of weather data
      for (let i = 0; i < 6; i++) {
        let tfObj = allWeatherArr[i];

        let tfItem = document.createElement("div");
        tfItem.classList = "tf-item";

        //add time, image, and temp to tf item
        tfItem.innerHTML = `${militaryToNormalTime(
          tfObj.time
        )} <img src="${getWeatherImage(
          tfObj.description
        )}" alt="weather icon" class="tf-item-image"/> <p>${tfObj.temp}°</p>`;

        tfContainer.appendChild(tfItem);
      }

      /* -----------------------------------------Air conditions card-------------------------------------------------------------*/

      //Air Conditions: feels like
      const acTopLeft = document.querySelector(".ac-top-left");

      let feelsLike = data.list[0].main["feels_like"];
      if (feelsLike > 0) {
        acTopLeft.innerHTML = `<img src="icons/thermostat.svg" alt="thermostat icon"/> Real feel <p>${celsiusToFahrenheit(
          feelsLike
        )}°</p>`;
      }

      //Air Conditions: wind
      const acTopRight = document.querySelector(".ac-top-right");

      let windSpeed = data.list[0].wind["speed"];
      acTopRight.innerHTML = `<img src="icons/wind.svg" alt="wind icon"/> Wind <p>${convertKPHtoMPH(
        windSpeed
      )} mph </p>`;

      //Air Conditions: chance of rain
      const acBottomLeft = document.querySelector(".ac-bottom-left");

      let chanceOfRain = data.list[0].pop;
      acBottomLeft.innerHTML = `<img src="icons/rain-drop.svg" alt="rain icon"/> Chance of rain<p>${
        chanceOfRain * 100
      }%</p>`;

      //Air Conditions: humidity
      const acBottomRight = document.querySelector(".ac-bottom-right");

      let humidity = data.list[0].main["humidity"];
      acBottomRight.innerHTML = `<img src="icons/humidity.svg" alt="humidity icon"/> Humidity <p>${humidity}%</p>`;

      /* -----------------------------------------Weekly forecast card-------------------------------------------------------------*/

      // create weekObj to store key info

      let weekObj = {
        Monday: { temp: [], description: [] },
        Tuesday: { temp: [], description: [] },
        Wednesday: { temp: [], description: [] },
        Thursday: { temp: [], description: [] },
        Friday: { temp: [], description: [] },
        Saturday: { temp: [], description: [] },
        Sunday: { temp: [], description: [] },
      };

      // get all info from 3 hour increments
      for (let i = 0; i < allWeatherArr.length; i++) {
        let increment = allWeatherArr[i];

        let day = increment.day;
        let minTemp = increment.minTemp;
        let maxTemp = increment.maxTemp;
        let description = increment.description;

        weekObj[day].temp.push(minTemp, maxTemp);
        weekObj[day].description.push(description);
      }

      let validWeatherWords = [
        "rain",
        "clouds",
        "sun",
        "clear",
        "snow",
        "thunder",
        "lightning",
      ];

      // get daily info from bulk info
      for (const key in weekObj) {
        //get min and max for day
        if (weekObj[key].temp.length >= 2) {
          weekObj[key].temp = getMinAndMaxFromArr(weekObj[key].temp);
        } else {
          delete weekObj[key];
        }

        if (weekObj[key]) {
          let wordArr = stringArrToWordArr(weekObj[key].description);
          let validWordArr = filterStringArr(validWeatherWords, wordArr);

          //count weather words, then find key with highest val
          let wordCount = countWordsInArr(validWordArr);

          weekObj[key].description = getKeyWithHighestVal(wordCount);
        }
      }

      //sort object by day before appending to the DOM
      let wfDataObj = sortObjectByOrderStartingFromToday(weekObj);

      //  if (wfDataObj['Monday']){
      //   delete wfDataObj['Monday'];
      //  }

      // grab wf container
      let wfContainer = document.querySelector(".week-forecast-container");

      // Prevent duplicates upon new searches
      removeAllChildren(wfContainer);

      // add wf header back
      let wfHeader = document.createElement("div");
      wfHeader.classList = "wf-header";
      wfHeader.innerText = "FUTURE FORECAST";

      wfContainer.appendChild(wfHeader);

      for (const key in wfDataObj) {
        let minTemp = wfDataObj[key].temp[0];
        let maxTemp = wfDataObj[key].temp[1];

        //create wf item container
        let wfItem = document.createElement("div");
        wfItem.classList = "wf-item";

        wfItem.innerHTML = `<div class="wf-day">${key}</div>
  
        <div class="wf-image-container"> 
  
        <img class="wf-item-image" src=${getWeatherImage(
          wfDataObj[key].description
        )}>&nbsp&nbsp ${capitalizeFirstLetter(wfDataObj[key].description)}
        </div>
  
        <div class="wf-temp">${maxTemp}° / ${minTemp}°</div>`;

        wfContainer.appendChild(wfItem);
      }
      //if it is the time of day where only 5 children and header appear then change css height of item
      if (wfContainer.children.length === 6) {
        let wfItems = document.querySelectorAll(".wf-item");
        wfItems.forEach((item) => {
          item.style.height = "17.2%";
        });
      }
    },
  });
}

/* -----------------------------------------Helper functions-------------------------------------------------------------*/

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
    case description.includes("sun") || description.includes("clear"):
      return "images/sun.png";

    case description.includes("rain"):
      return "images/cloud-rain.png";

    case description.includes("cloud"):
      return "images/cloud.png";

    case description.includes("lightning") || description.includes("thunder"):
      return "images/cloud-lightning.png";

    case description.includes("snow"):
      return "images/cloud-snow.png";

    default:
      console.error(
        `potential error.... does "${description}" match the image?\n`
      );
      return "images/sun.png";
  }
}

function convertKPHtoMPH(kph) {
  let result = kph * 0.6214;
  return Math.round(result);
}

function militaryToNormalTime(militaryTime) {
  // Split the military time into hours, second param is for the radix. 10 means decimal
  const hours = parseInt(militaryTime, 10);
  const period = hours < 12 ? "AM" : "PM";

  // Handle the special case of midnight (00:00)
  if (hours === 0) return "12:00 AM";

  // Convert hours to 12-hour format
  let clockHours = hours;

  if (hours >= 13) clockHours -= 12;

  return clockHours + ":00 " + period;
}

function removeAllChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function getDayOfWeek(dateString) {
  // parse into date object
  let date = new Date(dateString);

  //get day as num val 0 - 6
  let dayOfWeekIndex = date.getDay();

  // create arr to pass in num val as index
  let daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return daysOfWeek[dayOfWeekIndex];
}

function getMinAndMaxFromArr(array) {
  if (Array.isArray(array)) {
    let copyArr = [...array];

    copyArr.sort((a, b) => a - b);
    copyArr = [copyArr[0], copyArr[copyArr.length - 1]];

    return copyArr;
  } else {
    throw console.error(`${array} is not an array.`);
  }
}

function stringArrToWordArr(stringArray) {
  // ensure its an Array
  if (!Array.isArray(stringArray)) {
    return console.error(stringArray, "is not an array");
  }

  let copyArr = [...stringArray];
  let splitCopy = [];

  // split each string into words
  for (const sentence of copyArr) {
    const string = sentence.split(" ");

    for (const word of string) {
      splitCopy.push(word);
    }
  }

  return splitCopy;
}

function filterStringArr(validArray, invalidArr) {
  let copyInvalidArr = [...invalidArr];

  let filteredArr = copyInvalidArr.filter((word) => validArray.includes(word));

  return filteredArr;
}

function countWordsInArr(array) {
  let copyArr = [...array];

  let countObj = {};

  for (let word of copyArr) {
    if (!countObj.hasOwnProperty(word)) {
      countObj[word] = 1;
    } else {
      countObj[word] += 1;
    }
  }
  return countObj;
}

function getKeyWithHighestVal(obj) {
  let maxKey;
  let maxValue;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === "number") {
        if (maxKey === undefined || value > maxValue) {
          maxKey = key;
          maxValue = value;
        }
      }
    }
  }

  return maxKey;
}

function sortObjectByOrderStartingFromToday(obj) {
  let order = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let dateInstance = new Date();
  let today = dateInstance.getDay();

  let sortedObj = {};

  // Start from the current day and add keys in order
  for (let i = today; i < order.length; i++) {
    let day = order[i];
    if (obj.hasOwnProperty(day)) {
      sortedObj[day] = obj[day];
    }
  }

  // Continue adding keys from the beginning of the week
  for (let i = 0; i < today; i++) {
    let day = order[i];
    if (obj.hasOwnProperty(day)) {
      sortedObj[day] = obj[day];
    }
  }

  return sortedObj;
}

let testObj = {
  Monday: 0,
  Friday: 1,
  Thursday: 0,
  Tuesday: 1,
  Saturday: 0,
  Wednesday: 2,
  Sunday: 3,
};

// console.log('I am', sortObjectByOrderStartingFromToday(testObj))

// TODO://
// find out what day it is
//will need to call getDayOfWeek(today) to figure out which day to start painting info
// let dateInstance = new Date();
// let today = getDayOfWeek(dateInstance);

// console.log(organizeKeysFromToday(wfDataObj))

//TODO:// autocomplete for searching city!

//TODO:// center the air condition icon and word

//TODO:// implement geolocation?
// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(function(position) {
//     const latitude = position.coords.latitude;
//     const longitude = position.coords.longitude;
//     console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
//   });
// } else {
//   console.log("Geolocation is not supported by this browser.");
// }

//TODO:// Reverse geocoding to get city name by lat and long

// 7 day api?
//

//TODO:// styling for air conditions

//TODO:// onhover scale 1.2 for tf svgs
