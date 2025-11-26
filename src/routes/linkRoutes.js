const express = require('express');
const {
    createHandler,
    listHandler,
    statsHandler,
    deleteHandler
} = require('../controllers/linkController');
const { validateCodeMiddleware } = require('../middleware/validateCode');

const router = express.Router();

router.post('/', validateCodeMiddleware, createHandler);
router.get('/', listHandler);
router.get('/:code', statsHandler);
router.delete('/:code', deleteHandler);

module.exports = router;
