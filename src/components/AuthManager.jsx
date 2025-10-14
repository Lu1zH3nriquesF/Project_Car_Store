// src/components/AuthManager.jsx (NOVO)
import React, { useState } from 'react';
import Login from './Login';
import UserRegistration from './UserRegistration';

/**
 * Gerencia a alternância entre os formulários de Login e Registro.
 * @param {function} onSuccess - Callback de sucesso que será passado para Login e Registro.
 */
function AuthManager({ onSuccess }) {
    // Estado para alternar entre 'login' e 'register'
    const [mode, setMode] = useState('login'); 

    return (
        <div className="auth-manager-container">
            {mode === 'login' ? (
                <Login 
                    onSuccess={onSuccess} 
                    onSwitchToRegister={() => setMode('register')} 
                />
            ) : (
                <UserRegistration 
                    onSuccess={onSuccess} 
                    onSwitchToLogin={() => setMode('login')} 
                    // Passamos a função para o UserRegistration poder ter um botão de "Voltar para Login"
                />
            )}
        </div>
    );
}

export default AuthManager;