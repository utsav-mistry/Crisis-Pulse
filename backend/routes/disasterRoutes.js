const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disasterController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const aiServiceAuth = require('../middleware/aiServiceAuth');
const internalAuth = require('../middleware/internalAuth');

// GET /api/disasters - Get all disasters (authenticated users only)
router.get('/', authMiddleware, disasterController.getDisasters);

// POST /api/disasters/raise - Create disaster alert (AI Service Only)
router.post('/raise', aiServiceAuth, disasterController.createDisaster);

// POST /api/disasters/create-from-ai - Create disaster from AI prediction (Internal Service)
router.post('/create-from-ai', internalAuth, disasterController.createDisasterFromAI);

// GET /api/disasters/:id - Get specific disaster (authenticated users only)
router.get('/:id', authMiddleware, disasterController.getDisasterById);

// PUT /api/disasters/:id - Update disaster (admin only)
router.put('/:id', authMiddleware, authorize('admin', 'crpf'), disasterController.updateDisaster);

// DELETE /api/disasters/:id - Delete disaster (admin only)
router.delete('/:id', authMiddleware, authorize('admin', 'crpf'), disasterController.deleteDisaster);

module.exports = router;
