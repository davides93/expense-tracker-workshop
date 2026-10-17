## 2025-05-18 - Expense Endpoint Input Validation and Query Bounds
**Vulnerability:** Unbounded pagination (`limit`/`offset`) and missing input validation in expense POST/PUT routes allowing negative, non-finite, or huge query parameters.
**Learning:** `req.query` and `req.body` parameters were directly passed to query parameters without verifying finite positive numbers or date validity, risking query execution errors and DoS through massive offset/limit query values.
**Prevention:** Always validate and clamp pagination parameters (`limit` max 100, `offset` >= 0) and validate payload types before passing them to the database layer.
