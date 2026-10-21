## 2025-05-18 - Unbounded Pagination Limit DoS
**Vulnerability:** The `/api/expenses` endpoint accepted `limit` and `offset` query parameters without enforcing upper bounds or integer validation, allowing potential Denial of Service (DoS) attacks via massive memory/database load.
**Learning:** Query parameters extracted directly from `req.query` in Express routes must always be validated, parsed to integers, and clamped to safe limits before being passed into database SQL queries with `LIMIT` and `OFFSET`.
**Prevention:** Always sanitize pagination input using explicit bound limits (e.g., `Math.min(parsedLimit, MAX_LIMIT)` and `Math.max(0, parsedOffset)`).
