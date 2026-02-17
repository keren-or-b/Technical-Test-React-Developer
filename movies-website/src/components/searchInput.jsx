import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
// ייבוא הפעולות והסלקטורים
import {
  setSearchTerm,
  selectFocusArea,
  selectSearchTerm,
  setFocusArea,
  setFocusIndex,
  selectCurrentView,
} from "../redux/movies/movieSlice";

// ייבוא העיצוב החדש
import styles from "./searchInput.module.css";
import { getIndexByView } from "../services/navigationService";

const SearchInput = () => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();

  const focusArea = useSelector(selectFocusArea);
  const searchTerm = useSelector(selectSearchTerm);
  const currentView = useSelector(selectCurrentView);

  // סנכרון פוקוס
  useEffect(() => {
    if (focusArea === "SEARCH") {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [focusArea]);
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault(); // מונע התנהגות דפדפן ברירת מחדל

      // הסרת הפוקוס מה-DOM
      inputRef.current?.blur();

      // ביצוע פעולות הניווט (בדיוק כמו ב-Hook)
      dispatch(setSearchTerm("")); // איפוס הטקסט
      dispatch(setFocusArea("NAV_BAR")); // מעבר ל-NavBar
      dispatch(setFocusIndex(getIndexByView(currentView))); // סימון הטאב הנכון
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
          onKeyDown={handleKeyDown} // <--- הוספנו את ההאזנה כאן
          className={`${styles.input} ${isFocused ? styles.focused : ""}`}
        />
        {/* אייקון חיפוש קטן בצד שמאל */}
        <span className={styles.searchIcon}>🔍</span>
      </div>
    </div>
  );
};

export default SearchInput;
