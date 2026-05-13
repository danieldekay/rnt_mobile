# Capability: links-resources

## Purpose

Display curated community links on the Links & Ressourcen page with consistent, modern styling that matches the app's design language.

---

## MODIFIED Requirements

### Requirement: Link table uses consistent design system styling

The Links & Ressourcen page SHALL use design system patterns consistent with other components like AgendaPanel.

#### Scenario: Desktop table view renders with card styling
- **WHEN** the page renders on desktop (min-width: 768px)
- **THEN** the table container SHALL use `card` class, `rounded-card`, `shadow-card` styling
- **AND** the table header SHALL use `bg-surface-subtle` background
- **AND** rows SHALL have `divide-y divide-border-default`

#### Scenario: Mobile card list renders correctly
- **WHEN** the page renders on mobile (max-width: 767px)
- **THEN** links SHALL display as a vertical list with `divide-y divide-border-default`
- **AND** each item SHALL have consistent padding (`px-4 py-4`)
- **AND** category badge SHALL use `rounded-full` with `bg-surface-subtle`

#### Scenario: Typography matches design system
- **WHEN** the Links table renders
- **THEN** headings SHALL use `font-display` with proper sizes
- **AND** metadata SHALL use `meta-text` class
- **AND** category labels SHALL use `text-[0.8125rem]` with uppercase and tracking

#### Scenario: Interactive elements use consistent button styles
- **WHEN** the "Öffnen" action button renders
- **THEN** it SHALL use `btn-secondary` class for consistency
- **AND** have proper sizing (`min-h-12`, `px-3 py-2`)

### Requirement: Filtering UI matches existing patterns

The category chips and search input SHALL follow established UI patterns.

#### Scenario: Category filter chips styled correctly
- **WHEN** category chips render
- **THEN** each chip SHALL use inline-flex with rounded-full shape
- **AND** active state SHALL use `bg-action-primary` with white text
- **AND** hover state SHALL show subtle background change

#### Scenario: Search input matches design system
- **WHEN** the search input renders
- **THEN** it SHALL use `rounded-control` border radius
- **AND** use `border-border-default`, `bg-surface-card`
- **AND** focus state SHALL use `border-action-primary`

### Requirement: Empty and filtered states are handled gracefully

The page SHALL show appropriate messages for empty or filtered results.

#### Scenario: No links at all
- **WHEN** `data.links.length === 0`
- **THEN** a centered card SHALL show "Keine Links vorhanden"

#### Scenario: Filtered results empty
- **WHEN** `filteredLinks.length === 0` but `data.links.length > 0`
- **THEN** a centered card SHALL show "Keine passenden Links gefunden"
- **AND** a hint SHALL appear: "Passe Suche oder Typfilter an, um weitere Eintraege zu sehen."

#### Scenario: Filtered count displayed
- **WHEN** filters are active
- **THEN** the UI SHALL show "{filteredLinks.length} von {data.links.length} Links sichtbar"