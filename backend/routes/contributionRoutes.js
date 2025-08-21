const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// POST /api/contributions - Create contribution (users and volunteers only)
router.post('/', authMiddleware, authorize('user', 'volunteer'), contributionController.createContribution);

// POST /api/contribute - Submit contribution (users and volunteers only, matching README spec)
router.post('/contribute', authMiddleware, authorize('user', 'volunteer'), contributionController.createContribution);

// GET /api/contributions/user/:userId - User contributions (matching README spec)
router.get('/user/:userId', contributionController.getUserContributions);

// GET /api/contributions - Get all contributions
router.get('/', authMiddleware, authorize('admin', 'crpf'), contributionController.getContributions);

// GET /api/contributions/:id - Get specific contribution
router.get('/:id', authMiddleware, authorize('admin', 'crpf'), contributionController.getContributionById);

// PUT /api/contributions/:id - Update contribution (owner or admin only)
router.put('/:id', authMiddleware, contributionController.updateContribution);

// DELETE /api/contributions/:id - Delete contribution (owner or admin only)
router.delete('/:id', authMiddleware, contributionController.deleteContribution);

module.exports = router;
