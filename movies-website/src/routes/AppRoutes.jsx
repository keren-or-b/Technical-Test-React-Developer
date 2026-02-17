import { Routes, Route } from "react-router-dom";
import MoviesPage from "../pages/MoviesPage.jsx";
import MovieDetails from "../pages/MovieDetails.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MoviesPage />} />
      <Route path="/movie/:id" element={<MovieDetails />} />
    </Routes>
  );
}
