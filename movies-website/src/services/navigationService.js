import { VIEW_CATEGORIES } from "../utils/constants";

export const FOCUS_AREAS = {
  SEARCH: "SEARCH",
  NAV_BAR: "NAV_BAR",
  MOVIE_GRID: "MOVIE_GRID",
  PAGINATION: "PAGINATION",
  MOVIE_DETAILS: "MOVIE_DETAILS",
};

export const DIRECTIONS = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
};

// ============================================
// VIEW HELPERS
// ============================================

export const getViewByIndex = (index) => {
  return VIEW_CATEGORIES[index] || "popular";
};

export const getIndexByView = (view) => {
  const index = VIEW_CATEGORIES.indexOf(view);
  return index >= 0 ? index : 0;
};

export const calculateGridMove = ({
  currentIndex,
  direction,
  gridColumns,
  totalItems,
}) => {
  switch (direction) {
    case DIRECTIONS.RIGHT: {
      const newIndex = currentIndex + 1;
      if (newIndex < totalItems) {
        return { newIndex, shouldChangeArea: false };
      }
      return { newIndex: currentIndex, shouldChangeArea: false };
    }

    case DIRECTIONS.LEFT: {
      const newIndex = currentIndex - 1;
      if (newIndex >= 0) {
        return { newIndex, shouldChangeArea: false };
      }
      return { newIndex: currentIndex, shouldChangeArea: false };
    }

    case DIRECTIONS.UP: {
      const newIndex = currentIndex - gridColumns;
      if (newIndex >= 0) {
        return { newIndex, shouldChangeArea: false };
      }
      return {
        newIndex: currentIndex,
        shouldChangeArea: true,
        newArea: FOCUS_AREAS.NAV_BAR,
      };
    }

    case DIRECTIONS.DOWN: {
      const newIndex = currentIndex + gridColumns;
      if (newIndex < totalItems) {
        // תנועה בתוך הגריד
        return { newIndex, shouldChangeArea: false };
      }
      // צריך לעבור ל-PAGINATION
      return {
        newIndex: currentIndex,
        shouldChangeArea: true,
        newArea: FOCUS_AREAS.PAGINATION,
      };
    }

    default:
      return { newIndex: currentIndex, shouldChangeArea: false };
  }
};

// ============================================
// NAV BAR LOGIC
// ============================================

export const calculateNavBarMove = ({ currentIndex, direction }) => {
  const maxIndex = VIEW_CATEGORIES.length - 1;

  switch (direction) {
    case DIRECTIONS.LEFT:
      return Math.max(0, currentIndex - 1);
    case DIRECTIONS.RIGHT:
      return Math.min(maxIndex, currentIndex + 1);
    default:
      return currentIndex;
  }
};

// ============================================
// PAGINATION LOGIC
// ============================================

export const calculatePaginationMove = ({ currentIndex, direction }) => {
  const maxIndex = 1;

  switch (direction) {
    case DIRECTIONS.LEFT:
      return Math.max(0, currentIndex - 1);
    case DIRECTIONS.RIGHT:
      return Math.min(maxIndex, currentIndex + 1);
    default:
      return currentIndex;
  }
};

// ============================================
// MAIN NAVIGATION CALCULATOR
// ============================================

export const calculateNavigation = ({
  currentArea,
  currentIndex,
  direction,
  gridColumns,
  totalMovies,
  hasMovies,
  currentView,
  isPaginationVisible,
}) => {
  switch (currentArea) {
    case FOCUS_AREAS.SEARCH: {
      if (direction === DIRECTIONS.DOWN) {
        return {
          type: "CHANGE_AREA",
          newArea: FOCUS_AREAS.NAV_BAR,
          newIndex: getIndexByView(currentView),
        };
      }
      return { type: "NO_CHANGE" };
    }

    case FOCUS_AREAS.NAV_BAR: {
      if (direction === DIRECTIONS.UP) {
        return {
          type: "CHANGE_AREA",
          newArea: FOCUS_AREAS.SEARCH,
          newIndex: 0,
        };
      }

      if (direction === DIRECTIONS.DOWN && hasMovies) {
        return {
          type: "CHANGE_AREA",
          newArea: FOCUS_AREAS.MOVIE_GRID,
          newIndex: 0,
        };
      }

      if (direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT) {
        const newIndex = calculateNavBarMove({ currentIndex, direction });
        return {
          type: "UPDATE_INDEX",
          newIndex,
        };
      }

      return { type: "NO_CHANGE" };
    }

    case FOCUS_AREAS.MOVIE_GRID: {
      const gridMove = calculateGridMove({
        currentIndex,
        direction,
        gridColumns,
        totalItems: totalMovies,
      });

      if (gridMove.shouldChangeArea) {
        if (
          gridMove.newArea === FOCUS_AREAS.PAGINATION &&
          !isPaginationVisible
        ) {
          return { type: "NO_CHANGE" };
        }
        let targetIndex = 0;

        if (gridMove.newArea === FOCUS_AREAS.NAV_BAR) {
          targetIndex = getIndexByView(currentView);
        }

        if (gridMove.newArea === FOCUS_AREAS.PAGINATION) {
          targetIndex = 1; // 0 = Prev, 1 = Next
        }
        return {
          type: "CHANGE_AREA",
          newArea: gridMove.newArea,
          newIndex: targetIndex,
        };
      }

      return {
        type: "UPDATE_INDEX",
        newIndex: gridMove.newIndex,
      };
    }

    case FOCUS_AREAS.PAGINATION: {
      if (direction === DIRECTIONS.UP) {
        return {
          type: "CHANGE_AREA",
          newArea: hasMovies ? FOCUS_AREAS.MOVIE_GRID : FOCUS_AREAS.NAV_BAR,
          newIndex: hasMovies ? totalMovies - 1 : 0,
        };
      }

      if (direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT) {
        const newIndex = calculatePaginationMove({ currentIndex, direction });
        return {
          type: "UPDATE_INDEX",
          newIndex,
        };
      }

      return { type: "NO_CHANGE" };
    }
    case FOCUS_AREAS.MOVIE_DETAILS: {
      // 0 = כפתור מועדפים, 1 = כפתור חזרה
      if (direction === DIRECTIONS.RIGHT) {
        return { type: "UPDATE_INDEX", newIndex: 1 };
      }
      if (direction === DIRECTIONS.LEFT) {
        return { type: "UPDATE_INDEX", newIndex: 0 };
      }
      return { type: "NO_CHANGE" };
    }

    default:
      return { type: "NO_CHANGE" };
  }
};

// ============================================
// ENTER ACTIONS
// ============================================
export const getEnterAction = ({
  currentArea,
  currentIndex,
  movies,
  page,
  totalPages,
}) => {
  switch (currentArea) {
    case FOCUS_AREAS.NAV_BAR: {
      const selectedView = getViewByIndex(currentIndex);
      return {
        type: "SELECT_VIEW",
        view: selectedView,
      };
    }

    case FOCUS_AREAS.MOVIE_GRID: {
      const selectedMovie = movies[currentIndex];
      if (selectedMovie) {
        return {
          type: "SELECT_MOVIE",
          movieId: selectedMovie.id,
        };
      }
      return { type: "NO_ACTION" };
    }

    case FOCUS_AREAS.PAGINATION: {
      if (currentIndex === 0 && page > 1) {
        return {
          type: "PREVIOUS_PAGE",
        };
      }
      if (currentIndex === 1 && page < totalPages) {
        return {
          type: "NEXT_PAGE",
        };
      }
      return { type: "NO_ACTION" };
    }

    case FOCUS_AREAS.MOVIE_DETAILS: {
      if (currentIndex === 0) {
        return { type: "TOGGLE_FAVORITE_DETAILS" }; // הוספה למועדפים
      }
      if (currentIndex === 1) {
        return { type: "GO_BACK" };
      }
      return { type: "NO_ACTION" };
    }

    default:
      return { type: "NO_ACTION" };
  }
};
