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

const FAVORITES_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

// Safely fetch a single movie — returns null on failure instead of throwing,
// preventing a single bad ID from failing the entire batch
function* fetchMovieSafe(id) {
  try {
    const movie = yield call(moviesAPI.getMovieDetails, id);
    return movie;
  } catch (error) {
    return null;
  }
}

function* fetchMoviesSaga() {
  try {
    const state = yield select((state) => state.movies);
    const { view, page, searchTerm, favoriteIds, cache } = state;

    // --- Favorites view: fetch movie details for stored IDs ---
    if (view === "favorites") {
      const top20Ids = favoriteIds.slice(0, FAVORITES_PAGE_SIZE);

      if (top20Ids.length === 0) {
        yield put(fetchMoviesSuccess({ results: [], total_pages: 0 }));
        return;
      }

      const calls = top20Ids.map((id) => call(fetchMovieSafe, id));
      const moviesResults = yield all(calls);

      // Filter out any movies that failed to load
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

    // --- Cache hit: return stored results without calling the API ---
    if (cleanTerm.length < 2 && cache[view] && cache[view][page]) {
      response = cache[view][page];
      yield put(fetchMoviesSuccess(response));
      return;
    }

    // --- Search: query the API with rate limit protection ---
    if (cleanTerm.length >= 2) {
      if (!searchRateLimiter.isAllowed()) {
        yield put(
          fetchMoviesFailure(
            "You are searching too fast. Please wait a moment.",
          ),
        );
        return;
      }
      response = yield call(moviesAPI.searchMovies, cleanTerm, page);
    }
    // Single character — not enough to search, return empty
    else if (cleanTerm.length === 1) {
      yield put(fetchMoviesSuccess({ results: [], total_pages: 0 }));
      return;
    }
    // --- Browse: fetch by current view (popular / now_playing) ---
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

// Triggers a fetch when the search term changes (debounced at call site)
function* handleSearchChange() {
  yield put(fetchMoviesRequest());
}

// Triggers a fetch when the view or page changes
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

// Root saga — registers all watchers
export default function* moviesSaga() {
  yield all([
    takeLatest(appStarted.type, fetchMoviesSaga),
    debounce(SEARCH_DEBOUNCE_MS, setSearchTerm.type, handleSearchChange),
    takeLatest(fetchMovieDetailsRequest.type, fetchMovieDetailsSaga),
    takeLatest(fetchMoviesRequest.type, fetchMoviesSaga),
    takeLatest([setView.type, setPage.type], handleViewChange),
  ]);
}
