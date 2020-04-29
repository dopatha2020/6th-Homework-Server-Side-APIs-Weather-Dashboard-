let apiKey= "3ac6827d7f8416856e5537f9ae60281e";

var cityHistory = JSON.parse(window.localStorage.getItem("history")) || [];

$(document).ready(function(){

    $('#btnSearch').on("click", function(){
      
        var cityName = $('#inputSearch').val();
    
        getCurrentWeather(cityName);
      
        if (cityHistory.indexOf(cityName) === -1) {
            cityHistory.push(cityName);
            window.localStorage.setItem("history", JSON.stringify(cityHistory));
      
            createCityHistory(cityName);
          }
    });
     $("#history").on("click", "li", function() {
        getCurrentWeather($(this).text());
      });

//last searched city
  if (cityHistory.length > 0) {
    getCurrentWeather(cityHistory[cityHistory.length-1]);
  }

  //this created li history when  page is refreshed
  for (var i = 0; i < cityHistory.length; i++) {
    createCityHistory(cityHistory[i]);
  }
});

function createCityHistory(cityName){
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(cityName);
    $("#history").append(li);
}

function getCurrentWeather(cityName){

    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`,
        dataType: "json",
        success: function(data) {

            console.log("CurrentWeather data:", data);

            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
            
            $('#cityName').addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")").append(img);

            $('#temp').text("Tempereture: " + data.main.temp + "F");
            $("#humidity").text("Humidity: " + data.main.humidity + "%");
            $("#windSpeed").text("Wind Speed: " + data.wind.speed + "mph");
            getUv(data.coord.lat, data.coord.lon);
            getForescast(cityName);
        }});


}

function getUv(lat, lon){
    
    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`,
        dataType: "json",
        success: function(data) {
  
            console.log("UV data: ", data)

            var btn = $("<span>").addClass("btn btn-sm").text(data.value);

            if(data.value < 3){
                btn.addClass("btn-success");
            } else if (data.value < 7){
                btn.addClass("btn-warning");
            } else {
                btn.addClass("btn-danger");
            }

            $("#uv").text("UV Index: ").append(btn);

        }
      });
}

function getForescast(cityName){
    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`,
        dataType: "json",
        success: function(data) {
            console.log("forecast", data)

            $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
            for (var i = 0; i < data.list.length; i++) {

                if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                    // create html elements for a bootstrap card
                    var col = $("<div>").addClass("col-md-2");
                    var card = $("<div>").addClass("card bg-primary text-white");
                    var body = $("<div>").addClass("card-body p-2");
        
                    var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
        
                    var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
        
                    var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
                    var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
        
                    // merge together and put on page
                    col.append(card.append(body.append(title, img, p1, p2)));
                    $("#forecast .row").append(col);
                  }
            }
        }
      });
}