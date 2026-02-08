import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASS,
            database: process.env.TIDB_NAME || process.env.TIDB_NAME,
            port: 4000,
            ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
        });

        // 1. Get Counts (For Top Cards)
        const [propCount] = await connection.execute('SELECT COUNT(*) as count FROM properties');
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        
        // 2. Get Recent Properties (For Table)
        const [recentProperties] = await connection.execute('SELECT id, title, price, location FROM properties ORDER BY id DESC LIMIT 5');
        
        // 3. Get Recent Users/Leads (For List)
        const [recentUsers] = await connection.execute('SELECT id, full_name, phone FROM users ORDER BY id DESC LIMIT 5');

        res.status(200).json({
            stats: {
                properties: propCount[0].count,
                users: userCount[0].count,
                revenue: "4.2 Cr" // Hardcoded for now until you have a payments table
            },
            properties: recentProperties,
            users: recentUsers
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    } finally {
        if (connection) await connection.end();
    }
}