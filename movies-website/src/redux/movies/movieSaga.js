import {
  call,
  debounce,
  delay,
  put,
  select,
  takeLatest,
} from "redux-saga/effects";
import { moviesAPI } from "../../services/api"; // הייבוא של ה-API הפשוט
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
  moveFocus,
  selectCategory,
  appStarted,
} from "./movieSlice";

let searchTimestamps = [];

const checkSearchRateLimit = () => {
  const now = Date.now();
  // 1. ניקוי היסטוריה ישנה (מעל 10 שניות)
  searchTimestamps = searchTimestamps.filter((ts) => now - ts < 10000);

  // 2. בדיקה אם חרגנו (5 בקשות)
  if (searchTimestamps.length >= 5) {
    return false; // חסום
  }

  // 3. הוספת הזמן הנוכחי ואישור
  searchTimestamps.push(now);
  return true; // מאושר
};

function* fetchMoviesSaga() {
  try {
    const state = yield select((state) => state.movies);
    const { view, page, searchTerm } = state;

    let response;
    if (searchTerm && searchTerm.length >= 2) {
      const isAllowed = checkSearchRateLimit();
      if (!isAllowed) {
        yield put(
          fetchMoviesFailure("יותר מדי בקשות חיפוש. אנא המתן מספר שניות."),
        );
        return; // עוצרים כאן ולא ממשיכים ל-API
      }

      response = yield call(moviesAPI.searchMovies, searchTerm, page);
    } else {
      if (searchTerm.length === 0) {
        if (view === "now_playing") {
          response = yield call(moviesAPI.getAiringNow, page);
        } else {
          // ברירת מחדל: פופולרי
          response = yield call(moviesAPI.getPopularMovies, page);
        }
      }
    }

    yield put(fetchMoviesSuccess(response));
  } catch (error) {
    yield put(fetchMoviesFailure(error.message));
  }
}
function* handleSearchChange() {
  yield put(fetchMoviesRequest());
}

function* handleViewChange() {
  yield put(fetchMoviesRequest());
}
function* fetchMovieDetailsSaga(action) {
  try {
    const { id } = action.payload;
    const res = yield call(moviesAPI.getMovieDetails, id);

    yield put(fetchMovieDetailsSuccess(res));
  } catch (error) {
    yield put(fetchMovieDetailsFailure(error.message));
  }
}

function* handleFocusDelay(action) {
  const state = yield select((state) => state.movies);

  // בודקים אם המשתמש נמצא כרגע בתפריט הניווט
  if (state.currentArea === "NAV_BAR") {
    yield delay(2000); // הדיליי המבוקש

    // אחרי 2 שניות, מעדכנים את ה-View לפי איפה שהמשתמש עומד
    const categories = ["popular", "now_playing", "favorites"];
    const targetCategory = categories[state.navIndex];

    if (state.view !== targetCategory) {
      yield put(setView(targetCategory)); // מעדכן את ה-State
    }
  }
}

export default function* moviesSaga() {
  yield takeLatest(appStarted.type, fetchMoviesSaga); // טעינה ראשונית
  yield takeLatest(fetchMoviesRequest.type, fetchMoviesSaga);
  yield debounce(500, setSearchTerm.type, handleSearchChange);
  yield takeLatest(fetchMovieDetailsRequest.type, fetchMovieDetailsSaga);
  yield takeLatest(moveFocus.type, handleFocusDelay);
  yield takeLatest(
    [setView.type, setPage.type, selectCategory.type],
    handleViewChange,
  );
}
