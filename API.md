# API Documentation

## Overview

The Leads Dashboard API is a RESTful backend service built with **Express.js**, **MongoDB (Mongoose)**, and **JWT** authentication. It exposes two main namespaces:

- **`/api/auth`** — User registration, login, profile retrieval, and logout
- **``/api/leads`** — CRUD operations and CSV export for lead records

The base URL is configurable via the `VITE_API_BASE_URL` environment variable (default: `http://localhost:5000/api`). Protected routes require a JWT passed in the `Authorization` header as a `Bearer` token.

---

## Authentication Endpoints

All auth routes are mounted under **`/api/auth`**.

---

### 1. Register

**`POST /api/auth/register`**

Registers a new user account and returns a JWT alongside the created user profile (without the hashed password).

#### Request Body

| Field     | Type    | Required | Description                                       |
|-----------|---------|----------|---------------------------------------------------|
| `name`    | `string`| Yes      | Full name of the user                             |
| `email`   | `string`| Yes      | A unique email address                            |
| `password`| `string`| Yes      | Plain-text password (min length enforced by bcrypt) |
| `role`    | `string`| No       | `"admin"` or `"sales_user"` — defaults to `"sales_user"` |

#### Request Headers

| Header          | Value              |
|-----------------|--------------------|
| `Content-Type`  | `application/json` |

#### Success Response

**Status:** `201 Created`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "admin"
  }
}
```

#### Error Responses

| Status        | Body                                              |
|---------------|---------------------------------------------------|
| `400`         | `{ "message": "User already exists" }`             |
| `500`         | `{ "message": "Something went wrong!" }`           |

#### Example Request

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securePass123",
    "role": "admin"
  }'
```

---

### 2. Login

**`POST /api/auth/login`**

Authenticates an existing user. Returns a JWT and user profile on success.

#### Request Body

| Field     | Type    | Required | Description                |
|-----------|---------|----------|----------------------------|
| `email`   | `string`| Yes      | Registered email address   |
| `password`| `string`| Yes      | Account password           |

#### Request Headers

| Header          | Value              |
|-----------------|--------------------|
| `Content-Type`  | `application/json` |

#### Success Response

**Status:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "admin"
  }
}
```

#### Error Responses

| Status        | Body                                               |
|---------------|----------------------------------------------------|
| `401`         | `{ "message": "Invalid credentials" }`              |
| `500`         | `{ "message": "Something went wrong!" }`            |

#### Example Request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securePass123"
  }'
```

---

### 3. Get Profile

**`GET /api/auth/profile`**

Returns the profile of the currently authenticated user (decoded from the JWT in the Authorization header).

#### Request Headers

| Header            | Value                              |
|-------------------|------------------------------------|
| `Authorization`   | `Bearer <JWT_TOKEN>`               |

#### Success Response

**Status:** `200 OK`

```json
{
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "admin"
  }
}
```

#### Error Responses

| Status        | Body                                               |
|---------------|----------------------------------------------------|
| `401`         | `{ "message": "No token provided" }`                |
| `401`         | `{ "message": "Token expired" }`                    |
| `401`         | `{ "message": "Invalid token" }`                    |
| `401`         | `{ "message": "Unauthorized" }`                     |
| `500`         | `{ "message": "Something went wrong!" }`            |

#### Example Request

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Logout

**`POST /api/auth/logout`**

Logs the user out by instructing the client to discard its stored JWT token. The server does not maintain session state.

#### Request Headers

| Header            | Value                              |
|-------------------|------------------------------------|
| `Content-Type`    | `application/json`                 |

#### Success Response

**Status:** `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

#### Example Request

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json"
```

---

## Leads Endpoints

All lead routes are mounted under **`/api/leads`**.

### Roles

| Role          | Capabilities on leads                 |
|---------------|---------------------------------------|
| `admin`       | Full access: read, create, update, delete, export |
| `sales_user`  | Read, create, update, export (no delete) |

---

### 5. Get Leads

**`GET /api/leads`**

Retrieves a paginated, sortable, and filterable list of leads.

#### Request Headers

| Header            | Value                              |
|-------------------|------------------------------------|
| `Authorization`   | `Bearer <JWT_TOKEN>`               |

#### Query Parameters

| Parameter | Type       | Required | Description                                       |
|-----------|------------|----------|---------------------------------------------------|
| `page`    | `number`   | No       | Page number (default: `1`)                        |
| `limit`   | `number`   | No       | Items per page (default: `10`)                    |
| `sortBy`  | `string`   | No       | Field to sort by (default: `createdAt`)           |
| `sortOrder`| `string`  | No       | Sort direction: `asc` \| `desc` (default: `desc`)  |
| `status`  | `string`   | No       | Filter by status: `New` \| `Contacted` \| `Qualified` \| `Lost` |
| `source`  | `string`   | No       | Filter by source: `Website` \| `Instagram` \| `Referral` |
| `search`  | `string`   | No       | Case-insensitive search across `name` and `email` |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f2a1b2c3d4e5f6a7b8c9d0",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "status": "New",
      "source": "Website",
      "createdAt": "2024-01-15T08:30:00.000Z",
      "updatedAt": "2024-01-15T08:30:00.000Z",
      "__v": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Error Responses

| Status        | Body                                               |
|---------------|----------------------------------------------------|
| `401`         | `{ "message": "No token provided" }`                |
| `401`         | `{ "message": "Token expired" }`                    |
| `401`         | `{ "message": "Invalid token" }`                    |
| `400`         | `{ "message": "Something went wrong!" }`            |
| `500`         | `{ "message": "Something went wrong!" }`            |

#### Example Request

```bash
curl -X GET "http://localhost:5000/api/leads?page=1&limit=10&status=New&search=alice" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 6. Get Lead by ID

**`GET /api/leads/:id`**

Fetches a single lead by its MongoDB Object ID.

#### Request Headers

| Header            | Value                              |
|-------------------|------------------------------------|
| `Authorization`   | `Bearer <JWT_TOKEN>`               |

#### URL Parameters

| Parameter | Type    | Required | Description            |
|-----------|---------|----------|------------------------|
| `id`      | `string`| Yes      | MongoDB Object ID of the lead |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "64f2a1b2c3d4e5f6a7b8c9d0",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "status": "New",
    "source": "Website",
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z",
    "__v": 0
  }
}
```

#### Error Responses

| Status        | Body                                               |
|---------------|----------------------------------------------------|
| `401`         | `{ "message": "No token provided / Invalid token" }` |
| `404`         | `{ "success": false, "message": "Lead not found" }`  |
| `500`         | `{ "message": "Something went wrong!" }`            |

#### Example Request

```bash
curl -X GET http://localhost:5000/api/leads/64f2a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 7. Create Lead

**`POST /api/leads`**

Creates a new lead record. Requires `admin` or `sales_user` role.

#### Request Headers

| Header            | Value                              |
|-------------------|------------------------------------|
| `Authorization`   | `Bearer <JWT_TOKEN>`               |
| `Content-Type`    | `application/json`                 |

#### Request Body

| Field     | Type           | Required | Description                                          |
|-----------|----------------|----------|------------------------------------------------------|
| `name`    | `string`       | Yes      | Full name of the lead                                |
| `email`   | `string`       | Yes      | Email address of the lead                            |
| `status`  | `string`       | No       | `New` \| `Contacted` \| `Qualified` \| `Lost` — defaults to `New` |
| `source`  | `string`       | No       | `Website` \| `Instagram` \| `Referral`               |

#### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "64f3a2b3c4d5e6f7a8b9c0d1",
    "name": "Bob Williams",
    "email": "bob@example.com",
    "status": "New",
    "source": "Instagram",
    "createdAt": "2024-01-16T09:00:00.000Z",
    "updatedAt": "2024-01-16T09:00:00.000Z",
    "__v": 0
  }
}
```

#### Error Responses

| Status        | Body                                               |
|---------------|----------------------------------------------------|
| `400`         | Validation error / missing required fields         |
| `401`         | `{ "message": "No token provided / Invalid token" }` |
| `403`         | `{ "message": "Forbidden" }` — insufficient role   |
| `500`         | `{ "message": "Something went wrong!" }`            |

#### Example Request

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Williams",
    "email": "bob@example.com",
    "status": "Contacted",
    "source": "Instagram"
  }'
```

---

### 8. Update Lead

**`PUT /api/leads/:id`**

Partially updates an existing lead by ID. Requires `admin` or `sales_user` role.

#### Request Headers

| Header            | Value                              |
|-------------------|------------------------------------|
| `Authorization`   | `Bearer <JWT_TOKEN>`               |
| `Content-Type`    | `application/json`                 |

#### URL Parameters

| Parameter | Type    | Required | Description            |
|-----------|---------|----------|------------------------|
| `id`      | `string`| Yes      | MongoDB Object ID of the lead |

#### Request Body

All fields are optional. Only include fields you want to update.

| Field     | Type           | Description                                          |
|-----------|----------------|------------------------------------------------------|
| `name`    | `string`       | Updated full name                                    |
| `email`   | `string`       | Updated email address                                |
| `status`  | `string`       | `New` \| `Contacted` \| `Qualified` \| `Lost`         |
| `source`  | `string`       | `Website` \| `Instagram` \| `Referral`               |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "64f2a1b2c3d4e5f6a7b8c9d0",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "status": "Qualified",
    "source": "Referral",
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-16T10:00:00.000Z",
    "__v": 0
  }
}
```

#### Error Responses

| Status        | Body                                               |
|---------------|----------------------------------------------------|
| `400`         | Validation error                                    |
| `401`         | `{ "message": "No token provided / Invalid token" }` |
| `403`         | `{ "message": "Forbidden" }`                        |
| `404`         | `{ "success": false, "message": "Lead not found" }`  |
| `500`         | `{ "message": "Something went wrong!" }`            |

#### Example Request

```bash
curl -X PUT http://localhost:5000/api/leads/64f2a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Qualified",
    "source": "Referral"
  }'
```

---

### 9. Delete Lead

**`DELETE /api/leads/:id`**

Permanently deletes a lead by its ID. This endpoint is restricted to `admin` role only.

#### Request Headers

| Header            | Value                              |
|-------------------|------------------------------------|
| `Authorization`   | `Bearer <JWT_TOKEN>`               |

#### URL Parameters

| Parameter | Type    | Required | Description            |
|-----------|---------|----------|------------------------|
| `id`      | `string`| Yes      | MongoDB Object ID of the lead |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

#### Error Responses

| Status        | Body                                               |
|---------------|----------------------------------------------------|
| `401`         | `{ "message": "No token provided / Invalid token" }` |
| `403`         | `{ "message": "Forbidden" }` — only `admin` can delete |
| `404`         | `{ "success": false, "message": "Lead not found" }`  |
| `500`         | `{ "message": "Something went wrong!" }`            |

#### Example Request

```bash
curl -X DELETE http://localhost:5000/api/leads/64f2a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 10. Export Leads (CSV)

**`GET /api/leads/export/csv`**

Downloads all matching leads as a CSV file. Requires `admin` or `sales_user` role.

#### Request Headers

| Header            | Value                              |
|-------------------|------------------------------------|
| `Authorization`   | `Bearer <JWT_TOKEN>`               |

#### Query Parameters

| Parameter | Type    | Required | Description                                   |
|-----------|---------|----------|-----------------------------------------------|
| `status`  | `string`| No       | Filter by status                              |
| `source`  | `string`| No       | Filter by source                              |
| `search`  | `string`| No       | Case-insensitive search across `name`/`email` |

#### Success Response

**Status:** `200 OK`

- **Content-Type:** `text/csv`
- **Content-Disposition:** `attachment; filename=leads.csv`

```
Name,Email,Status,Source,Created At,Updated At
Alice Johnson,alice@example.com,Qualified,Referral,2024-01-15T08:30:00.000Z,2024-01-16T10:00:00.000Z
Bob Williams,bob@example.com,New,Instagram,2024-01-16T09:00:00.000Z,2024-01-16T09:00:00.000Z
```

> Values containing commas, quotes, or newlines are automatically double-quoted and escaped per RFC 4180.

#### Error Responses

| Status        | Body                                               |
|---------------|----------------------------------------------------|
| `401`         | `{ "message": "No token provided / Invalid token" }` |
| `403`         | `{ "message": "Forbidden" }`                        |
| `500`         | `{ "message": "Something went wrong!" }`            |

#### Example Request

```bash
curl -X GET "http://localhost:5000/api/leads/export/csv?status=New&source=Website" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  --output leads.csv
```

---

## Data Models

### User

```typescript
{
  id: string;          // MongoDB ObjectId
  name: string;
  email: string;
  role: "admin" | "sales_user";
  createdAt: Date;
  updatedAt: Date;
}
```

> The `password` field is hashed with bcrypt (rounds: 12) and **never** returned in API responses.

### Lead

```typescript
{
  id: string;               // MongoDB ObjectId
  name: string;
  email: string;
  status: "New" | "Contacted" | "Qualified" | "Lost";
  source?: "Website" | "Instagram" | "Referral";
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Roles & Permissions Summary

| Action              | `admin` | `sales_user` |
|---------------------|:-------:|:------------:|
| Login / Register    | ✓       | ✓            |
| Get own profile     | ✓       | ✓            |
| Logout              | ✓       | ✓            |
| List leads          | ✓       | ✓            |
| View lead by ID     | ✓       | ✓            |
| Create lead         | ✓       | ✓            |
| Update lead         | ✓       | ✓            |
| Delete lead         | ✓       | ✗            |
| Export leads (CSV)  | ✓       | ✓            |

---

## Authentication

All authenticated endpoints expect a **JWT Bearer token** in the request header:

```
Authorization: Bearer <JWT_TOKEN>
```

The token is generated with the following claims:

| Claim    | Description                          |
|----------|--------------------------------------|
| `userId` | MongoDB ObjectId of the user          |
| `role`   | Role of the user (`admin` / `sales_user`) |

Token expiration is configured via `JWT_EXPIRATION` (default: `7d`) in the server environment.

---

## Error Handling

All errors follow a consistent structure:

```json
{
  "message": "Human-readable error description"
}
```

| Status Code | Meaning                          |
|-------------|----------------------------------|
| `200`       | Success                          |
| `201`       | Resource created                 |
| `400`       | Bad request / invalid input       |
| `401`       | Unauthorized — missing/invalid token |
| `403`       | Forbidden — insufficient role     |
| `404`       | Resource not found               |
| `500`       | Internal server error            |
