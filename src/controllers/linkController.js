const { createLink, findByCode, listLinks, deleteByCode, incrementClick } = require('../models/linkModel');
const { generateCode } = require('../utils/generateCode');
const { CODE_REGEX } = require('../middleware/validateCode');

/**
 * POST /api/links
 * body: { target_url: string, code?: string }
 */
async function createHandler(req, res, next) {
    try {
        const { target_url, code: customCode } = req.body || {};
        if (!target_url || typeof target_url !== 'string') {
            return res.status(400).json({ error: 'target_url is required and must be a string' });
        }

        // Basic URL validation
        try {
            new URL(target_url);
        } catch {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        let code = customCode;
        if (code) {
            if (!CODE_REGEX.test(code)) {
                return res.status(400).json({ error: 'Invalid code. Must match [A-Za-z0-9]{6,8}.' });
            }
            const existing = await findByCode(code);
            if (existing) return res.status(409).json({ error: 'Code already exists' });
        } else {
            // generate until unique (small loop)
            let attempts = 0;
            do {
                code = generateCode(6);
                const existing = await findByCode(code);
                if (!existing) break;
                attempts++;
                if (attempts > 5) code = generateCode(7);
            } while (attempts < 10);
        }

        const created = await createLink({ code, target_url });
        return res.status(201).json(created);
    } catch (err) {
        next(err);
    }
}

async function listHandler(req, res, next) {
    try {
        const rows = await listLinks();
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

async function statsHandler(req, res, next) {
    try {
        const { code } = req.params;
        const row = await findByCode(code);
        if (!row) return res.status(404).json({ error: 'Code not found' });
        res.json(row);
    } catch (err) {
        next(err);
    }
}

async function deleteHandler(req, res, next) {
    try {
        const { code } = req.params;
        const existed = await deleteByCode(code);
        if (!existed) return res.status(404).json({ error: 'Code not found' });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

/**
 * Redirect handler for GET /:code
 * Performs 302 redirect and increments click_count + last_clicked
 */
async function redirectHandler(req, res, next) {
    try {
        const { code } = req.params;
        if (!code || !CODE_REGEX.test(code)) {
            return res.status(404).send('Not found');
        }
        const row = await findByCode(code);
        if (!row) return res.status(404).send('Not found');
        // increment (best-effort)
        await incrementClick(code);
        // redirect
        return res.redirect(302, row.target_url);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createHandler,
    listHandler,
    statsHandler,
    deleteHandler,
    redirectHandler
};
