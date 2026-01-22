# Frontend Troubleshooting

This document outlines the steps taken to fix the issues in the frontend application.

## Issues Identified

1.  **Redundant `useAuth` hook:** There were two `useAuth` hooks defined in the application, one in `frontend/src/hooks/useAuth.js` and another in `frontend/src/context/AuthContext.jsx`.
2.  **Redundant `AuthContext`:** There were two `AuthContext` creations, one in `frontend/src/context/AuthContextValue.js` and another in `frontend/src/context/AuthContext.jsx`.
3.  **Incorrect import paths:** Several files were using incorrect import paths to import the `useAuth` hook and other components.

## Steps Taken to Fix the Issues

1.  **Removed redundant files:**
    *   Deleted `frontend/src/hooks/useAuth.js`.
    *   Deleted `frontend/src/context/AuthContextValue.js`.
2.  **Consolidated `AuthContext` and `useAuth` hook:**
    *   The `AuthContext` and `useAuth` hook are now both defined in `frontend/src/context/AuthContext.jsx`.
    *   The `AuthContext` is now exported from `frontend/src/context/AuthContext.jsx` so that it can be used in `main.jsx`.
3.  **Fixed import paths:**
    *   Updated the import path for `useAuth` in the following files to be more explicit:
        *   `frontend/src/App.jsx`
        *   `frontend/src/pages/Login.jsx`
        *   `frontend/src/components/ProtectedRoute.jsx`
        *   `frontend/src/components/Navbar.jsx`
    *   Updated the import path for `AuthProvider` in `frontend/src/main.jsx` to be more explicit.

After these changes, the application should be in a runnable state. To run the application, you can use the following command in the `frontend` directory:

```bash
npm run dev
```
