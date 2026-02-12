import { useEffect, useState } from "react";
import styles from "../styles/movies.module.css";
import MovieCard from "../components/movies/movieCard/movieCard";
import SearchInput from "../components/movies/movieCard/searchInput";
import { useDispatch, useSelector } from "react-redux";
import { appStarted, loadFavorites, selectCategory } from "../store/movieSlice";
import {
  setPage,
  setSearchTerm,
  setView,
  moveFocus,
} from "../store/movieSlice";
import { useNavigate } from "react-router-dom";

const MoviesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    movies,
    favorites,
    totalPages,
    page,
    view,
    loading,
    searchTerm,
    currentArea,
    navIndex,
    movieIndex,
    paginationIndex,
  } = useSelector((state) => state.movies);

  const moviesToShow = view === "favorites" ? favorites : movies;

  useEffect(() => {
    dispatch(loadFavorites());

    dispatch(appStarted());
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // מניעת פעולות דפדפן ברירת מחדל
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].includes(
          e.key,
        )
      ) {
        e.preventDefault();
      }

      if (e.key === "Tab") return; // לא עושה כלום לפי המטלה

      // שליחת פעולת הניווט ל-Redux
      dispatch(moveFocus({ key: e.key }));
      // טיפול בבחירה (Enter)
      if (e.key === "Enter") {
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentArea,
    navIndex,
    movieIndex,
    paginationIndex,
    page,
    totalPages,
    moviesToShow,
    navigate,
    dispatch,
  ]);

  const handlePrevPage = () => {
    if (page > 1) {
      dispatch(setPage(page - 1));
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      dispatch(setPage(page + 1));
    }
  };
  return (
    <div>
      <SearchInput onSearch={(term) => dispatch(setSearchTerm(term))} />
      <h1>All Movies</h1>
      <div className={styles.menuBar}>
        {/* <button onClick={() => dispatch(setView("popular"))}>Popular</button> */}
        <button
          className={`${styles.navBtn} ${currentArea === "NAV_BAR" && navIndex === 0 ? styles.active : ""}`}
        >
          Popular
        </button>
        <button
          className={`${styles.navBtn} ${currentArea === "NAV_BAR" && navIndex === 1 ? styles.active : ""}`}
        >
          Now Playing
        </button>
        <button
          className={`${styles.navBtn} ${currentArea === "NAV_BAR" && navIndex === 2 ? styles.active : ""}`}
        >
          Favorites
        </button>
      </div>

      <div className={styles.movieGrid}>
        {moviesToShow?.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isFavorite={favorites.some((fav) => fav.id === movie.id)}
            isActive={currentArea === "MOVIE_GRID" && index === movieIndex}
          />
        ))}
      </div>
      {view !== "favorites" && (
        <div className={styles.paginationWrapper}>
          <button
            className={`${styles.paginationBtn} ${
              currentArea === "PAGINATION" && paginationIndex === 0
                ? styles.paginationActive
                : ""
            }`}
            disabled={page === 1}
          >
            Prev
          </button>

          <span className={styles.paginationInfo}>
            Page {page} of {totalPages}
          </span>

          <button
            className={`${styles.paginationBtn} ${
              currentArea === "PAGINATION" && paginationIndex === 1
                ? styles.paginationActive
                : ""
            }`}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
