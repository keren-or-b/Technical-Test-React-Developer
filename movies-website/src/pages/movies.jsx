import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  appStarted,
  setView,
  setPage,
  setFocusArea,
  setFocusIndex,
  selectCurrentMovies,
  selectIsLoading,
  selectFocusArea,
  selectFocusIndex,
  selectCurrentView,
  selectPage,
  selectTotalPages,
  selectGridColumns,
} from "../redux/movies/movieSlice";
import { useKeyboardNavigation } from "../hooks/useKeyBoardNavigation";
import { VIEW_CATEGORIES } from "../utils/constants";
import MovieCard from "../components/movieCard/movieCard";
import SearchInput from "../components/searchInput";
import styles from "../styles/movies.module.css";

const MoviesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navBarRef = useRef(null);

  const movies = useSelector(selectCurrentMovies);
  const loading = useSelector(selectIsLoading);
  const focusArea = useSelector(selectFocusArea);
  const focusIndex = useSelector(selectFocusIndex);
  const currentView = useSelector(selectCurrentView);
  const page = useSelector(selectPage);
  const totalPages = useSelector(selectTotalPages);
  const gridColumns = useSelector(selectGridColumns);

  useKeyboardNavigation();

  // Initial Load
  useEffect(() => {
    dispatch(appStarted());
  }, [dispatch]);

  useEffect(() => {
    if (focusArea === "NAV_BAR") {
      navBarRef.current?.scrollIntoView({
        block: "center",
      });
    }
    if (focusArea === "PAGINATION") {
      const paginationElement = document.querySelector(
        `.${styles.paginationWrapper}`,
      );
      if (paginationElement) {
        paginationElement.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }
  }, [focusArea]);

  useEffect(() => {
    if (focusArea === "MOVIE_DETAILS") {
      dispatch(setFocusArea("MOVIE_GRID"));
    }
  }, [focusArea, dispatch]);

  useEffect(() => {
    let timer;
    if (focusArea === "NAV_BAR") {
      timer = setTimeout(() => {
        const targetView = VIEW_CATEGORIES[focusIndex];
        if (targetView && targetView !== currentView) {
          dispatch(setView(targetView));
        }
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [focusArea, focusIndex, currentView, dispatch]);

  const handleNavHover = useCallback(
    (index) => {
      dispatch(setFocusArea("NAV_BAR"));
      dispatch(setFocusIndex(index));
    },
    [dispatch],
  );

  const handleNavClick = useCallback(
    (viewName) => {
      dispatch(setView(viewName));
      dispatch(setFocusArea("MOVIE_GRID"));
    },
    [dispatch],
  );

  const handleCardHover = useCallback(
    (index) => {
      dispatch(setFocusArea("MOVIE_GRID"));
      dispatch(setFocusIndex(index));
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (movieId) => {
      navigate(`/movie/${movieId}`);
    },
    [navigate],
  );

  const handlePaginationHover = useCallback(
    (index) => {
      dispatch(setFocusArea("PAGINATION"));
      dispatch(setFocusIndex(index));
    },
    [dispatch],
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <div className={styles.searchWrapper}>
          <SearchInput />
        </div>

        <div className={styles.menuBar} ref={navBarRef}>
          {VIEW_CATEGORIES.map((viewName, index) => {
            const label = viewName.replace("_", " ").toUpperCase();

            const isSelected = currentView === viewName;
            const isFocused = focusArea === "NAV_BAR" && focusIndex === index;

            return (
              <button
                key={viewName}
                className={`
                  ${styles.navBtn} 
                  ${isSelected ? styles.selected : ""} 
                  ${isFocused ? styles.focused : ""}
                `}
                onMouseMove={() => handleNavHover(index)}
                onClick={() => handleNavClick(viewName)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : (
        <>
          {/* === MOVIE GRID === */}

          <div
            className={styles.movieGrid}
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            }}
          >
            {movies.length > 0 ? (
              movies.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  index={index}
                  isActive={focusArea === "MOVIE_GRID" && focusIndex === index}
                  onHover={handleCardHover}
                  onClick={handleCardClick}
                />
              ))
            ) : (
              <div className={styles.noResults}>No movies found</div>
            )}
          </div>

          {/* === PAGINATION === */}
          {currentView !== "favorites" && movies.length > 0 && (
            <div className={styles.paginationWrapper}>
              <button
                className={`${styles.paginationBtn} ${
                  focusArea === "PAGINATION" && focusIndex === 0
                    ? styles.paginationActive
                    : ""
                }`}
                disabled={page === 1}
                onMouseEnter={() => handlePaginationHover(0)}
                onClick={() => {
                  dispatch(setFocusArea("PAGINATION"));
                  dispatch(setPage(page - 1));
                }}
              >
                Prev
              </button>

              <span className={styles.paginationInfo}>
                Page {page} of {totalPages}
              </span>

              <button
                className={`${styles.paginationBtn} ${
                  focusArea === "PAGINATION" && focusIndex === 1
                    ? styles.paginationActive
                    : ""
                }`}
                disabled={page === totalPages}
                onMouseEnter={() => handlePaginationHover(1)}
                onClick={() => {
                  dispatch(setFocusArea("PAGINATION"));
                  dispatch(setPage(page + 1));
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
