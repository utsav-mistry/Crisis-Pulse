// Placeholder for AI advice (swap for OpenAI or other LLM as needed)
module.exports = async function getLLMAdvice(type, city, severity = 'medium') {
    let advice = `For a ${severity} ${type} in ${city}, stay alert and follow official instructions.`;
    if (type === 'flood') advice += ' Move to higher ground if necessary.';
    if (type === 'drought') advice += ' Conserve water and stay hydrated.';
    if (type === 'earthquake') advice += ' Drop, cover, and hold on until the shaking stops.';
    return advice;
};
