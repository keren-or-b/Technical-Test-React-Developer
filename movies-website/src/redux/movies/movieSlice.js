import { createSlice } from "@reduxjs/toolkit";
import { localStorageUtils } from "../../utils/localStorage";
import { getViewByIndex } from "../../services/navigationService";

const initialState = {
  movies: [],
  gridColumns: 4,
  movieDetails: null,
  favorites: localStorageUtils.getFavorites(),
  loading: false,
  error: null,
  totalPages: 1,
  page: 1,
  view: "popular",
  searchTerm: "",
  focusArea: "MOVIE_GRID", // 'menu' או 'movies'
  focusIndex: 0,
};

const movieSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    appStarted: (state) => {
      // הפעולה הזו לא צריכה לעשות כלום ב-State,
      // היא רק "סיגנל" עבור הסאגה.
    },
    // פעולה לבקשת fetch
    fetchMoviesRequest: (state) => {
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

    fetchMovieDetailsRequest: (state, action) => {
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
    // החלפת view בין popular / now_playing / favorites
    setView: (state, action) => {
      if (state.view !== action.payload) {
        state.view = action.payload;
        state.page = 1;
      }
    },
    // שינוי עמוד
    setPage: (state, action) => {
      state.page = action.payload;
    },
    // שינוי searchTerm
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.page = 1; // תמיד מאפסים עמוד בחיפוש חדש

      // הלוגיקה החדשה:
      // אם יש טקסט בחיפוש והמשתמש נמצא במועדפים -> החזר אותו לפופולרי
      // (כדי שיוכל לראות את תוצאות החיפוש שיגיעו מה-API)
      if (state.searchTerm.length > 0 && state.view === "favorites") {
        state.view = "popular";
        state.movies = []; // אופציונלי: ניקוי סרטים קודמים כדי למנוע בלבול עד שהתוצאות יגיעו
      }
    },
    
    /**
     * שינוי אזור הפוקוס
     */
    setFocusArea: (state, action) => {
      state.focusArea = action.payload;
      // state.focusIndex = 0; // איפוס אינדקס באזור חדש
    },

    /**
     * הגדלת אינדקס הפוקוס
     */
    incrementFocusIndex: (state) => {
      state.focusIndex += 1;
    },

    /**
     * הקטנת אינדקס הפוקוס
     */
    decrementFocusIndex: (state) => {
      state.focusIndex = Math.max(0, state.focusIndex - 1);
    },

    /**
     * הגדרת אינדקס ספציפי
     */
    setFocusIndex: (state, action) => {
      state.focusIndex = action.payload;
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
      localStorageUtils.saveFavorites(state.favorites);
    },
   
  },
  // ==========================================
  // clearError: (state) => {
  //   state.error = null;
  // },
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
  selectCategory,
  setSearchTerm,
  selectCategoryByFocus,
  setFocusArea,
  incrementFocusIndex,
  decrementFocusIndex,
  setFocusIndex,
  // moveGridFocus,
  toggleFavorite,
  clearError,
} = movieSlice.actions;

// Basic selectors
export const selectMovies = (state) => state.movies.movies;
export const selectFavorites = (state) => state.movies.favorites;
export const selectMovieDetails = (state) => state.movies.movieDetails;
export const selectIsLoading = (state) => state.movies.loading;
export const selectError = (state) => state.movies.error;

// View selectors
export const selectCurrentView = (state) => state.movies.view;
export const selectSearchTerm = (state) => state.movies.searchTerm;
export const selectPage = (state) => state.movies.page;

// Navigation selectors
export const selectFocusArea = (state) => state.movies.focusArea;
export const selectFocusIndex = (state) => state.movies.focusIndex;
export const selectGridColumns = (state) => state.movies.gridColumns;

// Computed selectors
// redux/movies/movieSlice.js

// ... שאר הסלקטורים למעלה ...

// === תיקון: החזרת הלוגיקה החכמה ===

export const selectCurrentMovies = (state) => {
  const { view, movies, favorites, page } = state.movies;

  // במועדפים: אנחנו מבצעים פג'ינציה ידנית (Client Side)
  if (view === "favorites") {
    const ITEMS_PER_PAGE = 20;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return favorites.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }

  // ברגיל: השרת כבר נותן לנו 20 תוצאות
  return movies;
};

export const selectTotalPages = (state) => {
  const { view, totalPages, favorites } = state.movies;

  // במועדפים: מחשבים כמה עמודים יש סה"כ לפי אורך המערך
  if (view === "favorites") {
    if (!favorites || favorites.length === 0) return 1;
    return Math.ceil(favorites.length / 20);
  }

  return totalPages;
};

// ... שאר הסלקטורים (selectHasMovies וכו')
export const selectHasMovies = (state) => {
  const currentMovies = selectCurrentMovies(state);
  return currentMovies.length > 0;
};

export const selectFocusedMovie = (state) => {
  const currentMovies = selectCurrentMovies(state);
  const focusIndex = state.movies.focusIndex;
  return currentMovies[focusIndex] || null;
};

export const selectCanNavigateUp = (state) => {
  const { focusArea, focusIndex, gridColumns } = state.movies;

  if (focusArea === "MOVIE_GRID") {
    return focusIndex >= gridColumns; // יש שורה מעליו
  }
  return true; // תמיד אפשר לעלות מאזורים אחרים
};

export const selectCanNavigateDown = (state) => {
  const { focusArea, focusIndex, gridColumns } = state.movies;
  const currentMovies = selectCurrentMovies(state);

  if (focusArea === "MOVIE_GRID") {
    const nextRowIndex = focusIndex + gridColumns;
    return nextRowIndex < currentMovies.length; // יש שורה מתחתיו
  }
  return true;
};

export default movieSlice.reducer;
