let cityInput = document.querySelector('#city-input');
let cityBtn = document.querySelector('#search-btn');
let cityNameEl = document.querySelector('#city-name');
let cityArr = [];
let key = 'f1ba334870977058f24f9c6bdabe3420';

let formHandler = function (event) {

    let selectedCity = cityInput.value.trim().toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

    if (selectedCity) {
        getCoords(selectedCity);
        cityInput.value = '';
    } else {
        alert('enter a city');
    };
};

// uses open weather api to get longitude and latitude for cities //
let getCoords = function (city) {
    let currentWeatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${key}`;

    fetch(currentWeatherApi).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                let lon = data.coord['lon'];
                let lat = data.coord['lat'];
                getCityForecast(city, lon, lat);

                // saves searched city 
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
        .catch(function (error) {
            alert('cannot load weather');
        })
};

// uses longitude and latitude to get 5 day forcast
let getCityForecast = function (city, lon, lat) {
    let callApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${key}`;

    fetch(callApi).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {

                // id's city name in forecast
                cityNameEl.textContent = `${city} (${moment().format("M/D/YYYY")})`;
                console.log(data)
                currentForecast(data);
                fiveDayForecast(data);
            });
        }
    })
};

// helper function to select correct html element and display rounded temp
let displayTemp = function (element, temperature) {
    let tempEl = document.querySelector(element);
    let elementText = Math.round(temperature);
    tempEl.textContent = elementText;
}

// displays current forecast
let currentForecast = function (forecast) {

    let forecastEl = document.querySelector('.city-forecast');
    forecastEl.classList.remove('hide');

    let weatherIconEl = document.querySelector('#today-icon');
    let currentIcon = forecast.current.weather[0].icon;
    weatherIconEl.setAttribute('src', `http://openweathermap.org/img/wn/${currentIcon}.png`);
    weatherIconEl.setAttribute('alt', forecast.current.weather[0].main)

    displayTemp('#current-temp', forecast.current['temp']);
    displayTemp('#current-feels-like', forecast.current['feels_like']);
    displayTemp('#current-high', forecast.daily[0].temp.max);
    displayTemp('#current-low', forecast.daily[0].temp.min);

    let currentConditionEl = document.querySelector('#current-condition');
    currentConditionEl.textContent = forecast.current.weather[0].description.split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

    let currentHumidityEl = document.querySelector('#current-humidity');
    currentHumidityEl.textContent = forecast.current['humidity'];

    let currentWindEl = document.querySelector('#current-wind-speed');
    currentWindEl.textContent = forecast.current['wind_speed'];

    let uviEl = document.querySelector('#current-uvi')
    let currentUvi = forecast.current['uvi'];
    uviEl.textContent = currentUvi;

    // changes color for the uv index
    switch (true) {
        case (currentUvi <= 2):
            uviEl.className = 'badge badge-success';
            break;
        case (currentUvi <= 5):
            uviEl.className = 'badge badge-warning';
            break;
        case (currentUvi <= 7):
            uviEl.className = 'badge badge-danger';
            break;
        default:
            uviEl.className = 'badge text-light';
            uviEl.setAttribute('style', 'backgroud-color: blue');
    }
};


// display 5 day forecast
let fiveDayForecast = function (forecast) {

    for (let i = 1; i < 6; i++) {
        let dates = document.querySelector('#date-' + i);
        dates.textContent = moment().add(i, 'days').format('M/D/YYYY');

        let iconImg = document.querySelector('#icon-' + i);
        let iconCode = forecast.daily[i].weather[0].icon;
        iconImg.setAttribute('src', `http://openweathermap.org/img/wn/${iconCode}.png`);
        iconImg.setAttribute('alt', forecast.daily[i].weather[0].main);

        displayTemp('#temp-' + i, forecast.daily[i].temp.day);
        displayTemp('#high-' + i, forecast.daily[i].temp.max);
        displayTemp('#low-' + i, forecast.daily[i].temp.min);

        let humiditySpan = document.querySelector('#humidity-' + i);
        humiditySpan.textContent = forecast.daily[i].humidity;
    }
};

// saves searched cities to local storage
let saveCity = function (city) {

    // prevents duplicate city from being saved, moves it to the end of array
    for (let i = 0; i < cityArr.length; i++) {
        if (city === cityArr[i]) {
            cityArr.splice(i, 1);
        }
    }

    cityArr.push(city);
    localStorage.setItem('cities', JSON.stringify(cityArr));
};

// loads cities from local storage 
let loadCities = function () {
    cityArr = JSON.parse(localStorage.getItem('cities'));

    // saves only the 5 most recent searches
    if (!cityArr) {
        cityArr = [];
        return false;
    } else if (cityArr.length > 5) {
        cityArr.shift();
    }

    let recentCities = document.querySelector('#recent-cities');
    let cityListUl = document.createElement('ul');
    cityListUl.className = 'list-group list-group-flush city-list';
    recentCities.appendChild(cityListUl);

    for (let i = 0; i < cityArr.length; i++) {
        let cityListItem = document.createElement('button');
        cityListItem.setAttribute('type', 'button');
        cityListItem.className = 'list-group-item';
        cityListItem.setAttribute('value', cityArr[i]);
        cityListItem.textContent = cityArr[i];
        cityListUl.prepend(cityListItem);
    }

    let cityList = document.querySelector('.city-list');
    cityList.addEventListener('click', selectRecent)
}


let selectRecent = function (event) {
    let chosenCity = event.target.getAttribute('value');

    getCoords(chosenCity);
}

loadCities();
cityBtn.addEventListener('click', formHandler)

// can use the enter button to 'click' the search button
cityInput.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        cityBtn.click();
    }

});