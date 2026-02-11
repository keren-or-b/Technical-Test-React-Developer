import { useEffect, useState } from "react";

const SearchInput = ({ onSearch }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setValue(value);
    }, 500);

    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    if (value.length >= 2) {
      onSearch(value);
    } else if (value.length === 0) {
      onSearch("");
    }
  }, [value, onSearch]);
  return (
    <div style={{ margin: "20px 0", textAlign: "center" }}>
      <input
        type="text"
        placeholder="Search movies..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
