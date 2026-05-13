# Proposal: Blog Page Redesign

This change redesigns the blog list view to improve readability and information density by moving away from a card-based vertical stack to a more compact, horizontal list layout.

## What Changes

### Layout & Spacing
- Update the blog list to use the full width of the content bar.
- Shift from a vertical layout (image above text) to a horizontal layout (image left, text right) on larger screens.

### Image Styling
- Make featured images smaller and place them in a consistent square box (aspect-ratio square) on the left side of the post entry.
- Ensure fallback images (RNT logo) also follow this square constraint.

### Content Arrangement
- Position the Title, Date, and Excerpt to the right of the square image.
- Include the tags/categories directly within this right-hand content block for better context.

## Why Changes

- **Information Density**: The current layout takes up too much vertical space for a single post.
- **Readability**: A standard list-detail pattern (image left, content right) is more efficient for users scanning multiple articles.
- **Visual Balance**: Small square images provide a cleaner look compared to varying or large featured images.

## Impact

- Improved scannability of the blog feed.
- Better utilization of screen real estate on tablet and desktop devices.
- No impact on individual blog post detail pages.