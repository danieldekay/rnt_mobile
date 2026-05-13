## ADDED Requirements

### Requirement: Organizer card displays enhanced organizer information
The system SHALL display organizer information in a polished, consistent card format that matches the DJ card design quality.

#### Scenario: Organizer card displays basic information
- **WHEN** user views the organizers list page
- **THEN** each organizer SHALL display in a card format with organizer name, profile image, and description
- **THEN** cards SHALL use consistent styling with proper spacing, shadows, and typography
- **THEN** organizer name SHALL be prominently displayed with appropriate typography hierarchy

#### Scenario: Organizer card includes action buttons
- **WHEN** user views an organizer card
- **THEN** card SHALL include a consistent button styling pattern
- **THEN** buttons SHALL have proper text labels (not just icons)
- **THEN** profile button SHALL use white background with text instead of white text on green background
- **THEN** all buttons SHALL have uniform sizing and spacing

#### Scenario: Organizer card shows additional information
- **WHEN** organizer has additional data available from WordPress
- **THEN** card SHALL display organizer bio/description when available
- **THEN** card SHALL show social media links when provided
- **THEN** card SHALL display contact information when available
- **THEN** additional information SHALL be presented in a clean, organized manner

#### Scenario: Organizer card mobile responsiveness
- **WHEN** user views organizer cards on mobile devices
- **THEN** cards SHALL adapt to smaller screen sizes appropriately
- **THEN** text SHALL remain readable and properly sized
- **THEN** buttons SHALL remain tappable and appropriately sized
- **THEN** layout SHALL adjust to prevent horizontal scrolling