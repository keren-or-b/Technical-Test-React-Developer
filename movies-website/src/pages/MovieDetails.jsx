import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/MoviePage.module.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieDetails = () => {
  const { id } = useParams(); // קבלת id מהראוט
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`,
    )
      .then((res) => res.json())
      .then((data) => setMovie(data));
  }, [id]);

  if (!movie) return <p>Loading...</p>;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <div className={styles.info}>
          <h1>{movie.title}</h1>
          <p>{movie.release_date}</p>
          <p className={styles.overview}>{movie.overview}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
