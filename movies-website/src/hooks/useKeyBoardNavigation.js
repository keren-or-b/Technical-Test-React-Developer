// hooks/useKeyboardNavigation.js
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { moveFocus } from "../redux/movies/movieSlice";
import { moveFocus, selectCategory, setPage } from "../redux/movies/movieSlice";
// import {
//   moveSelectionUp,
//   moveSelectionDown,
//   moveSelectionLeft,
//   moveSelectionRight,
// } from "../redux/movies/moviesSlice";

export const useKeyboardNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    movies,
    favorites,
    view,
    movieIndex,
    currentArea,
    paginationIndex,
    page,
    totalPages,
  } = useSelector((state) => state.movies);

  const moviesToShow = view === "favorites" ? favorites : movies;
  const handleKeyDown = useCallback(
    (event) => {
      // Prevent Tab key action
      if (event.key === "Tab") {
        event.preventDefault();
        return;
      }

      switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
        case "Escape":
          event.preventDefault();

          // שליחת הפעולה האוניברסלית ל-Slice שמטפל בלוגיקה
          dispatch(moveFocus({ key: event.key }));
          break;

        case "Enter":
          event.preventDefault();
          if (currentArea === "NAV_BAR") {
            dispatch(selectCategory());
          } else if (currentArea === "PAGINATION") {
            if (paginationIndex === 0 && page > 1) {
              dispatch(setPage(page - 1));
            }

            if (paginationIndex === 1 && page < totalPages) {
              dispatch(setPage(page + 1));
            }
          } else {
            // מעבר לסרט שנמצא בפוקוס
            const selectedMovie = moviesToShow[movieIndex];
            if (selectedMovie) {
              navigate(`/movie/${selectedMovie.id}`);
            }
          }
          break;
        default:
          break;
      }
    },
    [
      dispatch,
      navigate,
      moviesToShow,
      movieIndex,
      currentArea,
      paginationIndex,
      page,
      totalPages,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};
