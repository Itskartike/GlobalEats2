# Authentication 400 Error - Troubleshooting Guide

## Problem
Getting a 400 (Bad Request) error when trying to login or register with the error message:
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
LoginModal.tsx:69 Auth submit error: AxiosError
```

## Root Cause
The 400 error indicates that the backend validation is failing. This typically happens when:
1. **Email format is invalid** - Not a proper email address
2. **Password is empty** - Password field is blank or not being sent
3. **Required fields are missing** - Email or password not included in the request
4. **Data format issues** - Form data not being sent correctly

## Backend Validation Requirements

### Login Endpoint (`/api/auth/login`)
- **Email**: Must be a valid email format (e.g., user@example.com)
- **Password**: Must not be empty

### Register Endpoint (`/api/auth/register`)
- **Name**: 2-100 characters
- **Email**: Valid email format
- **Phone**: 10-15 digits only
- **Password**: Minimum 6 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

## Solutions Implemented

### 1. Enhanced Error Handling
Created `frontend/src/utils/errorHandler.ts` with utilities to:
- Extract validation errors from backend responses
- Display field-specific errors
- Log detailed error information for debugging

### 2. Updated Login Component
- Added detailed logging of request data
- Displays backend validation errors in form fields
- Shows user-friendly error messages
- Validates email format and password before submission

### 3. Updated Register Component
- Similar improvements as Login
- Properly formats phone number (removes non-digits)
- Validates all fields before submission

### 4. Improved AuthService
- Added detailed logging of payloads being sent
- Trims whitespace from email
- Ensures all required fields are present

## Debugging Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and check the Console tab for:
```javascript
AuthService: Login attempt { email: "...", hasPassword: true, passwordLength: 8 }
AuthService: Sending payload { email: "...", hasPassword: true, passwordLength: 8 }
```

### Step 2: Check Network Tab
1. Open DevTools > Network tab
2. Filter by "XHR" or "Fetch"
3. Look for the `/api/auth/login` request
4. Check the **Request Payload** to see what's being sent
5. Check the **Response** to see the exact error

### Step 3: Verify Backend is Running
Run the test script:
```bash
node test-login-api.js
```

Expected output should show validation errors for invalid formats:
```
Status: 400
Response: {
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "Please provide a valid email address",
      "path": "email"
    }
  ]
}
```

### Step 4: Common Issues and Fixes

#### Issue: Email field is empty or invalid
**Symptoms**: Error message "Please provide a valid email address"
**Fix**: Ensure the email input field has `name="email"` and `type="email"`

#### Issue: Password field is empty
**Symptoms**: Error message "Password is required"
**Fix**: Ensure the password input field has `name="password"` and `type="password"`

#### Issue: Form data not being sent
**Symptoms**: Backend receives empty object `{}`
**Fix**: 
- Check that form inputs have `name` attributes
- Verify `handleInputChange` is updating `formData` state
- Ensure `handleSubmit` is calling `authService.login(formData)`

#### Issue: CORS errors
**Symptoms**: Network error or CORS policy error
**Fix**: 
- Verify backend is running on http://localhost:5000
- Check `.env` file has correct `VITE_API_URL=http://localhost:5000/api`
- Restart both frontend and backend servers

## Testing the Fix

### Test with Valid Credentials
1. Open the application
2. Click on Login
3. Enter:
   - Email: `test@example.com`
   - Password: `Test123456`
4. Check console for logs
5. Should show proper error message if user doesn't exist

### Test with Invalid Email
1. Enter: `invalid-email` (without @)
2. Submit form
3. Should show: "Please provide a valid email address"
4. Error should appear below the email field

### Test with Empty Password
1. Enter email but leave password blank
2. Submit form
3. Should show: "Password is required"
4. Error should appear below the password field

## Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] Frontend can reach backend (check Network tab)
- [ ] Email field has valid format
- [ ] Password field is not empty
- [ ] Form submission sends correct data structure
- [ ] Console shows detailed logging
- [ ] Validation errors display in UI
- [ ] Toast notifications show error messages

## Additional Resources

### Files Modified
1. `frontend/src/components/features/auth/Login.tsx` - Enhanced error handling
2. `frontend/src/components/features/auth/Register.tsx` - Enhanced error handling
3. `frontend/src/services/authService.ts` - Added detailed logging
4. `frontend/src/utils/errorHandler.ts` - NEW: Error handling utilities

### Test Files
- `test-login-api.js` - Test backend validation

## Next Steps

If the issue persists after implementing these fixes:
1. Open browser DevTools Console
2. Copy all logs starting with "AuthService:" or "[Login]"
3. Open Network tab and copy the request/response for `/api/auth/login`
4. Share this information for further debugging

## Quick Fix Commands

```bash
# Backend
cd backend
npm start

# Frontend (in new terminal)
cd frontend
npm run dev

# Test API
node test-login-api.js
```
