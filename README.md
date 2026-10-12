# AI Medical Assistant (MERN + Python ML)

Features: user login/register (JWT), symptom checker, disease prediction (ML model), medicine and precaution advisor,
nearby hospital locator (OpenStreetMap, free, no API key) and downloadable PDF health report.

## Folder structure
```
ai-medical-assistant/
 ├─ backend/      Node + Express + MongoDB (REST API)       -> port 5000
 ├─ frontend/     React (Vite)                              -> port 5173
 └─ ml-service/   Python Flask + scikit-learn (OPTIONAL)    -> port 5001
```

## Requirements (install once)
1. Node.js 18 or newer  -> https://nodejs.org
2. MongoDB Community Server -> https://www.mongodb.com/try/download/community  (keep it running)
   (or use a free MongoDB Atlas cluster and paste its URL in backend/.env as MONGO_URI)
3. Python 3.9+ (only for the optional ML service)

## Run step by step (open 3 terminals)

### Terminal 1 - Backend
```
cd backend
npm install
npm start
```
You should see: `MongoDB connected` and `API running on http://localhost:5000`

### Terminal 2 - Frontend
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 in your browser.

### Terminal 3 - ML service (optional)
```
cd ml-service
pip install -r requirements.txt
python app.py
```
If this is not running, the backend automatically uses its built-in rule engine, so the app still works.
The result card shows which engine was used ("ml-model" or "rule-engine").

## How to use
1. Register -> Log in
2. "Check symptoms" -> pick 2 or more symptoms -> Analyse
3. See possible diseases, medicines, precautions -> "Download PDF report"
4. "Hospitals" -> allow location -> see nearby hospitals on map
5. "My reports" shows your history

## Admin access
Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`. The backend provisions that account as an administrator when it starts. The password must be at least 12 characters; replace the sample value in `.env.example` before use. If the configured email already exists, startup promotes that account and resets its password to `ADMIN_PASSWORD`.

Sign in with the configured email and password to open the admin console. Administrators can review account/report counts, browse patient accounts and recent health reports, and delete patient accounts or individual reports. Deleting a patient also deletes their reports. Admin API routes verify the account's current database role on every request.

## API summary
| Method | URL | Purpose |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | Create account / login |
| GET  | /api/symptoms | List of symptoms |
| POST | /api/predict | Analyse symptoms (auth) |
| GET  | /api/predictions | History (auth) |
| GET  | /api/predictions/:id/report | PDF report (auth) |
| GET  | /api/hospitals?lat=&lng=&radius= | Nearby hospitals (auth) |
| GET | /api/admin/summary, /api/admin/users, /api/admin/predictions | Admin overview (admin) |
| DELETE | /api/admin/users/:id, /api/admin/predictions/:id | Delete account/report (admin) |

## Common problems
- `MongoDB connection failed` -> start MongoDB service (Windows: Services -> MongoDB -> Start; Mac: `brew services start mongodb-community`).
- Frontend shows "Cannot reach the server" -> backend (Terminal 1) is not running.
- Hospitals not loading -> allow location permission; the free Overpass server can be busy, try again.

## Disclaimer
Educational project. It is NOT a medical diagnosis. Always consult a licensed doctor.
