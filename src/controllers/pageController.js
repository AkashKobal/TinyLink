const { createLink, findByCode } = require("../models/linkModel");
const { CODE_REGEX } = require("../middleware/validateCode");
const { generateCode } = require("../utils/generateCode");

async function handleCreateForm(req, res) {
    const { target_url, code } = req.body;

    if (!target_url) return res.render("new", { error: "Target URL is required" });

    try {
        new URL(target_url);
    } catch {
        return res.render("new", { error: "Invalid URL format" });
    }

    if (code && !CODE_REGEX.test(code)) {
        return res.render("new", { error: "Code must be 6–8 alphanumeric characters" });
    }

    if (code) {
        const exists = await findByCode(code);
        if (exists) return res.render("new", { error: `Code "${code}" already exists` });
    }

    const finalCode = code || generateCode(6);

    await createLink({ code: finalCode, target_url });

    return res.redirect("/");
}

module.exports = { handleCreateForm };
