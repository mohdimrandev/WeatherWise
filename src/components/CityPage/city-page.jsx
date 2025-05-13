import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { WEATHER_API_URL, WEATHER_API_KEY } from "../../api";

const CityPage = () => {
  const { cityName } = useParams();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityTime, setCityTime] = useState(null);

  const getLocalTime = (timezone) => {
    const localTime = new Date();
    const utcTime = localTime.getTime() + localTime.getTimezoneOffset() * 60000;
    return new Date(utcTime + timezone * 1000);
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
        const response = await fetch(
          `${WEATHER_API_URL}/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error("Weather data not available");
        }

        const data = await response.json();
        setWeatherData(data);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{cityName}</h1>
          {cityTime && (
            <>
              <p className="text-gray-600 mt-2">
                {cityTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-600 text-lg mt-1">
                Local Time:{" "}
                {cityTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-800">
              {Math.round(weatherData.main.temp)}°C
            </div>
            <div className="flex justify-center items-center mt-4">
              <img
                src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
                className="w-16 h-16"
              />
              <span className="text-xl text-gray-600 capitalize">
                {weatherData.weather[0].description}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Feels like</span>
              <span className="font-semibold">
                {Math.round(weatherData.main.feels_like)}°C
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Humidity</span>
              <span className="font-semibold">
                {weatherData.main.humidity}%
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Wind Speed</span>
              <span className="font-semibold">
                {weatherData.wind.speed} m/s
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Pressure</span>
              <span className="font-semibold">
                {weatherData.main.pressure} hPa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityPage;
