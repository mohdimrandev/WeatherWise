import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WEATHER_API_URL, WEATHER_API_KEY } from "../../api";
import Forecast from "../forecast/forecast.jsx";
import { TbTemperatureCelsius, TbTemperatureFahrenheit, TbCurrentLocation } from "react-icons/tb";

const CityPage = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityTime, setCityTime] = useState(null);
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  const getLocalTime = (timezone) => {
    const localTime = new Date();
    const utcTime = localTime.getTime() + localTime.getTimezoneOffset() * 60000;
    return new Date(utcTime + timezone * 1000);
  };

  const convertTemp = (temp) => {
    if (useFahrenheit) {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const getTempUnit = () => {
    return useFahrenheit ? "°F" : "°C";
  };

  const getAirQualityLevel = (aqi) => {
    const levels = {
      1: { label: "Good", color: "text-green-400" },
      2: { label: "Fair", color: "text-yellow-400" },
      3: { label: "Moderate", color: "text-orange-400" },
      4: { label: "Poor", color: "text-red-400" },
      5: { label: "Very Poor", color: "text-red-600" }
    };
    return levels[aqi];
  };
  
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            const [weatherResponse, forecastResponse, airQualityResponse] = await Promise.all([
              fetch(
                `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
              ),
              fetch(
                `${WEATHER_API_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
              ),
              fetch(
                `${WEATHER_API_URL}/air_pollution?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
              )
            ]);

            if (!weatherResponse.ok || !forecastResponse.ok) {
              throw new Error("Weather data not available");
            }

            const [weatherData, forecastData, airQualityData] = await Promise.all([
              weatherResponse.json(),
              forecastResponse.json(),
              airQualityResponse.ok ? airQualityResponse.json() : null
            ]);

            setWeatherData(weatherData);
            setForecastData(forecastData);
            setAirQualityData(airQualityData);
            navigate(`/${weatherData.name}`);
          } catch (err) {
            setError(err.message);
          }
        },
        (err) => {
          setError("Unable to access location. " + err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    let timeInterval;
    if (weatherData?.timezone) {
      setCityTime(getLocalTime(weatherData.timezone));
      timeInterval = setInterval(() => {
        setCityTime(getLocalTime(weatherData.timezone));
      }, 60000);
    }
    return () => clearInterval(timeInterval);
  }, [weatherData]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const [weatherResponse, forecastResponse] = await Promise.all([
          fetch(
            `${WEATHER_API_URL}/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`
          ),
          fetch(
            `${WEATHER_API_URL}/forecast?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`
          )
        ]);

        if (!weatherResponse.ok) {
          throw new Error("Weather data not available");
        }

        if (!forecastResponse.ok) {
          throw new Error("Forecast data not available");
        }

        const [weatherData, forecastData] = await Promise.all([
          weatherResponse.json(),
          forecastResponse.json()
        ]);

        try {
          const airQualityResponse = await fetch(
            `${WEATHER_API_URL}/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${WEATHER_API_KEY}`
          );
          
          if (airQualityResponse.ok) {
            const airQualityData = await airQualityResponse.json();
            setAirQualityData(airQualityData);
          }
        } catch (err) {
          console.warn("Air quality data not available:", err);
        }

        setWeatherData(weatherData);
        setForecastData(forecastData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (cityName) {
      fetchWeatherData();
    }
  }, [cityName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-red-400 text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>Weather data not available for {cityName}</p>
          <button 
            onClick={() => navigate("/")}
            className="text-blue-400 hover:text-blue-300 inline-block mt-4"
          >
            Return to search
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData || !forecastData) return null;

  const airQualityLevel = airQualityData ? getAirQualityLevel(airQualityData.list[0].main.aqi) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 text-gray-100">
        <div className="relative text-center mb-6">
          <div className="absolute right-0 top-0 flex space-x-2">
            <button
              onClick={getCurrentLocation}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 p-2 rounded-full transition-all"
              title="Use current location"
            >
              <TbCurrentLocation size={20} />
            </button>
            
            <div className="flex items-center bg-gray-700 rounded-full p-1 w-20 h-8">
              <button 
                className={`w-10 h-6 rounded-full flex items-center justify-center transition-all ${
                  !useFahrenheit ? 'bg-blue-500 text-white' : 'text-gray-400'
                }`}
                onClick={() => setUseFahrenheit(false)}
              >
                <TbTemperatureCelsius size={16} />
              </button>
              <button 
                className={`w-10 h-6 rounded-full flex items-center justify-center transition-all ${
                  useFahrenheit ? 'bg-blue-500 text-white' : 'text-gray-400'
                }`}
                onClick={() => setUseFahrenheit(true)}
              >
                <TbTemperatureFahrenheit size={16} />
              </button>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-4xl font-bold mx-auto pt-10 sm:pt-0 text-white">
            {cityName}
          </h1>
          
          {cityTime && (
            <div className="mt-2">
              <p className="text-gray-400 text-sm">
                {cityTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-300 text-sm sm:text-base mt-1">
                Local Time:{" "}
                {cityTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center flex flex-col justify-center">
            <div className="text-5xl sm:text-6xl font-bold text-white mb-2">
              {convertTemp(weatherData.main.temp)}{getTempUnit()}
            </div>
            <div className="flex justify-center items-center mt-2 sm:mt-4">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
                className="w-14 h-14 sm:w-16 sm:h-16"
              />
              <span className="text-lg sm:text-xl text-gray-300 capitalize">
                {weatherData.weather[0].description}
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-400">Feels like</span>
              <span className="font-semibold">
                {convertTemp(weatherData.main.feels_like)}{getTempUnit()}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-400">Humidity</span>
              <span className="font-semibold">
                {weatherData.main.humidity}%
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-400">Wind Speed</span>
              <span className="font-semibold">
                {weatherData.wind.speed} m/s
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-400">Pressure</span>
              <span className="font-semibold">
                {weatherData.main.pressure} hPa
              </span>
            </div>
            {airQualityLevel && (
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <span className="text-gray-400">Air Quality</span>
                <span className={`font-semibold ${airQualityLevel.color}`}>
                  {airQualityLevel.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {forecastData && <Forecast data={forecastData} useFahrenheit={useFahrenheit} weatherCoords={weatherData.coord} />}
      </div>
    </div>
  );
};

export default CityPage;