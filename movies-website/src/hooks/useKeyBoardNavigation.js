import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
  selectMovieDetails,
  toggleFavorite,
} from "../redux/movies/movieSlice";

import {
  calculateNavigation,
  getEnterAction,
  DIRECTIONS,
  getIndexByView,
} from "../services/navigationService";

export const useKeyboardNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const movies = useSelector(selectCurrentMovies);
  const focusArea = useSelector(selectFocusArea);
  const focusIndex = useSelector(selectFocusIndex);
  const gridColumns = useSelector(selectGridColumns);
  const page = useSelector(selectPage);
  const totalPages = useSelector(selectTotalPages);
  const hasMovies = useSelector(selectHasMovies);
  const currentView = useSelector(selectCurrentView);
  const movieDetails = useSelector(selectMovieDetails);
  const isPaginationVisible = currentView !== "favorites" && totalPages > 1;

  // Translate arrow key to a direction and delegate to the navigation service
  const handleArrowKey = useCallback(
    (key) => {
      const directionMap = {
        ArrowUp: DIRECTIONS.UP,
        ArrowDown: DIRECTIONS.DOWN,
        ArrowLeft: DIRECTIONS.LEFT,
        ArrowRight: DIRECTIONS.RIGHT,
      };

      const direction = directionMap[key];

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

      switch (navigationResult.type) {
        case "CHANGE_AREA":
          dispatch(setFocusArea(navigationResult.newArea));
          if (navigationResult.newIndex !== undefined) {
            dispatch(setFocusIndex(navigationResult.newIndex));
          }
          break;

        case "UPDATE_INDEX":
          dispatch(setFocusIndex(navigationResult.newIndex));
          break;

        case "NO_CHANGE":
        default:
          break;
      }
    },
    [
      focusArea,
      focusIndex,
      gridColumns,
      dispatch,
      movies,
      hasMovies,
      currentView,
      isPaginationVisible,
    ],
  );

  // Resolve and execute the correct action for the currently focused element
  const handleEnter = useCallback(() => {
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
        dispatch(setFocusArea("MOVIE_GRID"));
        break;

      case "SELECT_MOVIE":
        navigate(`/movie/${enterAction.movieId}`);
        break;

      case "PREVIOUS_PAGE":
        if (page > 1) dispatch(setPage(page - 1));
        break;

      case "NEXT_PAGE":
        if (page < totalPages) dispatch(setPage(page + 1));
        break;

      case "TOGGLE_FAVORITE_DETAILS":
        if (movieDetails) dispatch(toggleFavorite(movieDetails));
        break;

      case "GO_BACK":
        navigate(-1);
        break;

      case "NO_ACTION":
      default:
        break;
    }
  }, [
    focusArea,
    focusIndex,
    dispatch,
    navigate,
    movies,
    page,
    totalPages,
    movieDetails,
  ]);

  const handleKeyDown = useCallback(
    (event) => {
      const key = event.key;

      // Prevent default Tab behavior throughout the app
      if (key === "Tab") {
        event.preventDefault();
        return;
      }

      // Escape — context-aware back/reset behavior
      if (key === "Escape") {
        event.preventDefault();

        if (focusArea === "PAGINATION") {
          // Return to the last item in the grid
          dispatch(setFocusArea("MOVIE_GRID"));
          const lastIndex = movies.length > 0 ? movies.length - 1 : 0;
          dispatch(setFocusIndex(lastIndex));
          return;
        }

        if (focusArea === "MOVIE_GRID") {
          if (focusIndex > 0) {
            // Jump to the first item
            dispatch(setFocusIndex(0));
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            // Already at first item — move up to the nav bar
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

      // Arrow keys — delegate to handleArrowKey
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        event.preventDefault();
        handleArrowKey(key);
        return;
      }

      // Enter — delegate to handleEnter
      if (key === "Enter") {
        event.preventDefault();
        handleEnter();
        return;
      }
    },
    [
      focusArea,
      focusIndex,
      movies,
      page,
      totalPages,
      hasMovies,
      currentView,
      movieDetails,
      dispatch,
      navigate,
      handleArrowKey,
      handleEnter,
      gridColumns,
      isPaginationVisible,
    ],
  );

  // Register and clean up the global keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
