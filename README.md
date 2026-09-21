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

## Run with Docker and host MySQL

The Docker Compose app is configured to use MySQL installed on the host machine. Before starting it:

1. Start the host MySQL service.
2. Create the database if needed: `CREATE DATABASE It_assets;`.
3. Update `DB_USER` and `DB_PASSWORD` in `docker-compose.yml` to match the host MySQL account.
4. Ensure host MySQL accepts connections from Docker Desktop and Windows Firewall allows TCP port `3306`.
5. Start the app with `docker compose up --build`.

On Docker Desktop for Windows, `host.docker.internal` points to the Windows host. Data written by the container will therefore appear in the host MySQL `It_assets` database.