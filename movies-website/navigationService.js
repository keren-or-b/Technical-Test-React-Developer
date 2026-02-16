// ✅ navigationService.js - לוגיקת ניווט נפרדת

/**
 * מחשב את האינדקס הבא בגריד
 */
export const calculateGridNavigation = (currentIndex, direction, gridConfig) => {
  const { columns, totalItems } = gridConfig;
  
  switch (direction) {
    case "RIGHT":
      return Math.min(currentIndex + 1, totalItems - 1);
    
    case "LEFT":
      return Math.max(currentIndex - 1, 0);
    
    case "UP": {
      const newIndex = currentIndex - columns;
      return newIndex >= 0 ? newIndex : -1; // -1 = צריך לעבור לאזור אחר
    }
    
    case "DOWN": {
      const newIndex = currentIndex + columns;
      return newIndex < totalItems ? newIndex : -1; // -1 = צריך לעבור לאזור אחר
    }
    
    default:
      return currentIndex;
  }
};

/**
 * מחליט לאיזה אזור לעבור
 */
export const getNextArea = (focusArea, direction, hasMovies) => {
  const areaFlow = {
    SEARCH: {
      DOWN: "NAV_BAR"
    },
    NAV_BAR: {
      UP: "SEARCH",
      DOWN: hasMovies ? "MOVIE_GRID" : "NAV_BAR",
    },
    MOVIE_GRID: {
      UP: "NAV_BAR",
      DOWN: "PAGINATION",
    },
    PAGINATION: {
      UP: hasMovies ? "MOVIE_GRID" : "NAV_BAR",
    },
  };

  return areaFlow[focusArea]?.[direction] || focusArea;
};

/**
 * ממיר view index ל-view name
 */
export const VIEW_CATEGORIES = ["popular", "now_playing", "favorites"];

export const getViewByIndex = (index) => {
  return VIEW_CATEGORIES[index] || "popular";
};

export const getIndexByView = (view) => {
  return VIEW_CATEGORIES.indexOf(view);
};
