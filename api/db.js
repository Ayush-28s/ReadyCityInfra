import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASS,
    database: process.env.TIDB_NAME || 'test',
    port: process.env.TIDB_PORT ? parseInt(process.env.TIDB_PORT) : 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 5, // Lower limit for serverless
    maxIdle: 5,
    idleTimeout: 60000,
    queueLimit: 0
});

export default pool;
