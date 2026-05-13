# Links & Ressourcen UI Refinements Spec

## ADDED Requirements

### Requirement: Desktop Table Alignment
The app SHALL optimize the table layout on the Links & Ressourcen page for desktop viewports to improve horizontal space utilization and reduce vertical sprawl.

#### Scenario: Optimized column widths
- **GIVEN** the user is viewing the Links page on a desktop device (>= 1024px)
- **WHEN** the links table renders
- **THEN** the **Typ** (Category) and **Aktion** (Button) columns SHALL be constrained to their minimum required width
- **AND** the **Beschreibung** column SHALL expand to fill the remaining horizontal space
- **AND** descriptions SHALL wrap across fewer lines than in the previous layout

### Requirement: Improved Action Clarity
The app SHALL use proper German typography and localized text for all action buttons in the links table.

#### Scenario: Localized action button
- **WHEN** an action button is rendered for a link entry
- **THEN** the button text SHALL be "Öffnen" (using the correct German Umlaut)
- **AND** the button SHALL follow the `btn-secondary` visual style

---

## ADDED Requirements

### Requirement: Feature Lifecycle Management
The app SHALL have the ability to temporarily hide or deactivate features that are under development or not ready for public use.

#### Scenario: Deactivate link suggestion button
- **WHEN** the Links & Ressourcen page renders
- **THEN** the "Link vorschlagen" (Suggest a link) button SHALL be hidden or deactivated
- **AND** no interactive element for suggesting links SHALL be visible to the end user until the feature is fully implemented
