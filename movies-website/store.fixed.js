// ✅ store/index.fixed.js - Store מתוקן

import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import movieReducer from "./movies/movieSlice";
import moviesSaga from "./movies/movieSaga";
import rateLimitMiddleware from "../middleware/rateLimitMiddleware";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    movies: movieReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ 
      thunk: false,
      serializableCheck: {
        // התעלמות מ-warnings על non-serializable values אם יש
        ignoredActions: [],
      },
    })
    .concat(rateLimitMiddleware) // ← Rate limiting לפני הסאגה
    .concat(sagaMiddleware),
});

// הרצת הסאגה
sagaMiddleware.run(moviesSaga);

export default store;
