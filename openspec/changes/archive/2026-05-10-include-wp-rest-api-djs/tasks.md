## 1. UI Enhancements

- [x] 1.1 Add toggle switch to DJ listing toolbar for "Show all WP API DJs"
- [x] 1.2 Implement tooltip/explanation for zero-event DJs state
- [x] 1.3 Add visual styling for DJs with zero upcoming events (reduced opacity, etc.)

## 2. State Management

- [x] 2.1 Modify derived values in +page.svelte to conditionally filter by event count
- [x] 2.2 Update filteredDjs derived value to respect the new show-all setting
- [x] 2.3 Ensure sorting still works correctly with zero-event DJs included

## 3. Component Updates

- [x] 3.1 Update DJ card component to handle zero-event state gracefully
- [x] 3.2 Modify "Next Terminus" section to show appropriate message for zero-event DJs
- [x] 3.3 Adjust action buttons (Profile, Zum Termin) for zero-event DJs state

## 4. Testing & Validation

- [x] 4.1 Verify backward compatibility - default behavior unchanged
- [x] 4.2 Test new toggle functionality shows all WP API DJs
- [x] 4.3 Confirm visual indicators correctly distinguish zero-event DJs
- [x] 4.4 Run npm run check to ensure no TypeScript errors
- [x] 4.5 Run npm run build to verify static adapter compatibility
