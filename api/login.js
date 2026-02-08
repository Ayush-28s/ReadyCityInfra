import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    // 1. Log what the Frontend sent us
    console.log("------------------------------------------------");
    console.log("LOGIN ATTEMPT RECEIVED");
    console.log("Body:", req.body);

    const { phone, password } = req.body; // 'phone' here holds the User ID input

    if (!phone || !password) {
        console.log("Error: Missing fields");
        return res.status(400).json({ message: 'Missing username or password' });
    }

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASS,
            database: process.env.TIDB_NAME,
            port: 4000,
            ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
        });

        // 2. Search for the user (By Phone OR Full Name)
        console.log(`Searching DB for: '${phone}'`);
        
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE phone = ? OR full_name = ?', 
            [phone, phone]
        );

        console.log(`Database found ${rows.length} matching users.`);

        // 3. Check if user exists
        if (rows.length === 0) {
            console.log("FAIL: User not found in database.");
            return res.status(401).json({ message: 'User not found. Check spelling or Sign Up.' });
        }

        const user = rows[0];
        console.log("User found:", user.full_name);
        console.log("Stored Password:", user.password);
        console.log("Input Password:", password);

        // 4. Check Password (Case sensitive)
        // Note: Using trim() to ignore accidental spaces
        if (String(user.password).trim() !== String(password).trim()) {
            console.log("FAIL: Password mismatch.");
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // 5. Success
        console.log("SUCCESS: Login Authorized.");
        res.status(200).json({ 
            message: 'Login successful', 
            user: { id: user.id, name: user.full_name, phone: user.phone } 
        });

    } catch (error) {
        console.error("CRITICAL DATABASE ERROR:", error);
        res.status(500).json({ message: 'Server connection failed', details: error.message });
    } finally {
        if (connection) await connection.end();
    }
}