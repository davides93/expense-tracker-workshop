## 2026-10-12 - Optimize Array.find in List Iteration
**Learning:** Performing array searches (`Array.prototype.find`) inside iteration loops over lists of items creates O(N*M) runtime complexity. Creating a `Map` hash lookup via `useMemo` reduces category lookup to O(1) time complexity, reducing render overhead for long expense lists.
**Action:** When mapping over items that require associated metadata by ID, construct a Lookup Map indexed by ID beforehand.

## 2026-10-13 - Memoize Chart.js Data & Options in React
**Learning:** Instantiating chart dataset objects and option literals inside React component render bodies causes new object references on every render, triggering redundant Chart.js canvas re-renders and re-computations.
**Action:** Move static chart option objects outside component scope and wrap chart data transformations with `useMemo` and component with `React.memo`.
