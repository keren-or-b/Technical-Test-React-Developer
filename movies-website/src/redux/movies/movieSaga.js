import {
  call,
  debounce,
  put,
  select,
  takeLatest,
  all,
} from "redux-saga/effects";
import { moviesAPI } from "../../services/api";
import { searchRateLimiter } from "../../utils/rateLimiter";
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
// (Safe Wrapper)
// ==========================================
function* fetchMovieSafe(id) {
  try {
    const movie = yield call(moviesAPI.getMovieDetails, id);
    return movie;
  } catch (error) {
    // במקרה של שגיאה (למשל 404), לא זורקים Error אלא מחזירים null
    // זה מונע מכל ה-Promise.all להיכשל
    return null;
  }
}

function* fetchMoviesSaga() {
  try {
    const state = yield select((state) => state.movies);
    const { view, page, searchTerm, favoriteIds, cache } = state;

    if (view === "favorites") {
      const top20Ids = favoriteIds.slice(0, 20);

      if (top20Ids.length === 0) {
        yield put(fetchMoviesSuccess({ results: [], total_pages: 0 }));
        return;
      }

      const calls = top20Ids.map((id) => call(fetchMovieSafe, id));

      const moviesResults = yield all(calls);

      const validMovies = moviesResults.filter((movie) => movie !== null);

      yield put(
        fetchMoviesSuccess({
          results: validMovies,
          total_pages: 1,
        }),
      );

      return;
    }
    const cleanTerm = searchTerm ? searchTerm.trim() : "";
    let response;

    if (cleanTerm.length < 2 && cache[view] && cache[view][page]) {
      console.log(`Cache HIT for ${view} page ${page}`); // לוג לבדיקה

      response = cache[view][page];

      // שולחים ישר ל-Success ומסיימים
      yield put(fetchMoviesSuccess(response));
      return;
    }

    console.log(`Cache MISS - Fetching from API...`);

    if (cleanTerm.length >= 2) {
      if (!searchRateLimiter.isAllowed()) {
        console.warn("Rate limit exceeded via Saga");
        yield put(
          fetchMoviesFailure(
            "You are searching too fast. Please wait a moment.",
          ),
        );
        return;
      }
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

function* handleSearchChange() {
  yield put(fetchMoviesRequest());
}

function* handleViewChange() {
  yield put(fetchMoviesRequest());
}

function* fetchMovieDetailsSaga(action) {
  try {
    const { id } = action.payload || action;
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
    debounce(500, setSearchTerm.type, handleSearchChange),
    takeLatest(fetchMovieDetailsRequest.type, fetchMovieDetailsSaga),
    takeLatest(fetchMoviesRequest.type, fetchMoviesSaga),
    takeLatest([setView.type, setPage.type], handleViewChange),
  ]);
}
