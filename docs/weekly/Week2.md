Week 2 – Authentication, Sessions, and API Scaffolding

1. Week Overview
This week centered on making GlobalEats secure and user-aware. I implemented core authentication using JSON Web Tokens (JWT) and session middleware to protect sensitive routes. I scaffolded RESTful endpoints for user registration and login, added password hashing, and integrated basic request validation to improve reliability. I also aligned response shapes and error conventions to keep the API predictable for the frontend.

2. Objectives and Tasks Completed
- Implemented user registration and login endpoints with hashed passwords.
- Added JWT issuance on login and middleware to verify tokens on protected routes.
- Introduced session middleware for server-side checks where needed.
- Created initial admin/user route separation; added role field to user model.
- Standardized API responses (data / error / message) for frontend consumption.
- Documented endpoints and example requests/responses in the project docs.

3. Technical Details
- Libraries: bcrypt for hashing, jsonwebtoken for token issuance/verification.
- Middleware: token extraction from headers; error handling with consistent status codes.
- Validation: basic request body validation to prevent malformed data from reaching controllers.
- Security: avoided sending sensitive fields (passwords, tokens) in API responses.

4. Learning Outcomes
- End-to-end JWT flow: creation, storage, verification, and refresh strategies.
- Role-based access considerations and mapping auth logic to route-level policies.
- The importance of unified response contracts to simplify frontend integration and testing.

5. Challenges Faced and Resolutions
- Handling token expiry and refresh: designed token lifecycle and error states for expired/invalid tokens.
- Storing tokens securely on the client: documented best practices (httpOnly cookies vs storage trade-offs).
- Ensuring consistent error shapes across all endpoints: refactored middleware and utilities to centralize error handling.

6. Testing and Validation
- Used Postman to test authentication endpoints (happy path and error cases).
- Wrote exploratory tests for protected routes to verify middleware enforcement.
- Manually verified frontend behavior with protected fetch calls and redirects on 401/403.

7. Impact and Next Steps
Secure endpoints unlock user-specific features like orders, addresses, and role-aware administration. Next week will focus on the brands/outlets domain and integrating frontend services for a visible, user-facing experience.



