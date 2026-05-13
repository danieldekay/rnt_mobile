# blog-browsing Specification

## Purpose
TBD - created by archiving change 2026-05-10-blog-redesign. Update Purpose after archive.
## Requirements
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

