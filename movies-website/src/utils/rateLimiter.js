class RateLimiter {
  constructor(maxRequests = 5, timeWindow = 10000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  isAllowed() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.timeWindow,
    );

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

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
export const searchRateLimiter = new RateLimiter(5, 10000);
