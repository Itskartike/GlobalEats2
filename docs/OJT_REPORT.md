OJT Weekly Report – 7 Weeks

Student Name: ____________________
Project Title: GlobalEats – Food Delivery Web App
Duration: 7 Weeks

Week 1 – Environment Setup, Architecture, and Planning
Week Overview
- Set up the development environment for a full‑stack food delivery platform (React + Vite + Tailwind on the frontend; Node.js/Express + PostgreSQL on the backend).
- Installed and configured project dependencies, ESLint, and scripts for migrations and seeding.
- Reviewed provided codebase structure; aligned on folder conventions for controllers, services, models, migrations, and React components.
- Prepared initial Docker/postgres setup (optional) and verified DB connectivity.
- Documented high‑level requirements: user auth, brands/outlets, orders, addresses, and admin flows.

Learning Outcomes
- Understood the repository structure for a scalable monorepo (frontend/backend separation).
- Practiced Vite/Tailwind setup and Express server bootstrapping.
- Learned how to structure migrations/seeders and manage local environment variables.

Challenges Faced
- Synchronizing Node/PostgreSQL versions across machines.
- Deciding on migration strategy and seed data ownership across environments.

Goals for Next Week
- Begin implementing core authentication and session handling.
- Define initial brand/outlet data models and routes.

Mentor Feedback
- Keep a strong focus on code readability and naming.
- Create early documentation for endpoints to help QA and future contributors.

Week 2 – Authentication, Sessions, and Basic API Scaffolding
Week Overview
- Implemented JWT-based authentication and basic session middleware for protected routes.
- Created initial RESTful endpoints for users and basic admin routes.
- Defined PostgreSQL tables and migrations for users, sessions, brands, and outlets.
- Integrated simple email/password login flow and response structures.

Learning Outcomes
- Deepened understanding of JWT vs session trade-offs and combined usage patterns.
- Learned secure password handling and error responses for auth endpoints.

Challenges Faced
- Handling refresh vs access tokens and aligning frontend storage.
- Coordinating auth guards on the frontend with route-level middleware on the backend.

Goals for Next Week
- Add brand/outlet CRUD and seed data.
- Start building frontend screens to consume the auth APIs.

Mentor Feedback
- Emphasize consistent response schemas across endpoints.
- Add request validation to reduce backend errors.

Week 3 – Brands/Outlets Domain and Frontend Integration
Week Overview
- Implemented CRUD for brands and outlets; wired migrations/seeders with sample data.
- Added featured brands listing and outlet-brand mapping.
- Built frontend services to consume the new APIs.
- Created a brand listing page (accessible under /restaurants) with sorting/filter placeholders.

Learning Outcomes
- Connecting React services to Express endpoints using fetch/Axios.
- Handling list views and mapping API models to UI view models.

Challenges Faced
- Normalizing API shapes (backend) vs. display shapes (frontend).
- Implementing pagination/limits for large brand lists.

Goals for Next Week
- Add order primitives and address/location context.
- Improve UI responsiveness.

Mentor Feedback
- Keep transforming API responses in one place (transformers/utilities) to avoid coupling.

Week 4 – Orders, Address/Location, and UX Polish
Week Overview
- Added order creation/listing endpoints and tied them to users.
- Introduced a LocationContext to handle location permission and outlet discovery integration.
- Implemented a “Set Location” prompt with a graceful fallback.
- Polished the FeaturedBrands UI with skeleton/loading states and empty/error states.

Learning Outcomes
- Built context-driven UI flows for location gates.
- Practiced robust UI states: loading, error, empty, and success.

Challenges Faced
- Handling geolocation errors and timeouts.
- Designing a good fallback when no nearby outlets were available.

Goals for Next Week
- Extend ordering flows and refine brand/outlet selection.
- Add analytics/debug logging for frontend API calls.

Mentor Feedback
- Ensure accessibility (focus management, keyboard navigation) while polishing UI.

Week 5 – Mobile-First Redesign (App-Like Experience)
Week Overview
- Redesigned the Home page to behave like a mobile web app (similar to industry apps) while preserving desktop experience.
- Added a clean mobile header, compact hero, quick categories, and a bottom navigation bar.
- Converted FeaturedBrands to an app-style card list on mobile and a horizontal scroll/grid on larger screens.
- Ensured touch-friendly targets (≥44px), responsive typography, and hidden decorative elements on small screens.

Learning Outcomes
- Mastered Tailwind responsive utilities (sm/md/lg) and conditional rendering for device-specific UI.
- Built app-like navigation patterns within the web context.

Challenges Faced
- Avoiding duplicate imports/JSX mistakes during rapid UI iteration.
- Balancing aesthetics with performance on low-end devices.

Goals for Next Week
- Finalize search/listing flows and “View All” navigation to brand listing.
- Optimize image loading and component memoization.

Mentor Feedback
- Implement lightweight logging/metrics to see what users click most on mobile.

Week 6 – Navigation, Routing, and Data Consistency
Week Overview
- Fixed “View All” navigation in FeaturedBrands to route to /restaurants.
- Verified bottom navigation routes for consistency.
- Added sample-data fallback in FeaturedBrands when the API is unavailable; added debug logs.
- Cleaned up imports and resolved name clashes (e.g., Home icon vs Home component).

Learning Outcomes
- Practiced route planning across multiple entry points (header links, CTA buttons, bottom nav).
- Learned to design fallbacks without breaking type safety.

Challenges Faced
- Reconciling API data contracts with evolving frontend needs.
- Handling fragment boundaries and JSX structure during refactors.

Goals for Next Week
- Write documentation and finalize a presentable build.
- Add polish for edge cases and loading states.

Mentor Feedback
- Keep code changes incremental with proper lint/testing before merges.

Week 7 – Documentation, Testing, and Final Polish
Week Overview
- Authored a comprehensive README and a 7‑week OJT report.
- Validated core flows: auth, location prompt, featured brands, brand listing navigation.
- Removed non-essential mobile header elements (e.g., hamburger/profile) per product direction.
- Ensured responsive spacing, consistent typography, and accessible touch targets.

Learning Outcomes
- Structured documentation for onboarding and evaluation (README, API docs, OJT report).
- Practiced systematic manual testing and lint-based quality checks.

Challenges Faced
- Keeping the UI consistent across multiple screen sizes after several iterations.
- Ensuring no regressions while refactoring the home and brands modules.

Goals (Post-OJT / Future Work)
- Add advanced search, filters, and sorting on /restaurants.
- Implement caching and skeletons for perceived performance.
- Add analytics and error monitoring.

Mentor Feedback & Suggestions
- Positive feedback on shipping both the functional backend and a modern mobile-first frontend.
- Recommendations to invest more in unit/integration tests and typed API contracts.

Additional Notes
- The project matured from baseline scaffolding to an app-like, responsive experience with clear extension points.
- The codebase now has a documented path for future contributors.



