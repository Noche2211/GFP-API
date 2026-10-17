const db = require("../config/database");

const MAX_AMOUNT = 22000000000.22;

exports.createMovement = (req, res) => {
	try {
		const { userId, type, amount, date, category, description } = req.body;
		if (!userId || !["income", "expense"].includes(type) || !amount || !date || !category) {
			return res.status(400).json({ message: "Faltan datos obligatorios del movimiento." });
		}
		if (Number(amount) > MAX_AMOUNT) {
			return res.status(400).json({ message: `El monto no puede ser mayor a ${MAX_AMOUNT.toFixed(2)}.` });
		}
		const info = db.prepare(`INSERT INTO movements (user_id, type, amount, date, category, description) VALUES (?, ?, ?, ?, ?, ?)`).run(userId, type, amount, date, category, description || null);
		res.status(201).json({ id: info.lastInsertRowid, type, amount, date, category, description });
	} catch (error) { res.status(400).json({ message: error.message }); }
};

exports.getMovements = (req, res) => {
	try {
		res.json(db.prepare(`SELECT id, type, amount, date, category, description, created_at FROM movements WHERE user_id = ? ORDER BY date DESC, id DESC`).all(req.params.userId));
	} catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateMovement = (req, res) => {
	try {
		const { userId, type, amount, date, category, description } = req.body;
		if (Number(amount) > MAX_AMOUNT) {
			return res.status(400).json({ message: `El monto no puede ser mayor a ${MAX_AMOUNT.toFixed(2)}.` });
		}
		const result = db.prepare(`UPDATE movements SET type = ?, amount = ?, date = ?, category = ?, description = ? WHERE id = ? AND user_id = ?`).run(type, amount, date, category, description || null, req.params.id, userId);
		if (!result.changes) return res.status(404).json({ message: "Movimiento no encontrado." });
		res.json({ message: "Movimiento actualizado correctamente." });
	} catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteMovement = (req, res) => {
	try {
		const result = db.prepare(`DELETE FROM movements WHERE id = ? AND user_id = ?`).run(req.params.id, req.body.userId);
		if (!result.changes) return res.status(404).json({ message: "Movimiento no encontrado." });
		res.json({ message: "Movimiento eliminado correctamente." });
	} catch (error) { res.status(400).json({ message: error.message }); }
};
