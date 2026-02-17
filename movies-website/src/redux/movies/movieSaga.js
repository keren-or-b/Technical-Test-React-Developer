import {
  call,
  debounce,
  put,
  select,
  takeLatest,
  all, // הוספתי את all לסידור נקי בסוף
} from "redux-saga/effects";
import { moviesAPI } from "../../services/api";

// 1. ייבוא רק של הפעולות שבאמת קיימות ב-Slice החדש
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

// ==========================================
// ✅ 1. פונקציית העזר (Safe Wrapper) - כאן!
// ==========================================
function* fetchMovieSafe(id) {
  try {
    // מנסים להביא את הסרט
    const movie = yield call(moviesAPI.getMovieDetails, id);
    return movie;
  } catch (error) {
    // במקרה של שגיאה (למשל 404), לא זורקים Error אלא מחזירים null
    // זה מונע מכל ה-Promise.all להיכשל
    console.warn(`Skipping movie ID ${id}:`, error.message);
    return null;
  }
}

// --- Fetch Movies Saga ---
function* fetchMoviesSaga() {
  try {
    const state = yield select((state) => state.movies);
    const { view, page, searchTerm, favoriteIds } = state;
    // בתוך fetchMoviesSaga, בחלק של favorites:

    if (view === "favorites") {
      const top20Ids = favoriteIds.slice(0, 20);

      if (top20Ids.length === 0) {
        yield put(fetchMoviesSuccess({ results: [], total_pages: 0 }));
        return;
      }

      // ✅ שינוי: קוראים ל-fetchMovieSafe במקום ל-api ישירות
      const calls = top20Ids.map((id) => call(fetchMovieSafe, id));

      // עכשיו זה לא ייכשל גם אם סרט אחד חסר
      const moviesResults = yield all(calls);

      // ✅ סינון: מעיפים את ה-null (הסרטים שנכשלו)
      const validMovies = moviesResults.filter((movie) => movie !== null);

      yield put(
        fetchMoviesSuccess({
          results: validMovies,
          total_pages: 1,
        }),
      );

      return;
    }
    // ניקוי רווחים
    const cleanTerm = searchTerm ? searchTerm.trim() : "";
    let response;

    // תרחיש 1: חיפוש פעיל
    if (cleanTerm.length >= 2) {
      // if (!checkSearchRateLimit()) {
      //   yield put(fetchMoviesFailure("יותר מדי בקשות. נא להמתין."));
      //   return;
      // }
      response = yield call(moviesAPI.searchMovies, cleanTerm, page);
    }
    // תרחיש 2: אות אחת (לא עושים כלום או מנקים)
    else if (cleanTerm.length === 1) {
      yield put(fetchMoviesSuccess({ results: [], total_pages: 0 }));
      return;
    }
    // תרחיש 3: אין חיפוש -> מביאים לפי View
    else {
      if (view === "now_playing") {
        response = yield call(moviesAPI.getAiringNow, page);
      } else {
        response = yield call(moviesAPI.getPopularMovies, page);
      }
    }

    yield put(fetchMoviesSuccess(response));
  } catch (error) {
    yield put(fetchMoviesFailure(error.message));
  }
}

// טריגרים לטעינה מחדש
function* handleSearchChange() {
  yield put(fetchMoviesRequest());
}

function* handleViewChange() {
  yield put(fetchMoviesRequest());
}

// --- Fetch Details Saga ---
function* fetchMovieDetailsSaga(action) {
  try {
    const { id } = action.payload || action; // הגנה קטנה
    if (!id) return;
    const res = yield call(moviesAPI.getMovieDetails, id);
    yield put(fetchMovieDetailsSuccess(res));
  } catch (error) {
    yield put(fetchMovieDetailsFailure(error.message));
  }
}

// --- Root Saga ---
export default function* moviesSaga() {
  yield all([
    // טעינה ראשונית
    takeLatest(appStarted.type, fetchMoviesSaga),

    // בקשת טעינה יזומה
    takeLatest(fetchMoviesRequest.type, fetchMoviesSaga),

    // האזנה לשינויים בחיפוש (עם Debounce)
    debounce(500, setSearchTerm.type, handleSearchChange),

    // האזנה לפרטי סרט
    takeLatest(fetchMovieDetailsRequest.type, fetchMovieDetailsSaga),

    // האזנה לשינויי ניווט שמצריכים טעינה מחדש (הורדנו את selectCategory)
    takeLatest([setView.type, setPage.type], handleViewChange),
  ]);
}
