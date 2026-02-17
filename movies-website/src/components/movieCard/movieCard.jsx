import { useSelector } from "react-redux";
import { selectGridColumns } from "../../redux/movies/movieSlice";
import { DEFAULT_GRID_COLUMNS } from "../../utils/constans";
import styles from "./movieCard.module.css";
import { memo, useEffect, useRef } from "react";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/500x750?text=No+Image";

const MovieCard = memo(({ movie, isActive, onHover, onClick, index }) => {
  const cardRef = useRef(null);

  const gridColumns = useSelector(selectGridColumns);

  useEffect(() => {
    if (isActive && cardRef.current) {
      const isFirstRow = index < gridColumns;

      if (isFirstRow) {
        // פתרון רדיקלי לשורה ראשונה: גלילה של כל הדף ל-0
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        // שאר השורות ממשיכות כרגיל
        cardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [isActive, index]);

  const handleMouseMove = () => {
    if (!isActive) {
      onHover(index);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isActive ? styles.active : ""}`}
      onMouseMove={handleMouseMove}
      onClick={() => onClick(movie.id)}
    >
      <img
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : PLACEHOLDER_IMAGE
        }
        alt={movie.title}
        loading="lazy"
        onError={(e) => {
          if (e.target.src !== PLACEHOLDER_IMAGE) {
            e.target.src = PLACEHOLDER_IMAGE;
          }
        }}
      />
      {/* הכותרת תופיע רק ב-Active בזכות ה-CSS */}
      <h2>{movie.title}</h2>
    </div>
  );
});

export default MovieCard;
