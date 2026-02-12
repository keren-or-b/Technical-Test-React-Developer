import { useNavigate } from "react-router-dom";
import styles from "./movieCard.module.css";
import { useEffect, useRef } from "react";
const MovieCard = ({ movie, isActive }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null); // צרי רפרנס

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isActive]);

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      ref={cardRef} // חברי את הרפרנס
      className={`${styles.card} ${isActive ? styles.active : ""}`}
      key={movie.id}
      onClick={handleClick}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
      />
      <h2>{movie.title}</h2>
    </div>
  );
};

export default MovieCard;
