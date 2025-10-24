// src/components/PasswordResetForm.jsx (NOVO COMPONENTE)
import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';
const RESET_API_URL = `${API_BASE_URL}/auth/reset-password`;

/**
 * Formulário simples para redefinição de senha (simula a função "Esqueci a Senha").
 */
function PasswordResetForm() {
    const [formData, setFormData] = useState({
        email: '',
        new_password: '',
        confirm_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '...' }

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        // Se você usa CamelCase no frontend (ex: newPassword), ajuste aqui:
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // A checagem de coincidência também é feita no frontend para feedback imediato
        if (formData.new_password !== formData.confirm_password) {
            setMessage({ type: 'error', text: 'The passwords are not the same.' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(RESET_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), // Envia email, new_password, confirm_password
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: result.message || 'Password successfully changed!' });
                setFormData({ email: '', new_password: '', confirm_password: '' }); // Limpa o form
            } else {
                setMessage({ type: 'error', text: result.detail || 'Fail to change the password.' });
            }

        } catch (err) {
            console.error("Reset Password Error:", err);
            setMessage({ type: 'error', text: "Connection error to change the password." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page-container">
            <form onSubmit={handleSubmit} className="auth-card reset-form">
                <h2 className="card-title">Reset Password</h2>

                {message && (
                    <div className={`message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleFormChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>New Password:</label>
                    <input 
                        type="password" 
                        name="new_password" 
                        value={formData.new_password} 
                        onChange={handleFormChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Confirm New Password:</label>
                    <input 
                        type="password" 
                        name="confirm_password" 
                        value={formData.confirm_password} 
                        onChange={handleFormChange} 
                        required 
                    />
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Processing...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}

export default PasswordResetForm;