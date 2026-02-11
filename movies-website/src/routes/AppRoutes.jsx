import { Routes, Route } from "react-router-dom";
import MoviesPage from "../pages//movies.jsx";
import MovieDetails from "../pages/MovieDetails.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/movie/:id" element={<MovieDetails />} />
    </Routes>
  );
}
