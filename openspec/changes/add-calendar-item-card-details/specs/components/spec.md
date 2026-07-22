# Delta: components

## MODIFIED Requirements

### Requirement: Event Card Component

The system SHALL provide a reusable component for displaying event information in a card format.

#### Scenario: Display event core information

- **GIVEN** a valid TribeEvent object
- **WHEN** the EventCard component is rendered
- **THEN** the event's title, date, time, location, and cost are displayed
- **AND** the event's type and music badges are shown if available
- **AND** the event organizer or DJ name is displayed if available
- **AND** any recognized supplemental event-detail markers, such as live music or show, are displayed when matching event metadata is present

#### Scenario: Handle event image display

- **GIVEN** an event with an image URL
- **WHEN** the EventCard component is rendered with showImage=true
- **THEN** the event image is displayed in the card
- **AND** the image is sized appropriately and lazy-loaded
- **AND** hovering over the card applies a scale transformation

#### Scenario: Handle missing event data gracefully

- **GIVEN** an event with missing or null data fields
- **WHEN** the EventCard component is rendered
- **THEN** missing venue city shows "Ort offen"
- **AND** missing cost is handled appropriately
- **AND** missing organizer/DJ information is not displayed
- **AND** missing supplemental marker metadata does not render empty placeholders
- **AND** the component does not throw errors due to null values

#### Scenario: Apply interactive states

- **GIVEN** the EventCard component is rendered
- **WHEN** the user hovers over the card
- **THEN** the card border changes to accent color and shadow is applied
- **AND** the external link icon translates and changes color on hover
- **AND** the card maintains accessible focus states
