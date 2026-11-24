## 2025-05-18 - Form Label and Input Association Pattern
**Learning:** Form `<label>` components in this app lacked `htmlFor` attributes connecting them to input/select element `id`s, preventing screen readers from identifying field labels on focus and preventing label clicks from focusing inputs.
**Action:** Ensure all form inputs have explicit `id` attributes matching their corresponding `<label htmlFor="...">` props, and add `role="alert"` on dynamically rendered form error boxes.

## 2026-10-22 - Secondary Text Contrast and Navigation Semantics
**Learning:** Secondary metadata text (such as dates rendered in `#999`) failed WCAG AA contrast against white card backgrounds (~2.8:1). Updating to `#595959` achieves compliant contrast (>= 4.5:1). Additionally, main navigation controls required explicit `aria-label` and `aria-current="page"` attributes to communicate view state to screen readers.
**Action:** Use `#595959` or darker for muted text on light backgrounds, and attach `aria-label` and `aria-current="page"` to navigation buttons.

## 2026-10-24 - Navigation Accessibility and Focus Visible Pattern
**Learning:** Custom tab-based view toggle buttons in SPA layouts lacked `aria-current="page"` and focus indicators (`.btn:focus-visible`), leaving screen reader users unable to identify the active view and keyboard users unable to locate focus state.
**Action:** Add `aria-current="page"` to active view buttons, `aria-label` on nav containers and action buttons, and `.btn:focus-visible` ring styles in CSS.

## 2026-10-13 - Custom Progress Bar ARIA Role Pattern
**Learning:** Custom styled `<div>` progress bars (such as in budget overviews) lack native progress semantics, making budget utilization invisible to screen reader users.
**Action:** Always wrap custom progress bars with `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`, and `aria-valuetext` describing current usage in context.
