# Tasks

## Prerequisites

- [x] `desktop-layout-foundation` applied.

---

## Task List

- [x] T1 - Create `src/lib/content/links.ts`
- [x] T1.1 - Define `CuratedLink` interface and `LINKS` array with at least 3 placeholder links per category for each of: Musik, Lehrvideos, Community, Veranstaltungsportale, Organisationen, Apps & Tools.
- [x] T1.2 - Export `CATEGORIES` derived set.
- [x] T1.3 - Validate with `npm run check`.

- [x] T2 - Create `src/routes/links/+page.svelte`
- [x] T2.1 - Add heading "Links & Ressourcen".
- [x] T2.2 - Loop over `CATEGORIES`, render `<section id={category}>` with `<h2>` and link cards.
- [x] T2.3 - Use `lg:grid-cols-3 lg:gap-4` within each section on desktop.
- [x] T2.4 - Add right sidebar snippet with jump-nav `<nav>` and `<a href="#{category}">` for each category.
- [x] T2.5 - Add "Link vorschlagen" button with `<a href="mailto:links@rheinneckartango.de" class="btn-secondary w-full mt-4">Link vorschlagen</a>`.
- [x] T2.6 - Ensure mobile renders a single-column list per section.
- [x] T2.7 - Ensure all external links use `target="_blank" rel="noopener noreferrer"`.
- [x] T2.8 - Validate with `npm run check`.

- [x] T3 - Verify prerender.
- [x] T3.1 - Run `npm run build` and confirm static route builds cleanly.
