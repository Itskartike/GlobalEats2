Week 5 – Mobile-First Redesign (App-Like Experience)

1. Week Overview
I refactored the Home page and related components to deliver an app-like experience on mobile devices while preserving a rich desktop layout. The redesign included a clean mobile header (removing non-essential icons), a compact hero with a concise search focus, quick category chips for horizontal scrolling, a bottom navigation bar, and app-style cards for featured brands. I also tuned spacing, typography, and touch-target sizes to meet accessibility standards.

2. Objectives and Tasks Completed
- Implemented a clean mobile header with branding and essential actions only.
- Redesigned HeroSection with a compact layout on mobile and a structured two-column layout on desktop.
- Added horizontally scrollable quick categories with visual affordances.
- Introduced a bottom navigation bar mimicking native app patterns.
- Converted FeaturedBrands to app-style vertical cards on mobile; kept horizontal scroll/grid on larger screens.
- Unified spacing/typography scale (e.g., text-base on mobile, text-lg on larger screens) and ≥44px buttons.

3. Technical Details
- Tailwind responsive utilities (sm, md, lg) and conditional rendering for mobile vs desktop UI.
- Framer Motion for subtle entry animations without overwhelming low-end devices.
- Lucide icons for consistent visual language.
- Scrollbar-hiding utility to provide clean horizontal lists on mobile.

4. Learning Outcomes
- Designing "two UIs in one"—lean mobile UI and fuller desktop UI using responsive classes.
- Accessibility considerations for mobile: minimum hit areas, contrast, and readable line lengths.
- Creating reusable, responsive card components that adapt layout and information density.

5. Challenges Faced and Resolutions
- Avoided clutter by removing hamburger/profile icons per updated UX direction.
- Managed layout shifts when switching between breakpoints by testing on multiple devices.
- Balanced animations with performance to avoid jank on low-power phones.

6. Testing and Validation
- Manual tests across viewport sizes and devices; verified bottom nav doesn’t overlap content.
- Checked scroll behaviors and ensured consistent card heights on mobile.

7. Impact and Next Steps
The app now feels familiar to users of native food delivery apps, improving usability and engagement on phones. Next week focuses on routing polish, “View All” navigation, and adding robust fallbacks.










