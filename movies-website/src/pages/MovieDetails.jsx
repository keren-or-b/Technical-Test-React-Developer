import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/MoviePage.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMovieDetailsRequest,
  selectFocusIndex,
  selectIsFavorite,
  selectIsLoading,
  selectMovieDetails,
  setFocusArea,
  setFocusIndex,
  toggleFavorite,
} from "../redux/movies/movieSlice";
import { useKeyboardNavigation } from "../hooks/useKeyBoardNavigation";

const MovieDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const movieDetails = useSelector(selectMovieDetails);
  const loading = useSelector(selectIsLoading);
  const focusIndex = useSelector(selectFocusIndex);
  const isAreaActive = useSelector(
    (state) => state.movies.focusArea === "MOVIE_DETAILS",
  );
  const isFavorite = useSelector((state) =>
    selectIsFavorite(state, Number(id)),
  );

  useKeyboardNavigation();

  useEffect(() => {
    dispatch(setFocusArea("MOVIE_DETAILS"));
    dispatch(setFocusIndex(0));

    if (id) {
      dispatch(fetchMovieDetailsRequest({ id }));
    }
  }, [id, dispatch]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!movieDetails) return null;

  const backdropUrl = `https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;

  const releaseYear = movieDetails.release_date?.split("-")[0];

  return (
    <div className={styles.page}>
      {movieDetails.backdrop_path && (
        <div
          className={styles.backdrop}
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}
      <div className={styles.overlay} />

      {/* === תוכן === */}
      <div className={styles.contentContainer}>
        {/* פוסטר שמאלי */}
        <img
          src={movieDetails.poster_path ? posterUrl : "/placeholder-movie.svg"}
          alt={movieDetails.title}
          className={styles.poster}
        />

        {/* מידע ימני */}
        <div className={styles.info}>
          <h1 className={styles.title}>{movieDetails.title}</h1>

          <div className={styles.metaData}>
            <span>{releaseYear}</span>
            {/* אם יש דירוג מה-API */}
            {movieDetails.vote_average && (
              <span className={styles.tag}>
                ⭐ {movieDetails.vote_average.toFixed(1)}
              </span>
            )}
            {/* המרת דקות לשעות ודקות */}
            {movieDetails.runtime && (
              <span>
                {Math.floor(movieDetails.runtime / 60)}h{" "}
                {movieDetails.runtime % 60}m
              </span>
            )}
          </div>

          <p className={styles.overview}>{movieDetails.overview}</p>

          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.primaryBtn} ${
                isAreaActive && focusIndex === 0 ? styles.focused : ""
              }`}
              onMouseEnter={() => dispatch(setFocusIndex(0))}
              onClick={() => dispatch(toggleFavorite(movieDetails))}
            >
              {isFavorite ? "💔 Remove" : "❤️ Add to Favorites"}
            </button>

            <button
              className={`${styles.btn} ${styles.secondaryBtn} ${
                isAreaActive && focusIndex === 1 ? styles.focused : ""
              }`}
              onMouseEnter={() => dispatch(setFocusIndex(1))}
              onClick={() => navigate(-1)}
            >
              ⬅ Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
