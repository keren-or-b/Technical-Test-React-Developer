import { useNavigate } from "react-router-dom";
import styles from "./movieCard.module.css";
const MovieCard = ({ movie, isFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className={styles.card} key={movie.id} onClick={handleClick}>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
      />
      <h2>{movie.title}</h2>
      <button onClick={() => onToggleFavorite(movie)}>
        {isFavorite ? "❤️" : "🤍"}
      </button>
      {/* <p>{movie.overview}</p> */}
    </div>
  );
};

export default MovieCard;
