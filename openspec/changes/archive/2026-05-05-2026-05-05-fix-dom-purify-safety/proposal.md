## Why

The detail page uses `DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })` to sanitize event descriptions before rendering them with `{@html}`. This configuration is permissive — it allows `on*` event attributes (including `onload` on SVG and MathML elements), which is a known XSS bypass vector. A malicious WordPress admin could inject a self-executing payload via an `<svg onload="...">` element, causing JavaScript execution in any user's browser.

Fixing this is a low-risk, high-impact change. It adds two lines to the sanitize configuration and eliminates a real security gap with no behavioral impact on correctly-formed content.

## What Changes

- Add `FORBID_TAGS: ['svg', 'math']` and `FORBID_ATTR: ['on*']` to the DOMPurify configuration in `src/lib/utils/html.ts`.
- This tightens sanitization to block self-executing HTML payloads while preserving all legitimate event description content.

## Capabilities

### Modified Capabilities
- `security-defense`: Tightens the HTML sanitization pipeline in `src/lib/utils/html.ts` to block `on*` attributes and dangerous `<svg>`/`<math>` tags, preventing self-executing DOM payloads in event descriptions.

## Impact

- Affected file: `src/lib/utils/html.ts` only.
- No WordPress API or data-shape changes.
- No deployment-model changes.
