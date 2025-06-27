// File: /api/auth.js
// Backend untuk menangani otentikasi dan data pengguna dengan Vercel Postgres & JWT

import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to create the users table if it doesn't exist
async function ensureTableExists() {
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(30) NOT NULL UNIQUE,
            email VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            coins INT NOT NULL DEFAULT 5,
            reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
}

// Main handler for all API requests to this endpoint
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await ensureTableExists();
        const { action, ...payload } = req.body;

        switch (action) {
            case 'register':
                return await handleRegister(req, res, payload);
            case 'login':
                return await handleLogin(req, res, payload);
            case 'get_coins':
            case 'add_coins':
            case 'use_coin':
                return await handleAuthenticatedRoutes(req, res, action, payload);
            default:
                return res.status(400).json({ success: false, message: 'Invalid action' });
        }
    } catch (error) {
        console.error('Global API Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
}

// Handler for user registration
async function handleRegister(req, res, { username, email, password }) {
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Semua field harus diisi.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await sql`
            INSERT INTO users (username, email, password_hash)
            VALUES (${username}, ${email}, ${hashedPassword});
        `;
        return res.status(201).json({ success: true, message: 'Pendaftaran berhasil! Silakan login.' });
    } catch (error) {
        if (error.code === '23505') { // Unique violation error code for Postgres
            return res.status(409).json({ success: false, message: 'Username atau email sudah digunakan.' });
        }
        console.error('Registration Error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mendaftar.' });
    }
}

// Handler for user login
async function handleLogin(req, res, { username, password }) {
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password harus diisi.' });
    }

    try {
        const { rows } = await sql`SELECT * FROM users WHERE username = ${username};`;
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Username tidak ditemukan.' });
        }

        const user = rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Password salah.' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '7d', // Token expires in 7 days
        });

        return res.status(200).json({ success: true, message: 'Login berhasil!', token });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat login.' });
    }
}

// Handler for protected routes that require a token
async function handleAuthenticatedRoutes(req, res, action, payload) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (action === 'get_coins') {
            const { rows } = await sql`SELECT coins FROM users WHERE id = ${userId};`;
            return res.status(200).json({ success: true, coins: rows[0].coins });
        }
        
        if (action === 'add_coins') {
            await sql`UPDATE users SET coins = coins + 5 WHERE id = ${userId};`;
            const { rows } = await sql`SELECT coins FROM users WHERE id = ${userId};`;
            return res.status(200).json({ success: true, message: 'Koin berhasil ditambahkan!', new_coins: rows[0].coins });
        }

        if (action === 'use_coin') {
            const { cost } = payload;
            const { rows } = await sql`SELECT coins FROM users WHERE id = ${userId};`;
            if (rows[0].coins < cost) {
                return res.status(400).json({ success: false, message: 'Koin tidak cukup.' });
            }
            await sql`UPDATE users SET coins = coins - ${cost} WHERE id = ${userId};`;
            return res.status(200).json({ success: true, message: 'Koin digunakan.' });
        }

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: 'Token tidak valid.' });
        }
        console.error('Authenticated Route Error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan internal.' });
    }
}
