// services/api.js
import axios from "axios";

const API_BASE_URL = "https://api.themoviedb.org/3";
// שימי לב: תוודאי שיש לך את המשתנה הזה בקובץ .env
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// יצירת מופע של אקסיוס עם הגדרות בסיס
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 שניות
  params: {
    api_key: API_KEY,
    language: "he-IL", // אופציונלי: אם את רוצה תוצאות בעברית
  },
});

// === Interceptor: טיפול מרכזי בשגיאות ===
// זה החלק החכם שחוסך לך try/catch בכל מקום באפליקציה
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

// === פונקציות ה-API ===
// פשוטות, בלי עטיפות מיותרות

export const moviesAPI = {
  // 1. קבלת סרטים פופולריים
  getPopularMovies: async (page = 1) => {
    const response = await apiClient.get("/movie/popular", {
      params: { page },
    });
    return response.data;
  },

  // 2. קבלת סרטים שמשודרים עכשיו
  getAiringNow: async (page = 1) => {
    const response = await apiClient.get("/movie/now_playing", {
      params: { page },
    });
    return response.data;
  },

  // 3. חיפוש סרטים
  searchMovies: async (query, page = 1) => {
    // מניעת שליחת בקשה סתם אם אין מספיק תווים
    if (!query || query.length < 2) {
      return { results: [], total_pages: 0 };
    }

    const response = await apiClient.get("/search/movie", {
      params: { query, page },
    });
    return response.data;
  },

  // 4. פרטי סרט
  getMovieDetails: async (movieId) => {
    const response = await apiClient.get(`/movie/${movieId}`);
    return response.data;
  },
};
