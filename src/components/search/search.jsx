import React, { useState, useCallback } from "react";
import AsyncSelect from "react-select/async";
import { geoApiOptions, GEO_API_URL } from "../../api";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [search, setSearch] = useState(null);
  const navigate = useNavigate();

  const loadOptions = useCallback(async (inputValue) => {
    try {
      if (!inputValue || inputValue.trim().length < 2) 
        return [];

      const trimmedInput = inputValue.trim();

      const response = await fetch(
        `${GEO_API_URL}/cities?namePrefix=${encodeURIComponent(
          trimmedInput
        )}&limit=10&sort=-population`,
        geoApiOptions
      );

      if (!response.ok) {
        console.error(`API Response Status: ${response.status}`);
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return (
        result.data?.map((city) => ({
          value: `${city.latitude} ${city.longitude}`,
          label: `${city.name}, ${city.countryCode}`,
          city: city.name,
          country: city.country,
        })) || []
      );
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }, []);

  const handleOnChange = (selectedOption) => {
    if (selectedOption) {
      navigate(`/${selectedOption.city}`);
    }
    setSearch(selectedOption);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AsyncSelect
        placeholder="Search for a city..."
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        onChange={handleOnChange}
        value={search}
        classNamePrefix="city-select"
        noOptionsMessage={({ inputValue }) =>
          !inputValue
            ? "Start typing to search..."
            : inputValue.length < 2
            ? "Type at least 2 characters"
            : "No cities found"
        }
        loadingMessage={() => "Searching..."}
        isClearable
        unstyled
        classNames={{
          control: (state) =>
            `bg-white border ${
              state.isFocused ? "border-blue-500" : "border-gray-300"
            } 
             rounded-lg p-2 min-h-[46px] w-full transition-colors duration-200`,
          option: (state) =>
            `p-2 ${state.isFocused ? "bg-gray-100" : "bg-white"} 
             cursor-pointer hover:bg-gray-100 transition-colors duration-150`,
          menuList: () =>
            "py-1 divide-y divide-gray-100 /*mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-[300px] overflow-y-auto/*",
          placeholder: () => "text-gray-400",
          input: () => "text-gray-800 focus:outline-none",
          singleValue: () => "text-gray-800",
          noOptionsMessage: () => "p-2 text-gray-500 text-center",
          loadingMessage: () => "p-2 text-gray-500 text-center",
        }}
        components={{
          IndicatorSeparator: null,
        }}
        filterOption={null}
        debounceTimeout={10}
        minInputLength={2}
      />
    </div>
  );
};

export default React.memo(Search);
