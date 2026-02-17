export const localStorageUtils = {
  getFavoritesIds: () => {
    try {
      const stored = localStorage.getItem("favorite_ids");
      const parsed = stored ? JSON.parse(stored) : [];
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
