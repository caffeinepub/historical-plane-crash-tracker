# Specification

## Summary
**Goal:** Build a comprehensive historical plane crash tracking application with manual data entry, interactive map visualization, 3D crash reconstruction, and detailed investigation timelines.

**Planned changes:**
- Create manual data entry form for plane crash records (date, location, airline, flight number, aircraft type, phase of flight, casualties, crash cause, data source attribution)
- Implement automatic aircraft model selection based on aircraft type entered
- Build interactive map visualization displaying flight paths (solid lines for known routes, dashed lines for speculative routes with clear labeling)
- Create 3D crash reconstruction viewer using Three.js and React Three Fiber with detailed aircraft models showing damage visualization and camera controls for multi-angle viewing
- Develop comprehensive investigation timeline component displaying preliminary reports, interim updates, final reports, and safety recommendations with support for text, images, and video embeds
- Implement crash details view showing casualty breakdown (total aboard, fatalities, survivors) and documented crash cause
- Design Motoko backend data model to store and retrieve crash records including flight path coordinates with known/speculative flags, aircraft details, casualty data, and investigation timeline entries
- Create main dashboard with searchable and filterable list of all crashes (by date, location, airline, aircraft type, casualty count)
- Apply professional, data-focused visual design theme with subdued colors and clear typography appropriate for historical tragedy documentation

**User-visible outcome:** Users can manually enter historical plane crash data, browse crashes through a filterable dashboard, view interactive flight path maps with speculative route indicators, explore detailed 3D crash reconstructions from multiple angles, and review comprehensive investigation timelines with rich media content.
