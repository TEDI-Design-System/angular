# WCAG Accessibility Review

Target component: `$ARGUMENTS`

## Audit Procedure

### 1. Read the Component

Read all files for the target component:
- `.component.ts` — check host bindings, ARIA attributes set programmatically
- `.component.html` — check template for roles, aria-* attributes, semantic HTML
- `.component.scss` — check focus styles, contrast, reduced motion support
- `.component.spec.ts` — check if accessibility scenarios are tested

### 2. ARIA & Semantics

Check against WAI-ARIA Authoring Practices for the component pattern:

- [ ] Correct `role` attribute for the component type
- [ ] Required ARIA attributes present (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-expanded`, `aria-selected`, `aria-checked`, etc.)
- [ ] `aria-live` regions for dynamic content updates
- [ ] Semantic HTML elements used where possible (`<button>`, `<input>`, `<nav>`, `<dialog>`) instead of ARIA on `<div>`/`<span>`
- [ ] No redundant ARIA (e.g., `role="button"` on `<button>`)
- [ ] `aria-hidden="true"` on decorative elements

### 3. Keyboard Navigation

- [ ] All standalone interactive elements reachable via Tab
- [ ] Composite widgets (listboxes, menus, tabs, grids) are a single Tab stop with internal arrow-key navigation — do not require each child to be Tab-reachable ([APG keyboard patterns](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/))
- [ ] Logical tab order (no positive `tabindex` values)
- [ ] Enter/Space activates buttons and controls
- [ ] Escape closes overlays/popups and returns focus
- [ ] Home/End navigate to first/last item where applicable
- [ ] No keyboard traps — focus can always leave the component

### 4. Focus Management

- [ ] Visible focus indicator on all interactive elements (not relying on browser default if custom styled)
- [ ] Focus moves to newly opened content (dialogs, dropdowns)
- [ ] Focus returns to trigger element when overlay closes
- [ ] `tabindex="-1"` used for programmatically focusable non-interactive elements
- [ ] No focus on hidden/invisible elements

### 5. Visual & Motion

- [ ] Text color contrast meets AA (4.5:1 normal, 3:1 large text)
- [ ] UI component contrast meets AA (3:1 against adjacent colors)
- [ ] Information not conveyed by color alone (icons, text, patterns as alternatives)
- [ ] `prefers-reduced-motion` respected — animations/transitions disabled or reduced
- [ ] Content readable at 200% zoom

### 6. Touch & Pointer

- [ ] Touch targets minimum 24x24 CSS pixels (WCAG 2.5.8 — AA), prefer 44x44 (WCAG 2.5.5 — AAA)
- [ ] Adequate spacing between touch targets (WCAG 2.5.8 — AA)
- [ ] No functionality dependent on hover alone — touch devices can't hover (WCAG 1.4.13 — AA)

### 7. Test Coverage

Check that the spec file includes tests for:
- [ ] ARIA attributes are rendered correctly
- [ ] Keyboard events trigger correct behavior
- [ ] Focus moves as expected
- [ ] Disabled state prevents interaction and is communicated to assistive tech

### 8. Report

Provide findings organized by severity:

**Critical** — WCAG A violations, keyboard traps, missing roles on interactive elements
**Major** — WCAG AA violations, missing ARIA attributes, no visible focus indicator
**Minor** — Best practice improvements, missing `prefers-reduced-motion`, missing test coverage

For each finding, include:
- File and line reference
- What the issue is
- How to fix it
- Which WCAG criterion it violates (e.g., 2.1.1 Keyboard, 4.1.2 Name Role Value)
