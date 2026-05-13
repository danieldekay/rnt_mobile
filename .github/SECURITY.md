# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report security vulnerabilities to **Daniel** via GitHub Issues with tag `security` or email directly.

Do NOT report security vulnerabilities in public issues.

## Security Measures

This project implements:

- **HTTPS only** - enforced by Cloudflare
- **Static output** - no server-side code, minimal attack surface
- **CSP** - Content Security Policy in headers
- **No secrets** - all data comes from public WordPress API
- **Subresource Integrity** - for external scripts (SRI in production)

### External Dependencies

- WordPress Events API (rhein-neckar-tango.de) - public, read-only
- OpenStreetMap tiles - public, HTTPS
- Cloudflare Pages - hosting with free SSL

### Data Flow

```
User → Cloudflare Pages (HTTPS)
     ↓
Static App (no server-side)
     ↓
WordPress REST API (public events only)
```

No user data is collected. No cookies. No personal data storage.

## Dependencies Audit

Run locally:

```bash
npm audit
npm outdated
```

## CodeQL

GitHub runs CodeQL on every push to detect vulnerabilities.

## Compliance

This is a static PWA displaying public event data. No GDPR concerns as:
- No user accounts
- No personal data collected
- No cookies
- No tracking
- No third-party analytics