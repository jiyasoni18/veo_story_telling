// REPLACE YOUR analyzeImage FUNCTION WITH THIS:

async function analyzeImage(type) {
    const geminiKey = document.getElementById('geminiKey').value.trim();
    
    if (!geminiKey) {
        showStatus('Please enter your Google Gemini API key first! Get it free at: aistudio.google.com/app/apikey', 'error');
        toggleApiSettings();
        return;
    }
    
    if (!uploadedImages[type]) {
        showStatus('Please upload an image first!', 'error');
        return;
    }
    
    const analyzeBtn = document.getElementById(`${type}AnalyzeBtn`);
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🔄 Analyzing with Gemini...';
    
    try {
        const response = await fetch('http://localhost:5001/analyze_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gemini_key: geminiKey,
                image: uploadedImages[type]
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Analysis failed');
        }
        
        const description = data.description || 'No description generated';
        
        // Fill description field
        const descField = type === 'primary' ? 'charDescription' : 'secondaryCharDescription';
        document.getElementById(descField).value = description;
        
        showStatus(`✨ Gemini analysis complete! Description added.`, 'success');
        
    } catch (error) {
        console.error('Error:', error);
        
        let errorMsg = error.message;
        
        if (errorMsg.includes('API_KEY_INVALID')) {
            errorMsg = 'Invalid Gemini API key. Please check your key at aistudio.google.com/app/apikey';
        } else if (errorMsg.includes('PERMISSION_DENIED')) {
            errorMsg = 'Gemini API not enabled. Please enable it in Google Cloud Console.';
        } else if (errorMsg.includes('QUOTA_EXCEEDED')) {
            errorMsg = 'Gemini daily quota exceeded. Try again tomorrow or upgrade.';
        }
        
        showStatus(`Error: ${errorMsg}`, 'error');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🤖 Analyze with AI';
    }
}

// ALSO ADD THIS TO YOUR DOMContentLoaded:

window.addEventListener('DOMContentLoaded', () => {
    // Load saved API keys
    const savedHfKey = localStorage.getItem('hf_api_key');
    if (savedHfKey) {
        document.getElementById('apiKey').value = savedHfKey;
    }
    
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    if (savedGeminiKey) {
        document.getElementById('geminiKey').value = savedGeminiKey;
    }
    
    // Save keys when changed
    document.getElementById('apiKey').addEventListener('change', (e) => {
        localStorage.setItem('hf_api_key', e.target.value);
    });
    
    document.getElementById('geminiKey').addEventListener('change', (e) => {
        localStorage.setItem('gemini_api_key', e.target.value);
    });
    
    loadMemory();
});