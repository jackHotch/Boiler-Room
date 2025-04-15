# Deployment

BoilerRoom - https://boiler-room-481.onrender.com

## Production Environment Variables

### Frontend

- NEXT_PUBLIC_BACKEND - Url to production backend

### Backend

- API_URL - Redirect url for steam authentication
- BACKEND_URL - Url for the backend of the app, used to redirect after successful login to save data in the session
- DB_URL - Connetion string to connect to Supabase database
- STEAM_API_KEY - Api key used for most api calls for the site
- FRIENDS_API_KEY - Api key used for any api calls on the friends page
- FRONTEND_URL - Url for the frontend of the app, used to redirect user after all authentication steps have been completed
- SAME_SITE - Setting that can allows cookies from other sites
- USE_HTTPS - Setting in the cookie storage, must be true when in production
- SESSON_SECRET - Secret key used for encrypting the data in the session
