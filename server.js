const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const apiRoutes = require("./src/routes/apiRoutes");
const pageRoutes = require("./src/routes/pageRoutes");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Page (HTML) routes
app.use("/", pageRoutes);

// API JSON routes
app.use("/api/links", apiRoutes);

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Redirect short code
const { findByCode, incrementClick } = require("./src/models/linkModel");
const { CODE_REGEX } = require("./src/middleware/validateCode");

app.get("/:code", async (req, res) => {
    const { code } = req.params;

    if (!CODE_REGEX.test(code)) return res.status(404).render("notfound", {
        title: "Not Found",
        message: "Invalid short code format."
    });

    const row = await findByCode(code);
    if (!row) return res.status(404).render("notfound", { title: "Not Found", message: "Short URL not found." });

    await incrementClick(code);
    return res.redirect(row.target_url);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`TinyLink running on port ${PORT}`));
