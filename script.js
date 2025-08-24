document.addEventListener('DOMContentLoaded', () => {
    const mainWeatherCard = document.getElementById('main-weather');
    const weatherCardsContainer = document.getElementById('weather-cards');
    const loadingSpinner = document.getElementById('loading');
    const errorMessageElement = document.getElementById('error-message');
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');

    // API credentials
    const API_KEY = '9172d22676msh5c49985f9e41eb7p1a6493jsnbf403c7bf5e6';
    const API_HOST = 'rapidweather.p.rapidapi.com';

    /**
     * Shows or hides the loading spinner and clears content.
     * @param {boolean} show - True to show, false to hide.
     */
    function showLoading(show) {
        loadingSpinner.style.display = show ? 'block' : 'none';
        mainWeatherCard.style.display = 'none';
        weatherCardsContainer.innerHTML = '';
        errorMessageElement.style.display = 'none';
    }

    /**
     * Displays an error message to the user.
     * @param {string} message - The error message to display.
     */
    function showErrorMessage(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }

    /**
     * Fetches weather data for a given city and renders it on the page.
     * @param {string} city - The name of the city to fetch the forecast for.
     */
    async function fetchWeather(city) {
        if (!city) {
            showErrorMessage('Please enter a city name.');
            return;
        }

        showLoading(true);

        const API_URL = `https://${API_HOST}/data/2.5/forecast?q=${city}`;
        const API_OPTIONS = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        };

        try {
            const response = await fetch(API_URL, API_OPTIONS);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.cod !== "200" || !data.list) {
                throw new Error(data.message || 'API response was not successful.');
            }

            showLoading(false);
            mainWeatherCard.style.display = 'flex';

            // Extract main weather for today
            const todayForecast = data.list[0];
            const todayTemp = Math.round(todayForecast.main.temp - 273.15);
            const feelsLikeTemp = Math.round(todayForecast.main.feels_like - 273.15);
            const humidity = todayForecast.main.humidity;
            const windSpeed = (todayForecast.wind.speed * 3.6).toFixed(1); // Convert m/s to km/h
            const todayCondition = todayForecast.weather[0].description;
            const todayIconCode = todayForecast.weather[0].icon;

            // Convert sunrise and sunset from Unix time to a readable format
            const sunrise = new Date(data.city.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const sunset = new Date(data.city.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            // Render the main weather card with new features
            mainWeatherCard.innerHTML = `
                <h1 class="city-name">${data.city.name}, ${data.city.country}</h1>
                <img src="https://openweathermap.org/img/wn/${todayIconCode}@4x.png" alt="${todayCondition}" />
                <div class="main-temp">${todayTemp}°C</div>
                <div class="main-condition">${todayCondition}</div>
                <div class="main-weather-details">
                    <div class="detail-item">
                        <i class="fas fa-temperature-half icon"></i>
                        <span>Feels Like</span>
                        <span>${feelsLikeTemp}°C</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tint icon"></i>
                        <span>Humidity</span>
                        <span>${humidity}%</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-wind icon"></i>
                        <span>Wind</span>
                        <span>${windSpeed} km/h</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-sun icon"></i>
                        <span>Sunrise</span>
                        <span>${sunrise}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-moon icon"></i>
                        <span>Sunset</span>
                        <span>${sunset}</span>
                    </div>
                </div>
            `;

            // Filter the list to get one forecast per day (around midday)
            const dailyForecasts = data.list.filter((forecast, index) => index % 8 === 0).slice(1); // Exclude today's main forecast

            // Clear previous content
            weatherCardsContainer.innerHTML = '';

            // Generate and append a card for each daily forecast
            dailyForecasts.forEach(forecast => {
                const date = new Date(forecast.dt * 1000);
                const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                const temp = Math.round(forecast.main.temp - 273.15);
                const condition = forecast.weather[0].description;
                const iconCode = forecast.weather[0].icon;

                const card = document.createElement('div');
                card.className = 'weather-card';

                card.innerHTML = `
                    <h3>${day}</h3>
                    <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${condition}" />
                    <div class="temp">${temp}°C</div>
                    <div class="condition">${condition}</div>
                `;

                weatherCardsContainer.appendChild(card);
            });

        } catch (error) {
            console.error("Error fetching weather data:", error);
            showLoading(false);
            showErrorMessage(`Failed to load weather data: ${error.message}. Please check the city name.`);
        }
    }

    // Handle search button click
    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        fetchWeather(city);
    });

    // Handle pressing 'Enter' in the input field
    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const city = cityInput.value.trim();
            fetchWeather(city);
        }
    });

    // Initial fetch call for London when the page loads
    fetchWeather('London,UK');
});
