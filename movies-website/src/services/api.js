import axios from "axios";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  params: {
    api_key: API_KEY,
    language: "he-IL",
  },
});

// Centralized response error handler — catches network errors and known HTTP status codes
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error or request timeout
    if (!error.response || error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Connection error — please check your internet connection"),
      );
    }

    const { status } = error.response;

    switch (status) {
      case 401:
        return Promise.reject(new Error("Invalid API key"));
      case 404:
        return Promise.reject(new Error("Content not found"));
      default:
        return Promise.reject(new Error("An unexpected server error occurred"));
    }
  },
);

// --- API Methods ---
export const moviesAPI = {
  getPopularMovies: async (page = 1) => {
    const response = await apiClient.get("/movie/popular", {
      params: { page },
    });
    return response.data;
  },

  getAiringNow: async (page = 1) => {
    const response = await apiClient.get("/movie/now_playing", {
      params: { page },
    });
    return response.data;
  },

  // Guard against short queries before hitting the API
  searchMovies: async (query, page = 1) => {
    if (!query || query.length < 2) {
      return { results: [], total_pages: 0 };
    }

    const response = await apiClient.get("/search/movie", {
      params: { query, page },
    });
    return response.data;
  },

  getMovieDetails: async (movieId) => {
    const response = await apiClient.get(`/movie/${movieId}`);
    return response.data;
  },
};
