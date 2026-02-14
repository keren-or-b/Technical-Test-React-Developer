import { useEffect, useRef, useState } from "react";
import styles from "../styles/movies.module.css";
import MovieCard from "../components/movies/movieCard/movieCard";
import SearchInput from "../components/movies/movieCard/searchInput";
import { useDispatch, useSelector } from "react-redux";
import { appStarted, selectCategory } from "../store/movieSlice";
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
  const navBarRef = useRef(null);

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
    dispatch(appStarted());
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (currentArea === "NAV_BAR") {
      navBarRef.current?.scrollIntoView({
        block: "center",
      });
    }
  }, [currentArea]);

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

  return (
    <div>
      <SearchInput />
      {/* <h1>All Movies</h1> */}
      <div className={styles.menuBar} ref={navBarRef}>
        {/* <button onClick={() => dispatch(setView("popular"))}>Popular</button> */}
        <button
          className={`${styles.navBtn} ${currentArea === "NAV_BAR" && navIndex === 0 ? styles.active : ""}`}
          onMouseEnter={() =>
            dispatch(moveFocus({ area: "NAV_BAR", index: 0 }))
          }
          onClick={() => {
            dispatch(moveFocus({ area: "NAV_BAR", index: 0 }));
            dispatch(selectCategory());
          }}
        >
          Popular
        </button>
        <button
          className={`${styles.navBtn} ${currentArea === "NAV_BAR" && navIndex === 1 ? styles.active : ""}`}
          onMouseEnter={() =>
            dispatch(moveFocus({ area: "NAV_BAR", index: 1 }))
          }
          onClick={() => {
            dispatch(moveFocus({ area: "NAV_BAR", index: 1 }));
            dispatch(selectCategory());
          }}
        >
          Now Playing
        </button>
        <button
          className={`${styles.navBtn} ${currentArea === "NAV_BAR" && navIndex === 2 ? styles.active : ""}`}
          onMouseEnter={() =>
            dispatch(moveFocus({ area: "NAV_BAR", index: 2 }))
          }
          onClick={() => {
            dispatch(moveFocus({ area: "NAV_BAR", index: 2 }));
            dispatch(selectCategory());
          }}
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
            onMouseMove={() => {
              if (currentArea !== "MOVIE_GRID" || movieIndex !== index) {
                dispatch(moveFocus({ area: "MOVIE_GRID", index }));
              }
            }}
            onClick={() => navigate(`/movie/${movie.id}`)}
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
            onMouseEnter={() =>
              dispatch(moveFocus({ area: "PAGINATION", index: 0 }))
            }
            onClick={() => {
              dispatch(moveFocus({ area: "PAGINATION", index: 0 }));
              if (page > 1) dispatch(setPage(page - 1));
            }}
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
            onMouseEnter={() =>
              dispatch(moveFocus({ area: "PAGINATION", index: 1 }))
            }
            onClick={() => {
              dispatch(moveFocus({ area: "PAGINATION", index: 1 }));
              if (page < totalPages) dispatch(setPage(page + 1));
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
