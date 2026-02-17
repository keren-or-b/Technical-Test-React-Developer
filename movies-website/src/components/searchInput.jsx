import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearchTerm,
  selectFocusArea,
  selectSearchTerm,
  setFocusArea,
  setFocusIndex,
  selectCurrentView,
} from "../redux/movies/movieSlice";
import styles from "./searchInput.module.css";
import { getIndexByView } from "../services/navigationService";

const SearchInput = () => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();

  const focusArea = useSelector(selectFocusArea);
  const searchTerm = useSelector(selectSearchTerm);
  const currentView = useSelector(selectCurrentView);

  useEffect(() => {
    if (focusArea === "SEARCH") {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [focusArea]);
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();

      inputRef.current?.blur();

      dispatch(setSearchTerm(""));
      dispatch(setFocusArea("NAV_BAR"));
      dispatch(setFocusIndex(getIndexByView(currentView)));
    }
  };

  const handleChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  // בדיקה האם האינפוט בפוקוס כרגע (לצורך עיצוב)
  const isFocused = focusArea === "SEARCH";

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Titles, people, genres..."
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`${styles.input} ${isFocused ? styles.focused : ""}`}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>
    </div>
  );
};

export default SearchInput;
