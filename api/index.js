const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create Connection Pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    database: 'test',
    port: process.env.DB_PORT || 4000,
    ssl: { rejectUnauthorized: true }, // Required for TiDB
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// TEST ROUTE - Prints DB Connection Details (Safely)
app.get('/api/properties', (req, res) => {
    const sql = "SELECT * FROM properties ORDER BY id DESC"; 
    
    db.query(sql, (err, result) => {
        if (err) {
            // IF ERROR: Send the exact error message to the browser
            console.error("Database Error:", err);
            return res.status(500).json({ 
                status: "Error",
                message: err.message, 
                code: err.code,
                host: process.env.DB_HOST // Verify if Host is being read
            });
        }
        // IF SUCCESS: Send data
        res.json(result);
    });
});

module.exports = app;