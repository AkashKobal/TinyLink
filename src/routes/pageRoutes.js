const express = require("express");
const router = express.Router();
const { listLinks, findByCode, deleteByCode } = require("../models/linkModel");
const { handleCreateForm } = require("../controllers/pageController");
const { CODE_REGEX } = require("../middleware/validateCode");

// Dashboard
router.get("/", async (req, res) => {
    const links = await listLinks();
    res.render("index", { links, error: req.query.error || null });
});

// Add new link
router.get("/new", (req, res) => res.render("new", { error: null }));
router.post("/new", handleCreateForm);

// Stats page
router.get("/code/:code", async (req, res) => {
    const link = await findByCode(req.params.code);
    if (!link)
        return res.render("stats", { error: "Link not found", link: null, shortUrl: null });

    const shortUrl = `${req.protocol}://${req.get("host")}/${link.code}`;

    res.render("stats", { error: null, link, shortUrl });
});

// Delete for HTML
router.post("/delete/:code", async (req, res) => {
    const { code } = req.params;

    if (!CODE_REGEX.test(code)) return res.redirect("/?error=Invalid+code");

    const deleted = await deleteByCode(code);
    if (!deleted) return res.redirect("/?error=Code+not+found");

    return res.redirect("/");
});


module.exports = router;
