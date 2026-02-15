import { useNavigate } from "react-router-dom";
import styles from "./movieCard.module.css";
import { memo, useEffect, useRef } from "react";
const MovieCard = memo(({ movie, isActive, onHover, onClick, index }) => {
  const cardRef = useRef(null);

  const PLACEHOLDER_IMAGE = "/placeholder-movie.png";

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        block: "center",
      });
    }
  }, [isActive]);

  const handleMouseMove = () => {
    // התנאי החשוב שלך נכנס כאן!
    // אם הכרטיס כבר אקטיבי - אל תעשה כלום.
    if (!isActive) {
      onHover(index);
    }
  };

  return (
    <div
      ref={cardRef} // חברי את הרפרנס
      className={`${styles.card} ${isActive ? styles.active : ""}`}
      key={movie.id}
      onMouseMove={handleMouseMove}
      onClick={() => onClick(movie.id)}

      // onClick={handleClick}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        loading="lazy" // שיפור ביצועים נוסף: טעינת תמונות עצלה
        onError={(e) => {
          e.target.src = PLACEHOLDER_IMAGE;
        }}
      />
      <h2>{movie.title}</h2>
    </div>
  );
});

export default MovieCard;
