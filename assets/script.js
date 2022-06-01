var searchHistory = [];
// returns local storage search history
function getItems() {
    var storedCities = JSON.parse(localStorage.getItem("searchHistory"));
    if (storedCities !== null) {
        searchHistory = storedCities;
    };
     // lists up to 6 locations
    for (i = 0; i < searchHistory.length; i++) {
        if (i == 6) {
            break;
          }
        //  creates links/buttons 
        cityListButton = $("<a>").attr({
            class: "list-group-item list-group-item-action",
            href: "#"
        });
        // appends history as a button below the search field
        cityListButton.text(searchHistory[i]);
        $(".list-group").append(cityListButton);
    }
};
var city;
var mainCard = $('.cardbody');
// prompt getItems
getItems();
// main card
function getData() { 
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=49fb27317373bb54f7d9243387af6df3"
    mainCard.empty();
    $("#forecast-card").empty();
    // requests
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        // using moment to call the date
        var date = moment().format(" MM/DD/YYYY");
        // takes the icon code from the response and assigns it to iconCode
        var iconCode = response.weather[0].icon;
        // builds the main card icon url
        var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
        // takes the name added from the search and the date/format from moment and creates a single var
        var name = $("<h3>").html(city + date);
        // displays name in main card
        mainCard.prepend(name);
        // displays icon on main card
        mainCard.append($("<img>").attr("src", iconURL));
        // converts K to C
        var temp = Math.round(response.main.temp - 273.15);
        mainCard.append($("<p>").html("Temperature: " + temp + " &#8451"));
        var humidity = response.main.humidity;
        mainCard.append($("<p>").html("Humidity: " + humidity));
        var windSpeed = response.wind.speed;
        mainCard.append($("<p>").html("Wind Speed: " + windSpeed)); 
        // takes from the response and creates a var used in the next request for UV index
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        // separate request for UV index, requires lat/long
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/uvi?appid=49fb27317373bb54f7d9243387af6df3&lat=" + lat + "&lon=" + lon,
            method: "GET"
        }).then(function (response) {
            mainCard.append($("<p>").html("UV Index: <span>" + response.value + "</span>"));
        })
        // another call for the 5-day (forecast)
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=49fb27317373bb54f7d9243387af6df3",
            method: "GET"
        // displays 5 separate columns from the forecast response for 5 days
        }).then(function (response) {
            for (i = 0; i < 5; i++) { 
                var newCard = $("<div>").attr("class", "col fiveDay bg-primary text-white p-2");
                $("#forecast-card").append(newCard);
                var newdate = new Date(response.list[i * 8].dt * 1000);
                newCard.append($("<h4>").html(newdate.toLocaleDateString()));
                var iconCode = response.list[i * 8].weather[0].icon;
                var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
                newCard.append($("<img>").attr("src", iconURL));
                var temp = Math.round(response.list[i * 8].main.temp - 273.15);
                newCard.append($("<p>").html("Temp: " + temp + " &#8451")); 
                var humidity = response.list[i * 8].main.humidity;
                newCard.append($("<p>").html("Humidity: " + humidity));
            }
        })
    })
};
// searches and adds to history(event)
$("#searchbutton").click(function() {
    city = $("#cityname").val().trim();
    getData();
    var checkArray = searchHistory.includes(city);
    if (checkArray == true) {
        return
    }
    else {
        searchHistory.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        var cityListButton = $("<a>").attr({
            class: "list-group-item list-group-item-action",
            href: "#"
        });
        cityListButton.text(city);
        $(".list-group").append(cityListButton);
    };
});
// listens for action on the history buttons(event)
$(".list-group-item").click(function() {
    city = $(this).text();
    getData();
});
