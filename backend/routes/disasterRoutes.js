const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disasterController');
const predictDisaster = require('../utils/disasterPrediction');

// Prediction endpoint
router.post('/predict', (req, res) => {
    const { state, month } = req.body;
    if (!state || !month) return res.status(400).json({ message: 'State and month are required.' });
    const prediction = predictDisaster(state, Number(month));
    res.json(prediction);
});

router.post('/', disasterController.createDisaster);
router.get('/', disasterController.getDisasters);
router.get('/:id', disasterController.getDisasterById);
router.put('/:id', disasterController.updateDisaster);
router.delete('/:id', disasterController.deleteDisaster);

module.exports = router;
