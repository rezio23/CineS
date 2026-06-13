# Cinema Dashboard - How to Run

## Quick Start

Double-click `RUN.bat` in the project root folder.

This will:
1. Open a new window and start the backend server
2. Wait 3 seconds for the server to initialize
3. Open your browser to http://localhost:5000

## What Was Fixed

The main issue was that the browser could not load the JavaScript modules
because the import statements did not include `.js` file extensions.
The server was serving `index.html` instead of the actual JavaScript files.

This has been fixed by adding middleware to the backend that automatically
serves the correct `.js` file for extension-less module requests.

## Manual Start

### 1. Start the Backend Server
```
cd cinema-dashboard/backend
node server.js
```

Or use the batch file:
```
cinema-dashboard/backend/start-server.bat
```

The server will run on http://localhost:5000

### 2. Open in Browser
Navigate to http://localhost:5000

The backend serves the pre-built frontend files from the `dist/` folder.

## What Works

- Backend API: All endpoints return data (with mock data fallback when Oracle DB is unavailable)
- Frontend: Served as static files via the backend
- Dashboard: Loads with all charts and KPIs using mock data

## Vite Dev Server Note

The Vite dev server (`npm run dev`) has a known Windows-specific esbuild issue
in this environment that causes Access is denied errors. The pre-built files
in `frontend/dist/` are fully functional, so the dev server is not required.

If you need to rebuild the frontend, use Babel directly:
```
cd cinema-dashboard/frontend
npx babel src --out-dir dist --extensions .jsx
```

## PowerShell Note

If you prefer using PowerShell commands like `npm start`, you may need to run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

But you do not need this for normal use -- the `RUN.bat` approach works
directly without requiring PowerShell script execution.
