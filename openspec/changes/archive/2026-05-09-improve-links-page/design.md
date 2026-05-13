## Context

The `/links` page displays curated links in a table on desktop and a card list on mobile. Current filtering uses a dropdown select for category selection and a text search input. The mobile card view needs visual improvement to match the desktop table's clarity.

## Goals / Non-Goals

**Goals:**
- Replace category dropdown with horizontal scrollable filter chips
- Improve mobile card design with category badges and better visual hierarchy
- Maintain all existing filtering and search functionality
- Preserve backward compatibility with existing behavior

**Non-Goals:**
- No changes to API or data fetching
- No new dependencies or library additions
- No changes to desktop table view (already functional)

## Decisions

### Filter Chips vs Dropdown

**Decision:** Replace dropdown with horizontal scrollable chips.

**Rationale:** Filter chips provide faster single-tap category selection vs dropdown tap + scroll + select. Visual chips are more discoverable and provide category count at a glance.

**Alternatives considered:**
- Keep dropdown: Functional but less user-friendly for frequent category switching
- Grid of buttons: Takes too much vertical space on mobile

### Mobile Card Design

**Decision:** Add category as a colored badge, improve spacing and typography hierarchy.

**Rationale:** Category is currently small uppercase text. Making it a badge increases scannability. Better spacing matches the design language used elsewhere in the app.

## Risks / Trade-offs

- **Risk:** Category chips may wrap awkwardly on narrow screens
  - **Mitigation:** Use horizontal scroll with snap for smooth scrolling experience

- **Risk:** Many categories could cause horizontal overflow
  - **Mitigation:** Use `overflow-x-auto` with hide-scrollbar pattern

- **Trade-off:** Adding badges increases visual complexity
  - **Mitigation:** Keep badge design minimal with muted colors that don't compete with content