import { useState, useEffect } from 'react';
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { WEATHER_API_URL, WEATHER_API_KEY } from "../../api";

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Forecast = ({ data, useFahrenheit, weatherCoords }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [airQualityForecast, setAirQualityForecast] = useState(null);
  
  const dayInAWeek = new Date().getDay();
  const forecastDays = WEEK_DAYS.slice(dayInAWeek, WEEK_DAYS.length).concat(WEEK_DAYS.slice(0, dayInAWeek));
  
  const toggleAccordion = (idx) => {
    setOpenIndex(prevIndex => prevIndex === idx ? null : idx);
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
    return levels[aqi] || { label: "N/A", color: "text-gray-400" };
  };

  useEffect(() => {
    const fetchAirQualityForecast = async () => {
      if (!weatherCoords) return;
      
      try {
        const response = await fetch(
          `${WEATHER_API_URL}/air_pollution/forecast?lat=${weatherCoords.lat}&lon=${weatherCoords.lon}&appid=${WEATHER_API_KEY}`
        );
        
        if (response.ok) {
          const airData = await response.json();
          setAirQualityForecast(airData);
        }
      } catch (error) {
        console.warn("Air quality forecast not available:", error);
      }
    };

    fetchAirQualityForecast();
  }, [weatherCoords]);

  const getAirQualityForDay = (dayIndex) => {
    if (!airQualityForecast || !airQualityForecast.list) return null;
    
    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + dayIndex);
    const targetDate = forecastDate.toDateString();

    const airQualityForDay = airQualityForecast.list.find(item => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate.toDateString() === targetDate;
    });
    
    return airQualityForDay ? airQualityForDay.main.aqi : null;
  };

  return (
    <div className="mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-3 sm:mb-4">Daily Forecast</h2>
      <div className="space-y-2 sm:space-y-3">
        {data.list.slice(0, 7).map((item, idx) => {
          const airQuality = getAirQualityForDay(idx);
          const airQualityLevel = airQuality ? getAirQualityLevel(airQuality) : { label: "N/A", color: "text-gray-400" };
          
          return (
            <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                className="w-full bg-gray-700 hover:bg-gray-600 p-3 transition-colors"
                onClick={() => toggleAccordion(idx)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
                      className="w-8 h-8" 
                      alt={item.weather[0].description} 
                    />
                    <span className="text-gray-100 font-medium ml-1 sm:ml-2">
                      {forecastDays[idx]}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="text-right mr-2">
                      <div className="text-gray-300 text-sm sm:text-base">
                        {convertTemp(item.main.temp_max)}{getTempUnit()} / {convertTemp(item.main.temp_min)}{getTempUnit()}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm capitalize">
                        {item.weather[0].description}
                      </div>
                    </div>
                    
                    {openIndex === idx ? (
                      <TbChevronUp className="text-gray-300" size={20} />
                    ) : (
                      <TbChevronDown className="text-gray-300" size={20} />
                    )}
                  </div>
                </div>
              </button>
              
              {openIndex === idx && (
                <div className="bg-gray-800 p-3 sm:p-4">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pressure:</span>
                      <span className="text-gray-200">{item.main.pressure} hPa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Humidity:</span>
                      <span className="text-gray-200">{item.main.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Clouds:</span>
                      <span className="text-gray-200">{item.clouds.all}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wind:</span>
                      <span className="text-gray-200">{item.wind.speed} m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Air Quality:</span>
                      <span className={`${airQualityLevel.color}`}>{airQualityLevel.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Feels like:</span>
                      <span className="text-gray-200">{convertTemp(item.main.feels_like)}{getTempUnit()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Forecast;