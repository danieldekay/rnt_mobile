# Spec Delta: progressive-list-browsing

## ADDED Requirements

### Requirement: List views can expose bottom navigation controls on mobile

List views that use the progressive list browsing pattern SHALL render explicit bottom-of-list controls on phone-sized viewports so users can either return to the top of the list or continue browsing forward without losing their place.

#### Scenario: Reaching the end of a supported mobile list

- **WHEN** the user reaches the bottom of a supported list view on a mobile viewport
- **THEN** the interface shows a jump-to-top action
- **AND** shows a forward-browsing action when that list view supports loading another chronological range

#### Scenario: List view does not support forward browsing

- **WHEN** a list view adopts the shared footer pattern but has no next-range behavior
- **THEN** the interface still offers the jump-to-top action
- **AND** does not present a misleading forward-browsing button

### Requirement: Jump-to-top preserves the loaded list state

The progressive list browsing pattern SHALL return the user to the top of the current list without discarding any already loaded items or resetting active filters.

#### Scenario: User returns to the top after browsing multiple screens

- **WHEN** the user activates the jump-to-top control
- **THEN** the view scrolls back to the start of the current list
- **AND** the already loaded list content remains available exactly as before the jump

### Requirement: Forward browsing keeps recovery controls local to the list footer

When a list view loads another chronological range from the footer, the footer SHALL communicate loading and recovery near the action that triggered the request.

#### Scenario: Forward browsing request is in progress

- **WHEN** the user activates the forward-browsing control
- **THEN** the footer communicates that more items are loading
- **AND** the already loaded list remains visible while the request is running

#### Scenario: Forward browsing request fails

- **WHEN** loading the next range fails
- **THEN** the already loaded list remains visible
- **AND** the footer communicates that the next range could not be loaded
- **AND** provides a retry path close to the failed action
