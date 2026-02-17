import { createSlice } from "@reduxjs/toolkit";
import { localStorageUtils } from "../../utils/localStorage";
import { DEFAULT_GRID_COLUMNS } from "../../utils/constants";

const initialState = {
  movies: [],
  gridColumns: DEFAULT_GRID_COLUMNS,
  movieDetails: null,

  favoriteIds: localStorageUtils.getFavoritesIds(),
  loading: false,
  error: null,
  totalPages: 1,
  page: 1,
  view: "popular",
  searchTerm: "",
  focusArea: "MOVIE_GRID",
  focusIndex: 0,
  cache: {
    popular: {},
    now_playing: {},
  },
};

const movieSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    appStarted: (state) => {
      // הפעולה הזו לא צריכה לעשות כלום ב-State,
      // היא רק "סיגנל" עבור הסאגה.
    },

    fetchMoviesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchMoviesSuccess: (state, action) => {
      const { results, total_pages } = action.payload;

      state.movies = results;
      state.totalPages = total_pages;
      state.loading = false;

      const isSearch = state.searchTerm.length >= 2;

      if (!isSearch && state.view !== "favorites") {
        const view = state.view;
        const page = state.page;

        if (!state.cache[view]) state.cache[view] = {};

        state.cache[view][page] = {
          results,
          total_pages,
          timestamp: Date.now(),
        };
      }
    },
    fetchMoviesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

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
    setView: (state, action) => {
      if (state.view !== action.payload) {
        state.view = action.payload;
        state.page = 1;
      }
    },
    setPage: (state, action) => {
      const newPage = action.payload;
      if (newPage >= 1 && newPage <= state.totalPages) {
        state.page = newPage;
      }
    },

    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.page = 1;

      if (state.searchTerm.length > 0 && state.view === "favorites") {
        state.view = "popular";
        state.movies = [];
      }
    },

    setFocusArea: (state, action) => {
      state.focusArea = action.payload;
    },

    setFocusIndex: (state, action) => {
      state.focusIndex = action.payload;
    },

    toggleFavorite: (state, action) => {
      const movieId = action.payload.id;
      const index = state.favoriteIds.indexOf(movieId);

      if (index >= 0) {
        state.favoriteIds.splice(index, 1);

        if (state.view === "favorites") {
          state.movies = state.movies.filter((m) => m.id !== movieId);
        }
      } else {
        state.favoriteIds.push(movieId);
      }

      localStorageUtils.saveFavoritesIds(state.favoriteIds);
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
  setView,
  setPage,
  setSearchTerm,
  setFocusArea,
  setFocusIndex,
  toggleFavorite,
} = movieSlice.actions;

export const selectCurrentMovies = (state) => state.movies.movies;
export const selectFavorites = (state) => state.movies.favoriteIds;
export const selectMovieDetails = (state) => state.movies.movieDetails;
export const selectIsLoading = (state) => state.movies.loading;
export const selectError = (state) => state.movies.error;
export const selectCurrentView = (state) => state.movies.view;
export const selectSearchTerm = (state) => state.movies.searchTerm;
export const selectPage = (state) => state.movies.page;
export const selectFocusArea = (state) => state.movies.focusArea;
export const selectFocusIndex = (state) => state.movies.focusIndex;
export const selectGridColumns = (state) => state.movies.gridColumns;

export const selectIsFavorite = (state, movieId) =>
  state.movies.favoriteIds.includes(movieId);

export const selectTotalPages = (state) => {
  const { view, totalPages, favoriteIds } = state.movies;

  if (view === "favorites") {
    if (!favoriteIds || favoriteIds.length === 0) return 1;
    return Math.ceil(favoriteIds.length / 20);
  }

  return totalPages;
};

export const selectHasMovies = (state) => {
  const currentMovies = selectCurrentMovies(state);
  return currentMovies.length > 0;
};


export default movieSlice.reducer;
