import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { fullName, phone, password } = req.body;

    if (!fullName || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    let connection;
    try {
        // 2. Connect to TiDB
        connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASS,
            database: process.env.TIDB_NAME,
            port: 4000,
            ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
        });

        // 3. Check if user already exists
        const [existing] = await connection.execute('SELECT * FROM users WHERE phone = ?', [phone]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Phone number already registered' });
        }

        // 4. Insert New User
        // Note: In a real production app, you should HASH the password using 'bcrypt' before saving.
        await connection.execute(
            'INSERT INTO users (full_name, phone, password) VALUES (?, ?, ?)',
            [fullName, phone, password]
        );

        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
}