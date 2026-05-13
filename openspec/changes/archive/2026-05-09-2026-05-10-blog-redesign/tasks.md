# Tasks: Blog Page Redesign

## Phase 1: Layout & Container Adjustments

- [x] 1.1 Remove max-width constraints on the blog container
    - Update `src/routes/blog/+page.svelte` to remove the `max-w-3xl` constraint, allowing the list to fill the `DesktopLayout` content area.
- [x] 1.2 Update skeleton loaders
    - Redesign the loading state cards to match the new horizontal square-image layout.

## Phase 2: Post Entry Redesign

- [x] 2.1 Restructure the post entry grid/flex layout
    - In `src/routes/blog/+page.svelte`, update the `article` structure to place the image container on the left and a content container on the right.
- [x] 2.2 Implement small square images
    - Set featured images to a fixed square size (e.g., `w-24 h-24` to `w-32 h-32` depending on viewport).
    - Ensure `aspect-ratio: 1/1` and `object-cover` are used for all images.
    - Apply the same square styling to the fallback RNT logo placeholder.
- [x] 2.3 Refactor the content block (Right Side)
    - Move the **Title**, **Date**, and **Excerpt** into a single column to the right of the image.
    - Integrate the **Tags/Categories** chips directly into this right-hand block (e.g., above the title or below the excerpt) to keep the post entry self-contained.
    - Adjust typography (line-height and spacing) to ensure the excerpt and metadata look balanced next to the square image.
- [x] 2.4 Optimize for Desktop vs Mobile
    - Ensure the square image remains aligned to the left on mobile rather than stacking on top, to maintain the requested compact "box" look.

## Phase 3: Validation

- [x] 3.1 Run `npm run check` to verify TypeScript and Svelte component integrity.
- [x] 3.2 Visual review: confirm images are square and small, and content flows correctly to the right.
- [x] 3.3 Verify that clicking categories still filters the list as expected.