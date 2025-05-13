import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "./components/search/search.jsx";
import CurrentWeather from "./components/current-weather/current-weather.jsx";
// import Forecast from "./components/forecast/forecast.jsx";
import CityPage from "./components/CityPage/city-page.jsx";
import { WEATHER_API_URL, WEATHER_API_KEY } from "./api.jsx";

function App() {
  const [weatherData, setWeatherData] = useState({
    current: null,
    // forecast: null,
  });

  const handleOnSearchChange = useCallback(async (searchData) => {
    try {
      const [lat, lon] = searchData.value.split(" ");
      const [weatherRes, /*forecastRes*/] = await Promise.all([
        fetch(
          `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        ),
        // fetch(
        //   `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        // ),
      ]);

      const [weather, /*forecast*/] = await Promise.all([
        weatherRes.json(),
        // forecastRes.json(),
      ]);

      setWeatherData({
        current: {
          city: searchData.label,
          ...weather,
          timezone: weather.timezone,
        },
        // forecast: { city: searchData.label, ...forecast },
      });
    } catch (err) {
      console.error("Error fetching weather data:", err);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1080px] mx-auto py-5 px-4">
          <Routes>
            <Route
              path="/"
              element={
                <div className="space-y-6">
                  <Search onSearchChange={handleOnSearchChange} />
                  {weatherData.current && (
                    <CurrentWeather data={weatherData.current} />
                  )}
                  {/* {weatherData.forecast && (
                    <Forecast data={weatherData.forecast} />
                  )} */}
                </div>
              }
            />
            <Route path="/:cityName" element={<CityPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
