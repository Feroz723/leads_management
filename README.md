# Smart Leads Dashboard

A full-stack MERN Lead Management Dashboard built with TypeScript, React, Tailwind CSS, Express, MongoDB, Mongoose, JWT authentication, role-based access control, CSV export, and Docker support.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- Protected dashboard and lead routes
- Role-based access control for `admin` and `sales_user`
- Lead CRUD: create, list, view details, update, and delete
- Admin-only lead deletion
- Combined filtering by status, source, and debounced search
- Sort leads by latest or oldest
- Backend pagination with metadata
- CSV export for filtered leads
- Loading, error, empty, and form validation states
- Responsive React UI with reusable components
- Docker Compose setup for frontend, backend, and MongoDB

## Tech Stack

Backend:
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Zustand

## Local Setup

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create environment files:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Backend `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/leadsdb
PORT=5000
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRATION=7d
NODE_ENV=development
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
```

Start the backend:

```bash
cd backend
npm run start:dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Open the frontend at `http://localhost:3000`.

## Docker Setup

Run the full stack:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- MongoDB: `mongodb://localhost:27017`

Stop services:

```bash
docker compose down
```

Remove containers and database volume:

```bash
docker compose down -v
```

## Scripts

Backend:

```bash
npm run build
npm run start:dev
npm start
```

Frontend:

```bash
npm run typecheck
npm run build
npm run dev
npm run preview
```

## API Overview

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `POST /api/auth/logout`

Leads:

- `GET /api/leads`
- `POST /api/leads`
- `GET /api/leads/:id`
- `PUT /api/leads/:id`
- `DELETE /api/leads/:id`
- `GET /api/leads/export/csv`

Protected endpoints require:

```http
Authorization: Bearer <token>
```

See [API.md](./API.md) for detailed request and response examples.

## Roles

`admin`:
- List, view, create, update, delete, and export leads

`sales_user`:
- List, view, create, update, and export leads
- Cannot delete leads

## Validation

The backend validates auth payloads, lead payloads, query filters, sort order, and pagination values. The frontend validates login, registration, and lead forms before submitting.

## Submission Details

- **GitHub Repository**: [https://github.com/Feroz723/leads_management.git](https://github.com/Feroz723/leads_management.git)
- **API Documentation**: [API.md](./API.md)
- **Setup Instructions**: See [Local Setup](#local-setup) and [Docker Setup](#docker-setup)
- **Environment Examples**: [backend/.env.example](./backend/.env.example) and [frontend/.env.example](./frontend/.env.example)
- **Live Deployment**: [https://leads-management-kohl.vercel.app/](https://leads-management-kohl.vercel.app/)
- **Demo Video (Drive)**: [https://drive.google.com/file/d/1o9WZb_gwmpQjbQZtcdOp8G90owe4NxPf/view?usp=sharing](https://drive.google.com/file/d/1o9WZb_gwmpQjbQZtcdOp8G90owe4NxPf/view?usp=sharing)


