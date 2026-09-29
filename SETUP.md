# ⚡ Local Setup & Development Guide — ReadyCity Infra

## 1. System Requirements

Ensure the following runtimes and tools are installed on your workstation:
* **Node.js**: `v18.x` or `v20.x` LTS recommended
* **npm**: `v9.x` or higher
* **Git**: `v2.x` or higher
* **Database Access**: A running instance of **TiDB Cloud (Serverless)** or **MySQL 8.0+**
* *(Optional)* **Vercel CLI**: For emulating serverless micro-endpoints locally (`npm install -g vercel`)

---

## 2. Step-by-Step Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/Prashant453/readycity.git
cd readycity
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` into a local `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your actual TiDB Cloud credentials:
```env
TIDB_HOST=your-cluster-name.region.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_user.root
TIDB_PASS=your_password
TIDB_NAME=readycity_db
JWT_SECRET=your_super_secret_jwt_key
```

---

## 3. Database Initialization

Execute the following DDL script in your TiDB Cloud SQL Editor to set up required tables:

```sql
CREATE DATABASE IF NOT EXISTS readycity_db;
USE readycity_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    location VARCHAR(150) NOT NULL,
    area VARCHAR(50) NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    map_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    booking_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT,
    status VARCHAR(30) DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lead_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);
```

### Optional: Insert Initial Admin User
To generate a bcrypt-hashed admin user, run a quick Node snippet or insert directly:
```sql
-- Creates an admin user: email: admin@readycity.in, phone: 9999999999
INSERT INTO users (full_name, email, phone, password, role, status)
VALUES ('System Admin', 'admin@readycity.in', '9999999999', '$2a$10$wJ2NqXhK9V2yvN5s6Qh8Pe6bV7S8X4N9K1yvN5s6Qh8Pe6bV7S8X4', 'admin', 'active');
```

---

## 4. Compile Styles & Launch Server

### Build Tailwind CSS Styles
```bash
npm run build
```

### Start Development Server
For running locally with full serverless routing simulation:
```bash
# Using Vercel CLI (Recommended for serverless testing)
vercel dev

# OR using standard node runner
npm start
```

Access the application in your browser:
* **Public Portal**: `http://localhost:3000`
* **Admin Login**: `http://localhost:3000/admin.html`
* **Partner Login**: `http://localhost:3000/login.html`

---

## 5. Verification & Testing

### Verify Public Property Feed:
```bash
curl http://localhost:3000/api
```

### Verify Admin Authentication:
```bash
curl -X POST http://localhost:3000/api/admin-auth \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@readycity.in", "password":"YourPassword"}'
```

---

## 6. Troubleshooting & FAQs

### Q: `Error: connect ECONNREFUSED` or `ENOTFOUND`
* Ensure `TIDB_HOST` matches your exact TiDB cluster URL.
* Check whether your public IP is allowed in your TiDB Cloud IP Allowlist (set to `0.0.0.0/0` or add your client IP).

### Q: `SSL handshake failed`
* TiDB Cloud requires TLS 1.2+. Verify that `api/db.js` has `ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }`.

### Q: Changes to Tailwind styles not appearing
* Re-run `npm run build` to compile `./src/input.css` into `./public/styles.css`.
