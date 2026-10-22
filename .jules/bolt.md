## 2026-10-12 - Optimize Array.find in List Iteration
**Learning:** Performing array searches (`Array.prototype.find`) inside iteration loops over lists of items creates O(N*M) runtime complexity. Creating a `Map` hash lookup via `useMemo` reduces category lookup to O(1) time complexity, reducing render overhead for long expense lists.
**Action:** When mapping over items that require associated metadata by ID, construct a Lookup Map indexed by ID beforehand.

## 2026-10-13 - SARGable Queries vs Function Calls on Indexed Columns
**Learning:** Applying PostgreSQL functions like `DATE_TRUNC('month', column)` in `WHERE` or `JOIN` conditions makes the query non-SARGable, forcing PostgreSQL to execute full table scans instead of using existing B-tree indexes.
**Action:** Replace `DATE_TRUNC('month', col) = DATE_TRUNC('month', CURRENT_DATE)` with range predicates (`col >= DATE_TRUNC('month', CURRENT_DATE) AND col < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`) to enable index range scans.
