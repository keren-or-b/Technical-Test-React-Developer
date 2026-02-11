import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchMoviesRequest,
  fetchMoviesSuccess,
  fetchMoviesFailure,
} from "./moviesSlice";

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function* fetchMoviesSaga(action) {
  try {
    const { view, page, searchTerm } = action.payload;

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

export default function* moviesSaga() {
  yield takeLatest(fetchMoviesRequest.type, fetchMoviesSaga);
}
