# Capability: links-rss-fetch

## Purpose

Fetch curated links dynamically from the WordPress RSS feed endpoint instead of relying on hardcoded static data. Enables the Links & Ressourcen page to display community-maintained links.

---

## ADDED Requirements

### Requirement: RSS feed fetches successfully

The system SHALL fetch curated links from the WordPress RSS feed endpoint when available.

#### Scenario: RSS feed returns valid data
- **WHEN** the Links page loads and the RSS feed returns valid XML with link items
- **THEN** the page SHALL display links parsed from the RSS feed
- **AND** each link SHALL include title, URL, description, and category

#### Scenario: RSS feed fetch fails
- **WHEN** the RSS feed request fails (network error, timeout, HTTP error)
- **THEN** the system SHALL log a warning with error details
- **AND** fallback to static data SHALL occur silently

#### Scenario: RSS feed returns empty XML
- **WHEN** the RSS feed returns valid XML but contains no items
- **THEN** the system SHALL log a warning about empty feed
- **AND** fallback to static data SHALL occur

### Requirement: RSS parser handles WordPress feed format

The parser SHALL correctly extract link data from WordPress RSS 2.0 format with CDATA sections.

#### Scenario: Link item with CDATA content
- **WHEN** an RSS item has title/description in CDATA sections
- **THEN** the parser SHALL correctly decode the HTML entities within CDATA
- **AND** return clean text without CDATA wrapper

#### Scenario: Link item without CDATA
- **WHEN** an RSS item has plain text content (no CDATA)
- **THEN** the parser SHALL still extract the content correctly

#### Scenario: Link item missing optional fields
- **WHEN** an RSS item has title and URL but no description or category
- **THEN** the parser SHALL use empty string for missing fields
- **AND** default category "Allgemein" SHALL be used when category is missing

### Requirement: Category extraction works correctly

The system SHALL extract unique categories from fetched links for filtering.

#### Scenario: Multiple links with different categories
- **WHEN** fetched links have categories: "Musik", "Community", "Musik"
- **THEN** the categories array SHALL be ["Musik", "Community"] (unique, preserve order)

#### Scenario: All links have same category
- **WHEN** all fetched links have category "Veranstaltungsportale"
- **THEN** the categories array SHALL be ["Veranstaltungsportale"]

### Requirement: Fallback to static data

When RSS fetch fails or returns no items, the system SHALL fall back to static curated links.

#### Scenario: Fallback to static data
- **WHEN** RSS fetch returns empty array or throws an error
- **THEN** the page SHALL display links from `STATIC_LINKS`
- **AND** categories SHALL be derived from static links
- **AND** the user SHALL not see any error indication

#### Scenario: Both RSS and static data unavailable
- **WHEN** RSS fetch fails AND static data is empty
- **THEN** the page SHALL display "Keine Links vorhanden" message