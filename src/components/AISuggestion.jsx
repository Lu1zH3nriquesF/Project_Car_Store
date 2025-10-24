// src/components/AISuggestion.jsx
import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

// Estado inicial do prompt de pesquisa
const initialSearchState = {
    preferences: '',
};

function AISuggestion() {
    const [searchData, setSearchData] = useState(initialSearchState);
    const [suggestion, setSuggestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { value } = e.target;
        setSearchData({ preferences: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuggestion('');
        setError('');
        setLoading(true);

        // O Pydantic espera um objeto JSON com a chave 'preferences'
        const dataToSend = searchData;
        
        try {
            const response = await fetch(`${API_BASE_URL}/suggest_car/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // user_id é opcional na sua rota, mas se tiver autenticação, 
                    // você deve enviá-lo como um query parameter ou header.
                },
                body: JSON.stringify(dataToSend), 
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || 'Failed to get suggestion from AI.');
            }

            // O FastAPI retorna: {"Suggestion": "..."}
            setSuggestion(responseData.Suggestion);
            setError(''); 

        } catch (err) {
            setError(`AI Interaction Error: ${err.message || 'Check network or API Key configuration.'}`);
            setSuggestion('');
            console.error('AI error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-suggestion-container">
            <h1>AI Car Assistant</h1>
            
            <p>Tell the AI what kind of car you are looking for (e.g., "A robust and economical SUV for city use," or "A cheap sports car for weekends").</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px', margin: '0 auto' }}>
                
                <textarea 
                    name="preferences" 
                    placeholder="Enter your car preferences here..." 
                    value={searchData.preferences} 
                    onChange={handleChange} 
                    rows="4"
                    required
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Get Suggestions'}
                </button>
            </form>

            {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

            {suggestion && (
                <div className="ai-result" style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px', whiteSpace: 'pre-wrap' }}>
                    <h2>AI Suggestion:</h2>
                    {/* whiteSpace: 'pre-wrap' garante que as quebras de linha da IA sejam exibidas */}
                    <p>{suggestion}</p>
                </div>
            )}
        </div>
    );
}

export default AISuggestion;