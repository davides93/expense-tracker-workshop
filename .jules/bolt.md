## 2026-10-12 - Optimize Array.find in List Iteration
**Learning:** Performing array searches (`Array.prototype.find`) inside iteration loops over lists of items creates O(N*M) runtime complexity. Creating a `Map` hash lookup via `useMemo` reduces category lookup to O(1) time complexity, reducing render overhead for long expense lists.
**Action:** When mapping over items that require associated metadata by ID, construct a Lookup Map indexed by ID beforehand.
