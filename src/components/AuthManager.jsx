// src/components/AuthManager.jsx
import React, { useState } from 'react';
import Login from './Login'; // Importa o componente de Login
import Register from './UserRegistration'; // Assume que você tem um componente de Registro

const AUTH_MODE = {
    LOGIN: 'login',
    REGISTER: 'register',
};

/**
 * Gerencia a exibição entre as telas de Login e Registro, atuando
 * como intermediário para a tela de Redefinição de Senha.
 * * @param {function} onSuccess - Chamado após sucesso no Login/Registro.
 * @param {function} onForgotPassword - Chamado quando o usuário clica em "Esqueci a Senha".
 */
function AuthManager({ onSuccess, onForgotPassword }) {
    const [authMode, setAuthMode] = useState(AUTH_MODE.LOGIN);

    const handleSwitchToRegister = () => setAuthMode(AUTH_MODE.REGISTER);
    const handleSwitchToLogin = () => setAuthMode(AUTH_MODE.LOGIN);

    if (authMode === AUTH_MODE.REGISTER) {
        // Assume que o componente Register também recebe onSuccess e onSwitchToLogin
        return <Register onSuccess={onSuccess} onSwitchToLogin={handleSwitchToLogin} />;
    }
    
    // Padrão: LOGIN
    return (
        <Login
            onSuccess={onSuccess}
            onSwitchToRegister={handleSwitchToRegister}
            // 🎯 Propriedade crucial: Passa a função recebida do App.jsx para o Login.jsx
            onSwitchToResetPassword={onForgotPassword} 
        />
    );
}

export default AuthManager;