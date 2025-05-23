import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { WEATHER_API_URL, WEATHER_API_KEY } from "../../api";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [search, setSearch] = useState(null);
  const navigate = useNavigate();

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const searchCities = async (inputValue) => {
    if (!inputValue) return [];

    try {
      const response = await fetch(
        `${WEATHER_API_URL}/find?q=${inputValue}&type=like&sort=population&cnt=10&appid=${WEATHER_API_KEY}`
      );

      if (!response.ok) return [];
      const result = await response.json();
      if (!result.list) return [];

      return result.list.map((city) => ({
        value: `${city.name}|${city.sys.country}|${city.coord.lat}|${city.coord.lon}`,
        label: `${city.name}, ${city.sys.country}`,
        city: city.name,
        countryCode: city.sys.country,
        latitude: city.coord.lat,
        longitude: city.coord.lon,
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const loadOptions = debounce((inputValue, callback) => {
    searchCities(inputValue).then(callback);
  }, 150);

  const handleOnChange = (selectedOption) => {
    setSearch(selectedOption);
    if (selectedOption) {
      navigate(`/${selectedOption.city}`);
    }
  };

  return (
    <div className="w-full sm:max-w-md mx-auto">
      <AsyncSelect
        placeholder="Search for a city..."
        loadOptions={loadOptions}
        onChange={handleOnChange}
        value={search}
        isClearable
        noOptionsMessage={() => "No cities found"}
        loadingMessage={() => "Searching..."}
        unstyled
        classNames={{
          control: (state) =>
            `bg-gray-800 border ${
              state.isFocused ? "border-blue-500" : "border-gray-700"
            } rounded-lg p-2 min-h-[46px] w-full transition-colors`,
          option: (state) =>
            `p-2 ${state.isFocused ? "bg-gray-700" : "bg-gray-800"}
              cursor-pointer hover:bg-gray-700 transition-colors`,
          menuList: () =>
            "py-1 divide-y divide-gray-700 mt-1 border border-gray-700 rounded-lg bg-gray-800 shadow-lg max-h-[300px] overflow-y-auto",
          placeholder: () => "text-gray-400",
          input: () => "text-gray-200",
          singleValue: () => "text-gray-200",
          noOptionsMessage: () => "p-2 text-gray-400 text-center",
          loadingMessage: () => "p-2 text-gray-400 text-center"
        }}
        components={{
          IndicatorSeparator: null,
        }}
      />
    </div>
  );
};

export default Search;