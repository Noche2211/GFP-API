const db = require('../config/database');

const allowedResources = new Set(['movements', 'budgets', 'goals']);

function assertResource(resource) {
    if (!allowedResources.has(resource)) throw new Error('Recurso no permitido.');
}

exports.list = (req, res) => {
    try {
        assertResource(req.params.resource);
        const rows = db.prepare('SELECT id, data FROM app_data WHERE resource = ? AND user_id = ? ORDER BY updated_at DESC').all(req.params.resource, req.params.userId);
        res.json(rows.map(row => ({ ...JSON.parse(row.data), id: row.id })));
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.save = (req, res) => {
    try {
        const resource = req.params.resource;
        assertResource(resource);
        const { userId, id, ...data } = req.body;
        if (!userId || !id) return res.status(400).json({ message: 'Faltan usuario o identificador.' });
        const serialized = JSON.stringify(data);
        const existing = db.prepare('SELECT id FROM app_data WHERE id = ? AND resource = ? AND user_id = ?').get(id, resource, userId);
        if (existing) {
            db.prepare('UPDATE app_data SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND resource = ? AND user_id = ?').run(serialized, id, resource, userId);
        } else {
            db.prepare('INSERT INTO app_data (id, resource, user_id, data) VALUES (?, ?, ?, ?)').run(id, resource, userId, serialized);
        }
        res.status(existing ? 200 : 201).json({ id, ...data });
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.remove = (req, res) => {
    try {
        assertResource(req.params.resource);
        const userId = (req.body || {}).userId || req.query.userId;
        const result = db.prepare('DELETE FROM app_data WHERE id = ? AND resource = ? AND user_id = ?').run(req.params.id, req.params.resource, userId);
        if (!result.changes) return res.status(404).json({ message: 'Registro no encontrado.' });
        res.json({ message: 'Registro eliminado.' });
    } catch (error) { res.status(400).json({ message: error.message }); }
};
