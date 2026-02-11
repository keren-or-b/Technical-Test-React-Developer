import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movies: [],
  favorites: [],
  loading: false,
  error: null,
  totalPages: 1,
  page: 1,
  view: "popular",
  searchTerm: "",
};

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    // פעולה לבקשת fetch
    fetchMoviesRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    // פעולה כשיש הצלחה
    fetchMoviesSuccess: (state, action) => {
      state.loading = false;
      state.movies = action.payload.results;
      state.totalPages = action.payload.total_pages;
    },
    // פעולה כשיש שגיאה
    fetchMoviesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // החלפת view בין popular / now_playing / favorites
    setView: (state, action) => {
      state.view = action.payload;
      state.page = 1;
    },
    // שינוי עמוד
    setPage: (state, action) => {
      state.page = action.payload;
    },
    // שינוי searchTerm
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.page = 1;
    },
    // ניהול favorites ב-localStorage
    toggleFavorite: (state, action) => {
      const movie = action.payload;
      const exists = state.favorites.some((f) => f.id === movie.id);
      if (exists) {
        state.favorites = state.favorites.filter((f) => f.id !== movie.id);
      } else {
        state.favorites.push(movie);
      }
      localStorage.setItem("favorites", JSON.stringify(state.favorites));
    },
    loadFavorites: (state) => {
      const saved = localStorage.getItem("favorites");
      if (saved) state.favorites = JSON.parse(saved);
    },
  },
});

export const {
  fetchMoviesRequest,
  fetchMoviesSuccess,
  fetchMoviesFailure,
  setView,
  setPage,
  setSearchTerm,
  toggleFavorite,
  loadFavorites,
} = moviesSlice.actions;

export default moviesSlice.reducer;
