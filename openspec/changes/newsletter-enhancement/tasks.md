# Tasks: Newsletter Enhancement

## Task Group: Newsletter API Module

### Task 0.1: Create newsletter signup module

**File:** `src/lib/newsletter/signup.ts`
**Dependencies:** `src/lib/newsletter/sendy.ts`

Create the newsletter signup logic module with helper functions.

**Implementation:**

1. `subscribe(email: string): Promise<SignupResponse>` — send subscribe request to Sendy
2. `unsubscribe(email: string): Promise<SignupResponse>` — send unsubscribe request to Sendy
3. `verifyEmail(token: string): Promise<SignupResponse>` — verify email via token
4. `SignupResponse` type with `success`, `error`, `message` fields

**Acceptance:**

- [ ] Type `SignupResponse` is exported
- [ ] `subscribe()` returns Promise<SignupResponse>
- [ ] `unsubscribe()` returns Promise<SignupResponse>
- [ ] `verifyEmail()` returns Promise<SignupResponse>
- [ ] All functions delegate to `sendy.ts` Sendy integration
- [ ] Error responses include descriptive message strings

---

### Task 0.2: Create newsletter preferences module

**File:** `src/lib/newsletter/preferences.ts`
**Dependencies:** `src/lib/newsletter/sendy.ts`

Create the preference center logic for managing email frequency and categories.

**Implementation:**

1. `PreferenceState` type with `subscribed`, `categories`, `frequency`
2. `getPreferences(): Promise<PreferenceState>` — fetch current preferences
3. `updatePreferences(prefs: PreferenceState): Promise<void>` — update preferences on Sendy
4. `subscribe(email: string): Promise<PreferenceState>` — subscribe with default preferences

**Acceptance:**

- [ ] Type `PreferenceState` includes `subscribed: boolean`, `categories: string[]`, `frequency: enum`
- [ ] `frequency` enum supports `'daily' | 'weekly' | 'monthly'`
- [ ] `getPreferences()` fetches from Sendy API
- [ ] `updatePreferences()` sends changes to Sendy API
- [ ] Defaults to daily frequency if no preference set
- [ ] `PreferenceState` type is exported

---

### Task 0.3: Create email handling utility

**File:** `src/lib/newsletter/email.ts`
**Dependencies:** `src/lib/newsletter/sendy.ts`

Create email handling utilities for sending verification and welcome emails.

**Implementation:**

1. `sendVerificationEmail(email: string): Promise<void>` — request verification email
2. `sendWelcomeEmail(email: string): Promise<void>` — send welcome email after verification

**Acceptance:**

- [ ] `sendVerificationEmail()` calls Sendy with verification flag
- [ ] `sendWelcomeEmail()` calls Sendy with welcome message
- [ ] Both functions return `Promise<void>`
- [ ] Errors from Sendy are caught and re-thrown with context

---

## Task Group: Newsletter UI Components

### Task 1.0: Implement newsletter signup form

**File:** `src/lib/components/NewsletterSignup.svelte`
**Dependencies:** `src/lib/newsletter/signup.ts`

Update the NewsletterSignup component to support full lifecycle: signup, verify, unsubscribe, resubscribe.

**Implementation:**

1. Email input field with validation (regex for valid email)
2. Submit button — calls `subscribe(email)` from `signup.ts`
3. Success state — Confirmation message after successful signup
4. Error state — Error message displayed on failure
5. Unsubscribe link — navigates to unsubscribe state or `src/routes/newsletter/unsubscribe`
6. Honeypot field — hidden input to reduce spam submissions

**Acceptance:**

- [ ] Email input validates format before submission
- [ ] Subscribe sends request and shows success/error state
- [ ] Error messages are user-friendly in German
- [ ] Honeypot field is visible only to bots (no-webkit-appearance)
- [ ] Form resets after successful submission
- [ ] Loading state shows during API call

---

### Task 1.1: Add unsubscribe link to signup component

**File:** `src/lib/components/NewsletterSignup.svelte`
**Dependencies:** `src/lib/newsletter/signup.ts`

Add unsubscribe functionality to the NewsletterSignup component.

**Implementation:**

1. Unsubscribe link/button in form footer
2. Calls `unsubscribe(email)` with same email from input
3. Shows confirmation: "You have been unsubscribed"
4. Shows error if unsubscription fails
5. Email field auto-fills from previous attempt for quick re-subscribe

**Acceptance:**

- [ ] Unsubscribe link is visible next to subscribe form
- [ ] Clicking it calls `signup.ts` unsubscribe function
- [ ] Success shows "You have been unsubscribed" message
- [ ] Error case shows error message with retry option
- [ ] Email field preserves value for easy resubscribe

---

### Task 1.2: Add preference center to signup component

**File:** `src/lib/components/NewsletterSignup.svelte`
**Dependencies:** `src/lib/newsletter/preferences.ts`

Add a preference center where users can update email frequency and categories.

**Implementation:**

1. Preference center section with frequency radio buttons (daily/weekly/monthly)
2. Category checkboxes for subscription topics
3. Save button — calls `updatePreferences(prefs)` from `preferences.ts`
4. Show current preferences on load via `getPreferences()`
5. Error state if preference update fails

**Acceptance:**

- [ ] Preference center renders after successful subscription
- [ ] Frequency radio buttons work (daily/weekly/monthly)
- [ ] Category checkboxes toggle subscription categories
- [ ] Save button calls `updatePreferences()`
- [ ] Success shows "Preferences updated" message
- [ ] Error state shows failure message with retry option
- [ ] `getPreferences()` fetches current state on preference center open

---

## Task Group: Newsletter Route

### Task 2.0: Enhance newsletter route page

**File:** `src/routes/newsletter/+page.html`
**Dependencies:** `NewsletterSignup.svelte`

Update the newsletter route page to support full user lifecycle: signup, verify, unsubscribe, resubscribe, preference center.

**Implementation:**

1. Wrap `NewsletterSignup` component in proper layout
2. Add page title and description meta tags
3. Add canonical URL for SEO
4. Add meta description for social sharing
5. Support URL params: `?verify=token`, `? unsub=token`

**Acceptance:**

- [ ] Page has meaningful `<title>` and `<meta description>`
- [ ] `NewsletterSignup` component is used in page
- [ ] Page supports email verification URL params
- [ ] Page supports unsubscribe URL params
- [ ] Meta tags are SEO-friendly

---

### Task 2.1: Add email verification route support

**File:** `src/routes/newsletter/+page.svelte` (or `+page.html` if using routes)
**Dependencies:** `src/lib/newsletter/signup.ts`

Handle email verification from URL params. When user clicks verify link in email, the route should process the token.

**Implementation:**

1. Check URL params for `verify` token
2. If present, call `verifyEmail(token)` from `signup.ts`
3. On success: show "Email verified" message
4. On failure: show verification failed message
5. Add `NewsletterSignup` component as fallback

**Acceptance:**

- [ ] Verification token from URL is detected
- [ ] `verifyEmail()` is called with token
- [ ] Success shows verification confirmation
- [ ] Failure shows appropriate error message
- [ ] `NewsletterSignup` component renders after verification

---

## Task Group: Integration Testing

### Task 3.0: Test newsletter signup flow

**File:** (manual testing)

Verify the complete newsletter signup flow:

- [ ] Enter valid email → receive confirmation
- [ ] Enter invalid email → show validation error
- [ ] Submit with empty email → show error
- [ ] Network error during signup → show retry message
- [ ] Sendy API returns success → confirmation displayed
- [ ] Sendy API returns error → error message shown

### Task 3.1: Test unsubscribe flow

**File:** (manual testing)

Verify unsubscribe from within component:

- [ ] Click unsubscribe → receive "unsubscribed" message
- [ ] Enter wrong email → show error
- [ ] Network error during unsubscribe → show retry
- [ ] Resubscribe immediately after unsubscribe → works
- [ ] Unsubscribe URL params (`?unsub=token`) → processed correctly

### Task 3.2: Test preference center

**File:** (manual testing)

Verify preference management:

- [ ] Open preference center → current preferences shown
- [ ] Change frequency → changes saved on submit
- [ ] Toggle categories → changes saved on submit
- [ ] Submit with no changes → no error shown
- [ ] Network failure → error shown with retry
- [ ] Verify preference center appears after signup

### Task 3.3: Test verification flow

**File:** (manual testing)

Verify email verification:

- [ ] Click verification link → "Email verified" shown
- [ ] Click invalid link → "Verification failed" shown
- [ ] Expired token → appropriate error message
- [ ] Already verified token → already-verified message
