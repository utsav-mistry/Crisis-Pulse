// Sample dataset (replace with real data or DB queries in production)
const sampleDisasters = [
    { type: 'flood', state: 'Assam', month: 7, count: 15 },
    { type: 'flood', state: 'Bihar', month: 8, count: 10 },
    { type: 'drought', state: 'Maharashtra', month: 5, count: 8 },
    { type: 'cyclone', state: 'Odisha', month: 10, count: 12 },
    { type: 'earthquake', state: 'Sikkim', month: 4, count: 3 },
    // ... add more as needed
];

/**
 * Predicts the most likely disaster for a given state and month.
 * @param {string} state
 * @param {number} month (1-12)
 * @returns {object} { type, likelihood, explanation }
 */
module.exports = function predictDisaster(state, month) {
    // Filter for the state and month
    const filtered = sampleDisasters.filter(d => d.state.toLowerCase() === state.toLowerCase() && d.month === month);
    if (filtered.length === 0) {
        return { type: null, likelihood: 'low', explanation: 'No significant historical disasters found for this state and month.' };
    }
    // Find the disaster type with the highest count
    const likely = filtered.reduce((a, b) => (a.count > b.count ? a : b));
    return {
        type: likely.type,
        likelihood: likely.count > 10 ? 'high' : 'medium',
        explanation: `Historically, ${likely.type}s are most common in ${state} during month ${month}. (${likely.count} events)`
    };
}; 