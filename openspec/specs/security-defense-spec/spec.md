# security-defense-spec Specification

## Purpose
TBD - created by archiving change 2026-05-05-fix-dom-purify-safety. Update Purpose after archive.
## Requirements
### Requirement: Block self-executing HTML in sanitized descriptions
The `sanitizeHtml()` function in `src/lib/utils/html.ts` SHALL reject `on*` attributes and `<svg>`/`<math>` elements from event description HTML.

#### Scenario: Malicious SVG onload is stripped
- **WHEN** `sanitizeHtml` receives `<svg onload="alert(1)">`, an SVG element with any `on*` attribute
- **THEN** the output HTML does NOT contain that element or attribute

#### Scenario: Malicious inline event attributes are stripped
- **WHEN** `sanitizeHtml` receives `<div onclick="alert(1)">Hello</div>`
- **THEN** the output HTML does NOT contain the `onclick` attribute

#### Scenario: Legitimate event description still renders correctly
- **WHEN** `sanitizeHtml` receives a normal WordPress event description with `<p>`, `<strong>`, `<a>`, `<br>`, etc.
- **THEN** the output HTML preserves all safe tags and attributes

### Requirement: No behavioral regression in event detail rendering
- **WHEN** the detail page renders `sanitizedDescription`
- **THEN** correctly-formed event descriptions render identically to before the security fix

