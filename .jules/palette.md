## 2025-05-18 - Form Label and Input Association Pattern
**Learning:** Form `<label>` components in this app lacked `htmlFor` attributes connecting them to input/select element `id`s, preventing screen readers from identifying field labels on focus and preventing label clicks from focusing inputs.
**Action:** Ensure all form inputs have explicit `id` attributes matching their corresponding `<label htmlFor="...">` props, and add `role="alert"` on dynamically rendered form error boxes.

## 2026-10-24 - Navigation Accessibility and Focus Visible Pattern
**Learning:** Custom tab-based view toggle buttons in SPA layouts lacked `aria-current="page"` and focus indicators (`.btn:focus-visible`), leaving screen reader users unable to identify the active view and keyboard users unable to locate focus state.
**Action:** Add `aria-current="page"` to active view buttons, `aria-label` on nav containers and action buttons, and `.btn:focus-visible` ring styles in CSS.
