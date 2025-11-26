// Middleware to validate custom code in body (if provided)
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

function validateCodeMiddleware(req, res, next) {
    const { code } = req.body || {};
    if (!code) return next();
    if (typeof code !== 'string' || !CODE_REGEX.test(code)) {
        return res.status(400).json({ error: 'Invalid code. Must match [A-Za-z0-9]{6,8}.' });
    }
    next();
}

module.exports = { validateCodeMiddleware, CODE_REGEX };
