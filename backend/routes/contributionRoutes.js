const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/contributions - Create contribution
router.post('/', authMiddleware, contributionController.createContribution);

// POST /api/contribute - Submit contribution (matching README spec)
router.post('/contribute', authMiddleware, contributionController.createContribution);

// GET /api/contributions/user/:userId - User contributions (matching README spec)
router.get('/user/:userId', contributionController.getUserContributions);

// GET /api/contributions - Get all contributions
router.get('/', contributionController.getContributions);

// GET /api/contributions/:id - Get specific contribution
router.get('/:id', contributionController.getContributionById);

// PUT /api/contributions/:id - Update contribution
router.put('/:id', authMiddleware, contributionController.updateContribution);

// DELETE /api/contributions/:id - Delete contribution
router.delete('/:id', authMiddleware, contributionController.deleteContribution);

module.exports = router;
