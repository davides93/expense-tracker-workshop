## 2026-05-18 - Unbounded Query Limit & Pagination Validation
**Vulnerability:** Unsanitized and uncapped `limit` and `offset` query parameters allowed callers to request unlimited records or pass non-numeric values, creating a Denial of Service (DoS) risk and query errors.
**Learning:** Destructuring default query parameters (e.g., `{ limit = 50 }`) in Express doesn't guard against explicit string or NaN query values passed in request URLs.
**Prevention:** Explicitly parse query parameters using `parseInt(req.query.param, 10)`, check for `isNaN` and non-positive bounds, and enforce a strict upper cap (e.g., max 100) on pagination limit parameters.
