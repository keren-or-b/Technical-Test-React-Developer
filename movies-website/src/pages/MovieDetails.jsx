import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../styles/MoviePage.module.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchMovieDetailsRequest, toggleFavorite } from "../redux/movies/movieSlice";


const MovieDetails = () => {
  const { id } = useParams(); // קבלת id מהראוט
  const dispatch = useDispatch();
    const navigate = useNavigate();
  const { movieDetails, loading, error, favorites } = useSelector(
    (state) => state.movies,
  );
  const isFavorite = favorites.some((fav) => fav.id === movieDetails?.id);

 useEffect(() => {
  dispatch(fetchMovieDetailsRequest({ id }));
}, [id, dispatch]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        navigate(-1); // חזרה לדף הקודם
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!movieDetails) return null;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img
          src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
          alt={movieDetails.title}
        />
        <div className={styles.info}>
          <h1>{movieDetails.title}</h1>
          <p>{movieDetails.release_date}</p>
          <p className={styles.overview}>{movieDetails.overview}</p>
          <button onClick={() => dispatch(toggleFavorite(movieDetails))}>
            {isFavorite ? "💔 Remove from Favorites" : "❤️ Add to Favorites"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
