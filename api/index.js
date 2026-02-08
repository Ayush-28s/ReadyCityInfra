import mysql from 'mysql2/promise';

// Create the pool OUTSIDE the handler (best practice for Vercel)
const pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASS,
    database: process.env.TIDB_NAME,
    port: process.env.TIDB_PORT || 4000, // Changed to 4000
    ssl: { 
        minVersion: 'TLSv1.2', 
        rejectUnauthorized: true 
    },
    waitForConnections: true,
    connectionLimit: 1, // Lower this for Serverless (Vercel spins up many instances)
    maxIdle: 1, 
    idleTimeout: 60000,
    queueLimit: 0
});

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const [rows] = await pool.query("SELECT * FROM properties WHERE status = 'available' ORDER BY id DESC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Database Error:", error); // This logs to Vercel Logs
        res.status(500).json({ error: error.message });
    }
}