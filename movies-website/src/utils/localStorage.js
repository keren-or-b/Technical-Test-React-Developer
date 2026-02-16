// utils/localStorage.js
// const FAVORITES_KEY = 'movieFavorites';
const FAVORITES_KEY = 'favorites';

export const localStorageUtils = {
  // קריאה מהזיכרון (רק בטעינת האפליקציה)
  getFavorites: () => {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  },

  // שמירה לזיכרון (בכל פעם שה-Redux משתנה)
  saveFavorites: (favorites) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }
};