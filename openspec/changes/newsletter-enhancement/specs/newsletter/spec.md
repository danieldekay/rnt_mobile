# Spec: Newsletter Enhancement

## Purpose

Add newsletter signup flow improvements to rnt_mobile. Enhance the existing NewsletterSignup
component with unsubscribe link, preference center, and email verification.

## Scenarios

### Scenario: Newsletter signup form

- **GIVEN** user is on `/news`
- **AND** user has clicked "Newsletter"
- **WHEN** user enters email and clicks "Subscribe"
- **THEN** newsletter signup form shown
- **AND** form submits via Sendy API

### Scenario: Subscribe success

- **GIVEN** form submitted
- **AND** email valid
- **WHEN** Sendy API returns success
- **THEN** confirmation message shown
- **AND** user receives confirmation email

### Scenario: Subscribe failure

- **WHEN** Sendy API returns error
- **THEN** error message shown
- **AND** form cleared

### Scenario: Unsubscribe

- **GIVEN** user clicks unsubscribe link in email
- **WHEN** API succeeds
- **THEN** "You have been unsubscribed" shown
- **AND** user removed from list

### Scenario: Unsubscribe error

- **WHEN** API returns error
- **AND** email invalid
- **THEN** error message shown
- **AND** user remains subscribed

### Scenario: Preference center

- **WHEN** user clicks unsubscribe link
- **AND** email invalid
- **WHEN** user opens preference center
- **THEN** user sees subscription options
- **AND** user can update preferences

### Scenario: Email verification

- **WHEN** user subscribes
- **AND** email sent
- **WHEN** user clicks verification link
- **THEN** "Email verified" shown
- **AND** user active in list

### Scenario: Verification failed

- **WHEN** verification link invalid
- **WHEN** user clicks verify
- **THEN** error shown
- **AND** user not subscribed

### Scenario: Newsletter preference

- **WHEN** user opens preference center
- **WHEN** user chooses to unsubscribe
- **THEN** newsletter preferences updated
- **AND** user unsubscribed

### Scenario: Unsubscribed

- **WHEN** user previously unsubscribed
- **WHEN** user returns to `/newsletter`
- **WHEN** user sees "You are unsubscribed"
- **WHEN** user sees "Resubscribe" button
- **WHEN** user clicks resubscribe
- **WHEN** sends request
- **WHEN** user unsubscribed`

### Scenario: Resubscribe success

- **GIVEN** user is unsubscribed
- **AND** user chooses to resubscribe
- **WHEN** user clicks "Resubscribe"
- **AND** user sees resubscribe confirmation
- **AND** user receives verification email
- **AND** user receives confirmation email
