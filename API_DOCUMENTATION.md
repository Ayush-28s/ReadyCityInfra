# 🔌 API Documentation — ReadyCity Infra

## 1. Overview & Conventions

All backend endpoints in ReadyCity are hosted as **Vercel Serverless Functions** located in the `/api` directory.
* **Base URL (Local)**: `http://localhost:3000`
* **Base URL (Production)**: `https://<your-vercel-domain>.vercel.app`
* **Content-Type**: `application/json`

---

## 2. Authentication & Headers

Endpoints categorized under the Administrative Controller require a valid JSON Web Token (JWT) in the HTTP Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Tokens are signed using `JWT_SECRET` and are valid for **24 hours (`1d`)**. Requests without a token or with an invalid/expired token will receive `403 Forbidden` or `401 Unauthorized`.

---

## 3. Public Endpoints

### 3.1 Fetch Active Properties
Fetches all listed real estate properties where `status = 'available'`.

* **Route**: `GET /api`
* **Auth Required**: No
* **Headers**: `Accept: application/json`
* **Response `200 OK`**:
```json
[
  {
    "id": 1,
    "title": "Green Meadows Phase 1",
    "type": "Plot",
    "price": "2500000.00",
    "location": "Sector 12, Smart City",
    "area": "1500 sq.ft",
    "image_url": "https://example.com/images/plot1.jpg",
    "description": "Prime corner residential plot with 40ft road connectivity.",
    "map_url": "https://maps.google.com/?q=26.8467,80.9462",
    "status": "available",
    "created_at": "2026-02-08T10:00:00.000Z"
  }
]
```

---

### 3.2 Customer & Partner Registration
Registers a new customer/partner account.

* **Route**: `POST /api/signup`
* **Auth Required**: No
* **Request Body**:
```json
{
  "fullName": "Rahul Sharma",
  "phone": "+919876543210",
  "password": "SecurePassword123"
}
```
* **Response `201 Created`**:
```json
{
  "message": "User created successfully"
}
```
* **Error Responses**:
  * `400 Bad Request`: `{ "message": "All fields are required" }`
  * `409 Conflict`: `{ "message": "Phone number already registered" }`

---

### 3.3 Customer & Partner Login
Authenticates an existing user account using phone or full name.

* **Route**: `POST /api/login`
* **Auth Required**: No
* **Request Body**:
```json
{
  "phone": "+919876543210",
  "password": "SecurePassword123"
}
```
* **Response `200 OK`**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 12,
    "name": "Rahul Sharma",
    "phone": "+919876543210"
  }
}
```
* **Error Responses**:
  * `400 Bad Request`: `{ "message": "Missing username or password" }`
  * `401 Unauthorized`: `{ "message": "User not found. Check spelling or Sign Up." }` / `{ "message": "Incorrect password" }`

---

## 4. Administrative Endpoints

### 4.1 Admin Authentication
Authenticates administrators or agents and generates a signed JWT token.

* **Route**: `POST /api/admin-auth`
* **Auth Required**: No
* **Request Body**:
```json
{
  "identifier": "admin@readycity.in",
  "password": "AdminPassword123"
}
```
* **Response `200 OK`**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Prashant Singh",
    "role": "admin"
  }
}
```
* **Error Responses**:
  * `400 Bad Request`: `{ "message": "Credentials required" }`
  * `401 Unauthorized`: `{ "message": "Invalid admin credentials" }`

---

### 4.2 Dashboard Aggregated Stats
Retrieves operational metrics and the 5 most recent property bookings.

* **Route**: `GET /api/admin-api?type=stats`
* **Auth Required**: Yes (`Bearer <JWT>`)
* **Response `200 OK`**:
```json
{
  "stats": {
    "users": 142,
    "properties": 18,
    "bookings": 35,
    "revenue": 4500000
  },
  "recentBookings": [
    {
      "id": 7,
      "full_name": "Aman Verma",
      "title": "Royal Residency Block B",
      "booking_date": "2026-02-15T14:30:00.000Z",
      "status": "confirmed"
    }
  ]
}
```

---

### 4.3 List All Properties (Admin)
Retrieves all properties across all availability states.

* **Route**: `GET /api/admin-api?type=properties`
* **Auth Required**: Yes (`Bearer <JWT>`)
* **Response `200 OK`**: Array of property records.

---

### 4.4 List Registered Users
Retrieves up to 100 recent users.

* **Route**: `GET /api/admin-api?type=users`
* **Auth Required**: Yes (`Bearer <JWT>`)
* **Response `200 OK`**:
```json
[
  {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "status": "active"
  }
]
```

---

### 4.5 List All Bookings
Retrieves all customer bookings with joined user name and property title.

* **Route**: `GET /api/admin-api?type=bookings`
* **Auth Required**: Yes (`Bearer <JWT>`)
* **Response `200 OK`**:
```json
[
  {
    "id": 3,
    "user_id": 4,
    "property_id": 2,
    "booking_date": "2026-02-10T12:00:00.000Z",
    "booking_amount": "500000.00",
    "status": "confirmed",
    "user_name": "Vikas Singh",
    "property_title": "Highway Commercial Hub"
  }
]
```

---

### 4.6 List Leads Pipeline
Retrieves captured prospect inquiries with referenced property names.

* **Route**: `GET /api/admin-api?type=leads`
* **Auth Required**: Yes (`Bearer <JWT>`)
* **Response `200 OK`**: Array of lead records.

---

### 4.7 Create Property Listing
Creates a new property record in the database.

* **Route**: `POST /api/admin-api`
* **Auth Required**: Yes (`Bearer <JWT>`)
* **Request Body**:
```json
{
  "action": "create",
  "table": "properties",
  "data": {
    "title": "Palm Heights Villa 4",
    "type": "Residential",
    "price": 4500000,
    "location": "North Corridor, Highway 24",
    "area": "2400 sq.ft",
    "image_url": "https://example.com/images/villa.jpg",
    "description": "Luxury 3BHK villa with private lawn.",
    "map_url": "https://maps.google.com/?q=26.85,80.95"
  }
}
```
* **Response `201 Created`**:
```json
{
  "message": "Property created"
}
```

---

### 4.8 Update Property / Lead
Updates the metadata of a property or status of a lead.

* **Route**: `PUT /api/admin-api`
* **Auth Required**: Yes (`Bearer <JWT>`)
* **Request Body (Property Update)**:
```json
{
  "action": "update",
  "table": "properties",
  "id": 5,
  "data": {
    "title": "Palm Heights Villa 4 (Updated)",
    "price": 4300000,
    "location": "North Corridor, Highway 24",
    "status": "sold"
  }
}
```
* **Request Body (Lead Status Update)**:
```json
{
  "action": "update",
  "table": "leads",
  "id": 12,
  "data": {
    "status": "contacted"
  }
}
```
* **Response `200 OK`**: `{ "message": "Property updated" }` or `{ "message": "Lead status updated" }`

---

### 4.9 Delete Property Listing
Deletes a property listing by ID.

* **Route**: `DELETE /api/admin-api`
* **Auth Required**: Yes (`Bearer <JWT>`)
* **Request Body**:
```json
{
  "action": "delete",
  "table": "properties",
  "id": 5
}
```
* **Response `200 OK`**:
```json
{
  "message": "Property deleted"
}
```

---

## 5. Summary of HTTP Status Codes

| Code | Meaning | Context |
| :--- | :--- | :--- |
| `200 OK` | Success | Standard response for successful GET, PUT, DELETE operations |
| `201 Created` | Resource Created | Successful user registration or property creation |
| `400 Bad Request` | Invalid Input | Missing required fields or invalid query parameters |
| `401 Unauthorized` | Authentication Failed | Invalid credentials during login |
| `403 Forbidden` | Access Denied | Missing/invalid JWT token or unauthorized role |
| `405 Method Not Allowed` | Invalid HTTP Method | Non-permitted HTTP verb dispatched |
| `409 Conflict` | Unique Constraint Collision | Phone number already registered |
| `500 Server Error` | Database/Internal Failure | Connection timeout or unhandled exception |
