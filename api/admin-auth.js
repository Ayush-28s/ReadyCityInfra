import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Credentials required' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE (email = ? OR phone = ?) AND role = ?', [identifier, identifier, 'admin']);

        if (users.length === 0) {
            // Check if it's the specific hardcoded admin fallback (if DB is empty or separate)
            // But for now, just return fail
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const secret = process.env.JWT_SECRET || 'dev_secret_key';
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.full_name },
            secret,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { name: user.full_name, role: user.role }
        });

    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
