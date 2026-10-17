const db = require('../config/database');

const MAX_AMOUNT = 22000000000.22;
const AMOUNT_FIELDS = ['amount', 'monto', 'montoObjetivo', 'montoAhorrado'];

function assertAmountsWithinLimit(data) {
    for (const field of AMOUNT_FIELDS) {
        if (data[field] === undefined || data[field] === null || data[field] === '') continue;
        const value = Number(data[field]);
        if (!Number.isNaN(value) && value > MAX_AMOUNT) {
            throw new Error(`El monto no puede ser mayor a ${MAX_AMOUNT.toFixed(2)}.`);
        }
    }
}

function createController(table) {
    return {
        list(req, res) {
            try {
                const rows = db.prepare(`SELECT id, data FROM ${table} WHERE user_id = ? ORDER BY updated_at DESC`).all(req.params.userId);
                res.json(rows.map(row => ({ ...JSON.parse(row.data), id: row.id })));
            } catch (error) { res.status(500).json({ message: error.message }); }
        },
        save(req, res) {
            try {
                const { userId, ...data } = req.body;
                if (!userId || !data.id) return res.status(400).json({ message: 'Faltan el usuario o el identificador.' });
                assertAmountsWithinLimit(data);
                const serialized = JSON.stringify(data);
                const existing = db.prepare(`SELECT id FROM ${table} WHERE id = ? AND user_id = ?`).get(data.id, userId);
                if (existing) db.prepare(`UPDATE ${table} SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`).run(serialized, data.id, userId);
                else db.prepare(`INSERT INTO ${table} (id, user_id, data) VALUES (?, ?, ?)`).run(data.id, userId, serialized);
                res.status(existing ? 200 : 201).json(data);
            } catch (error) { res.status(400).json({ message: error.message }); }
        },
        remove(req, res) {
            try {
                const userId = req.body.userId || req.query.userId;
                const result = db.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).run(req.params.id, userId);
                if (!result.changes) return res.status(404).json({ message: 'Registro no encontrado.' });
                res.json({ message: 'Registro eliminado correctamente.' });
            } catch (error) { res.status(400).json({ message: error.message }); }
        }
    };
}

module.exports = createController;
