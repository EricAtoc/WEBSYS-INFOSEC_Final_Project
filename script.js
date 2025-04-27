document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed - Combined Script Initializing (Free API Version)");

    // ============================================================
    // SECTION 1: NAVIGATION & CONTENT SWITCHING LOGIC (No changes needed here)
    // ============================================================
    console.log("Initializing Navigation Logic...");
    const mainNavButtons = document.querySelectorAll('.main-nav .nav-button:not(#category-btn)');
    const categoryButton = document.getElementById('category-btn');
    const categoryDropdown = document.getElementById('category-dropdown');
    const categoryDropdownButtons = categoryDropdown ? categoryDropdown.querySelectorAll('button') : [];
    const allMainNavButtons = document.querySelectorAll('.main-nav .nav-button');
    const contentSections = document.querySelectorAll('.main-content .content-section');
    const pollutionContainer = document.getElementById('pollution-content');
    const pollutionSideNavButtons = pollutionContainer ? pollutionContainer.querySelectorAll('.side-nav .side-nav-item') : [];
    const pollutionPages = pollutionContainer ? pollutionContainer.querySelectorAll('.pollution-main .pollution-page') : [];
    console.log(`Found ${contentSections.length} main content sections.`);
    if (pollutionContainer) { /* Basic check */ } else { console.warn("Pollution section container (#pollution-content) not found!"); }

    function setActiveSection(targetId) {
        console.log(`Attempting to activate main section: #${targetId}`);
        contentSections.forEach(section => section.classList.remove('active'));
        allMainNavButtons.forEach(btn => btn.classList.remove('active'));
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`Successfully activated main section: #${targetId}`);
            if (targetId === 'pollution-content' && pollutionContainer && pollutionSideNavButtons.length > 0 && pollutionPages.length > 0) {
                console.log('Resetting pollution pagination to page 1...');
                pollutionPages.forEach(page => page.classList.remove('active'));
                pollutionSideNavButtons.forEach(btn => btn.classList.remove('active'));
                const firstPollutionPage = pollutionContainer.querySelector('#pollution-page-1');
                const firstPollutionButton = pollutionContainer.querySelector('.side-nav-item[data-target="pollution-page-1"]');
                if (firstPollutionPage) firstPollutionPage.classList.add('active'); else console.error('Could not find #pollution-page-1.');
                if (firstPollutionButton) firstPollutionButton.classList.add('active'); else console.error('Could not find pollution side nav button for page 1.');
            }
        } else {
            console.error(`Target main section with ID "${targetId}" not found!`); return;
        }
        let mainButtonToActivate = document.querySelector(`.main-nav .nav-button[data-target="${targetId}"]`);
        if (!mainButtonToActivate && categoryDropdownButtons.length > 0) {
            const isCategoryItem = Array.from(categoryDropdownButtons).some(btn => btn.dataset.target === targetId);
            if (isCategoryItem && categoryButton) mainButtonToActivate = categoryButton;
        }
        if (mainButtonToActivate) mainButtonToActivate.classList.add('active');
        else if (targetId === 'welcome-content') { const aboutButton = document.querySelector('.main-nav .nav-button[data-target="welcome-content"]'); if (aboutButton) aboutButton.classList.add('active'); }
        else console.warn(`No main nav button found to activate for target: ${targetId}`);
        if (categoryDropdown) categoryDropdown.style.display = 'none';
    }
    mainNavButtons.forEach(button => { button.addEventListener('click', () => { const targetId = button.dataset.target; if (targetId) setActiveSection(targetId); else console.warn('Main nav button has no data-target'); }); });
    if (categoryButton && categoryDropdown) { categoryButton.addEventListener('click', (event) => { event.stopPropagation(); const isVisible = categoryDropdown.style.display === 'block'; categoryDropdown.style.display = isVisible ? 'none' : 'block'; }); }
    if (categoryDropdownButtons.length > 0) { categoryDropdownButtons.forEach(button => { button.addEventListener('click', (event) => { event.stopPropagation(); const targetId = button.dataset.target; if (targetId) setActiveSection(targetId); }); }); }
    document.addEventListener('click', (event) => { if (categoryDropdown && categoryButton && categoryDropdown.style.display === 'block') { if (!categoryButton.contains(event.target) && !categoryDropdown.contains(event.target)) categoryDropdown.style.display = 'none'; } });
    if (pollutionContainer && pollutionSideNavButtons.length > 0 && pollutionPages.length > 0) { pollutionSideNavButtons.forEach(button => { button.addEventListener('click', () => { const targetPageId = button.dataset.target; const targetPage = pollutionContainer.querySelector(`#${targetPageId}`); if (!targetPage) { console.warn(`Pollution page "${targetPageId}" not found.`); return; } pollutionSideNavButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); pollutionPages.forEach(page => page.classList.remove('active')); targetPage.classList.add('active'); console.log(`Activated pollution page: #${targetPageId}`); }); }); }
    else { console.warn("Pollution pagination listeners not attached."); }


    // ============================================================
    // SECTION 2: WEATHER FETCHING & DISPLAY LOGIC (Using FREE APIs)
    // ============================================================

    console.log("Initializing Weather Logic (Free API Version)...");

    // --- Weather Configuration ---
    const apiKey = '8f13fb6287de35c130eda6f7c8d28119'; // Your actual API key
    const cityLat = 14.6573; // Latitude for Caloocan City
    const cityLon = 120.9842; // Longitude for Caloocan City
    const units = 'metric'; // 'metric' for Celsius
    const forecastDaysToShow = 5; // FREE API PROVIDES 5 DAYS MAX

    // --- Weather DOM Element References ---
    const currentDateTimeEl = document.getElementById('current-date-time');
    const currentWeatherDescEl = document.getElementById('current-weather-desc');
    const currentTempEl = document.getElementById('current-temp');
    const currentTempFEl = document.getElementById('current-temp-f');
    const currentWindEl = document.getElementById('current-wind');
    const currentHumidityEl = document.getElementById('current-humidity');
    // Ensure forecast day elements exist (IDs forecast-day-0 to forecast-day-4 needed now)

    // --- Weather Helper Functions (Mostly unchanged) ---
    function celsiusToFahrenheit(celsius) { return (celsius * 9 / 5) + 32; }
    function formatDateTime(timestamp) { const date = new Date(timestamp * 1000); return date.toLocaleTimeString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true }); }
    function formatForecastDate(timestamp) { const date = new Date(timestamp * 1000); return date.toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit' }).replace(',', '<br>'); }
    function mapOwmIconToFontAwesome(owmIconCode) { /* Icon mapping remains the same */ const iconMap={'01d':'fa-solid fa-sun sunny','02d':'fa-solid fa-cloud-sun partly-cloudy','03d':'fa-solid fa-cloud cloudy','04d':'fa-solid fa-cloud cloudy','09d':'fa-solid fa-cloud-showers-heavy rain','10d':'fa-solid fa-cloud-sun-rain rain','11d':'fa-solid fa-cloud-bolt thunder','13d':'fa-solid fa-snowflake snow','50d':'fa-solid fa-smog mist','01n':'fa-solid fa-moon clear-night','02n':'fa-solid fa-cloud-moon partly-cloudy-night','03n':'fa-solid fa-cloud cloudy','04n':'fa-solid fa-cloud cloudy','09n':'fa-solid fa-cloud-showers-heavy rain','10n':'fa-solid fa-cloud-moon-rain rain','11n':'fa-solid fa-cloud-bolt thunder','13n':'fa-solid fa-snowflake snow','50n':'fa-solid fa-smog mist',}; return (iconMap[owmIconCode]||'fa-solid fa-question unknown')+' weather-icon'; }
    function capitalizeDescription(description) { return description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); }

    // --- Weather Main Fetch Function (Modified for two calls) ---
    async function getWeatherData() {
        console.log("Attempting to fetch weather data (Free API)...");
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&appid=${apiKey}&units=${units}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityLat}&lon=${cityLon}&appid=${apiKey}&units=${units}`;

        console.log("Current Weather API URL:", currentWeatherUrl);
        console.log("Forecast API URL:", forecastUrl);

        // Check if essential DOM elements exist before fetching
        if (!currentDateTimeEl || !currentWeatherDescEl || !currentTempEl) {
            console.error("Core current weather DOM elements missing! Aborting fetch."); return;
        }
         if (!document.getElementById('forecast-date-0')) {
             console.error("Forecast DOM elements seem missing! Aborting fetch."); return;
         }


        try {
            // Use Promise.all to fetch both concurrently
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(forecastUrl)
            ]);

            console.log("Current Weather Response Status:", currentResponse.status);
            console.log("Forecast Response Status:", forecastResponse.status);

            // Process responses individually, handle errors for each
            let currentData = null;
            let forecastData = null;
            let currentError = null;
            let forecastError = null;

            if (currentResponse.ok) {
                currentData = await currentResponse.json();
                console.log("Current Weather Data Received:", currentData);
            } else {
                 const errorText = await currentResponse.text(); // Get raw error text
                 console.error("Current Weather API Error Response Text:", errorText);
                 currentError = new Error(`Current Weather fetch failed: ${currentResponse.status} ${currentResponse.statusText}. Response: ${errorText.substring(0, 100)}...`); // Limit error text length
                 // Handle specific status codes if needed (e.g., 401 Invalid Key)
                 if (currentResponse.status === 401) currentError = new Error("Invalid API Key (401). Check key.");
            }

            if (forecastResponse.ok) {
                forecastData = await forecastResponse.json();
                console.log("Forecast Data Received:", forecastData);
            } else {
                const errorText = await forecastResponse.text();
                console.error("Forecast API Error Response Text:", errorText);
                forecastError = new Error(`Forecast fetch failed: ${forecastResponse.status} ${forecastResponse.statusText}. Response: ${errorText.substring(0, 100)}...`);
                if (forecastResponse.status === 401) forecastError = new Error("Invalid API Key (401). Check key.");
            }

            // If both failed, throw a combined error or the first one encountered
            if (currentError && forecastError) throw new Error(`Both fetches failed: ${currentError.message} AND ${forecastError.message}`);
            if (currentError) throw currentError;
            if (forecastError) throw forecastError;

            // If we reach here, at least one (likely both) succeeded
            updateUI(currentData, forecastData); // Pass both data objects

        } catch (error) {
            console.error("Error during weather fetch execution:", error);
            // Update UI to show a general error
            currentDateTimeEl.textContent = 'Error';
            currentWeatherDescEl.textContent = `Weather Load Failed: ${error.message}`;
             currentTempEl.textContent = '--';
             if (currentTempFEl) currentTempFEl.textContent = '--';
             if (currentWindEl) currentWindEl.textContent = '--';
             if (currentHumidityEl) currentHumidityEl.textContent = '--';

            // Clear forecast or show error there too (limited to 5 days now)
            for (let i = 0; i < forecastDaysToShow; i++) {
                 try {
                    document.getElementById(`forecast-date-${i}`).textContent = 'Error';
                    document.getElementById(`forecast-icon-${i}`).className = 'fa-solid fa-exclamation-triangle weather-icon error-icon';
                    document.getElementById(`forecast-desc-${i}`).textContent = 'Load failed';
                    document.getElementById(`forecast-temp-${i}`).textContent = '--°C';
                    document.getElementById(`forecast-humidity-${i}`).textContent = '--%';
                 } catch (elementError) { console.warn(`Could not update error state for forecast day ${i}: ${elementError.message}`); }
            }
        }
    }

    // --- Weather Update UI Function (Modified to accept two data objects) ---
    function updateUI(currentData, forecastData) {
        console.log("Updating Weather UI (Free API Version)...");

        // Update Current Weather
        if (currentData && currentData.weather && currentData.weather.length > 0 && currentData.main) {
            currentDateTimeEl.textContent = formatDateTime(currentData.dt); // Use current weather timestamp
            currentWeatherDescEl.textContent = `Weather: ${capitalizeDescription(currentData.weather[0].description)}`;
            currentTempEl.textContent = Math.round(currentData.main.temp);
            if (currentTempFEl) currentTempFEl.textContent = Math.round(celsiusToFahrenheit(currentData.main.temp));
             if (currentWindEl) currentWindEl.textContent = Math.round(currentData.wind.speed * 3.6); // Convert m/s to KMPH
             if (currentHumidityEl) currentHumidityEl.textContent = currentData.main.humidity;
        } else {
            console.warn("Current weather data missing or incomplete.");
            currentWeatherDescEl.textContent = 'Current data unavailable.';
            // Clear other fields if needed
        }

        // Update Forecast (Using the 5-day/3-hour data)
        if (forecastData && forecastData.list && forecastData.list.length > 0) {
            const dailyForecasts = {}; // Object to hold one entry per day

            // Iterate through the 3-hour list
            forecastData.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dayKey = date.toISOString().split('T')[0]; // Get YYYY-MM-DD as a key

                // If we don't have an entry for this day yet, or if this entry is around midday (more representative)
                // We'll store the entry closest to 12:00 PM (or the first one we encounter for the day)
                if (!dailyForecasts[dayKey] || date.getHours() >= 11 && date.getHours() <= 13) {
                     // Only store if we haven't hit the display limit
                     if (Object.keys(dailyForecasts).length < forecastDaysToShow || dailyForecasts[dayKey]) {
                          dailyForecasts[dayKey] = item;
                     }
                }
            });

             // Get the keys (dates) and sort them
             const sortedDays = Object.keys(dailyForecasts).sort();

             // Now update the UI using the selected daily entries (max 5)
             for (let i = 0; i < forecastDaysToShow && i < sortedDays.length; i++) {
                 const dayKey = sortedDays[i];
                 const dayData = dailyForecasts[dayKey];

                 if (!dayData || !dayData.weather || dayData.weather.length === 0 || !dayData.main) {
                     console.warn(`Incomplete data for forecast day ${i} (Date: ${dayKey})`);
                     continue; // Skip if essential parts are missing
                 }

                 const dateEl = document.getElementById(`forecast-date-${i}`);
                 const iconEl = document.getElementById(`forecast-icon-${i}`);
                 const descEl = document.getElementById(`forecast-desc-${i}`);
                 const tempEl = document.getElementById(`forecast-temp-${i}`);
                 const humidityEl = document.getElementById(`forecast-humidity-${i}`);

                 if (dateEl && iconEl && descEl && tempEl && humidityEl) {
                     dateEl.innerHTML = formatForecastDate(dayData.dt);
                     iconEl.className = mapOwmIconToFontAwesome(dayData.weather[0].icon);
                     descEl.textContent = capitalizeDescription(dayData.weather[0].description);
                     tempEl.textContent = `${Math.round(dayData.main.temp)}°C`; // Use the temp from the 3-hour entry
                     humidityEl.textContent = `${dayData.main.humidity}%`; // Use humidity from the 3-hour entry
                 } else {
                     console.warn(`DOM element missing for forecast day index ${i}. Cannot update.`);
                 }
             }
             // If there are fewer than 5 days of data, clear the remaining slots
             for (let i = sortedDays.length; i < forecastDaysToShow; i++) {
                  try {
                     document.getElementById(`forecast-date-${i}`).textContent = '--/--';
                     document.getElementById(`forecast-icon-${i}`).className = 'fa-solid fa-minus weather-icon'; // Indicate empty slot
                     document.getElementById(`forecast-desc-${i}`).textContent = 'N/A';
                     document.getElementById(`forecast-temp-${i}`).textContent = '--°C';
                     document.getElementById(`forecast-humidity-${i}`).textContent = '--%';
                  } catch(e) {/* Ignore if elements don't exist */}
             }

        } else {
            console.warn("Daily forecast data missing or empty in response.");
            // Clear forecast UI
            for (let i = 0; i < forecastDaysToShow; i++) {
                 try {
                     document.getElementById(`forecast-desc-${i}`).textContent = 'Forecast unavailable';
                     document.getElementById(`forecast-icon-${i}`).className = 'fa-solid fa-times-circle weather-icon error-icon';
                 } catch (e) {/* Ignore if elements don't exist */}
            }
        }
        console.log("Weather UI update complete (Free API Version).");
    }

    // ============================================================
    // SECTION 3: INITIALIZATION (Unchanged logic, uses the new getWeatherData)
    // ============================================================
    console.log("Running Initial Page Setup...");
    contentSections.forEach(section => section.classList.remove('active'));
    setActiveSection('welcome-content'); // Set default section

    // --- Initialize Weather ---
    if (apiKey && apiKey !== 'YOUR_OPENWEATHERMAP_API_KEY_PLACEHOLDER') { // Check against a placeholder if needed
        getWeatherData(); // Fetch weather data on load
        // setInterval(getWeatherData, 30 * 60 * 1000); // Optional refresh
    } else {
        console.error("API Key is missing or invalid! Please add your OpenWeatherMap API key to script.js");
        if(currentDateTimeEl) currentDateTimeEl.textContent = 'Setup Error';
        if(currentWeatherDescEl) currentWeatherDescEl.textContent = 'API Key missing/invalid';
    }
    console.log("Combined script initialization complete.");

}); // End of the single DOMContentLoaded listener