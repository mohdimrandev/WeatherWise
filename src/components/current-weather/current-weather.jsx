import React from "react";
import { Link } from "react-router-dom";

const CurrentWeather = ({ data }) => {
  if (!data) return null;

  console.log("Weather data with timezone:", data);

  if (!data.timezone) {
    console.error("Timezone data is missing from the API response");
    return null;
  }

  const cityNameOnly = data.city.split(",")[0];

  const getLocalTime = () => {
    const localTime = new Date();
    const utcTime = localTime.getTime() + localTime.getTimezoneOffset() * 60000;
    return new Date(utcTime + data.timezone * 1000);
  };

  const cityTime = getLocalTime();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div className="flex justify-between items-start">
          <div>
            <Link
              to={`/${cityNameOnly}`}
              className="text-2xl font-bold text-white hover:text-blue-100 transition-colors"
            >
              {data.city}
            </Link>
            <p className="text-blue-100 mt-1">
              {cityTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-blue-100 text-sm">
              Local Time:{" "}
              {cityTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-white">
              {Math.round(data.main.temp)}°C
            </p>
            <p className="text-blue-100">
              Feels like {Math.round(data.main.feels_like)}°C
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <img
              src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
              alt={data.weather[0].description}
              className="w-12 h-12"
            />
            <span className="text-gray-700 capitalize">
              {data.weather[0].description}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Wind</span>
            <span className="text-gray-700 font-medium">
              {Math.round(data.wind.speed)} m/s
            </span>
          </div>
          #
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Humidity</span>
            <span className="text-gray-700 font-medium">
              {data.main.humidity}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Pressure</span>
            <span className="text-gray-700 font-medium">
              {data.main.pressure} hPa
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Min Temp</span>
            <span className="text-gray-700 font-medium">
              {Math.round(data.main.temp_min)}°C
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Max Temp</span>
            <span className="text-gray-700 font-medium">
              {Math.round(data.main.temp_max)}°C
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Sunrise</span>
            <span className="text-gray-700 font-medium">
              {new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Sunset</span>
            <span className="text-gray-700 font-medium">
              {new Date(data.sys.sunset * 1000).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
