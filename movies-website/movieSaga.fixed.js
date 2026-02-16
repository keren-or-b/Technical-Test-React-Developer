// ✅ movieSaga.fixed.js - Saga עם אחריות ברורה

import {
  call,
  debounce,
  put,
  select,
  takeLatest,
  retry,
} from "redux-saga/effects";
import { moviesAPI } from "../../services/api";
import {
  fetchMoviesRequest,
  fetchMoviesSuccess,
  fetchMoviesFailure,
  fetchMovieDetailsRequest,
  fetchMovieDetailsSuccess,
  fetchMovieDetailsFailure,
  setView,
  setPage,
  setSearchTerm,
  appStarted,
} from "./movieSlice";

// ==================
// Helper: בחירת API call הנכון
// ==================
function* getMoviesAPICall(view, searchTerm, page) {
  if (searchTerm && searchTerm.length >= 2) {
    return yield call(moviesAPI.searchMovies, searchTerm, page);
  }
  
  // אם אין חיפוש, תלוי ב-view
  switch (view) {
    case "now_playing":
      return yield call(moviesAPI.getAiringNow, page);
    case "favorites":
      // favorites לא מגיע מ-API, נטפל בזה ב-selector
      return { results: [], total_pages: 1 };
    default: // popular
      return yield call(moviesAPI.getPopularMovies, page);
  }
}

// ==================
// Main Fetch Saga
// ==================
function* fetchMoviesSaga() {
  try {
    const state = yield select((state) => state.movies);
    const { view, page, searchTerm } = state;

    // אם אנחנו ב-favorites ואין חיפוש - לא צריך לקרוא ל-API
    if (view === "favorites" && !searchTerm) {
      yield put(fetchMoviesSuccess({ results: state.favorites, total_pages: 1 }));
      return;
    }

    // קריאת API עם retry logic
    const response = yield retry(
      3, // 3 ניסיונות
      1000, // המתנה של שניה בין ניסיונות
      getMoviesAPICall,
      view,
      searchTerm,
      page
    );

    yield put(fetchMoviesSuccess(response));
  } catch (error) {
    console.error("Fetch movies error:", error);
    yield put(
      fetchMoviesFailure(
        error.message || "שגיאה בטעינת הסרטים. אנא נסה שוב."
      )
    );
  }
}

// ==================
// Movie Details Saga
// ==================
function* fetchMovieDetailsSaga(action) {
  try {
    const { id } = action.payload;
    
    // קריאה עם retry
    const details = yield retry(
      3,
      1000,
      moviesAPI.getMovieDetails,
      id
    );

    yield put(fetchMovieDetailsSuccess(details));
  } catch (error) {
    console.error("Fetch movie details error:", error);
    yield put(
      fetchMovieDetailsFailure(
        error.message || "שגיאה בטעינת פרטי הסרט"
      )
    );
  }
}

// ==================
// Search Handler (עם debounce)
// ==================
function* handleSearchChange() {
  // הסאגה פשוט מפעילה fetch
  yield put(fetchMoviesRequest());
}

// ==================
// View/Page Change Handler
// ==================
function* handleViewOrPageChange() {
  yield put(fetchMoviesRequest());
}

// ==================
// Root Saga
// ==================
export default function* moviesSaga() {
  // טעינה ראשונית
  yield takeLatest(appStarted.type, fetchMoviesSaga);
  
  // טעינת סרטים
  yield takeLatest(fetchMoviesRequest.type, fetchMoviesSaga);
  
  // חיפוש עם debounce של 500ms
  yield debounce(500, setSearchTerm.type, handleSearchChange);
  
  // שינוי view או page
  yield takeLatest(
    [setView.type, setPage.type],
    handleViewOrPageChange
  );
  
  // טעינת פרטי סרט
  yield takeLatest(
    fetchMovieDetailsRequest.type,
    fetchMovieDetailsSaga
  );
}
