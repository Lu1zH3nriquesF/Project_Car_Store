// src/components/Login.jsx
import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Componente de Login de Usuário Existente.
 * @param {function} onSuccess - Callback chamado após o login bem-sucedido.
 * @param {function} onSwitchToRegister - Callback para mudar para a tela de Registro.
 */
function Login({ onSuccess, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        // NOTA: Você precisará criar uma rota /login/ no seu main.py!
        try {
            const response = await fetch(`${API_BASE_URL}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                // Erros 401 (Credenciais inválidas) ou outros erros de servidor
                throw new Error(responseData.detail || 'Authentication failed. Check email/password.');
            }

            setMessage(responseData.Message || 'Login successful!');
            
            // Supondo que o backend retorna o User_ID e o account_type
            if (onSuccess) {
                // Passa os dados necessários para o App.jsx
                onSuccess({ account_type: responseData.Account_Type }, responseData.User_ID);
            }

            setEmail('');
            setPassword('');

        } catch (err) {
            setError(`Login Error: ${err.message}`);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <h1>User Login</h1>
            
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                {/* O grid tem 2 colunas, mas o Login usa apenas uma, 
                então forçamos span 2 */}
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ gridColumn: 'span 2' }}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ gridColumn: 'span 2' }}
                />
                
                <button type="submit" disabled={loading} style={{ gridColumn: 'span 2' }}>
                    {loading ? 'Logging In...' : 'Login'}
                </button>
            </form>

            <p style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '15px' }}>
                Don't have an account? 
                <button 
                    type="button" 
                    onClick={onSwitchToRegister} 
                    style={{ 
                        background: 'none', 
                        color: 'var(--primary-color)', 
                        textDecoration: 'underline', 
                        cursor: 'pointer', 
                        border: 'none',
                        display: 'inline',
                        padding: '0 5px'
                    }}
                >
                    Register here.
                </button>
            </p>
        </div>
    );
}

export default Login;