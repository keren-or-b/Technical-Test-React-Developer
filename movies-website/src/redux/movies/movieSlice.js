import { createSlice } from "@reduxjs/toolkit";
import { localStorageUtils } from "../../utils/localStorage";
import { DEFAULT_GRID_COLUMNS } from "../../utils/constans";

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
  focusArea: "MOVIE_GRID", // 'menu' או 'movies'
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
    // פעולה לבקשת fetch
    fetchMoviesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // פעולה כשיש הצלחה
    fetchMoviesSuccess: (state, action) => {
      const { results, total_pages } = action.payload;

      state.movies = results;
      state.totalPages = total_pages;
      state.loading = false;

      const isSearch = state.searchTerm.length >= 2;

      if (!isSearch && state.view !== "favorites") {
        const view = state.view; // 'popular' או 'now_playing'
        const page = state.page;

        // יוצרים את האובייקט אם לא קיים
        if (!state.cache[view]) state.cache[view] = {};

        // שומרים את הנתונים + חותמת זמן (אופציונלי, לשימוש עתידי)
        state.cache[view][page] = {
          results,
          total_pages,
          timestamp: Date.now(),
        };
      }
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
      const newPage = action.payload;
      // הגנה בסיסית בתוך ה-Reducer (למרות שגם ה-UI מגן)
      if (newPage >= 1 && newPage <= state.totalPages) {
        state.page = newPage;
      }
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
      const movieId = action.payload.id;
      const index = state.favoriteIds.indexOf(movieId);

      if (index >= 0) {
        // === הסרה ===
        state.favoriteIds.splice(index, 1);

        // עדכון מיידי של התצוגה אם אנחנו במסך המועדפים
        if (state.view === "favorites") {
          // מסננים את הסרט שנמחק מרשימת הסרטים המוצגים
          state.movies = state.movies.filter((m) => m.id !== movieId);
        }
      } else {
        // === הוספה ===
        // אופציונלי: אם את רוצה שהחדשים יהיו ראשונים, תשתמשי ב-unshift
        // state.favoriteIds.unshift(movieId);
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
  incrementFocusIndex,
  decrementFocusIndex,
  setFocusIndex,
  toggleFavorite,
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
// ✅ התיקון: תמיד מחזירים את המערך הראשי
export const selectCurrentMovies = (state) => state.movies.movies;

// ✅ selectIsFavorite נשאר מצוין כמו שהוא (כי הוא בודק IDs)
export const selectIsFavorite = (state, movieId) =>
  state.movies.favoriteIds.includes(movieId);

export const selectTotalPages = (state) => {
  const { view, totalPages, favoriteIds } = state.movies;

  // במועדפים: מחשבים כמה עמודים יש סה"כ לפי אורך המערך
  if (view === "favorites") {
    if (!favoriteIds || favoriteIds.length === 0) return 1;
    return Math.ceil(favoriteIds.length / 20);
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
