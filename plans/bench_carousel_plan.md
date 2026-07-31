# Ārohaṇa Bench Carousel UI Enhancement Plan

## Objective

Transform the vertical bench queue into a horizontal carousel with Instagram Stories-like UX that shows piece names on hover/tap.

## Current State

- BenchRow component exists but shows fixed-width items
- Piece names are always visible in small text
- No interactive hover/tap behavior for piece names

## Design Requirements

1. Horizontal scrollable carousel
2. Only piece icons visible by default
3. Piece name appears on hover (desktop) or tap (mobile)
4. Carousel limits visible items to approximately 5
5. Smooth scroll with snap-to-item behavior
6. Mobile-optimized touch interactions

## Component Design

### PieceTooltip

A reusable tooltip component that displays piece names on hover/tap:

**Features**:

- Desktop: Show name on hover, hide on mouse leave
- Mobile: Toggle name on tap/click
- Position: Above the piece icon
- Styling: Dark background with white text, subtle transition
- Responsive: Works on all screen sizes

**Implementation Approach**:

- Use React state to manage visibility
- Use onMouseEnter/onMouseLeave for desktop hover
- Use onClick for mobile tap (touch) support
- Position absolutely relative to the parent container
- Include transition for smooth appearance/disappearance

### Enhanced BenchRow

Updated version of BenchRow with carousel and tooltip features:

**Enhancements**:

- Wrap each piece in PieceTooltip
- Constrain container width to show ~5 items
- Add proper scroll snap behavior
- Ensure touch scrolling works on mobile
- Keep existing visual styling (borders, gold highlight)

**Layout**:

- Container: "max-w-[300px]" to limit visible width
- Scroll container: "flex gap-2 overflow-x-auto scroll-snap-x"
- Item: "flex-shrink-0 ... snap-start" to ensure proper snapping

## Implementation Plan

1. Create PieceTooltip component in `/src/components/tooltip/PieceTooltip.jsx`
2. Update BenchRow to use PieceTooltip for each piece
3. Add width constraints to limit visible items to ~5
4. Implement smooth scroll and snap behavior
5. Test on desktop and mobile devices
6. Verify touch interactions on mobile

## Edge Cases & Considerations

- Mobile vs desktop detection (use hover + click for universal support)
- Touch devices without hover capability
- Screen size responsiveness
- Accessibility (focus management)
- Performance with large queues
- RTL language support (if needed)

## Success Criteria

- Users can scroll horizontally through the bench
- Piece names are only visible on hover/tap
- Approximately 5 items are visible at a time
- Last item is partially cropped to indicate scrollability
- Smooth scrolling behavior on all devices
- Consistent UX across desktop and mobile
