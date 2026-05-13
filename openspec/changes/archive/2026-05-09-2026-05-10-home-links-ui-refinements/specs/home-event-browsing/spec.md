# Home Page UI Refinements Spec

## ADDED Requirements

### Requirement: Unified Filter Language
The app SHALL update the `DateFilter` component on the home page to use the same visual language (chips) as the filters used for DJs and Organizers to ensure interface consistency.

#### Scenario: Visual alignment of home filters
- **WHEN** the user views the date navigation (Heute, 7 Tage, Monat, Alle) on the home page
- **THEN** each option SHALL be rendered as a chip matching the `filter-chip` class
- **AND** the size and styling SHALL be identical to the "Bilder" and "Karte" secondary buttons

### Requirement: Consistent Button Sizing
The app SHALL ensure that the home page toolbar elements (Date Filter, Image Toggle, Map Toggle) follow a consistent sizing pattern.

#### Scenario: Toolbar uniformity
- **WHEN** the home page renders the navigation and view toggles
- **THEN** the `DateFilter` chips and the view toggle buttons SHALL share the same height and horizontal alignment
- **AND** the active state for date chips SHALL use the `filter-chip-active` design tokens
