# Design: Newsletter Enhancement

## Architecture

The newsletter enhancement adds a signup flow with email verification, preference management, and unsubscribe options. The architecture extends the existing `NewsletterSignup.svelte` component with new helper modules for signup logic and preferences.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  src/routes/newsletter/+page.html                                        │
│                                                                          │
│    <NewsletterSignup email={userEmail} />                                │
│    └──> NewsletterSignup.svelte (modified)                               │
│         ├── Email input + submit button                                    │
│         ├── Unsubscribe link                                               │
│         └── Preference center (after signup)                               │
│              ├── Frequency radio (daily/weekly/monthly)                   │
│              ├── Category checkboxes                                       │
│              └── Save button → updatePreferences()                        │
└──────────────────────────────────────────────────────────────────────────┘
```

## File Structure

### `src/lib/newsletter/signup.ts` (New)

Newsletter signup logic module.

```typescript
export type SignupResponse = {
  success: boolean;
  error: string | null;
  message: string;
};

export async function subscribe(email: string): Promise<SignupResponse>;
export async function unsubscribe(email: string): Promise<SignupResponse>;
export async function verifyEmail(token: string): Promise<SignupResponse>;
```

### `src/lib/newsletter/preferences.ts` (New)

Preference center module for managing email frequency and categories.

```typescript
export type PreferenceState = {
  subscribed: boolean;
  categories: string[];
  frequency: "daily" | "weekly" | "monthly";
};

export async function getPreferences(): Promise<PreferenceState>;
export async function updatePreferences(prefs: PreferenceState): Promise<void>;
export async function subscribe(email: string): Promise<PreferenceState>;
```

### `src/lib/newsletter/email.ts` (New)

Email handling utilities for verification and welcome emails.

```typescript
export async function sendVerificationEmail(email: string): Promise<void>;
export async function sendWelcomeEmail(email: string): Promise<void>;
```

### `src/lib/components/NewsletterSignup.svelte` (Modified)

Updated component supporting full lifecycle: signup, verify, unsubscribe, resubscribe.

**New behaviors:**

- Unsubscribe link in footer
- Preference center section (after successful signup)
- Verification handling from URL params

**Existing behaviors preserved:**

- Email input with validation
- Submit → Sendy API
- Success/error state display
- Honeypot spam protection

### `src/lib/newsletter/sendy.ts` (Modified)

Sendy integration extended with `unsubscribe`, `verify`, and `preferences` endpoints.

## Data Flow

```
1. User opens /newsletter
2. NewsletterSignup renders email input + subscribe button
3. User enters email, clicks "Subscribe"
4. subscribe(email) called → src/lib/newsletter/sendy.ts
5. Sendy returns: { success: true, message: '...' }
6. SUCCESS: Confirmation shown, preference center opened
7. FAILURE: Error shown with retry option
8. User clicks "Unsubscribe" → unsubscribe(email) → Sendy
9. Sendy returns success → "Unsubscribed" shown
10. User opens preference center → getPreferences() → Sendy
11. User updates frequency/categories → updatePreferences() → Sendy
12. Email verification via URL param → verifyEmail(token) → Sendy
```

## Testing

### Unit Tests

- `tests/newsletter/signup.test.ts`: `subscribe`, `unsubscribe`, `verifyEmail`
- `tests/newsletter/preferences.test.ts`: `getPreferences`, `updatePreferences`
- `tests/newsletter/email.test.ts`: `sendVerificationEmail`, `sendWelcomeEmail`

### Manual Tests

- Signup flow: valid email → confirmation, invalid email → error
- Unsubscribe flow: link click → unsubscribed message, re-subscribe works
- Preference center: open → current prefs shown, update → saved
- Verification: valid token → verified message, invalid → error
- Newsletter route: `/newsletter` loads Signup component, meta tags present
