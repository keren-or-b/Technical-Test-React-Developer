import { createSlice } from "@reduxjs/toolkit";
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};
const initialState = {
  areas: ["SEARCH", "NAV_BAR", "MOVIE_GRID", "PAGINATION"],
  movies: [],
  movieDetails: null,

  favorites: loadFromStorage(),
  loading: false,
  error: null,
  totalPages: 1,
  page: 1,
  view: "popular",
  searchTerm: "",
  currentArea: "MOVIE_GRID", // 'menu' או 'movies'
  navIndex: 0, // 0: Popular, 1: Now Playing, 2: Favorites
  movieIndex: 0,
  paginationIndex: 0, // 0 = Prev, 1 = Next
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
      state.page = 1; // תמיד מאפסים עמוד בחיפוש חדש

      // הלוגיקה החדשה:
      // אם יש טקסט בחיפוש והמשתמש נמצא במועדפים -> החזר אותו לפופולרי
      // (כדי שיוכל לראות את תוצאות החיפוש שיגיעו מה-API)
      if (state.searchTerm.length > 0 && state.view === "favorites") {
        state.view = "popular";
        state.movies = []; // אופציונלי: ניקוי סרטים קודמים כדי למנוע בלבול עד שהתוצאות יגיעו
      }
    },
    moveFocus: (state, action) => {
      const { key, area, index } = action.payload;
      const columns = 4;
      const totalMovies =
        state.view === "favorites"
          ? state.favorites.length
          : state.movies.length;

      // ========================
      // MOUSE SUPPORT
      // ========================
      if (area) {
        state.currentArea = area;

        if (area === "NAV_BAR") {
          state.navIndex = index;
        }

        if (area === "MOVIE_GRID") {
          state.movieIndex = index;
        }

        if (area === "PAGINATION") {
          state.paginationIndex = index;
        }

        return;
      }
      // ========================
      // ESCAPE – עולה אזור אחד למעלה
      // ========================
      if (key === "Escape") {
        if (state.currentArea === "PAGINATION") {
          state.currentArea = "MOVIE_GRID";
          return;
        }

        if (state.currentArea === "MOVIE_GRID") {
          state.currentArea = "NAV_BAR";
          state.movieIndex = 0;
          return;
        }

        if (state.currentArea === "SEARCH") {
          state.currentArea = "NAV_BAR";
          state.searchTerm = ""; // אם רוצים גם לנקות חיפוש
          return;
        }

        // אם כבר ב-NAV_BAR → לא עושים כלום
        return;
      }
      // ========================
      // SEARCH
      // ========================
      if (state.currentArea === "SEARCH") {
        if (key === "ArrowDown") {
          state.currentArea = "NAV_BAR";
        }
      }

      // ========================
      // NAV BAR
      // ========================
      else if (state.currentArea === "NAV_BAR") {
        if (key === "ArrowRight")
          state.navIndex = Math.min(state.navIndex + 1, 2);
        if (key === "ArrowLeft")
          state.navIndex = Math.max(state.navIndex - 1, 0);
        if (key === "ArrowDown") {
          if (totalMovies > 0) {
            state.currentArea = "MOVIE_GRID";
            state.movieIndex = 0; // תמיד מתחיל מהסרט הראשון
          }
        }
        if (key === "ArrowUp") {
          state.currentArea = "SEARCH";
        }
      }
      // ========================
      // MOVIE GRID
      // ========================
      else if (state.currentArea === "MOVIE_GRID") {
        if (key === "ArrowRight")
          state.movieIndex = Math.min(state.movieIndex + 1, totalMovies - 1);
        if (key === "ArrowLeft")
          state.movieIndex = Math.max(state.movieIndex - 1, 0);

        if (key === "ArrowUp") {
          if (state.movieIndex < columns) {
            // אם המשתמש בשורה הראשונה ולחץ למעלה -> חזור לתפריט
            state.currentArea = "NAV_BAR";
            state.movieIndex = 0; // איפס לשימוש הבא
          } else {
            // עלייה שורה אחת למעלה בתוך הגריד
            state.movieIndex -= columns;
          }
        }
        //   if (key === "ArrowDown")
        //   state.movieIndex = Math.min(
        //     state.movieIndex + columns,
        //     state.movies.length - 1,
        //   );
        if (key === "ArrowDown") {
          const nextIndex = state.movieIndex + columns;

          if (nextIndex < totalMovies) {
            state.movieIndex = nextIndex;
          } else {
            // אם אין עוד שורה → לעבור ל-pagination
            state.currentArea = "PAGINATION";
          }
        }
      }
      // ========================
      // PAGINATION
      // ========================
      else if (state.currentArea === "PAGINATION") {
        if (key === "ArrowRight")
          state.paginationIndex = Math.min(state.paginationIndex + 1, 1);

        if (key === "ArrowLeft")
          state.paginationIndex = Math.max(state.paginationIndex - 1, 0);

        if (key === "ArrowUp") {
          state.currentArea = "MOVIE_GRID";
        }
      }
    },

    selectCategory: (state) => {
      const categories = ["popular", "now_playing", "favorites"];
      state.view = categories[state.navIndex];
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
    // loadFavorites: (state) => {
    //   const saved = localStorage.getItem("favorites");
    //   if (saved) state.favorites = JSON.parse(saved);
    // },
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
  moveFocus,
  selectCategory,
  setSearchTerm,
  toggleFavorite,
} = movieSlice.actions;

export default movieSlice.reducer;
