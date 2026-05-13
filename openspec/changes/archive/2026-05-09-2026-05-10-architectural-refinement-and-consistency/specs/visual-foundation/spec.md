# Architectural Refinement Spec

## ADDED Requirements

### Requirement: Unified Utility Layer
The app SHALL consolidate all HTML decoding, stripping, and truncation logic into a single utility module to ensure consistent text rendering across events, blog posts, and legal pages.

#### Scenario: Decoding HTML entities in Blog and Events
- **GIVEN** a string with WordPress-encoded entities (e.g., `&amp;`, `&quot;`, `&#039;`)
- **WHEN** processed by the unified `src/lib/utils/text.ts`
- **THEN** it returns the correctly decoded UTF-8 string
- **AND** this utility is used by both `src/lib/api/tribe.ts` and `src/routes/blog/+page.svelte`

### Requirement: Standardized Date Formatting
The app SHALL use a centralized date utility that defaults to the `de-DE` locale for all user-facing date strings.

#### Scenario: Consistent German date format
- **WHEN** any component needs to display a date
- **THEN** it calls `formatDate` from `src/lib/utils/date.ts`
- **AND** the output follows the German convention (e.g., "10. Mai 2026")

---

## ADDED Requirements

### Requirement: Component Decomposition
The app SHALL move common UI patterns, such as skeleton loaders and layout containers, into a shared directory to reduce duplication.

#### Scenario: Shared Skeleton Loader
- **WHEN** the Blog, DJs, or Veranstalter routes are in a loading state
- **THEN** they SHALL use the shared skeleton components from `src/lib/components/ui/`
- **AND** the visual style of the loading state remains identical across these pages

### Requirement: Extraction of Complex Snippets
Large route files SHALL have complex UI logic extracted into dedicated components to improve template readability and maintainability.

#### Scenario: Home Page Refactor
- **WHEN** `src/routes/+page.svelte` grows beyond manageable size
- **THEN** the filter and toolbar logic SHALL be extracted into a `FilterToolbar.svelte` component
- **AND** the component uses Svelte 5 runes for state synchronization

---

## ADDED Requirements

### Requirement: Design System Alignment
All components SHALL use the established Tailwind design tokens defined in `src/app.css` instead of arbitrary values.

#### Scenario: Visual Consistency Check
- **WHEN** a component defines a border radius or background color
- **THEN** it MUST use tokens like `rounded-control` or `bg-surface-subtle`
- **AND** no raw hex codes or non-standard Tailwind values (e.g., `rounded-[12px]`) are present in the component markup

### Requirement: Standardized Touch Targets
The app SHALL ensure all interactive elements follow a consistent sizing pattern suitable for mobile-first usage.

#### Scenario: Button Sizing
- **WHEN** any button or interactive chip is rendered
- **THEN** it SHALL have a minimum height of `48px` (or equivalent Tailwind classes) to ensure reliable touch interaction on mobile devices
