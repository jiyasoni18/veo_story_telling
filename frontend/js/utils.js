// ============================================
// SHARED UTILITIES MODULE
// Common functions used across all modes
// ============================================

/**
 * Formats prompt based on API provider (Gemini or HuggingFace)
 * @param {string} systemPrompt - The system instruction
 * @param {string} userPrompt - The user request
 * @param {string} geminiKey - Gemini API key
 * @param {string} hfKey - HuggingFace API token
 * @returns {Object} {finalPrompt, token, provider}
 */
function formatPromptForProvider(systemPrompt, userPrompt, geminiKey, hfKey) {
    let effectiveToken = hfKey;
    let provider = 'huggingface';
    let finalPrompt = `<|system|>${systemPrompt}</s>
