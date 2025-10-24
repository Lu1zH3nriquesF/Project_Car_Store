// src/components/Login.jsx (ADAPTADO COM RESET DE SENHA)
import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Componente de Login de Usuário Existente.
 * @param {function} onSuccess - Callback chamado após o login bem-sucedido.
 * @param {function} onSwitchToRegister - Callback para mudar para a tela de Registro.
 * @param {function} onSwitchToResetPassword - Callback para mudar para a tela de Redefinição de Senha.
 */
function Login({ onSuccess, onSwitchToRegister, onSwitchToResetPassword }) {
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

    const linkStyle = { 
        background: 'none', 
        color: 'var(--primary-color)', 
        textDecoration: 'underline', 
        cursor: 'pointer', 
        border: 'none',
        display: 'inline',
        padding: '0 5px'
    };

    return (
        <div className="registration-container">
            <h1>User Login</h1>
            
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
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
                
                {/* 🎯 LINK "ESQUECI A SENHA" VIA CALLBACK */}
                <p style={{ gridColumn: 'span 2', textAlign: 'right', margin: '5px 0' }}>
                    <button 
                        type="button" 
                        onClick={onSwitchToResetPassword} 
                        style={{ ...linkStyle, padding: '0' }}
                    >
                        Esqueci a Senha?
                    </button>
                </p>
                
                <button type="submit" disabled={loading} style={{ gridColumn: 'span 2' }}>
                    {loading ? 'Logging In...' : 'Login'}
                </button>
            </form>

            {/* Link para o Registro */}
            <p style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '15px' }}>
                Don't have an account? 
                <button 
                    type="button" 
                    onClick={onSwitchToRegister} 
                    style={linkStyle}
                >
                    Register here.
                </button>
            </p>
        </div>
    );
}

export default Login;