## ADDED Requirements

### Requirement: Provide in-app access to the main legal documents
The app SHALL provide in-app routes for Impressum, Datenschutzerklärung, and Cookie-Richtlinie so users can read the legal information without leaving the app.

#### Scenario: Open a legal page from the app shell
- **WHEN** the user taps a legal link from the footer or related legal navigation
- **THEN** the app opens the selected legal document in a dedicated in-app route
- **AND** shows a clear page title and heading for that document
- **AND** keeps the content readable on a phone-sized viewport

### Requirement: Mirror canonical legal content from the WordPress source site
The app SHALL load the legal-page content from the canonical RNT WordPress pages and render a readable in-app mirror.

#### Scenario: Legal content loads successfully
- **WHEN** the user opens one of the in-app legal routes and the WordPress page is available
- **THEN** the app fetches the corresponding published legal page by slug
- **AND** shows a loading state until the content arrives
- **AND** renders the current legal content inside the app

#### Scenario: Legal content cannot be loaded
- **WHEN** the legal-page request fails or returns no matching page
- **THEN** the app shows an error state explaining that the legal document could not be loaded in-app
- **AND** provides a direct link to the canonical page on `rhein-neckar-tango.de`

### Requirement: Preserve canonical legal references
The app SHALL identify the canonical source for each mirrored legal document.

#### Scenario: Legal page is rendered in-app
- **WHEN** a mirrored legal page is displayed successfully
- **THEN** the app shows a link to the canonical source URL
- **AND** shows the source page title
- **AND** shows the source modified date when that metadata is available