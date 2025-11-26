const { pool } = require('../config/db');

/**
 * DB contract:
 * links (
 *   id uuid primary key default gen_random_uuid(),
 *   code varchar unique not null,
 *   target_url text not null,
 *   click_count integer default 0,
 *   last_clicked timestamptz,
 *   created_at timestamptz default now()
 * )
 */

async function createLink({ code, target_url }) {
    const sql = `
    INSERT INTO links (code, target_url)
    VALUES ($1, $2)
    RETURNING id, code, target_url, click_count, last_clicked, created_at
  `;
    const values = [code, target_url];
    const { rows } = await pool.query(sql, values);
    return rows[0];
}

async function findByCode(code) {
    const { rows } = await pool.query(
        `SELECT id, code, target_url, click_count, last_clicked, created_at FROM links WHERE code = $1`,
        [code]
    );
    return rows[0] || null;
}

async function listLinks() {
    const { rows } = await pool.query(
        `SELECT id, code, target_url, click_count, last_clicked, created_at FROM links ORDER BY created_at DESC`
    );
    return rows;
}

async function deleteByCode(code) {
    const { rowCount } = await pool.query(`DELETE FROM links WHERE code = $1`, [code]);
    return rowCount > 0;
}

async function incrementClick(code) {
    const sql = `
    UPDATE links
    SET click_count = click_count + 1,
        last_clicked = now()
    WHERE code = $1
    RETURNING click_count, last_clicked
  `;
    const { rows } = await pool.query(sql, [code]);
    return rows[0] || null;
}

module.exports = {
    createLink,
    findByCode,
    listLinks,
    deleteByCode,
    incrementClick
};
