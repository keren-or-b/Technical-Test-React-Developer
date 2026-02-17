import { useSelector } from "react-redux";
import { selectGridColumns } from "../../redux/movies/movieSlice";
import styles from "./movieCard.module.css";
import { memo, useEffect, useRef } from "react";

const PLACEHOLDER_IMAGE = "/placeholder-movie.svg";
const POSTER_PATH = "https://image.tmdb.org/t/p/w500";

const MovieCard = memo(({ movie, isActive, onHover, onClick, index }) => {
  const cardRef = useRef(null);

  const gridColumns = useSelector(selectGridColumns);

  useEffect(() => {
    if (isActive && cardRef.current) {
      const isFirstRow = index < gridColumns;

      if (isFirstRow) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
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
            ? `${POSTER_PATH}${movie.poster_path}`
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
      <h2>{movie.title}</h2>
    </div>
  );
});

export default MovieCard;
