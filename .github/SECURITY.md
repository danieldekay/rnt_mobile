# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| 0.5.x | :white_check_mark: |
| < 0.5 | Best effort only |

## Reporting a Vulnerability

Report vulnerabilities privately to the repository owner. Do not publish exploitable security details in a public issue.

## Security Model

RNT Mobile is a static SvelteKit PWA delivered through a Cloudflare Worker Assets service. The Worker also provides same-origin API proxying and selected server-side behavior.

Current controls include:

- HTTPS through Cloudflare
- Content Security Policy and defensive response headers
- DOMPurify for WordPress/editorial HTML
- Cloudflare edge caching only for public read APIs
- Service Worker caching restricted to explicit public GET endpoints
- newsletter/auth/mutating API requests excluded from Service Worker caching
- short-lived, single-use newsletter authenticity nonces
- route-scoped Cloudflare Workers Rate Limiting for newsletter endpoints
- Worker secrets for Sendy API credentials/list identifiers
- consent-gated Matomo analytics and OpenStreetMap tiles
- CI type checks, tests, and build validation before production deployment

### External Services

- Rhein-Neckar-Tango WordPress / Tribe Events API
- Sendy newsletter service
- Matomo analytics after explicit consent
- OpenStreetMap tiles after explicit consent
- Authentik is planned for future authentication but is not yet an application login dependency

### Data Flow

```
Browser / installed PWA
        ↓
Cloudflare Worker Assets (HTTPS)
        ├── static app assets
        ├── same-origin public API proxy/cache
        ├── newsletter endpoints → Sendy
        └── SEO/sitemap handling
        ↓
WordPress / Tribe Events API
```

The app stores local preferences/favorites on the device. Optional analytics and external map requests are consent-gated. Newsletter subscription necessarily processes an email address through the Worker and Sendy.

## Dependency Audit

Run:

```bash
npm audit
npm outdated
npm run test:run
npm run check
npm run build
```

## Deployment

Production is deployed by GitHub Actions to the Cloudflare Worker Assets service `rnt`. Production workflow changes must preserve the test/check/build gate.
