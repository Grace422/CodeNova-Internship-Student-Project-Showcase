# Student Project Showcase

A full-stack web application for submitting, reviewing, and showcasing student projects. 

The system allows students to submit project details and provides administrators with tools to review submissions and manage their publication status.

## 1. Setup Guide

### Prerequisites

Ensure the following are installed:

- Node.js and npm
- PostgreSQL
- Git
- A code editor such as Visual Studio Code

### Clone the Repository

```bash
git clone https://github.com/Grace422/CodeNova-Internship-Student-Project-Showcase/
cd student-project-showcase
```

### Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_showcase
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_SSL=false

ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password

JWT_SECRET=your_secure_random_secret
```

Replace the placeholder values with your local PostgreSQL credentials and secure administrator settings. Adjust the port if PostgreSQL uses a different port on your computer.

Create the `student_showcase` database in PostgreSQL and execute the project's database schema to create the `projects` and `admins` tables and their indexes.

Create the administrator account using the existing setup script:

```bash
node scripts/createAdmin.js
```

Start the backend development server:

```bash
npm run dev
```

The backend runs at `http://localhost:5000` unless a different port is configured.

### Frontend Setup

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

### Production Configuration

The application is deployed using Vercel for the frontend and Render for the backend and PostgreSQL database.

For production deployment:

- Configure Vercel's Root Directory as `frontend`.
- Set `VITE_API_URL` in Vercel to the deployed backend URL.
- Configure the backend environment variables in Render using the hosted PostgreSQL credentials.
- Set `DB_SSL=true` for the hosted database connection.
- Keep passwords, JWT secrets, and `.env` files out of version control.

## 2. API Route Listing

The backend exposes REST API endpoints through Express.js.

Base URL for local development:

```text
http://localhost:5000
```

Production API:

```text
https://student-showcase-api.onrender.com
```

### Public Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health/db` | Checks database connectivity and returns the connected database name. |
| GET | `/api/projects` | Retrieves approved projects for the public gallery. |
| POST | `/api/projects` | Validates and submits a new project. New submissions receive a pending status. |

### Administrator Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Authenticates an administrator and returns an authentication token. |
| GET | `/api/admin/projects` | Retrieves project submissions for administrative review. Requires authentication. |
| PATCH | `/api/admin/projects/:id/status` | Updates a project's status to approved or rejected. Requires authentication. |

### Authentication

Administrator endpoints require a valid JSON Web Token (JWT).

Include the token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The login endpoint accepts administrator credentials. Upon successful authentication, the backend issues a token used to authorize protected administrative operations.

### Project Submission Fields

The project submission endpoint accepts the following fields:

| Field | Description |
|---|---|
| `title` | Project title |
| `student_name` | Student's name |
| `description` | Project description |
| `tags` | Array of technologies or project categories |
| `github_url` | GitHub repository URL |
| `demo_url` | Live demonstration URL |

New submissions are stored with `pending` status until reviewed by an administrator.

### Project Status Values

- `pending` — Awaiting administrator review.
- `approved` — Accepted and visible in the public gallery.
- `rejected` — Not approved for public display.

## 3. Architectural Documentation

### System Overview

The application follows a client-server architecture using a React frontend, an Express.js REST API, and a PostgreSQL relational database.

```text
                 Student Project Showcase
                            |
                +-----------+-----------+
                |                       |
           Public Pages            Admin Pages
                |                       |
                +-----------+-----------+
                            |
                      React + Vite
                            |
                       REST API
                            |
                       Express.js
                            |
                +-----------+-----------+
                |                       |
          Public Routes           Protected Routes
                |                       |
                +-----------+-----------+
                            |
                        PostgreSQL
```

### Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React | User interface and components |
| Frontend tooling | Vite | Development server and production builds |
| Styling | Tailwind CSS | Layout and visual styling |
| Routing | React Router | Client-side navigation |
| Backend | Node.js and Express.js | HTTP server and API routes |
| Database | PostgreSQL | Persistent storage |
| Database driver | `pg` | Database connectivity and SQL queries |
| Authentication | JSON Web Token | Protecting administrator endpoints |
| Password security | bcryptjs | Hashing and verifying administrator passwords |
| Configuration | dotenv | Loading environment variables |
| Cross-origin requests | CORS | Configuring frontend-to-backend access |
| Frontend hosting | Vercel | Serving the production frontend |
| Backend and database hosting | Render | Hosting the API and PostgreSQL database |

### Frontend Architecture

The frontend is responsible for rendering the public gallery, collecting project submissions, handling administrator login, and presenting the administrative dashboard.

Its main components include:

- `App.jsx` — Defines application routes.
- `ProjectGallery.jsx` — Retrieves and displays approved projects.
- `SubmitProject.jsx` — Collects and submits project information.
- `AdminLogin.jsx` — Handles administrator authentication.
- `AdminDashboard.jsx` — Displays submissions and supports project moderation.

React Router provides navigation between the public application and the administrator pages.

### Backend Architecture

The Express.js backend processes incoming HTTP requests, validates data, performs database operations, and returns JSON responses.

The API is divided into public project operations and protected administrative operations.

The backend uses:

- Express.js for request routing and middleware.
- `pg` for executing PostgreSQL queries.
- bcryptjs for password verification.
- JWT middleware for protecting administrative routes.
- dotenv for loading configuration from environment variables.

### Database Architecture

The PostgreSQL database contains two primary tables.

**`projects`**

Stores project submissions and their review information.

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `title` | Project title |
| `student_name` | Submitting student |
| `description` | Project details |
| `tags` | Project tags stored as a PostgreSQL text array |
| `github_url` | Source code repository |
| `demo_url` | Live demo |
| `status` | Review status |
| `created_at` | Submission timestamp |
| `reviewed_at` | Review timestamp |

**`admins`**

Stores administrator account information.

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `username` | Unique administrator username |
| `password_hash` | Hashed password |
| `created_at` | Account creation timestamp |

The project status constraint restricts status values to `pending`, `approved`, or `rejected`. Indexes support project status filtering and sorting by submission time.

### Project Review Workflow

1. A student submits project details through the frontend.
2. The backend validates the submission and stores it in PostgreSQL with `pending` status.
3. An administrator signs in and receives a JWT.
4. The administrator retrieves submissions through the protected API.
5. The administrator approves or rejects a project.
6. The backend updates the project's status and review timestamp.
7. The public gallery displays approved projects only.

### Repository Structure

```text
student-project-showcase/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── ProjectGallery.jsx
│   │   ├── SubmitProject.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminDashboard.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

This tree illustrates the main application files. Additional files may exist depending on the current repository structure.

### Security Considerations

- Administrator passwords are stored as hashes.
- JWT authentication protects administrative operations.
- Environment variables are used for sensitive configuration.
- Production database connections use SSL/TLS.
- Input validation helps prevent invalid project data from being stored.
- Production CORS settings should restrict access to trusted frontend origins.

### Live Application

- Public Website: [Student Project Showcase](https://code-nova-internship-student-projec.vercel.app/)
- Admin Login: [Admin Dashboard Login](https://code-nova-internship-student-projec.vercel.app/admin/dashboard)



