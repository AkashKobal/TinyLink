// Simple deterministic random generator using shortid to produce 6-8 alphanumeric codes
const shortid = require('shortid');

/**
 * generateCode(length = 6)
 * returns a code matching [A-Za-z0-9]{6,8}
 */
function generateCode(length = 6) {
    const raw = shortid.generate().replace(/[^A-Za-z0-9]/g, '');
    return (raw + shortid.generate()).slice(0, Math.max(6, Math.min(length, 8)));
}

module.exports = { generateCode };
