import {
  call,
  debounce,
  delay,
  put,
  select,
  takeLatest,
} from "redux-saga/effects";
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

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const selectMoviesState = (state) => state.movies;

let searchTimestamps = [];

function* fetchMoviesSaga(action) {
  try {
    const { view, page, searchTerm } = action.payload;
    const isSearch = searchTerm && searchTerm.length >= 2;

    if (isSearch) {
      const now = Date.now();
      // מנקים בקשות שקרו לפני יותר מ-10 שניות
      searchTimestamps = searchTimestamps.filter((ts) => now - ts < 10000);

      // אם כבר שלחנו 5 בקשות ב-10 השניות האחרונות
      if (searchTimestamps.length >= 5) {
        console.warn("Rate limit reached. Request ignored.");
        // אנחנו פשוט עוצרים כאן. הסאגה מסתיימת בלי לבצע את ה-fetch.
        return;
      }

      // אם הגענו לכאן, סימן שמותר לשלוח. מוסיפים את הזמן הנוכחי לרשימה.
      searchTimestamps.push(now);
    }

    let endpoint =
      searchTerm && searchTerm.length >= 2 ? "/search/movie" : `/movie/${view}`;

    const params = new URLSearchParams({
      api_key: API_KEY,
      language: "he-IL",
      page,
    });

    if (searchTerm && searchTerm.length >= 2) {
      params.append("query", searchTerm);
    }

    const res = yield call(
      fetch,
      `${BASE_URL}${endpoint}?${params.toString()}`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch movies");
    }

    const data = yield res.json();

    yield put(fetchMoviesSuccess(data));
  } catch (error) {
    yield put(fetchMoviesFailure(error.message));
  }
}
function* handleFetchTrigger() {
  const { view, page, searchTerm } = yield select(selectMoviesState);

  if (searchTerm.length >= 2) {
    yield put(fetchMoviesRequest({ view, page, searchTerm }));
  }
  if (view === "favorites") return;

  if (searchTerm.length === 0) {
    yield put(fetchMoviesRequest({ view, page, searchTerm: "" }));
  }
}

function* fetchMovieDetailsSaga(action) {
  try {
    const { id } = action.payload;
    const res = yield call(
      fetch,
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=he-IL`,
    );
    if (!res.ok) throw new Error("Failed to fetch movie details");
    const data = yield res.json();
    yield put(fetchMovieDetailsSuccess(data));
  } catch (error) {
    yield put(fetchMovieDetailsFailure(error.message));
  }
}

function* triggerMovieFetch() {
  const state = yield select((state) => state.movies);
  if (state.view !== "favorites") {
    yield put(
      fetchMoviesRequest({
        view: state.view,
        page: state.page,
        searchTerm: state.searchTerm,
      }),
    );
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
      yield call(triggerMovieFetch); // שולח API
    }
  }
}

export default function* moviesSaga() {
  yield takeLatest(appStarted.type, handleFetchTrigger); // טעינה ראשונית
  yield takeLatest(fetchMoviesRequest.type, fetchMoviesSaga);
  yield takeLatest(setView.type, handleFetchTrigger);
  yield takeLatest(setPage.type, handleFetchTrigger);
  yield debounce(500, setSearchTerm.type, handleFetchTrigger);
  yield takeLatest(fetchMovieDetailsRequest.type, fetchMovieDetailsSaga);

  // פוקוס עם דיליי
  yield takeLatest(moveFocus.type, handleFocusDelay);

  // לחיצה על אנטר - מפעילה את העדכון של ה-view ואז את הטריגר
  yield takeLatest(selectCategory.type, handleFetchTrigger);
}
