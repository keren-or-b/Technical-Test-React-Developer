// ✅ rateLimitMiddleware.js - Rate limiting נכון

import { setSearchTerm } from "../redux/movies/movieSlice";

/**
 * Middleware לניהול Rate Limiting של חיפוש
 */
class RateLimiter {
  constructor(maxRequests = 5, timeWindow = 10000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow; // milliseconds
    this.requests = [];
  }

  isAllowed() {
    const now = Date.now();
    
    // ניקוי בקשות ישנות
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    // בדיקת מגבלה
    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    // הוספת בקשה נוכחית
    this.requests.push(now);
    return true;
  }

  getRemainingTime() {
    if (this.requests.length === 0) return 0;
    
    const oldest = this.requests[0];
    const now = Date.now();
    const elapsed = now - oldest;
    
    return Math.max(0, this.timeWindow - elapsed);
  }

  reset() {
    this.requests = [];
  }
}

// יצירת instance
const searchRateLimiter = new RateLimiter(5, 10000);

/**
 * Redux Middleware
 */
export const rateLimitMiddleware = (store) => (next) => (action) => {
  // בודקים רק פעולות של setSearchTerm
  if (action.type === setSearchTerm.type) {
    const searchTerm = action.payload;
    
    // אם יש טקסט חיפוש
    if (searchTerm && searchTerm.length >= 2) {
      if (!searchRateLimiter.isAllowed()) {
        const remaining = Math.ceil(searchRateLimiter.getRemainingTime() / 1000);
        
        console.warn(
          `Rate limit exceeded. Please wait ${remaining} seconds.`
        );
        
        // אפשר להוסיף כאן dispatch של error action
        // store.dispatch(showRateLimitError(remaining));
        
        return; // חוסמים את הפעולה
      }
    }
  }

  return next(action);
};

export default rateLimitMiddleware;
