// ============================================
// useKeyboardNavigation.js - HOOK מלא ומושלם
// ============================================

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Redux actions
import {
  setFocusArea,
  setFocusIndex,
  setView,
  setPage,
  selectCurrentMovies,
  selectFocusArea,
  selectFocusIndex,
  selectGridColumns,
  selectPage,
  selectTotalPages,
  selectHasMovies,
  selectCurrentView,
  selectMovieDetails, // <--- לוודא שזה קיים ב-Slice
  toggleFavorite,
} from "../redux/movies/movieSlice";

// Navigation service
import {
  calculateNavigation,
  getEnterAction,
  // getEscapeAction,
  DIRECTIONS,
  getIndexByView,
} from "../services/navigationService";

export const useKeyboardNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectors
  const movies = useSelector(selectCurrentMovies);
  const focusArea = useSelector(selectFocusArea);
  const focusIndex = useSelector(selectFocusIndex);
  const gridColumns = useSelector(selectGridColumns);
  const page = useSelector(selectPage);
  const totalPages = useSelector(selectTotalPages);
  const hasMovies = useSelector(selectHasMovies);
  const currentView = useSelector(selectCurrentView); // <--- שליפת ה-View הנוכחי
  const movieDetails = useSelector(selectMovieDetails);
  const isPaginationVisible = currentView !== "favorites" && totalPages > 1;

  // ============================================
  // MAIN KEYBOARD HANDLER
  // ============================================
  const handleKeyDown = useCallback(
    (event) => {
      const key = event.key;

      // מניעת Tab
      if (key === "Tab") {
        event.preventDefault();
        return;
      }

      // ============================================
      // ESCAPE - חזרה לגריד
      // ============================================
      // ============================================
      // ESCAPE - המימוש המתוקן והסופי
      // ============================================
      if (key === "Escape") {
        event.preventDefault();

        // 1. תרחיש פג'ינציה -> עולה לסוף הגריד
        if (focusArea === "PAGINATION") {
          dispatch(setFocusArea("MOVIE_GRID"));
          const lastIndex = movies.length > 0 ? movies.length - 1 : 0;
          dispatch(setFocusIndex(lastIndex));
          return;
        }

        // 3. תרחיש גריד
        if (focusArea === "MOVIE_GRID") {
          if (focusIndex > 0) {
            // אם אנחנו לא בהתחלה -> קפוץ להתחלה
            dispatch(setFocusIndex(0));
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            // אם אנחנו כבר ב-0 -> עולה ל-NavBar לטאב הפעיל
            dispatch(setFocusArea("NAV_BAR"));
            dispatch(setFocusIndex(getIndexByView(currentView)));
          }
          return;
        }
        if (focusArea === "MOVIE_DETAILS") {
          navigate(-1);
          return;
        }

        return;
      }

      // ============================================
      // ARROW KEYS - ניווט
      // ============================================
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        event.preventDefault();
        handleArrowKey(key);
        return;
      }

      // ============================================
      // ENTER - בחירה
      // ============================================
      if (key === "Enter") {
        event.preventDefault();
        handleEnter();
        return;
      }
    },
    [
      // 1. משתני State בסיסיים
      focusArea,
      focusIndex,
      movies,
      page,
      totalPages,
      hasMovies,
      currentView,
      movieDetails,

      // 2. פונקציות חיצוניות
      dispatch,
      navigate, // ✅ הוספנו (חובה לניווט)

      // 3. משתני חישוב קריטיים
      gridColumns, // ✅ הוספנו (קריטי לרספונסיביות)
      isPaginationVisible,
    ],
  );

  // ============================================
  // ARROW KEY HANDLER
  // ============================================
  const handleArrowKey = (key) => {
    // המרה ל-direction
    const directionMap = {
      ArrowUp: DIRECTIONS.UP,
      ArrowDown: DIRECTIONS.DOWN,
      ArrowLeft: DIRECTIONS.LEFT,
      ArrowRight: DIRECTIONS.RIGHT,
    };

    const direction = directionMap[key];

    // חישוב הניווט דרך ה-service
    const navigationResult = calculateNavigation({
      currentArea: focusArea,
      currentIndex: focusIndex,
      direction,
      gridColumns,
      totalMovies: movies.length,
      hasMovies,
      currentView,
      isPaginationVisible,
    });

    // ביצוע הפעולה לפי התוצאה
    switch (navigationResult.type) {
      case "CHANGE_AREA":
        dispatch(setFocusArea(navigationResult.newArea));
        // האינדקס מתאפס אוטומטית ב-setFocusArea

        // 2. === התיקון הקריטי ===
        // אם השירות חישב אינדקס ספציפי (למשל סוף הרשימה), נעדכן אותו מיד!
        if (navigationResult.newIndex !== undefined) {
          dispatch(setFocusIndex(navigationResult.newIndex));
        }
        break;

      case "UPDATE_INDEX":
        dispatch(setFocusIndex(navigationResult.newIndex));
        break;

      case "NO_CHANGE":
        // לא עושים כלום
        break;

      default:
        break;
    }
  };

  // ============================================
  // ENTER HANDLER
  // ============================================
  const handleEnter = () => {
    const enterAction = getEnterAction({
      currentArea: focusArea,
      currentIndex: focusIndex,
      movies,
      page,
      totalPages,
    });

    switch (enterAction.type) {
      case "SELECT_VIEW":
        dispatch(setView(enterAction.view));
        dispatch(setFocusArea("MOVIE_GRID")); // מעבר לגריד
        break;

      case "SELECT_MOVIE":
        navigate(`/movie/${enterAction.movieId}`);
        break;

      case "PREVIOUS_PAGE":
        // ✅ שימוש ב-setPage עם חישוב
        if (page > 1) {
          dispatch(setPage(page - 1));
        }
        break;

      case "NEXT_PAGE":
        // ✅ שימוש ב-setPage עם חישוב
        if (page < totalPages) {
          dispatch(setPage(page + 1));
        }
        break;
      case "TOGGLE_FAVORITE_DETAILS":
        if (movieDetails) {
          dispatch(toggleFavorite(movieDetails));
        }
        break;

      case "GO_BACK":
        navigate(-1);
        break;

      case "NO_ACTION":
      default:
        // לא עושים כלום
        break;
    }
  };

  // ============================================
  // ATTACH EVENT LISTENER
  // ============================================
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // ============================================
  // RETURN - אפשר להחזיר utility functions
  // ============================================
  return {
    // אם רוצים לאפשר גישה ידנית לפעולות
    moveFocus: handleArrowKey,
    selectCurrent: handleEnter,
    resetToGrid: () => dispatch(setFocusArea("MOVIE_GRID")),
  };
};
