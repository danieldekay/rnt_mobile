## ADDED Requirements

### Requirement: Block self-executing HTML in sanitized descriptions
- [x] 1.1 Add `FORBID_TAGS: ['svg', 'math']` and `FORBID_ATTR: ['on*']` to the `sanitizeHtml` options in `src/lib/utils/html.ts`

### Requirement: Verify no regression for legitimate content
- [x] 1.2 Ensure `sanitizeHtml` still preserves `<p>`, `<strong>`, `<a href>`, `<br>`, and other common WordPress HTML elements
