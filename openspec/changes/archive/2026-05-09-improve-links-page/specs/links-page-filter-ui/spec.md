## ADDED Requirements

### Requirement: Category filter chips are displayed horizontally

The system SHALL display category filter chips in a horizontal scrollable container above the link list. Each chip SHALL show the category name and its link count. The "All" chip SHALL always appear first.

#### Scenario: Display category chips
- **WHEN** the links page loads with categories available
- **THEN** a horizontal scrollable row of chips is displayed with "All" first, followed by each category sorted alphabetically

#### Scenario: Chip shows count
- **WHEN** a category has N links
- **THEN** the chip displays "Category (N)" with the correct count

### Requirement: Category chips are interactive for filtering

Tapping a category chip SHALL filter the link list to show only links from that category. The selected chip SHALL have a distinct visual state. Tapping the selected chip again SHALL reset to "All".

#### Scenario: Select category
- **WHEN** user taps a category chip (not "All")
- **THEN** the chip becomes visually selected and only links from that category are displayed

#### Scenario: Deselect category
- **WHEN** user taps the currently selected category chip
- **THEN** the selection is cleared and "All" becomes active, showing all links

#### Scenario: Select different category
- **WHEN** user taps a different category chip while one is already selected
- **THEN** the new category becomes selected and the previous selection is cleared

### Requirement: Mobile card displays category as badge

On mobile view, each link card SHALL display the category as a visual badge with a muted color style.

#### Scenario: Mobile category badge
- **WHEN** the page is viewed on a mobile-sized screen
- **THEN** each link card shows the category as a small colored badge above the title

### Requirement: Existing search functionality remains

The text search input SHALL remain functional and filter by title, description, and domain. Search SHALL work in combination with category filter.

#### Scenario: Combined filter
- **WHEN** user has a category selected AND enters search text
- **THEN** links are filtered by both category AND search query matching title, description, or domain