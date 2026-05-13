# Spec: Newsletter Enhancement

## Purpose

Add newsletter signup flow improvements to rnt_mobile. Enhance the existing NewsletterSignup
component with unsubscribe link, preference center, and email verification.

## ADDED Requirements

### Requirement: Newsletter Signup Flow

The app SHALL enhance the newsletter signup component and dedicated newsletter page with status checking and improved feedback.

#### Scenario: Newsletter signup form
- **GIVEN** user is on `/newsletter` or views the `NewsletterSignup` component
- **WHEN** user enters email and clicks "Subscribe"
- **THEN** the form MUST submit via Sendy API
- **AND** a success message SHALL be shown if the API returns success

#### Scenario: Status checking
- **WHEN** user enters their email on the newsletter page
- **AND** clicks "Status prüfen"
- **THEN** the app SHALL fetch the current subscription status (subscribed, unconfirmed, etc.)
- **AND** SHALL display the appropriate UI for that status (e.g., Unsubscribe button for active subscribers)

---

## ADDED Requirements

### Requirement: Email Verification

The app SHALL support email verification through URL parameters to confirm user subscriptions.

#### Scenario: Email verification success
- **WHEN** the user opens `/newsletter?verify=success`
- **THEN** a success banner SHALL be shown: "Deine E-Mail-Adresse wurde bestätigt. Du bist jetzt angemeldet."

#### Scenario: Email verification pending
- **WHEN** the user opens `/newsletter?verify=pending`
- **THEN** an info banner SHALL be shown: "Die Bestätigung wird über den Link in der Bestätigungs-E-Mail verarbeitet."

---

## ADDED Requirements

### Requirement: Unsubscribe Flow

The app SHALL provide a clear and functional path for users to unsubscribe from the newsletter.

#### Scenario: Unsubscribe from newsletter page
- **GIVEN** a user is identified as 'subscribed' or 'unconfirmed'
- **WHEN** the user clicks "Vom Newsletter abmelden" or "Abmeldung beantragen"
- **THEN** an unsubscribe request SHALL be sent to the API
- **AND** a success message SHALL be displayed upon completion

---

## ADDED Requirements

### Requirement: Matomo Integration

The app SHALL track newsletter interactions for analytics.

#### Scenario: Track newsletter events
- **WHEN** a user submits the signup form, checks status, or unsubscribes
- **THEN** a Matomo event SHALL be tracked with category `'newsletter'` and the corresponding action
- **AND** the current display mode SHALL be included in the tracking data
