import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const SearchInput = ({ onSearch }) => {
  const inputRef = useRef();
  const currentArea = useSelector((state) => state.movies.currentArea);

  const [value, setValue] = useState("");
  useEffect(() => {
    if (currentArea  === "SEARCH") {
      inputRef.current?.focus();
    }
  }, [currentArea]);
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  return (
    <div style={{ margin: "20px 0", textAlign: "center" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search movies..."
        value={value}
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
