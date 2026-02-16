// ✅ movieSlice.fixed.js - הפרדת אחריות נכונה

import { createSlice } from "@reduxjs/toolkit";
import { localStorageUtils } from "../../utils/localStorage";

const initialState = {
  // Data
  movies: [],
  movieDetails: null,
  favorites: localStorageUtils.getFavorites(),
  
  // UI State
  loading: false,
  error: null,
  
  // Pagination
  totalPages: 1,
  page: 1,
  
  // View Management
  view: "popular", // popular | now_playing | favorites
  searchTerm: "",
  
  // Navigation State (פשוט יותר)
  focusArea: "MOVIE_GRID", // SEARCH | NAV_BAR | MOVIE_GRID | PAGINATION
  focusIndex: 0, // אינד
};

const movieSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    // ==================
    // App Lifecycle
    // ==================
    appStarted: (state) => {
      // טריגר בלבד - הסאגה תטפל
    },

    // ==================
    // Data Fetching
    // ==================
    fetchMoviesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchMoviesSuccess: (state, action) => {
      state.loading = false;
      state.movies = action.payload.results;
      state.totalPages = action.payload.total_pages;
      state.focusIndex = 0; // איפוס פוקוס לסרט הראשון
    },

    fetchMoviesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ==================
    // Movie Details
    // ==================
    fetchMovieDetailsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchMovieDetailsSuccess: (state, action) => {
      state.loading = false;
      state.movieDetails = action.payload;
    },

    fetchMovieDetailsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearMovieDetails: (state) => {
      state.movieDetails = null;
    },

    // ==================
    // View Management
    // ==================
    setView: (state, action) => {
      if (state.view !== action.payload) {
        state.view = action.payload;
        state.page = 1;
        state.focusIndex = 0;
      }
    },

    setPage: (state, action) => {
      state.page = action.payload;
      state.focusIndex = 0; // איפוס פוקוס בעמוד חדש
    },

    // ==================
    // Search
    // ==================
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.page = 1;
      
      // אם יש טקסט חיפוש ואנחנו במועדפים -> חזור לפופולרי
      if (state.searchTerm.length > 0 && state.view === "favorites") {
        state.view = "popular";
      }
    },

    clearSearch: (state) => {
      state.searchTerm = "";
      state.page = 1;
    },

    // ==================
    // Navigation (מופשט)
    // ==================
    setFocusArea: (state, action) => {
      state.focusArea = action.payload;
      // state.focusIndex = 0;
    },

    incrementFocusIndex: (state, action) => {
      const max = action.payload?.max || Infinity;
      state.focusIndex = Math.min(state.focusIndex + 1, max);
    },

    decrementFocusIndex: (state, action) => {
      state.focusIndex = Math.max(state.focusIndex - 1, 0);
    },

    setFocusIndex: (state, action) => {
      state.focusIndex = action.payload;
    },

    // ==================
    // Favorites
    // ==================
    toggleFavorite: (state, action) => {
      const movie = action.payload;
      const exists = state.favorites.some((f) => f.id === movie.id);
      
      if (exists) {
        state.favorites = state.favorites.filter((f) => f.id !== movie.id);
      } else {
        state.favorites.push(movie);
      }
      
      localStorageUtils.saveFavorites(state.favorites);
    },

    // ==================
    // Error Handling
    // ==================
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  appStarted,
  fetchMoviesRequest,
  fetchMoviesSuccess,
  fetchMoviesFailure,
  fetchMovieDetailsRequest,
  fetchMovieDetailsSuccess,
  fetchMovieDetailsFailure,
  clearMovieDetails,
  setView,
  setPage,
  setSearchTerm,
  clearSearch,
  setFocusArea,
  incrementFocusIndex,
  decrementFocusIndex,
  setFocusIndex,
  toggleFavorite,
  clearError,
} = movieSlice.actions;

export default movieSlice.reducer;

// ==================
// Selectors (מומלץ להוסיף)
// ==================
export const selectMovies = (state) => state.movies.movies;
export const selectCurrentMovies = (state) => 
  state.movies.view === "favorites" 
    ? state.movies.favorites 
    : state.movies.movies;
export const selectIsLoading = (state) => state.movies.loading;
export const selectError = (state) => state.movies.error;
export const selectCurrentView = (state) => state.movies.view;
export const selectFocusArea = (state) => state.movies.focusArea;
export const selectFocusIndex = (state) => state.movies.focusIndex;
