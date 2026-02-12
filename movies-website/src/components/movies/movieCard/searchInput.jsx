import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { moveFocus, setSearchTerm } from "../../../store/movieSlice";

const SearchInput = ({}) => {
  const inputRef = useRef();
  const dispatch = useDispatch();

  const currentArea = useSelector((state) => state.movies.currentArea);
  const searchTerm = useSelector((state) => state.movies.searchTerm);

  // const [value, setValue] = useState("");
  useEffect(() => {
    if (currentArea === "SEARCH") {
      inputRef.current?.focus();
    }
  }, [currentArea]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (currentArea === "SEARCH") {
          dispatch(moveFocus({ key: "Escape" })); // חזור לפוקוס הראשי
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentArea, dispatch]);

  // const handleChange = (e) => {
  //   const newValue = e.target.value;
  //   setValue(newValue);
  //   onSearch(newValue);
  // };
  const handleChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  return (
    <div style={{ margin: "20px 0", textAlign: "center" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search movies..."
        value={searchTerm} // ← כאן
        onChange={handleChange}
        style={{
          padding: "8px 12px",
          width: "250px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          outline: "none",
        }}
      />
    </div>
  );
};

export default SearchInput;
