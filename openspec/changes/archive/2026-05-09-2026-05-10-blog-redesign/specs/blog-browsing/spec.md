# Blog Redesign Spec

## ADDED Requirements

### Requirement: Compact List Layout
The app SHALL transition the blog post list from a card-based vertical stack to a compact horizontal list layout on larger screens to improve information density.

#### Scenario: Desktop blog list view
- **GIVEN** the user is on the blog page with a screen wider than `md` breakpoint
- **WHEN** the blog post list renders
- **THEN** each post SHALL display the featured image on the left and content on the right
- **AND** the post entry SHALL utilize the full width of the main content container

### Requirement: Standardized Square Thumbnails
The app SHALL enforce a consistent square aspect ratio for all blog post thumbnails to ensure visual alignment regardless of the original image dimensions.

#### Scenario: Consistent post images
- **WHEN** a blog post is rendered in the list
- **THEN** its featured image SHALL be constrained to a square `aspect-ratio: 1/1`
- **AND** if no featured image is present, the fallback RNT logo SHALL also follow the square constraint
- **AND** images SHALL use `object-cover` to prevent distortion

---

## ADDED Requirements

### Requirement: Integrated Post Metadata
The app SHALL arrange post title, date, excerpt, and categories in a single content block to the right of the thumbnail.

#### Scenario: Post metadata layout
- **WHEN** viewing a blog post entry
- **THEN** the title SHALL be prominent at the top of the content block
- **AND** the date and categories SHALL be positioned for quick scanning
- **AND** the excerpt SHALL be truncated to maintain consistent row height across the list

### Requirement: Improved Feed Scannability
The app SHALL optimize the typography and spacing of the blog feed to allow users to scan more posts with less vertical scrolling.

#### Scenario: Vertical space efficiency
- **WHEN** multiple posts are rendered in the feed
- **THEN** the total height of a single post entry SHALL be reduced compared to the previous card-based layout
- **AND** the spacing between posts SHALL be consistent with the app's overall design system tokens
