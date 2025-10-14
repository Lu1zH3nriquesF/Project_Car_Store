// src/components/UserRegistration.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

const initialUserState = {
    name: '',
    email: '',
    password: '',
    account_type: 'Person', // Default
    phone_number: '',
    company_name: '',
    cnpj: '',
};

/**
 * Componente de Registro de Novo Usuário/Empresa.
 * @param {function} onSuccess - Callback de sucesso (leva ao Perfil).
 * @param {function} onSwitchToLogin - Callback para voltar ao Login.
 */
function UserRegistration({ onSuccess, onSwitchToLogin }) {
    const [userData, setUserData] = useState(initialUserState);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Controla se os campos de Company (Empresa) devem aparecer
    const isCompany = userData.account_type === 'Company'; 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    useEffect(() => {
        // Limpa campos específicos ao trocar o tipo de conta
        if (!isCompany) {
            setUserData(prev => ({ ...prev, company_name: '', cnpj: '' }));
        } else {
             setUserData(prev => ({ ...prev, name: '', phone_number: '' }));
        }
    }, [isCompany]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        
        // 1. Prepara os dados: remove campos vazios opcionais
        const dataToSend = {};
        for (const key in userData) {
            // Se o campo for nulo, vazio ou irrelevante (ex: Company_Name para Person), não o envie
            if (userData[key] !== '' && (isCompany || key !== 'company_name' && key !== 'cnpj')) {
                dataToSend[key] = userData[key];
            } else if (!isCompany && key === 'account_type') {
                dataToSend[key] = userData[key]; // Garante que o tipo de conta é enviado
            } else if (isCompany && (key === 'name' || key === 'phone_number')) {
                 // Nomes e telefones são opcionais para empresas, e os campos são vazios aqui
                 // Vamos deixar o Python tratar como Optional
                 continue; 
            }
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData), // Enviamos o objeto completo, o backend trata os opcionais
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || 'Unknown registration failure.');
            }

            setMessage(responseData.Message || 'Seller successfully registered!');
            
            if (onSuccess) {
                // responseData.User_ID é o ID retornado pelo backend Python
                onSuccess(userData, responseData.User_ID); 
            }

            setUserData(initialUserState); 

        } catch (err) {
            setError(`Registration Error: ${err.message || 'Check your network connection.'}`);
            console.error('User registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <h1>Register New Seller</h1>
            
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                {/* Tipo de Conta */}
                <select 
                    name="account_type" 
                    value={userData.account_type} 
                    onChange={handleChange} 
                    required
                    style={{ gridColumn: 'span 2' }}
                >
                    <option value="Person">Pessoa (Vendedor Individual)</option>
                    <option value="Company">Empresa (Concessionária)</option>
                </select>

                {/* Campos Específicos de Pessoa/Empresa */}
                {isCompany ? (
                    <>
                        {/* Campos da Empresa */}
                        <input type="text" name="company_name" placeholder="Nome da Empresa" value={userData.company_name} onChange={handleChange} required />
                        <input type="text" name="cnpj" placeholder="CNPJ" value={userData.cnpj} onChange={handleChange} required />
                    </>
                ) : (
                    <>
                        {/* Campos de Pessoa */}
                        <input type="text" name="name" placeholder="Nome Completo" value={userData.name} onChange={handleChange} required />
                        <input type="text" name="phone_number" placeholder="Telefone" value={userData.phone_number} onChange={handleChange} />
                    </>
                )}
                
                {/* Campos Comuns */}
                <input type="email" name="email" placeholder="Email" value={userData.email} onChange={handleChange} required style={{ gridColumn: 'span 2' }} />
                <input type="password" name="password" placeholder="Senha" value={userData.password} onChange={handleChange} required style={{ gridColumn: 'span 2' }} />
                
                <button type="submit" disabled={loading} style={{ gridColumn: 'span 2' }}>
                    {loading ? 'Registrando...' : 'Registrar Vendedor'}
                </button>
                
                {/* Botão de Retorno para Login */}
                {onSwitchToLogin && (
                    <p style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '15px' }}>
                        Já possui uma conta? 
                        <button 
                            type="button" 
                            onClick={onSwitchToLogin} 
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
                            Faça Login.
                        </button>
                    </p>
                )}
            </form>
        </div>
    );
}

export default UserRegistration;