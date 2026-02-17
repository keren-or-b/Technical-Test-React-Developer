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

// === Interceptor: טיפול מרכזי בשגיאות ===
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // שגיאת רשת או timeout
    if (!error.response || error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("שגיאת תקשורת - נא לבדוק את החיבור לאינטרנט"),
      );
    }

    const { status } = error.response;

    // טיפול בשגיאות נפוצות
    switch (status) {
      case 401:
        return Promise.reject(new Error("מפתח API לא תקין"));
      case 404:
        return Promise.reject(new Error("התוכן לא נמצא"));
      default:
        return Promise.reject(new Error("אירעה שגיאה כללית בשרת"));
    }
  },
);

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
