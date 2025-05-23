import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Search from "./components/search/search.jsx";
import CityPage from "./components/CityPage/city-page.jsx";
import { TbCurrentLocation } from "react-icons/tb";
import { WEATHER_API_URL, WEATHER_API_KEY } from "./api";

function App() {
  const [locationError, setLocationError] = useState(null);

  const getCurrentLocation = (navigate) => {
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            const response = await fetch(
              `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
            );

            if (!response.ok) {
              throw new Error("Weather data not available");
            }

            const weatherData = await response.json();
            navigate(`/${weatherData.name}`);
          } catch (err) {
            setLocationError(err.message);
          }
        },
        (err) => {
          setLocationError("Unable to access location: " + err.message);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-[1080px] mx-auto py-5 px-4">
          <Routes>
            <Route
              path="/"
              element={
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold text-center text-gray-100 mb-6">Weather Forecast</h1>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <Search />
                    
                    <LocationButton 
                      getCurrentLocation={getCurrentLocation}
                    />
                    
                    {locationError && (
                      <div className="text-red-400 text-sm text-center">
                        {locationError}
                      </div>
                    )}
                  </div>
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

const LocationButton = ({ getCurrentLocation }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    getCurrentLocation(navigate);
  };
  
  return (
    <button
      onClick={handleClick}
      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      <TbCurrentLocation size={20} className="mr-2" />
      <span>Use my current location</span>
    </button>
  );
};

export default App;