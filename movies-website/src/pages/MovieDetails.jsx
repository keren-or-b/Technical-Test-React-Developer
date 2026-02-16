import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/MoviePage.module.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchMovieDetailsRequest, toggleFavorite } from "../redux/movies/movieSlice";

const MovieDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. שליפת הנתונים מה-Store
  const { movieDetails, loading, error, favorites } = useSelector(
    (state) => state.movies
  );

  // 2. בדיקה אם הסרט במועדפים (כדי לשנות את הכפתור)
  const isFavorite = favorites.some((fav) => fav.id === movieDetails?.id);

  useEffect(() => {
    if (id) {
      dispatch(fetchMovieDetailsRequest({ id }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        navigate(-1);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [navigate]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!movieDetails) return null;

  // 3. בניית נתיבי תמונה (רזולוציה גבוהה לרקע, בינונית לפוסטר)
  const backdropUrl = `https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;

  // 4. חילוץ שנה מהתאריך
  const releaseYear = movieDetails.release_date?.split("-")[0];

  return (
    <div className={styles.page}>
      
      {/* === רקע אחורי דרמטי === */}
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
          src={posterUrl}
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
                {Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m
              </span>
            )}
          </div>

          <p className={styles.overview}>{movieDetails.overview}</p>

          <div className={styles.actions}>
            {/* כפתור מועדפים ראשי */}
            <button 
              className={`${styles.btn} ${styles.primaryBtn}`}
              onClick={() => dispatch(toggleFavorite(movieDetails))}
            >
              {isFavorite ? "💔 Remove from Favorites" : "❤️ Add to Favorites"}
            </button>

            {/* כפתור חזרה */}
            <button 
              className={`${styles.btn} ${styles.secondaryBtn}`}
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