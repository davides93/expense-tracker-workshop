## 2025-05-18 - Form Label and Input Association Pattern
**Learning:** Form `<label>` components in this app lacked `htmlFor` attributes connecting them to input/select element `id`s, preventing screen readers from identifying field labels on focus and preventing label clicks from focusing inputs.
**Action:** Ensure all form inputs have explicit `id` attributes matching their corresponding `<label htmlFor="...">` props, and add `role="alert"` on dynamically rendered form error boxes.

## 2026-10-13 - Custom Progress Bar ARIA Role Pattern
**Learning:** Custom styled `<div>` progress bars (such as in budget overviews) lack native progress semantics, making budget utilization invisible to screen reader users.
**Action:** Always wrap custom progress bars with `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`, and `aria-valuetext` describing current usage in context.
