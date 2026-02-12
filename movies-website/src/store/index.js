// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import movieReducer from "./movieSlice";
import moviesSaga from "./movieSaga";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    movies: movieReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

// הרצת הסאגה
sagaMiddleware.run(moviesSaga);

export default store;
