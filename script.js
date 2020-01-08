const APIKEY = "5f72695b61e52bc78f35360b1c746b2e";
populateSearchHistory();

$("#citySearchBtn").on("click", function(event) {
  event.preventDefault();
  let citySearched = $("#citySearchText").val();
  $("#citySearchText").val("");
  $("#searchResults").fadeIn();
  getCurrentWeatherConditions(citySearched);
  getFiveDayForecast(citySearched);
});

// showing sidebar
function populateSearchHistory() {
    $("#searchHistoryList").empty();
    let searchHistory = getStoredWeatherData().searchHistory;
    if (searchHistory) {
      for (let i = 0; i < searchHistory.length; i++) {
        let item = $("<li class='list-group-item'></li>");
        item.text(searchHistory[i].cityName);
        $("#searchHistoryList").prepend(item);
      }
      $(".list-group-item").on("click", function() {
        $("#searchResults").fadeIn("slow");
        getCurrentWeatherConditions($(this).text());
        getFiveDayForecast($(this).text());
      });
    }
  }

// showing weather data of the previous searched, or
// shows an empty structure if no info was stored.
function getStoredWeatherData() {
    let storedWeatherData = JSON.parse(localStorage.getItem("storedWeatherData"));
    if (!storedWeatherData) {
      return {
        searchHistory: [],
        data: {
          currentWeather: [],
          forecast: []
        }
      };
    } else {
      return storedWeatherData;
    }
  }
  
// Looking in local storage for weather data of user's search
function getCurrentWeatherConditions(citySearched) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${citySearched}&units=imperial&appid=${APIKEY}`;
    let storedWeatherData = getStoredWeatherData();
    let searchHistory = storedWeatherData.searchHistory;
    let timeNow = new Date().getTime();
    citySearched = citySearched.toLowerCase().trim();
    for (let i = 0; i < searchHistory.length; i++) {
      if (
        searchHistory[i].cityName.toLowerCase() == citySearched &&
        timeNow < searchHistory[i].dt * 1000 + 600000
      ) {
        for (let j = 0; j < storedWeatherData.data.currentWeather.length; j++) {
          if (
            storedWeatherData.data.currentWeather[j].name.toLowerCase() ==
            citySearched
          ) {
            populateCurrentWeatherConditions(
              storedWeatherData.data.currentWeather[j]
            );
            return;
          }
        }
      }
    }
    
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(results) {
    populateCurrentWeatherConditions(results);
    storeCurrentWeather(results);
  });
}//API call to get the current weather

// Storing the current weather data of the API call.
function storeCurrentWeather(results) {
    let storedWeatherData = getStoredWeatherData();
    let searchHistoryEntry = {
      cityName: results.name,
      dt: results.dt
    };
    storedWeatherData.searchHistory.push(searchHistoryEntry);
    storedWeatherData.data.currentWeather.push(results);
    localStorage.setItem("storedWeatherData", JSON.stringify(storedWeatherData));
  }

// weather data from API call
function populateCurrentWeatherConditions(results) {
    let cityName = results.name;
    let date = new Date(results.dt * 1000);
    let description = results.weather[0].main;
    let humidity = results.main.humidity;
    let iconURL = `https://openweathermap.org/img/w/${results.weather[0].icon}.png`;
    let temp = results.main.temp;
    let windSpeed = results.wind.speed;
  
    let lon = results.coord.lon;
    let lat = results.coord.lat;
  
// Adding eather to the page
    $("#elCity").text(cityName);
    $("#curentDate").text(
      `(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`
    );
    $("#elWeatherIcon").attr("src", iconURL);
    $("#elWeatherIcon").attr("alt", description + " icon");
    $("#elTemp").text(temp);
    $("#elHumidity").text(humidity);
    $("#elWindSpeed").text(windSpeed);
  
    populateUVIndex(lon, lat);
  }

// Locating UV Index with API
function populateUVIndex(lon, lat) {
    let UVIndexURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${APIKEY}&lat=${lat}&lon=${lon}`;
    $.ajax({
      url: UVIndexURL,
      method: "GET"
    }).then(function(results) {
      let UVIndex = results.value;
      let currUVLevel = $("#elUVIndex").attr("data-uv-level");
      $("#elUVIndex").removeClass(currUVLevel);
      $("#elUVIndex").text(UVIndex);
      if (UVIndex < 3) {
        $("#elUVIndex").attr("data-uv-level", "uv-low");
      } else if (UVIndex < 6) {
        $("#elUVIndex").attr("data-uv-level", "uv-mod");
      } else if (UVIndex < 8) {
        $("#elUVIndex").attr("data-uv-level", "uv-high");
      } else if (UVIndex < 11) {
        $("#elUVIndex").attr("data-uv-level", "uv-very-high");
      } else {
        $("#elUVIndex").attr("data-uv-level", "uv-ext");
      }
      $("#elUVIndex").addClass($("#elUVIndex").attr("data-uv-level"));
    });
  }

function getFiveDayForecast(citySearched) {
    let storedWeatherData = getStoredWeatherData();
    let forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${citySearched}&units=imperial&appid=ace07f609ddfcf658bcba38cc43237a5`;
    let today = new Date().getDate();
    for (let i = 0; i < storedWeatherData.searchHistory.length; i++) {
      let savedDate = new Date(
        storedWeatherData.searchHistory[i].dt * 1000
      ).getDate();
      if (
        storedWeatherData.searchHistory[i].cityName.toLowerCase() ==
          citySearched &&
        savedDate == today
      ) {
        for (let j = 0; j < storedWeatherData.data.forecast.length; j++) {
          if (
            storedWeatherData.data.forecast[j].city.name.toLowerCase() ==
            citySearched.toLowerCase()
          ) {
            populateForecast(storedWeatherData.data.forecast[j]);
            return;
          }
        }
      }
    }
    $.ajax({
      url: forecastURL,
      method: "GET"
    }).then(function(results) {
      populateForecast(results);
      storeForecast(results, citySearched);
    });
  }
  
function storeForecast(results, citySearched) {
    citySearched = citySearched.toLowerCase().trim();
    let storedWeatherData = getStoredWeatherData();
    storedWeatherData.data.forecast.push(results);
    localStorage.setItem("storedWeatherData", JSON.stringify(storedWeatherData));
  }

function populateForecast(results) {
    $("#5Dayforecast").empty();
    let list = results.list;
    let daysForecasted = 0;  
    for (let i = 0; i < list.length && daysForecasted < 6; i++) {
      let time = list[i].dt_txt.split(" ")[1];
  
      if (time == "12:00:00") {
        let cardDiv = $("<div class='card forecast-card mx-2 shadow'>");
        let cardBodyDiv = $("<div class='card-body'>");
  
        let dateDiv = $("<div class='forecast-date'>");
        let date = formatDate(list[i].dt_txt.split(" ")[0]);
        dateDiv.text(date);
  
        let imgElem = $("<img>");
        let iconURL = `https://openweathermap.org/img/w/${list[i].weather[0].icon}.png`;
        imgElem.attr("src", iconURL);
        let temp = list[i].main.temp;
        let pTemp = $(`<p>Temp: ${temp} &degF</p>`);
        let humidity = list[i].main.humidity;
        let pHumid = $(`<p>Humidity: ${humidity}%</p>`);
  
        cardBodyDiv.append(dateDiv, imgElem, pTemp, pHumid);
        cardDiv.append(cardBodyDiv);
        $("#5Dayforecast").append(cardDiv);
  
        daysForecasted++;
      }
    }
    populateSearchHistory();
  }
  
  //changes date to MDY
  function formatDate(date) {
    let arr = date.split(" ")[0].split("-");
    let formattedDate = `${arr[1]}/${arr[2]}/${arr[0]}`;
    return formattedDate;
  }

  localStorage.clear();