// src/components/UserRegistration.jsx (Refatorado - Foco em Person/Company)
import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

const initialUserState = {
    name: '',
    email: '',
    password: '',
    // account_type agora representa o tipo de VENDEDOR (Person ou Company)
    account_type: 'Person', // Padrão: Pessoa
    
    // Campos condicionais para EMPRESA
    company_name: '',
    cnpj: '',
    
    phone_number: '',
};

function UserRegistration({ onSuccess }) {
    const [userData, setUserData] = useState(initialUserState);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let newUserData = { ...userData, [name]: value };

        // LÓGICA DE LIMPEZA: Se mudar de Company para Person, zera os campos de Company
        if (name === 'account_type' && value === 'Person') {
            newUserData.company_name = '';
            newUserData.cnpj = '';
        }

        setUserData(newUserData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        // Validação para Empresa
        if (userData.account_type === 'Company' && (!userData.company_name || !userData.cnpj)) {
            setError("Company registration requires Company Name and CNPJ.");
            setLoading(false);
            return;
        }
        
        // Lógica de limpeza: Cria o objeto para enviar
        const { company_name, cnpj, ...baseData } = userData;
        
        let dataToSend = baseData;

        if (userData.account_type === 'Company') {
            // Se for Company, adiciona os campos extras
            dataToSend = { ...dataToSend, company_name, cnpj };
        } else {
            // Se for Person, garante que os campos de Company não sejam enviados (limpeza final)
            dataToSend = baseData; 
        }

        // Mapeamento do nome da conta (Person/Company) para account_type (se o backend precisar)
        // No seu main.py, o Pydantic só pede `account_type: str`.
        // Vamos enviar 'Person' ou 'Company' neste campo.
        
        try {
            const response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend), 
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || 'Unknown registration failure.');
            }

            setMessage(responseData.Message || 'Seller successfully registered!');
            
            // CORREÇÃO CRÍTICA: Passar o ID e os dados do formulário
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
            <h1>Seller Account Registration</h1>
            
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', maxWidth: '600px', margin: '0 auto' }}>
                
                {/* CAMPOS BÁSICOS */}
                <input type="text" name="name" placeholder="Full Name / Responsible" value={userData.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={userData.email} onChange={handleChange} required />
                
                <input type="password" name="password" placeholder="Password" value={userData.password} onChange={handleChange} required />
                <input type="tel" name="phone_number" placeholder="Phone Number (Optional)" value={userData.phone_number} onChange={handleChange} />
                
                {/* 1. Account Type (Person/Company) */}
                <select name="account_type" value={userData.account_type} onChange={handleChange} required style={{ gridColumn: 'span 2' }}>
                    <option value="Person">Individual Seller (Person)</option>
                    <option value="Company">Dealership/Business (Company)</option>
                </select>
                
                {/* 2. Lógica Condicional: Se for EMPRESA */}
                {userData.account_type === 'Company' && (
                    <>
                        <input type="text" name="company_name" placeholder="Company Name" value={userData.company_name} onChange={handleChange} required />
                        <input type="text" name="cnpj" placeholder="CNPJ / Tax ID" value={userData.cnpj} onChange={handleChange} required />
                    </>
                )}
                
                {/* O CAMPO vehicle_condition foi removido para simplificar o fluxo inicial */}
                
                <button type="submit" disabled={loading} style={{ gridColumn: 'span 2', padding: '10px' }}>
                    {loading ? 'Registering...' : 'Register Seller'}
                </button>
            </form>
        </div>
    );
}

export default UserRegistration;