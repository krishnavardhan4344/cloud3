# Cloud-Based Digital Identity Verification System

A simple full-stack web app where users register, log in, upload identity documents and track verification status. An admin reviews the documents and approves or rejects each request.

## Features
- User registration and login (JWT authentication, bcrypt password hashing)
- Dashboard with verification status and history
- Identity verification form with document upload (PDF, JPG, JPEG, PNG, max 5 MB)
- Status page showing Pending / Under Review / Approved / Rejected, submission date and admin remarks
- Admin panel: view users, view requests, view uploaded documents, mark Under Review, approve, reject, add remarks
- Separate user and admin authorization
- Responsive Bootstrap 5 blue/white cloud-security theme

## Technologies
HTML5, CSS3, JavaScript, Bootstrap 5, Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer

## Project Structure
```
cloud-digital-identity/
├── frontend/   (HTML pages, css/, js/)
├── backend/    (server.js, config/, models/, routes/, middleware/, uploads/, .env)
└── README.md
```

## Setup (VS Code)

### 1. Install Node.js and MongoDB
- Node.js (LTS): https://nodejs.org
- MongoDB Community Server: https://www.mongodb.com/try/download/community
  (install it as a service so it runs on `mongodb://127.0.0.1:27017`)

Start MongoDB if it is not already running:
- Windows: it starts automatically as a service (or run `net start MongoDB` as administrator)
- macOS (Homebrew): `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

**Using MongoDB Atlas instead?** Create a free cluster, copy the connection string and put it in `MONGO_URI` in `backend/.env`.

### 2. Install dependencies
```bash
cd cloud-digital-identity/backend
npm install
```

### 3. Configure environment variables
Copy `backend/.env.example` to `backend/.env`, then configure the values for your environment:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cloud_digital_identity
JWT_SECRET=change_this_to_a_long_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```
Change `JWT_SECRET` before using this anywhere real.

### 4. Start the app
```bash
cd backend
npm start
```
Open **http://localhost:5000** in your browser.

The Express server serves both the API and the frontend, so there is only one command to run.
(If you prefer VS Code Live Server for the `frontend/` folder, it also works because the frontend calls `http://localhost:5000/api` automatically. Keep the backend running.)

### 5. Log in as admin
The admin account is created automatically on first start using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.
Default: `admin@example.com` / `Admin@123`

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register a user |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/profile | User | Get own profile |
| POST | /api/verification/submit | User | Submit verification (FormData with `document` file) |
| GET | /api/verification/status | User | Get own verification requests |
| GET | /api/admin/users | Admin | List all users |
| GET | /api/admin/verifications | Admin | List all verification requests |
| GET | /api/admin/verification/:id/document | Admin | Download uploaded document |
| PUT | /api/admin/verification/:id/review | Admin | Mark as Under Review |
| PUT | /api/admin/verification/:id/approve | Admin | Approve (body: `{ "remarks": "..." }`) |
| PUT | /api/admin/verification/:id/reject | Admin | Reject (body: `{ "remarks": "..." }`) |

Protected routes need the header `Authorization: Bearer <token>`.

## Security Notes
- Passwords are hashed with bcrypt and never returned by the API
- JWT tokens expire after 2 hours
- Uploaded files get random names, are type-checked (extension and MIME) and limited to 5 MB
- Uploads are **not** publicly served; only admins can download them through a protected route
- Secrets are read from environment variables

## Testing Flow
1. Register a user and log in
2. Go to Verify, fill the form, upload a PDF/JPG/PNG and submit
3. Check Dashboard / Status (shows Pending)
4. Log out, log in as admin, open Admin Panel, click View Doc, add remarks, Approve or Reject
5. Log in as the user again to see the updated status and remarks

## Screenshots
_Add your screenshots here (Home, Register, Login, Dashboard, Verification, Status, Admin)._

## Troubleshooting
- **Could not connect to MongoDB**: make sure MongoDB is running and `MONGO_URI` is correct
- **Cannot reach the server**: start the backend with `npm start`
- **Port already in use**: change `PORT` in `.env`
