// redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

// הייבוא של ה-Reducer וה-Saga שלך
import movieReducer from "./movies/movieSlice";
import moviesSaga from "./movies/movieSaga";

// ✅ 1. ייבוא ה-Middleware החדש
import { rateLimitMiddleware } from "../middleware/rateLimitMiddleware";

// יצירת ה-Saga Middleware
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    movies: movieReducer,
  },

  // ✅ 2. הוספה לשרשרת ה-Middlewares
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }) // אם את משתמשת רק בסאגה, אפשר לכבות את thunk
      .concat(rateLimitMiddleware) // <--- הנה הוא! שימי אותו לפני הסאגה
      .concat(sagaMiddleware),
});

// הרצת הסאגה
sagaMiddleware.run(moviesSaga);

export default store;
