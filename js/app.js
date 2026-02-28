/* ============================================
   WhereToBreathe – Air Quality Activity Planner
   Main Application Script
   ============================================ */

// ──────────────────────────────────────────────
// AQI Reference Data
// ──────────────────────────────────────────────

/** AQI concentration ranges for each pollutant category */
const AQI_TABLE = [
    { category: "Good",      no2: "0–40",    o3: "0-50",    so2: "0-100"   },
    { category: "Fair",      no2: "41-90",   o3: "51-100",  so2: "101-200" },
    { category: "Moderate",  no2: "91-120",  o3: "101-130", so2: "201-350" },
    { category: "Poor",      no2: "121-230", o3: "131-240", so2: "351-500" },
    { category: "Very poor", no2: "231-340", o3: "241-380", so2: "501-750" }
];

/** AQI index ranges mapped to each category */
const AQI_INDEX = [
    { category: "Good",      range: "0-25"   },
    { category: "Fair",      range: "25-50"  },
    { category: "Moderate",  range: "50-75"  },
    { category: "Poor",      range: "75-100" },
    { category: "Very poor", range: "100-125"}
];

/** Pollutant keys used in data processing */
const POLLUTANT_KEYS = ["no2", "o3", "so2"];

/** Pollutant key mapping from raw data to AQI table keys */
const POLLUTANT_MAP = {
    no2_conc: "no2",
    o3_conc:  "o3",
    so2_conc: "so2"
};

// ──────────────────────────────────────────────
// Sensitivity Thresholds
// ──────────────────────────────────────────────

const SENSITIVITY_THRESHOLDS = {
    low:      { good: 75,  moderate: 100 },
    moderate: { good: 50,  moderate: 75  },
    high:     { good: 25,  moderate: 50  }
};

// ──────────────────────────────────────────────
// Weather Icon SVGs
// ──────────────────────────────────────────────

const WEATHER_ICONS = {
    'Sunny': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    'Clear': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    'Partly Cloudy': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="3" stroke="#FF9800"/><line x1="12" y1="2" x2="12" y2="4" stroke="#FF9800"/><line x1="5.6" y1="5.6" x2="7" y2="7" stroke="#FF9800"/><line x1="17" y1="7" x2="18.4" y2="5.6" stroke="#FF9800"/><path d="M16 14.5A3.5 3.5 0 1 1 9.5 18H16a4 4 0 1 0 0-8h-.5" stroke="#aaaaaa"/></svg>`,
    'Cloudy': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
    'Light Rain': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4682B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M9 19 6 22"/><path d="m13 19-2 3"/><path d="m16 19-1 3"/></svg>`,
    'Rain': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4682B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M9 19 6 22"/><path d="m13 19-2 3"/><path d="m16 19-1 3"/></svg>`
};

// ──────────────────────────────────────────────
// Location Configuration
// ──────────────────────────────────────────────

const LOCATIONS = [
    { name: "Χαλκηδόνα",    lat: 40.7315937,  lng: 22.59874208, dataFile: "Chalkidona",    weatherFile: "WeatherChalkidona"    },
    { name: "Εύοσμος",      lat: 40.6696845,  lng: 22.91539098, dataFile: "Euosmos",       weatherFile: "WeatherEuosmos"       },
    { name: "Καλαμαριά",    lat: 40.58220224, lng: 22.95315301, dataFile: "Kalamaria",     weatherFile: "WeatherKalamaria"     },
    { name: "Νεάπολη",      lat: 40.6534,     lng: 22.9420,     dataFile: "Neapoli",       weatherFile: "WeatherNeapoli"       },
    { name: "Περαία",        lat: 40.5031,     lng: 22.9296,     dataFile: "Peraia",        weatherFile: "WeatherPeraia"        },
    { name: "Πυλαία",        lat: 40.6009,     lng: 22.9891,     dataFile: "Pylaia",        weatherFile: "WeatherPylaia"        },
    { name: "Σίνδος",        lat: 40.670698,   lng: 22.8034071,  dataFile: "Sindos",        weatherFile: "WeatherSindos"        },
    { name: "Θέρμη",         lat: 40.5485251,  lng: 23.01970203, dataFile: "Thermi",        weatherFile: "WeatherThermi"        },
    { name: "Θεσσαλονίκη",  lat: 40.6401,     lng: 22.9444,     dataFile: "Thessaloniki",  weatherFile: "WeatherThessaloniki"  },
    { name: "Ωραιόκαστρο",  lat: 40.7284342,  lng: 22.91872141, dataFile: "Wraiokastro",   weatherFile: "WeatherWraiokastro"   }
];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// ──────────────────────────────────────────────
// AQI Calculation Utilities
// ──────────────────────────────────────────────

/**
 * Parses a range string like "0-40" or "0–40" into { min, max }.
 */
function parseRange(rangeStr) {
    const normalized = rangeStr.replace('–', '-');
    const [minStr, maxStr] = normalized.split('-');
    return { min: parseFloat(minStr), max: parseFloat(maxStr) };
}

/**
 * Gets AQI category info for a pollutant concentration value.
 * @param {number} value - The concentration value
 * @param {string} pollutantKey - Key in AQI_TABLE (no2, o3, so2)
 * @returns {{ category: string, Clow: number|null, Chigh: number|null }}
 */
function getAQICategoryInfo(value, pollutantKey) {
    for (const entry of AQI_TABLE) {
        const range = entry[pollutantKey];
        if (!range) continue;

        const { min, max } = parseRange(range);
        if (value >= min && value <= max) {
            return { category: entry.category, Clow: min, Chigh: max };
        }
    }
    return { category: "Out of Range", Clow: null, Chigh: null };
}

/**
 * Gets the index range for an AQI category.
 * @param {string} category
 * @returns {{ Ilow: number|null, Ihigh: number|null }}
 */
function getAQIIndexRange(category) {
    const entry = AQI_INDEX.find(e => e.category === category);
    if (entry && entry.range) {
        const [Ilow, Ihigh] = entry.range.split('-').map(Number);
        return { Ilow, Ihigh };
    }
    return { Ilow: null, Ihigh: null };
}

/**
 * Calculates the average of an array of numbers.
 */
function average(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Formats a Date to the short format used in the data files: M/D/YY
 */
function formatDateShort(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const y = date.getFullYear().toString().slice(2);
    return `${m}/${d}/${y}`;
}

// ──────────────────────────────────────────────
// Data Loading
// ──────────────────────────────────────────────

/**
 * Loads AQI data from a JSON file and computes daily AQI values.
 * @param {string} filePath - Path to the JSON file
 * @returns {Object} - Map of date strings to AQI values
 */
async function loadAndProcessAQI(filePath) {
    const result = {};
    try {
        const res = await fetch(filePath);
        const data = await res.json();

        // Group measurements by date
        const grouped = {};
        for (const item of data) {
            const dateObj = new Date(item.time);
            const key = formatDateShort(dateObj);

            if (!grouped[key]) {
                grouped[key] = { no2_conc: [], o3_conc: [], so2_conc: [] };
            }
            grouped[key].no2_conc.push(parseFloat(item.no2_conc));
            grouped[key].o3_conc.push(parseFloat(item.o3_conc));
            grouped[key].so2_conc.push(parseFloat(item.so2_conc));
        }

        // Calculate AQI for each day
        for (const date in grouped) {
            const conc = grouped[date];
            const avg = {
                no2_conc: parseFloat(average(conc.no2_conc).toFixed(2)),
                o3_conc:  parseFloat(average(conc.o3_conc).toFixed(2)),
                so2_conc: parseFloat(average(conc.so2_conc).toFixed(2))
            };

            const aqiResults = [];
            for (const rawKey of ["no2_conc", "o3_conc", "so2_conc"]) {
                const C = avg[rawKey];
                const tableKey = POLLUTANT_MAP[rawKey];
                const { category, Clow, Chigh } = getAQICategoryInfo(C, tableKey);
                const { Ilow, Ihigh } = getAQIIndexRange(category);

                if (Clow !== null && Chigh !== null && Ilow !== null && Ihigh !== null) {
                    const aqiValue = parseFloat(
                        (((Ihigh - Ilow) / (Chigh - Clow)) * (C - Clow) + Ilow).toFixed(2)
                    );
                    aqiResults.push(aqiValue);
                }
            }

            if (aqiResults.length > 0) {
                result[date] = Math.max(...aqiResults);
            }
        }
    } catch (error) {
        console.error(`Error loading AQI data from ${filePath}:`, error);
    }
    return result;
}

/**
 * Loads weather data from a JSON file.
 * @param {string} filePath - Path to the JSON file
 * @returns {Object} - Map of date strings to weather objects
 */
async function loadAndProcessWeather(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const result = {};
        for (const { date, ...rest } of data) {
            const d = new Date(date);
            result[formatDateShort(d)] = rest;
        }
        return result;
    } catch (error) {
        console.error(`Error loading weather data from ${filePath}:`, error);
        return {};
    }
}

// ──────────────────────────────────────────────
// Main Application
// ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function () {
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');

    // Data stores keyed by location name
    const aqiData = {};
    const weatherData = {};

    // Load all data in parallel
    const loadPromises = LOCATIONS.map(async (loc) => {
        const [aqi, weather] = await Promise.all([
            loadAndProcessAQI(`ElementsData/${loc.dataFile}.json`),
            loadAndProcessWeather(`WeatherData/${loc.weatherFile}.json`)
        ]);
        aqiData[loc.name] = aqi;
        weatherData[loc.name] = weather;
    });

    await Promise.all(loadPromises);

    // Hide loading overlay
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => loadingOverlay.remove(), 500);
    }

    // ── App State ──
    let selectedArea = null;
    let selectedDate = null;
    let selectedSensitivity = null;
    let map = null;
    const markers = [];
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // ── DOM References ──
    const weatherWidget = document.getElementById('weather-widget');
    const sensitivityButtons = document.querySelectorAll('.sensitivity-btn');
    const resultContainer = document.getElementById('results');

    // ── Event Listeners ──

    // Sensitivity buttons
    sensitivityButtons.forEach(button => {
        button.addEventListener('click', function () {
            sensitivityButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            selectedSensitivity = this.dataset.sensitivity;
            checkAllSelections();
        });
    });

    // Keyboard navigation for calendar
    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') navigateToPrevMonth();
        else if (event.key === 'ArrowRight') navigateToNextMonth();
    });

    // ── Map Initialization ──

    function initializeMap() {
        map = L.map('map').setView([40.6401, 22.9444], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const initialDate = formatDateShort(new Date());

        LOCATIONS.forEach(loc => {
            const locAqi = aqiData[loc.name]?.[initialDate];
            const locWeather = weatherData[loc.name]?.[initialDate];

            const areaData = {
                name: loc.name,
                lat: loc.lat,
                lng: loc.lng,
                aqi: locAqi,
                temp:     locWeather?.temperature  || '--',
                weather:  locWeather?.description   || 'No Data',
                humidity: locWeather?.humidity       || '--',
                wind:     locWeather?.wind           || '--'
            };

            const markerColor = getMarkerColor(locAqi);

            const marker = L.circleMarker([loc.lat, loc.lng], {
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.5,
                radius: 15
            }).addTo(map);

            marker.areaData = areaData;
            marker.on('click', () => selectArea(marker));

            const aqiText = locAqi !== undefined ? `AQI: ${Math.round(locAqi)}` : 'AQI: No Data';
            marker.bindPopup(`<b>${loc.name}</b><br>${aqiText}<br>${areaData.weather}, ${areaData.temp}°C`);

            markers.push(marker);
        });

        window.addEventListener('resize', () => map.invalidateSize());
    }

    /**
     * Returns the appropriate marker color based on AQI value.
     */
    function getMarkerColor(aqi, sensitivity) {
        if (aqi === undefined) return '#999999';

        if (sensitivity) {
            const thresholds = SENSITIVITY_THRESHOLDS[sensitivity];
            if (aqi < thresholds.good)     return '#4CAF50';
            if (aqi < thresholds.moderate) return '#FF9800';
            return '#F44336';
        }

        // Default color scheme
        if (aqi < 50)  return '#4CAF50';
        if (aqi < 100) return '#FF9800';
        return '#F44336';
    }

    /**
     * Handles area selection on the map.
     */
    function selectArea(marker) {
        if (selectedArea) {
            selectedArea.setStyle({ fillOpacity: 0.5 });
        }

        selectedArea = marker;
        selectedArea.setStyle({ fillOpacity: 0.8 });
        updateWeatherWidget(selectedArea.areaData);
        checkAllSelections();
    }

    // ── Calendar ──

    function generateCalendar(month, year) {
        const today = new Date();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Update header
        document.getElementById('month-year').innerHTML = `
            ${MONTH_NAMES[month]} ${year}
            <div class="calendar-nav">
                <button class="calendar-nav-btn" id="prev-month" aria-label="Previous month">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <button class="calendar-nav-btn" id="next-month" aria-label="Next month">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>
            <div class="calendar-today-wrapper">
                <button class="today-btn" id="today-button">Today</button>
            </div>
        `;

        const calendarBody = document.getElementById('calendar-body');
        calendarBody.innerHTML = '';

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay.getDay()) {
                    const cell = document.createElement('td');
                    cell.classList.add('unavailable');
                    row.appendChild(cell);
                } else if (date > lastDay.getDate()) {
                    break;
                } else {
                    const cell = document.createElement('td');
                    cell.textContent = date;
                    const dayValue = date;

                    if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                        cell.classList.add('today');
                    }

                    cell.addEventListener('click', function () {
                        document.querySelectorAll('.calendar td').forEach(c => c.classList.remove('selected'));
                        cell.classList.add('selected');
                        selectedDate = new Date(year, month, dayValue);
                        updateAllMarkers(formatDateShort(selectedDate));
                        checkAllSelections();
                    });

                    row.appendChild(cell);
                    date++;
                }
            }

            calendarBody.appendChild(row);
            if (date > lastDay.getDate()) break;
        }

        // Attach navigation listeners
        document.getElementById('prev-month').addEventListener('click', navigateToPrevMonth);
        document.getElementById('next-month').addEventListener('click', navigateToNextMonth);
        document.getElementById('today-button').addEventListener('click', goToToday);
    }

    function navigateToPrevMonth() {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        generateCalendar(currentMonth, currentYear);
    }

    function navigateToNextMonth() {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        generateCalendar(currentMonth, currentYear);
    }

    function goToToday() {
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        generateCalendar(currentMonth, currentYear);

        setTimeout(() => {
            const todayCell = document.querySelector('.calendar td.today');
            if (todayCell) {
                document.querySelectorAll('.calendar td').forEach(c => c.classList.remove('selected'));
                todayCell.classList.add('selected');
                selectedDate = today;
                updateAllMarkers(formatDateShort(today));
                checkAllSelections();
                todayCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50);
    }

    // ── Marker Updates ──

    function updateAllMarkers(formattedDate) {
        markers.forEach(marker => {
            const name = marker.areaData.name;

            // Update AQI
            marker.areaData.aqi = aqiData[name]?.[formattedDate];

            // Update weather
            const wd = weatherData[name]?.[formattedDate];
            if (wd) {
                marker.areaData.temp     = wd.temperature;
                marker.areaData.weather  = wd.description;
                marker.areaData.humidity = wd.humidity;
                marker.areaData.wind     = wd.wind;
            } else {
                marker.areaData.temp     = '--';
                marker.areaData.weather  = 'No Data';
                marker.areaData.humidity = '--';
                marker.areaData.wind     = '--';
            }

            // Update marker color
            const color = getMarkerColor(marker.areaData.aqi, selectedSensitivity);
            marker.setStyle({ color, fillColor: color });

            // Update popup
            const aqiText = marker.areaData.aqi !== undefined
                ? `AQI: ${Math.round(marker.areaData.aqi)}`
                : 'AQI: No Data';
            const weatherText = marker.areaData.weather !== 'No Data'
                ? `${marker.areaData.weather}, ${marker.areaData.temp}°C`
                : 'No Data, --°C';
            marker.setPopupContent(`<b>${name}</b><br>${aqiText}<br>${weatherText}`);
        });

        // Refresh results if all selections made
        if (selectedArea && selectedDate && selectedSensitivity) {
            if (selectedArea.areaData.aqi !== undefined) {
                displayResults();
            } else {
                resultContainer.style.display = 'none';
            }
        }

        // Update weather widget for selected area
        if (selectedArea) {
            updateWeatherWidget(selectedArea.areaData);
        }
    }

    // ── Weather Widget ──

    function updateWeatherWidget(area) {
        document.getElementById('weather-location').textContent = area.name;
        document.getElementById('weather-temp').textContent = `${area.temp}°C`;
        document.getElementById('weather-desc').textContent = area.weather;
        document.getElementById('weather-humidity').textContent = `${area.humidity}%`;
        document.getElementById('weather-wind').textContent = `${area.wind} km/h`;

        const iconContainer = document.getElementById('weather-icon');
        iconContainer.innerHTML = WEATHER_ICONS[area.weather] || '';

        weatherWidget.style.display = 'block';
    }

    // ── Selection & Results ──

    function checkAllSelections() {
        // Auto-select low sensitivity if area + date are chosen
        if (selectedArea && selectedDate && !selectedSensitivity) {
            const lowBtn = document.querySelector('.sensitivity-btn.low');
            if (lowBtn) {
                sensitivityButtons.forEach(btn => btn.classList.remove('selected'));
                lowBtn.classList.add('selected');
                selectedSensitivity = 'low';
            }
        }

        if (selectedArea && selectedDate && selectedSensitivity) {
            if (selectedArea.areaData.aqi !== undefined) {
                displayResults();
            } else {
                resultContainer.style.display = 'none';
            }
        } else {
            resultContainer.style.display = 'none';
        }
    }

    function displayResults() {
        const resultMessage = document.getElementById('result-message');
        const resultDetails = document.getElementById('result-details');
        const resultTitle = document.getElementById('result-title');

        const areaData = selectedArea.areaData;
        const aqi = areaData.aqi;
        const thresholds = SENSITIVITY_THRESHOLDS[selectedSensitivity];

        // Determine status
        let status, statusColor;
        if (aqi < thresholds.good) {
            status = 'good';
            statusColor = '#4CAF50';
        } else if (aqi < thresholds.moderate) {
            status = 'moderate';
            statusColor = '#FF9800';
        } else {
            status = 'poor';
            statusColor = '#F44336';
        }

        // Format date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = selectedDate.toLocaleDateString('en-US', options);

        // Build messages
        const messages = {
            good: {
                low:      'It\'s a great time to be outdoors. The air quality poses no concerns.',
                moderate: 'The air is clean — a good opportunity to enjoy some time outdoors.',
                high:     'Safe conditions for outdoor activities. Enjoy the fresh air.'
            },
            moderate: {
                low:      'Outdoor activities are generally fine. Just be mindful of any symptoms.',
                moderate: 'Some may experience discomfort. Light outdoor activity is okay with caution.',
                high:     'Even moderate levels may cause issues. It\'s safer to stay indoors.'
            },
            poor: {
                low:      'Consider limiting time outside. The air may cause mild discomfort.',
                moderate: 'Not recommended to go outside. The air quality may affect breathing.',
                high:     'Stay indoors. The air quality is unhealthy for sensitive individuals.'
            }
        };

        const message = `<strong>${areaData.name}</strong> has ${status} air quality for your planned activity on ${formattedDate}.`;
        const details = messages[status][selectedSensitivity];

        // Update UI
        resultContainer.className = `results ${status}`;
        resultMessage.innerHTML = message;
        resultDetails.textContent = details;
        resultContainer.style.display = 'block';

        // Status icon
        const icons = {
            good: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
            moderate: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
            poor: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
        };

        resultTitle.innerHTML = `${icons[status]} <span style="color: ${statusColor}">Outdoor Activity Guide</span>`;

        // Update marker colors based on sensitivity
        updateMarkersForSensitivity();
    }

    function updateMarkersForSensitivity() {
        markers.forEach(marker => {
            const color = getMarkerColor(marker.areaData.aqi, selectedSensitivity);
            marker.setStyle({ color, fillColor: color });

            if (selectedArea === marker) {
                marker.setStyle({ fillOpacity: 0.8, weight: 3 });
            }
        });
    }

    // ── Initialize ──
    generateCalendar(currentMonth, currentYear);
    initializeMap();
});
