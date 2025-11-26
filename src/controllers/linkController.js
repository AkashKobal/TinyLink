const {
    createLink,
    findByCode,
    listLinks,
    deleteByCode,
    incrementClick
} = require("../models/linkModel");

const { generateCode } = require("../utils/generateCode");
const { CODE_REGEX } = require("../middleware/validateCode");
const logger = require("../utils/logger");

/**
 * POST /api/links
 */
async function createHandler(req, res) {
    logger.log("CREATE API REQUEST:", req.body);

    const { target_url, code: customCode } = req.body;

    if (!target_url) return res.status(400).json({ status: 400, message: "Target URL is required" });

    try {
        new URL(target_url);
    } catch {
        return res.status(400).json({ status: 400, message: "Invalid URL format" });
    }

    let code = customCode;

    if (code) {
        if (!CODE_REGEX.test(code)) {
            return res.status(400).json({ status: 400, message: "Code must be 6–8 alphanumeric characters" });
        }

        const exists = await findByCode(code);
        if (exists) return res.status(409).json({
            status: 409,
            message: `Code "${code}" already exists`
        });
    } else {
        let attempts = 0;
        do {
            code = generateCode(6);
            const exists = await findByCode(code);
            if (!exists) break;
            attempts++;
        } while (attempts < 5);
    }

    const created = await createLink({ code, target_url });

    return res.status(201).json({
        status: 201,
        message: "Link created",
        data: created
    });
}

/**
 * GET /api/links
 */
async function listHandler(req, res) {
    const links = await listLinks();
    res.json({ status: 200, data: links });
}

/**
 * GET /api/links/:code
 */
async function statsHandler(req, res) {
    const { code } = req.params;

    if (!CODE_REGEX.test(code)) return res.status(400).json({ status: 400, message: "Invalid code" });

    const link = await findByCode(code);

    if (!link) return res.status(404).json({ status: 404, message: "Not found" });

    return res.json({ status: 200, data: link });
}

/**
 * DELETE /api/links/:code
 */
async function deleteHandler(req, res) {
    const { code } = req.params;

    if (!CODE_REGEX.test(code)) return res.status(400).json({ status: 400, message: "Invalid code" });

    const deleted = await deleteByCode(code);

    if (!deleted) return res.status(404).json({ status: 404, message: "Code not found" });

    return res.json({ status: 200, message: "Deleted" });
}

module.exports = {
    createHandler,
    listHandler,
    statsHandler,
    deleteHandler
};
