# IT Asset System

## Structure

```text
app.js                 Application entrypoint
src/config/            Environment and MySQL pool
src/middleware/        Authentication and file upload middleware
src/routes/            Auth, dashboard, asset, assignment, maintenance and scrap routes
public/                CSS and browser assets
views/                 EJS templates
uploads/               Temporary import files
```

## Run locally

1. Create `.env` from `.env.example` and set the MySQL values.
2. Ensure the `It_assets` database and the existing business tables are available.
3. Run `npm install`.
4. Run `npm start` and open `http://localhost:3000`.

The application creates the `Users` table automatically. For production, set `NODE_ENV=production`, use a strong `SESSION_SECRET`, and run behind HTTPS.