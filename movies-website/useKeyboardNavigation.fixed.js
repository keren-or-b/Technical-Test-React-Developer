// ✅ useKeyboardNavigation.fixed.js - Hook מתוקן

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setFocusArea,
  incrementFocusIndex,
  decrementFocusIndex,
  setFocusIndex,
  setView,
  setPage,
  selectCurrentMovies,
  selectFocusArea,
  selectFocusIndex,
} from "../redux/movies/movieSlice";
import {
  calculateGridNavigation,
  getNextArea,
  VIEW_CATEGORIES,
  getViewByIndex,
} from "../services/navigationService";

export const useKeyboardNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const movies = useSelector(selectCurrentMovies);
  const focusArea = useSelector(selectFocusArea);
  const focusIndex = useSelector(selectFocusIndex);
  const { page, totalPages } = useSelector((state) => state.movies);

  const GRID_COLUMNS = 4;

  const handleKeyDown = useCallback(
    (event) => {
      // מניעת Tab
      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }

      const key = event.key;

      // Escape - חזרה לאזור הראשי
      if (key === "Escape") {
        event.preventDefault();
        dispatch(setFocusArea("MOVIE_GRID"));
        return;
      }

      // Arrow Keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        event.preventDefault();
        handleArrowKey(key);
        return;
      }

      // Enter
      if (key === "Enter") {
        event.preventDefault();
        handleEnter();
      }
    },
    [focusArea, focusIndex, movies, page, totalPages],
  );

  // ==================
  // ניהול חצים
  // ==================
  const handleArrowKey = (key) => {
    const direction = key.replace("Arrow", "").toUpperCase();

    switch (focusArea) {
      case "SEARCH":
        handleSearchNavigation(direction);
        break;
      case "NAV_BAR":
        handleNavBarNavigation(direction);
        break;
      case "MOVIE_GRID":
        handleMovieGridNavigation(direction);
        break;
      case "PAGINATION":
        handlePaginationNavigation(direction);
        break;
    }
  };

  // ==================
  // Search Area
  // ==================
  const handleSearchNavigation = (direction) => {
    if (direction === "DOWN") {
      dispatch(setFocusArea("NAV_BAR"));
    }
  };

  // ==================
  // Nav Bar Area
  // ==================
  const handleNavBarNavigation = (direction) => {
    switch (direction) {
      case "LEFT":
        dispatch(decrementFocusIndex());
        break;
      case "RIGHT":
        dispatch(incrementFocusIndex({ max: 2 })); // 3 קטגוריות
        break;
      case "UP":
        dispatch(setFocusArea("SEARCH"));
        break;
      case "DOWN":
        if (movies.length > 0) {
          dispatch(setFocusArea("MOVIE_GRID"));
        }
        break;
    }
  };

  // ==================
  // Movie Grid Area
  // ==================
  const handleMovieGridNavigation = (direction) => {
    const newIndex = calculateGridNavigation(focusIndex, direction, {
      columns: GRID_COLUMNS,
      totalItems: movies.length,
    });

    if (newIndex >= 0) {
      // תנועה בתוך הגריד
      dispatch(setFocusIndex(newIndex));
    } else {
      // תנועה מחוץ לגריד
      if (direction === "UP") {
        dispatch(setFocusArea("NAV_BAR"));
      } else if (direction === "DOWN") {
        dispatch(setFocusArea("PAGINATION"));
        dispatch(setFocusIndex(1)); // <--- הגדרת אינדקס 1 כדי ש-Next יהיה הדיפולט
      }
    }
  };

  // ==================
  // Pagination Area
  // ==================
  const handlePaginationNavigation = (direction) => {
    switch (direction) {
      case "LEFT":
        dispatch(decrementFocusIndex());
        break;
      case "RIGHT":
        dispatch(incrementFocusIndex({ max: 1 })); // Prev/Next
        break;
      case "UP":
        dispatch(setFocusArea("MOVIE_GRID"));
        break;
    }
  };

  // ==================
  // ניהול Enter
  // ==================
  const handleEnter = () => {
    switch (focusArea) {
      case "NAV_BAR": {
        const selectedView = getViewByIndex(focusIndex);
        dispatch(setView(selectedView));
        dispatch(setFocusArea("MOVIE_GRID"));
        break;
      }

      case "MOVIE_GRID": {
        const selectedMovie = movies[focusIndex];
        if (selectedMovie) {
          navigate(`/movie/${selectedMovie.id}`);
        }
        break;
      }

      case "PAGINATION": {
        if (focusIndex === 0 && page > 1) {
          dispatch(setPage(page - 1));
        } else if (focusIndex === 1 && page < totalPages) {
          dispatch(setPage(page + 1));
        }
        break;
      }
    }
  };

  // ==================
  // Attach Event Listener
  // ==================
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
