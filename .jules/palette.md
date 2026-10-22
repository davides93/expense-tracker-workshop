## 2025-05-18 - Form Label and Input Association Pattern
**Learning:** Form `<label>` components in this app lacked `htmlFor` attributes connecting them to input/select element `id`s, preventing screen readers from identifying field labels on focus and preventing label clicks from focusing inputs.
**Action:** Ensure all form inputs have explicit `id` attributes matching their corresponding `<label htmlFor="...">` props, and add `role="alert"` on dynamically rendered form error boxes.

## 2026-10-22 - Secondary Text Contrast and Navigation Semantics
**Learning:** Secondary metadata text (such as dates rendered in `#999`) failed WCAG AA contrast against white card backgrounds (~2.8:1). Updating to `#595959` achieves compliant contrast (>= 4.5:1). Additionally, main navigation controls required explicit `aria-label` and `aria-current="page"` attributes to communicate view state to screen readers.
**Action:** Use `#595959` or darker for muted text on light backgrounds, and attach `aria-label` and `aria-current="page"` to navigation buttons.
