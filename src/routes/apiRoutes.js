const express = require("express");
const router = express.Router();
const {
    createHandler,
    listHandler,
    statsHandler,
    deleteHandler
} = require("../controllers/linkController");

const { validateCodeMiddleware } = require("../middleware/validateCode");

// JSON API
router.post("/", validateCodeMiddleware, createHandler);
router.get("/", listHandler);
router.get("/:code", statsHandler);
router.delete("/:code", deleteHandler);     // Postman only

module.exports = router;
