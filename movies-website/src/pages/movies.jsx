import { useEffect, useRef } from "react";
import styles from "../styles/movies.module.css";
import MovieCard from "../components/movieCard/movieCard";
import SearchInput from "../components/searchInput";
import { useDispatch, useSelector } from "react-redux";
import {
  appStarted,
  selectCategory,
  setPage,
  moveFocus,
} from "../redux/movies/movieSlice";
import { useNavigate } from "react-router-dom";
import { useKeyboardNavigation } from "../hooks/useKeyBoardNavigation";

const categories = ["Popular", "Now Playing", "Favorites"];

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
    currentArea,
    navIndex,
    movieIndex,
    paginationIndex,
  } = useSelector((state) => state.movies);

  useKeyboardNavigation();
  const moviesToShow = view === "favorites" ? favorites : movies;

  useEffect(() => {
    dispatch(appStarted());
  }, [dispatch]);

  // useEffect(() => {
  //   localStorage.setItem("favorites", JSON.stringify(favorites));
  // }, [favorites]);

  useEffect(() => {
    if (currentArea === "NAV_BAR") {
      navBarRef.current?.scrollIntoView({
        block: "center",
      });
    }
  }, [currentArea]);

  return (
    <div>
      <SearchInput />
      <div className={styles.menuBar} ref={navBarRef}>
        {categories.map((label, index) => (
          <button
            key={label}
            className={`${styles.navBtn} ${
              currentArea === "NAV_BAR" && navIndex === index
                ? styles.active
                : ""
            }`}
            onMouseMove={() => dispatch(moveFocus({ area: "NAV_BAR", index }))}
            onClick={() => {
              dispatch(moveFocus({ area: "NAV_BAR", index }));
              dispatch(selectCategory());
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <>
          <div className={styles.movieGrid}>
            {moviesToShow?.map((movie, index) => (
              <MovieCard
                movie={movie}
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
        </>
      )}
    </div>
  );
};

export default MoviesPage;
