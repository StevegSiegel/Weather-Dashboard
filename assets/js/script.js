let cityInput = document.querySelector('#city-input');
let cityBtn = document.querySelector('#search-btn');
let cityNameEl = document.querySelector('#city-name');
let cityArr = [];
let key = 'f1ba334870977058f24f9c6bdabe3420';

let formHandler = function(event) {
    
    let selectedCity = cityInput.value.trim().toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

    if(selectedCity) {
        getCoords(selectedCity);
        cityInput.value = '';
    } else {
        alert('enter a city');
    };
};

let getCoords = function(city) {
    let currentWeatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${key}`;

    fetch(currentWeatherApi).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {
                let lon = data.coord['lon'];
                let lat = data.coord['lat'];
                getCityForecast(city, lon, lat);

                if (document.querySelector('.city-list')) {
                    document.querySelector('.city-list').remove();
                }
                saveCity(city);
                loadCities();
            });
        } else {
            alert(`error: ${response.statusText}`);
        }
    })
    .catch(function(error) {
        alert('cannot load weather');
    })
};

let getCityForecast = function(city, lon, lat) {
    let callApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=impiral&exclude=minutely,hourly,alerts&appid=${key}`;
    
    fetch(callApi).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {

                cityNameEl.textContent = `${city} (${moment().format("M/D/YYYY")})`;
                console.log(data)
                currentForecast(data);
                fifeDayForecast(data);
            });
        }
    })
};

