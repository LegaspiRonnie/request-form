# Request Form (React SPA + PHP + MySQL / XAMPP)

## Folder structure

- `frontend/`: React SPA (Vite)
- `backend/`: PHP API (XAMPP)

## 1) Database setup (phpMyAdmin)

1. Start **Apache** + **MySQL** in XAMPP.
2. Open `http://localhost/phpmyadmin`.
3. Go to **Import**
4. Import: `backend/sql/request_system.sql`

This creates DB `request_system` and table `requests`.

## 2) Backend setup (XAMPP)

1. Copy the `backend/` folder into your XAMPP web root:
   - Example: `C:\xampp\htdocs\request-form\backend\...`
2. Confirm the endpoint is reachable in a browser:
   - `http://localhost/request-form/backend/submit_request.php`
3. If your MySQL credentials differ, edit:
   - `backend/config/db.php`

## 3) Frontend setup

1. Create your local env file:
   - Copy `frontend/.env.example` to `frontend/.env`
2. Ensure it points to the backend folder URL, for example:
   - `VITE_API_BASE_URL=http://localhost/request-form/backend`
3. Run the React app:

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## API contract

### POST `/submit_request.php`

Accepts JSON:

```json
{
  "full_name": "John Doe",
  "reason": "Request Customize",
  "description": "Details here...",
  "fb_url": "https://facebook.com/..."
}
```

Returns:

```json
{
  "status": "success",
  "message": "Request submitted successfully"
}
```

## Optional UI improvements

- Add a toast system (e.g. `react-hot-toast`) instead of inline alerts
- Add a “View submissions” admin page (protected) for quick review

