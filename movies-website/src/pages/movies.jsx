import { useEffect, useState } from "react";
import styles from "../styles/movies.module.css";
import MovieCard from "../components/movies/movieCard/movieCard";
import SearchInput from "../components/movies/movieCard/searchInput";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState("popular");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const moviesToShow = view === "favorites" ? favorites : movies;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, view]);

  useEffect(() => {
    if (view === "favorites") return;
    fetchMovies(page);
  }, [debouncedSearch, view, page]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const fetchMovies = async (page) => {
    const BASE_URL = "https://api.themoviedb.org/3";
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

    let endpoint =
      debouncedSearch && debouncedSearch.length >= 2
        ? "/search/movie"
        : `/movie/${view}`;

    const params = new URLSearchParams({
      api_key: API_KEY,
      language: "he-IL",
      page: page,
    });
    if (debouncedSearch && debouncedSearch.length >= 2) {
      params.append("query", debouncedSearch);
    }

    const res = await fetch(`${BASE_URL}${endpoint}?${params.toString()}`);
    if (!res.ok) {
      throw new Error("Failed to fetch movies");
    }
    const data = await res.json();
    console.log(data);
    setMovies(data.results);
    setTotalPages(data.total_pages);

    console.log(data);
  };

  const toggleFavorite = (movie) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === movie.id);

      if (exists) {
        return prev.filter((fav) => fav.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };
  return (
    <div>
      <SearchInput onSearch={(term) => setDebouncedSearch(term)} />
      <h1>All Movies</h1>
      <div>
        <button onClick={() => setView("popular")}>Popular</button>

        <button onClick={() => setView("now_playing")}>Now Playing</button>

        <button onClick={() => setView("favorites")}>My Favorites</button>
      </div>

      <div className={styles.movieGrid}>
        {moviesToShow?.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isFavorite={favorites.some((fav) => fav.id === movie.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {view !== "favorites" && (
          <>
            <button onClick={handlePrevPage} disabled={page === 1}>
              Prev
            </button>
            <span style={{ margin: "0 10px" }}>
              Page {page} of {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={page === totalPages}>
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
