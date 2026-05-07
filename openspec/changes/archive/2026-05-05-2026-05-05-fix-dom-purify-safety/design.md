## Context

The detail page (`src/routes/event/[id]/+page.svelte`) renders `event.description` using `{@html sanitizedDescription}`, where `sanitizedDescription` is produced by `sanitizeHtml()` from `src/lib/utils/html.ts`. The current `sanitizeHtml` call uses:

```ts
DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
```

The `html` profile allows `on*` attributes on most elements. This means a WordPress admin injecting:

```html
<svg onload="alert(1)"><img onerror=alert(2) src=x>
```

would pass through DOMPurify unchanged, because `onload` and `onerror` are valid attributes on the SVG spec. The current `sanitizeText` (which strips all tags) is safe and correct — only `sanitizeHtml` needs tightening.

The fix is straightforward: add `FORBID_TAGS` and `FORBID_ATTR` to the configuration.

## Decisions

### Decision: Add FORBID_TAGS and FORBID_ATTR to sanitizeHtml
- **Choice:** Append `{ FORBID_TAGS: ['svg', 'math'], FORBID_ATTR: ['on*'] }` to the existing DOMPurify options.
- **Rationale:** Blocks self-executing HTML payloads at the sanitize layer without changing any behavior for legitimate event descriptions (which don't use `on*` or inline SVG).
- **Alternative:** Switch to `DOMPurify.sanitize(html)` with no options (uses defaults, which are stricter).
- **Why not:** Default config differs by DOMPurify version and might unintentionally strip valid attributes. Explicit config is safer and clearer.

### Decision: Apply the same fix to sanitizeText for consistency
- **Choice:** Keep `sanitizeText` as-is (it already strips all tags and attributes).
- **Reasoning:** `sanitizeText` uses `ALLOWED_TAGS: []` and `ALLOWED_ATTR: []`, which is already maximum-tight. No change needed.
