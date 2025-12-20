# Deployment Guide for Clinic Appointment System

This project is configured to be deployed on **Vercel** as two separate projects: one for the Backend (Python/Pyramid) and one for the Frontend (React/Vite).

## Prerequisites

- A [Vercel](https://vercel.com/) account.
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional, but recommended) or connected GitHub repository.
- A **PostgreSQL Database** accessible from the internet (e.g., Neon, Supabase, Vercel Postgres). Your current `development.ini` uses Neon, which is perfect.

---

## Part 1: Deploying the Backend

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Deploy using Vercel CLI**:
    ```bash
    vercel
    ```
    - Follow the prompts.
    - **Project Name**: e.g., `clinic-backend`
    - **In which directory is your code located?**: `./` (default)
    - **Want to modify these settings?**: No (default settings should detect Python/Other). *Note: If it detects nothing, ensure `vercel.json` is present.*

3.  **Environment Variables**:
    - Go to your Vercel Dashboard -> Project Settings -> Environment Variables.
    - Add the following variable:
        - `DATABASE_URL`: Your production PostgreSQL connection string (must start with `postgresql+psycopg://` or `postgresql://`).
        - *Note: If using Neon, `sslmode=require` is usually needed.*

4.  **Get the Backend URL**:
    - Once deployed, copy the production URL (e.g., `https://clinic-backend.vercel.app`).
    - **Verify**: Visit `https://clinic-backend.vercel.app/`. You should see a 404 (Pyramid default) or your API response if you have a root route. Try `https://clinic-backend.vercel.app/api/doctors` (might require auth).

---

## Part 2: Deploying the Frontend

1.  **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```

2.  **Deploy using Vercel CLI**:
    ```bash
    vercel
    ```
    - Follow the prompts.
    - **Project Name**: e.g., `clinic-frontend`
    - **Framework Preset**: Vite (should be auto-detected).
    - **Build Command**: `npm run build` (default).
    - **Output Directory**: `dist` (default).

3.  **Environment Variables**:
    - Go to your Vercel Dashboard -> Project Settings -> Environment Variables.
    - Add the following variable:
        - `VITE_API_URL`: The **Backend URL** from Part 1 (e.g., `https://clinic-backend.vercel.app`). **Important**: Do not add a trailing slash.

4.  **Redeploy**:
    - If you added the environment variable *after* the initial deployment, you must redeploy for it to take effect.
    ```bash
    vercel --prod
    ```

---

## Troubleshooting

- **CORS Issues**: The backend is configured to allow `*` (all origins). If you see CORS errors, ensure `VITE_API_URL` is correct and matches the backend URL exactly (https vs http).
- **Database Errors**: Check your `DATABASE_URL` in Vercel backend settings. Ensure the database accepts connections from anywhere (0.0.0.0/0) or Vercel's IP ranges.
- **500 Errors on Backend**: Check Vercel Logs (Runtime Logs) in the dashboard to see Python exceptions.
