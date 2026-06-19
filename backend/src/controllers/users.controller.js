/**
 * users.controller.js
 * CRUD de usuarios (Versión Nativa)
 */
const db = require("../config/database");
const bcrypt = require("bcryptjs");

exports.createUser = (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        const stmt = db.prepare(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`);
        const info = stmt.run(name, email, hashedPassword);
        
        res.status(201).json({ message: "Usuario creado correctamente", id: info.lastInsertRowid });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginUser = (req, res) => {
    try {
        const { email, password } = req.body;
        const stmt = db.prepare(`SELECT id, name, email, password FROM users WHERE email = ?`);
        const user = stmt.get(email);

        if (!user) {
            return res.status(400).json({ message: "Usuario o contraseña inválidos" });
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Usuario o contraseña inválidos" });
        }

        res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUsers = (req, res) => {
    try {
        const stmt = db.prepare(`SELECT id, name, email, created_at FROM users`);
        const rows = stmt.all();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const updates = [];
        const params = [];

        if (name !== undefined && email !== undefined) {
            updates.push("name = ?", "email = ?");
            params.push(name, email);
        } else if (name !== undefined) {
            updates.push("name = ?");
            params.push(name);
        } else if (email !== undefined) {
            updates.push("email = ?");
            params.push(email);
        }

        if (password) {
            const hashedPassword = bcrypt.hashSync(password, 10);
            updates.push("password = ?");
            params.push(hashedPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No se enviaron campos válidos para actualizar." });
        }

        params.push(id);
        const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
        stmt.run(...params);

        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteUser = (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare(`DELETE FROM users WHERE id = ?`);
        stmt.run(id);
        
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};