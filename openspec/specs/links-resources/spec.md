# links-resources Specification

## Purpose
TBD - created by archiving change 2026-05-10-home-links-ui-refinements. Update Purpose after archive.
## Requirements
### Requirement: Feature Lifecycle Management
The app SHALL have the ability to temporarily hide or deactivate features that are under development or not ready for public use.

#### Scenario: Deactivate link suggestion button
- **WHEN** the Links & Ressourcen page renders
- **THEN** the "Link vorschlagen" (Suggest a link) button SHALL be hidden or deactivated
- **AND** no interactive element for suggesting links SHALL be visible to the end user until the feature is fully implemented

