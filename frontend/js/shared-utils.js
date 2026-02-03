// ============================================
// SHARED UTILITIES MODULE
// Common functions used across all modes
// ============================================

/**
 * Formats prompt based on API provider (Gemini or HuggingFace)
 */
function formatPromptForProvider(systemPrompt, userPrompt, geminiKey, hfKey) {
    let effectiveToken = hfKey;
    let provider = 'huggingface';

    let finalPrompt = '<|system|>' + systemPrompt + '</s>
