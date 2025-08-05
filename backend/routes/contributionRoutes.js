const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');

router.post('/', contributionController.createContribution);
router.get('/', contributionController.getContributions);
router.get('/:id', contributionController.getContributionById);
router.put('/:id', contributionController.updateContribution);
router.delete('/:id', contributionController.deleteContribution);

module.exports = router;
