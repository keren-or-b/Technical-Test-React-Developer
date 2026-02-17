// utils/localStorage.js

export const localStorageUtils = {
  getFavoritesIds: () => {
    try {
      const stored = localStorage.getItem("favorite_ids");
      const parsed = stored ? JSON.parse(stored) : [];
      // וידוא שאנחנו מחזירים רק מספרים
      return Array.isArray(parsed)
        ? parsed.filter((id) => typeof id === "number")
        : [];
    } catch (e) {
      return [];
    }
  },

  saveFavoritesIds: (ids) => {
    localStorage.setItem("favorite_ids", JSON.stringify(ids));
  },
};
