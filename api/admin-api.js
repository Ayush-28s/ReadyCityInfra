import pool from './db.js';
import jwt from 'jsonwebtoken';

// Middleware to verify JWT
const verifyToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Unauthorized');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key');
    if (decoded.role !== 'admin' && decoded.role !== 'agent') throw new Error('Forbidden');
    return decoded;
};

export default async function handler(req, res) {
    try {
        // Authenticate
        const user = verifyToken(req);

        // GET Request (Fetch Data)
        if (req.method === 'GET') {
            const { type } = req.query;

            if (type === 'stats') {
                const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
                const [properties] = await pool.query('SELECT COUNT(*) as count FROM properties WHERE status="available"');
                const [bookings] = await pool.query('SELECT COUNT(*) as count FROM bookings');
                const [revenue] = await pool.query('SELECT SUM(booking_amount) as total FROM bookings WHERE status="confirmed"');
                const [recentBookings] = await pool.query(`
                    SELECT b.id, u.full_name, p.title, b.booking_date, b.status 
                    FROM bookings b 
                    JOIN users u ON b.user_id = u.id 
                    JOIN properties p ON b.property_id = p.id 
                    ORDER BY b.booking_date DESC LIMIT 5
                `);
                return res.json({
                    stats: {
                        users: users[0].count,
                        properties: properties[0].count,
                        bookings: bookings[0].count,
                        revenue: revenue[0].total || 0,
                    },
                    recentBookings
                });
            }

            if (type === 'properties') {
                const [rows] = await pool.query("SELECT * FROM properties ORDER BY id DESC");
                return res.json(rows);
            }

            if (type === 'users') {
                const [rows] = await pool.query("SELECT id, full_name, email, phone, role, status FROM users ORDER BY id DESC LIMIT 100");
                return res.json(rows);
            }

            if (type === 'bookings') {
                const [rows] = await pool.query(`
                    SELECT b.*, u.full_name as user_name, p.title as property_title 
                    FROM bookings b 
                    JOIN users u ON b.user_id = u.id 
                    JOIN properties p ON b.property_id = p.id
                    ORDER BY b.booking_date DESC
                `);
                return res.json(rows);
            }

            if (type === 'leads') {
                const [rows] = await pool.query(`
                    SELECT l.*, p.title as property_title 
                    FROM leads l 
                    LEFT JOIN properties p ON l.property_id = p.id 
                    ORDER BY l.created_at DESC
                `);
                return res.json(rows);
            }

            return res.status(400).json({ message: 'Invalid type parameter' });
        }

        // POST/PUT/DELETE Actions
        const { action, table, data, id } = req.body;

        if (req.method === 'POST') {
            if (table === 'properties') {
                await pool.query(
                    "INSERT INTO properties (title, type, price, location, area, image_url, description, map_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [data.title, data.type, data.price, data.location, data.area, data.image_url, data.description, data.map_url]
                );
                return res.status(201).json({ message: 'Property created' });
            }
        }

        if (req.method === 'PUT') {
            if (table === 'properties') {
                await pool.query(
                    "UPDATE properties SET title=?, price=?, location=?, status=? WHERE id=?",
                    [data.title, data.price, data.location, data.status, id]
                );
                return res.json({ message: 'Property updated' });
            }
            if (table === 'leads') {
                await pool.query("UPDATE leads SET status=? WHERE id=?", [data.status, id]);
                return res.json({ message: 'Lead status updated' });
            }
        }

        if (req.method === 'DELETE') {
            if (table === 'properties') {
                await pool.query("DELETE FROM properties WHERE id=?", [id]);
                return res.json({ message: 'Property deleted' });
            }
        }

        return res.status(400).json({ message: 'Invalid action' });

    } catch (error) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return res.status(403).json({ message: error.message });
        }
        console.error("API Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
