## Why

The existing NewsletterSignup component on `/newsletter` provides basic email subscription but lacks critical user experience features: an unsubscribe link, a preference center for managing email frequency and categories, and email verification flow. Users have no way to update their subscription preferences beyond full unsubscribe, and there is no verification step to confirm email addresses. This leads to churn from users who want to reduce frequency rather than unsubscribe entirely, and from verification failures that go untracked.

## What Changes

- NEW — `src/lib/newsletter/signup.ts`: Newsletter signup logic with `subscribe(email)`, `unsubscribe(email)`, `verifyEmail(token)` functions
- NEW — `src/lib/newsletter/preferences.ts`: Preference center with `getPreferences()`, `updatePreferences()`, with state shape including `subscribed`, `categories`, `frequency`
- NO new dependencies — all logic uses existing Sendy API integration (`src/lib/newsletter/sendy.ts`)
- MODIFIED — `src/routes/newsletter/+page.html`: Enhanced with unsubscribe link, preference center UI, and verification confirmation
- MODIFIED — `src/lib/components/NewsletterSignup.svelte`: Updated to support full lifecycle (signup → verify → preferences → unsubscribe → resubscribe)

### Capabilities

#### New Capabilities

- `newsletter-signup`: Enhanced newsletter signup flow with email verification, preference management, and unsubscribe options
- `newsletter-preferences`: Preference center allowing users to manage email frequency and category subscriptions

#### Modified Capabilities

- `newsletter-subscribe`: Existing subscribe flow enhanced with verification step and confirmation email
- `newsletter-sendy`: Sendy integration now handles subscribe, unsubscribe, verify, and preference update operations

## Impact

- Affected files:
  - `src/lib/newsletter/signup.ts` (new)
  - `src/lib/newsletter/preferences.ts` (new)
  - `src/lib/newsletter/sendy.ts` (modified)
  - `src/routes/newsletter/+page.html` (modified)
  - `src/lib/components/NewsletterSignup.svelte` (modified)
  - `src/lib/newsletter/email.ts` (new — email handling utilities)
- No WordPress API or data-shape changes
- No deployment-model changes
- No auth changes (newsletters are first-party, no PII beyond email)
