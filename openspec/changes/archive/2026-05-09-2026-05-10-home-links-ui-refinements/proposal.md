# Proposal: UI Refinements for Home and Links Pages

This change addresses specific usability and aesthetic feedback for the Home (next events) and Links & Ressourcen pages.

## What Changes

### Home Page (Next Events)
- Rework the `DateFilter` component to match the styling and sizing of secondary buttons (`Bilder` and `Karte`).
- The "pill" navigation (Heute, 7 Tage, Monat, Alle) will now use the same visual language as the filter chips used for DJs and Organizers.

### Links & Ressourcen Page
- Optimize the table layout for desktop users to better utilize available horizontal space.
- Narrow the **Typ** (Category) and **Aktion** (Button) columns.
- Expand the **Beschreibung** column to allow more text to fit on fewer lines, reducing vertical sprawl.
- Update the action button text from "Oeffnen" to "Öffnen" (using proper Umlaut).
- Deactivate the "Link vorschlagen" button temporarily.

## Why Changes

- **Consistency**: Aligning filter styles on the home page creates a more unified interface.
- **Efficiency**: The Links page currently consumes too much vertical space due to narrow description columns; widening them makes the list easier to scan.
- **Polish**: Fixing missing Umlauts and hiding unused features ("Proposal button") improves the overall production quality.

## Impact

- Improved visual consistency across the app.
- Better information density on the Links page for desktop users.
- No changes to data fetching or backend logic.