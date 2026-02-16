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
} from "../redux/movies/movieSlice";

// Navigation service
import {
  calculateNavigation,
  getEnterAction,
  getEscapeAction,
  DIRECTIONS,
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
      if (key === "Escape") {
        event.preventDefault();
        const escapeAction = getEscapeAction({ currentArea: focusArea });

        if (escapeAction.type === "RESET_TO_GRID") {
          dispatch(setFocusArea("MOVIE_GRID"));
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
    [focusArea, focusIndex, movies, page, totalPages, hasMovies],
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
      isPaginationVisible
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
        dispatch(setPage(page - 1));
        break;

      case "NEXT_PAGE":
        dispatch(setPage(page + 1));
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
