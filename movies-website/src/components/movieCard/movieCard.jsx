import { useNavigate } from "react-router-dom";
import styles from "./movieCard.module.css";
import { useEffect, useRef } from "react";
const MovieCard = ({ movie, isActive, onMouseMove, onClick }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        block: "center",
      });
    }
  }, [isActive]);


  return (
    <div
      ref={cardRef} // חברי את הרפרנס
      className={`${styles.card} ${isActive ? styles.active : ""}`}
      key={movie.id}
      onMouseMove={onMouseMove}
      onClick={onClick}
      // onClick={handleClick}
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
