const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disasterController');
const { authMiddleware } = require('../middleware/authMiddleware');

// GET /api/disasters - Get all disasters
router.get('/', disasterController.getDisasters);

// POST /api/disasters - Create disaster (matching test expectations)
router.post('/', authMiddleware, disasterController.createDisaster);

// POST /api/disasters/raise - Create disaster alert (matching README spec)
router.post('/raise', authMiddleware, disasterController.createDisaster);

// GET /api/disasters/:id - Get specific disaster
router.get('/:id', disasterController.getDisasterById);

// PUT /api/disasters/:id - Update disaster (admin only)
router.put('/:id', authMiddleware, disasterController.updateDisaster);

// DELETE /api/disasters/:id - Delete disaster (admin only)
router.delete('/:id', authMiddleware, disasterController.deleteDisaster);

module.exports = router;
