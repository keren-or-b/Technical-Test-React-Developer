import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
// ייבוא הפעולות והסלקטורים
import {
  setSearchTerm,
  selectFocusArea,
  selectSearchTerm,
} from "../redux/movies/movieSlice";

// ייבוא העיצוב החדש
import styles from "./searchInput.module.css";

const SearchInput = () => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();

  const focusArea = useSelector(selectFocusArea);
  const searchTerm = useSelector(selectSearchTerm);

  // סנכרון פוקוס
  useEffect(() => {
    if (focusArea === "SEARCH") {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [focusArea]);

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
          className={`${styles.input} ${isFocused ? styles.focused : ""}`}
        />
        {/* אייקון חיפוש קטן בצד שמאל */}
        <span className={styles.searchIcon}>🔍</span>
      </div>
    </div>
  );
};

export default SearchInput;
