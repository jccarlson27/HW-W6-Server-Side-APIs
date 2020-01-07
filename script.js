// Add API key for weather search
const APIKEY = "5f72695b61e52bc78f35360b1c746b2e";
populateSearchHistory();
//making button function for searching an diplaying in history and go to api Key
$("#citySearchButton").on("click", function (event) {
    event.preventDefault();
    let citySearched = $("#citySearchText").val();
    $("#citySerchText").val("");
    $("#searchResults").fadeIn();
    getCurrentWeatherConditions(citySearched);
    getFiveDayForecast(citySearched);

    // dieplay history of searched results and let it view on click 
    function populateSearchHistory() {
        $("#searchHistoryList").empty();
        let searchHistory = getStoredWeatherData().searchHistory;
        if (searchHistory) {
            for (let i = 0; i < searchHistory.length; i++) {
                let item = $("<li class='list-group-item'></li>");
                item.text(searchHistory[i].cityName);
                $('#searchHistoryList').prepend(item);
            }
            $(".list-group-item").on("click", function () {
                $("#searchResuts").fadeIn("slow");
                getCurrentWeatherConditions($(this).text());
                getFiveDayForecast($(this).ext());
            });

        }


    }


});