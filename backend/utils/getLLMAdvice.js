const axios = require('axios');

const getLLMAdvice = async (type, city) => {
    const prompt = `Give 2-3 short safety tips for people in ${city} if a ${type} is about to happen.`;

    try {
        const response = await axios.post('http://localhost:11434/api/chat', {
            model: 'mistral',
            messages: [{ role: 'user', content: prompt }],
            stream: false
        });

        return response.data.message.content.trim();
    } catch (err) {
        console.error('LLM advice error (Ollama/Mistral):', err.message);
        return 'Stay alert and follow official safety instructions from your local authority.';
    }
};

module.exports = getLLMAdvice;
