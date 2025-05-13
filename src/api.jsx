const API_CONFIG = {
  GEO_API_KEY: "2db5270a73mshecf4f296f493ee7p1e2874jsna31a52c3786c",
  WEATHER_API_KEY: "1db03b9a6c4a429f44b23db54ab3a5a0",
};

export const geoApiOptions = {
  method: "GET",
  headers: {
    "x-rapidapi-key": API_CONFIG.GEO_API_KEY,
    "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
  },
};

export const GEO_API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";
export const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";
export const WEATHER_API_KEY = API_CONFIG.WEATHER_API_KEY;
