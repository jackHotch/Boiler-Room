# Deployment Changelog

## 02/12/2025

- Updated environment variables necassary for steam authentication
  - API_URL - redirect url for steam authentication
  - BACKEND_URL - url for the backend of the app, used to redirect after successful login to save data in the session
  - FRONTEND_URL - url for the frontend of the app, used to redirect user after all authentication steps have been completed
  - USE_HTTPS - setting in the cookie storage, must be true when in production
  - SESSON_SECRET - secret key used for encrypting the data in the session
