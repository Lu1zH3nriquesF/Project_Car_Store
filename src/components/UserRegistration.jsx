// src/components/Register.jsx (Atualizado com linkStyle para o botão Login)
import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Componente de Registro de Novo Usuário (Pessoa ou Empresa).
 * @param {function} onSuccess - Callback chamado após o registro bem-sucedido.
 * @param {function} onSwitchToLogin - Callback para mudar para a tela de Login.
 */
function UserRegistration({ onSuccess, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: '', 
        account_type: 'Person',
        company_name: '',
        cnpj: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isCompany = formData.account_type === 'Company';

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        const dataToSend = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            account_type: formData.account_type,
            phone_number: formData.phone_number, 
        };
        
        if (isCompany) {
            dataToSend.company_name = formData.company_name;
            dataToSend.cnpj = formData.cnpj;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || 'Registration failed.');
            }

            setMessage(responseData.Message || 'Registration successful! You are now logged in.');
            
            if (onSuccess) {
                onSuccess({ account_type: responseData.Account_Type }, responseData.User_ID);
            }

        } catch (err) {
            setError(`Registration Error: ${err.message}`);
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { gridColumn: 'span 2' }; 
    
    // 🎯 NOVO ESTILO: Similar ao que você usou no Login
    const linkStyle = { 
        background: 'none', 
        color: 'var(--primary-color, #007bff)', // Cor primária como fallback
        textDecoration: 'underline', 
        cursor: 'pointer', 
        border: 'none',
        display: 'inline',
        padding: '0 5px'
    };

    return (
        <div className="registration-container">
            <h1>User Registration</h1>
            
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                {/* Tipo de Conta */}
                <div className="form-group" style={{ ...inputStyle, textAlign: 'left' }}>
                    <label>Account Type:</label>
                    <select 
                        name="account_type" 
                        value={formData.account_type} 
                        onChange={handleFormChange}
                    >
                        <option value="Person">Pessoa</option>
                        <option value="Company">Empresa</option>
                    </select>
                </div>

                {/* Nome / Nome da Empresa, CNPJ, Email, Telefone, Senha (restante do formulário...) */}
                {isCompany ? (
                    <input 
                        type="text" 
                        placeholder="Company Name" 
                        name="company_name"
                        value={formData.company_name} 
                        onChange={handleFormChange} 
                        required 
                        style={inputStyle}
                    />
                ) : (
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        name="name"
                        value={formData.name} 
                        onChange={handleFormChange} 
                        required 
                        style={inputStyle}
                    />
                )}
                
                {isCompany && (
                    <input 
                        type="text" 
                        placeholder="CNPJ" 
                        name="cnpj"
                        value={formData.cnpj} 
                        onChange={handleFormChange} 
                        required 
                        style={inputStyle}
                    />
                )}
                
                <input 
                    type="email" 
                    placeholder="Email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleFormChange} 
                    required 
                    style={inputStyle}
                />
                
                <input 
                    type="tel" 
                    placeholder="Phone Number (Ex: +5511987654321)" 
                    name="phone_number"
                    value={formData.phone_number} 
                    onChange={handleFormChange} 
                    required={!isCompany} 
                    style={inputStyle}
                />
                
                <input 
                    type="password" 
                    placeholder="Password (Min. 6 characters)" 
                    name="password"
                    value={formData.password} 
                    onChange={handleFormChange} 
                    required 
                    minLength={6} 
                    style={inputStyle}
                />
                
                <button type="submit" disabled={loading} style={inputStyle}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            {/* 🎯 Aplica o linkStyle ao botão de Login */}
            <p style={{ ...inputStyle, textAlign: 'center', marginTop: '15px' }}>
                Do you have an account? 
                <button 
                    type="button" 
                    onClick={onSwitchToLogin} 
                    style={linkStyle} // <--- Estilo aplicado aqui
                >
                    Login here.
                </button>
            </p>
        </div>
    );
}

export default UserRegistration;