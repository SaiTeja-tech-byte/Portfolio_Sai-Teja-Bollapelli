# Sai Teja Bollapelli: PERN Portfolio

PostgreSQL + Express + React (Vite) + Node.js. One web service serves both the API and the React build.

- Public site at `/`
- Owner-only dashboard at `/admin` (change or remove your profile photo, read contact messages)
- Photo and messages are stored in PostgreSQL, so they survive Render redeploys

## Run locally

1. Create a local database: `createdb portfolio`
2. `cp .env.example .env` and edit the values
3. `npm install && npm --prefix client install`
4. Terminal 1: `npm run dev:server`   Terminal 2: `npm run dev:client`
5. Open http://localhost:5173 (admin at http://localhost:5173/admin)

## Deploy on Render

1. Push this folder to a GitHub repository.
2. Render dashboard: New > Blueprint > pick the repo. It reads `render.yaml` and creates the web service and the PostgreSQL database.
3. When asked, set `ADMIN_PASSWORD` to a strong password (this is your admin login). `JWT_SECRET` is generated for you.
4. After the build finishes, open `https://<your-service>.onrender.com/admin`, log in and upload your photo.

Notes
- Tables are created automatically on first start.
- Free Render web services sleep when idle and free databases have limits; check Render's current free-tier terms, or choose a paid plan for an always-on site.
- To use an external database URL, set `DB_SSL=true`.
- Update LinkedIn, GitHub and LeetCode links at the bottom of `client/src/App.jsx`.
- Edit your content in `client/src/data.js` and `client/src/App.jsx`.

## Security built in
HttpOnly SameSite=Strict cookie, JWT 7-day sessions, login rate limit (10 per 15 min), contact rate limit, image type check by file signature, 3 MB upload cap, Helmet security headers with a strict CSP, parameterised SQL.
