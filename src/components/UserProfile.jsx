// src/components/UserProfile.jsx (COMPLETO E ATUALIZADO COM LÓGICA DE EDIÇÃO E REGRAS)
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';
const EDIT_API_URL = `${API_BASE_URL}/profile/edit`;

/**
 * Exibe o perfil do usuário logado (Pessoa ou Empresa) e permite a edição 
 * com regras específicas de campos.
 * @param {number} userId - O ID do usuário logado.
 */
function UserProfile({ userId }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({}); // Dados do formulário
    const [saveMessage, setSaveMessage] = useState(null); // Feedback de salvamento

    // ----------------------------------------------------
    // FUNÇÃO DE BUSCA DO PERFIL
    // ----------------------------------------------------
    const fetchProfile = async () => {
        if (!userId) {
            setError("User ID is required to load profile.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to fetch user profile.');
            }

            const data = await response.json();
            setProfile(data);
            setFormData(data); // Inicializa o formulário com dados do perfil
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            setError(`Could not load user profile. ${err.message}`);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    // Efeito para carregar o perfil
    useEffect(() => {
        fetchProfile();
    }, [userId]); 

    // ----------------------------------------------------
    // LÓGICA DE EDIÇÃO
    // ----------------------------------------------------
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveMessage(null);
        
        // 1. Filtra dados: Envia apenas o que pode ser alterado
        const dataToSend = {};
        
        // Campos permitidos para Pessoa: name, email, Phone_Number
        if (!isCompany) {
            if (formData.name !== profile.name) dataToSend.name = formData.name;
            if (formData.email !== profile.email) dataToSend.email = formData.email;
            if (formData.Phone_Number !== profile.Phone_Number) dataToSend.phone_number = formData.Phone_Number; // Mapeia para snake_case do backend
        } 
        // Campos permitidos para Empresa: email, company_name
        else {
            if (formData.email !== profile.email) dataToSend.email = formData.email;
            if (formData.company_name !== profile.company_name) dataToSend.company_name = formData.company_name;
        }
        
        if (Object.keys(dataToSend).length === 0) {
            setSaveMessage({ type: 'info', text: 'Nenhuma alteração detectada.' });
            setLoading(false);
            setIsEditing(false);
            return;
        }

        try {
            const response = await fetch(`${EDIT_API_URL}/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend), 
            });

            const result = await response.json();

            if (response.ok) {
                setSaveMessage({ type: 'success', text: result.message || 'Perfil atualizado com sucesso!' });
                setIsEditing(false);
                await fetchProfile(); // Recarrega os dados
            } else {
                setSaveMessage({ type: 'error', text: result.detail || 'Falha ao salvar o perfil.' });
            }
        } catch (err) {
            console.error("Save Error:", err);
            setSaveMessage({ type: 'error', text: "Erro de conexão ao tentar salvar o perfil." });
        } finally {
            setLoading(false);
        }
    };
    
    // ----------------------------------------------------
    // RENDERIZAÇÃO
    // ----------------------------------------------------
    if (loading && !profile) {
        return <div className="loading-message">Loading profile...</div>;
    }
    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }
    if (!profile) {
        return <div className="info-message">No profile data available.</div>;
    }

    const isCompany = profile.Account_Type === 'Company';
    const profileName = isCompany ? profile.company_name : profile.name;
    
    // --- MODO EDIÇÃO ---
    if (isEditing) {
        return (
            <div className="profile-page-container">
                <form onSubmit={handleSave} className="profile-card profile-edit-form">
                    <h2 className="profile-card-title">Editing Profile: {profileName}</h2>
                    <p className="account-type-tag">Account Type: **{profile.Account_Type}**</p>
                    
                    {saveMessage && (
                        <div className={`message-${saveMessage.type}`}>
                            {saveMessage.text}
                        </div>
                    )}
                    
                    {/* CAMPO DE EMAIL (Permitido para ambos) */}
                    <div className="form-group">
                        <label>Email:</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email || ''} 
                            onChange={handleFormChange} 
                            required 
                        />
                    </div>
                    
                    {/* CAMPOS ESPECÍFICOS DE PESSOA */}
                    {!isCompany && (
                        <>
                            <div className="form-group">
                                <label>Name:</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name || ''} 
                                    onChange={handleFormChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number:</label>
                                {/* O campo de telefone está mapeado para 'Phone_Number' no frontend, mas enviado como 'phone_number' no backend */}
                                <input 
                                    type="text" 
                                    name="Phone_Number" 
                                    value={formData.Phone_Number || ''} 
                                    onChange={handleFormChange} 
                                />
                            </div>
                        </>
                    )}
                    
                    {/* CAMPO ESPECÍFICO DE EMPRESA */}
                    {isCompany && (
                        <div className="form-group">
                            <label>Company Name:</label>
                            <input 
                                type="text" 
                                name="company_name" 
                                value={formData.company_name || ''} 
                                onChange={handleFormChange} 
                                required 
                            />
                        </div>
                    )}
                    
                    <div className="profile-edit-actions">
                        <button type="submit" disabled={loading} className="btn-save-profile">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel-edit">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }
    
    // --- MODO VISUALIZAÇÃO ---
    return (
        <div className="profile-page-container">
            <div className="profile-card">
                <h2 className="profile-card-title">{profileName}'s Profile</h2>
                <p className="account-type-tag">Account Type: **{profile.Account_Type}**</p>
                
                <hr className="profile-separator" />
                
                {saveMessage && (
                    <div className={`message-${saveMessage.type}`}>
                        {saveMessage.text}
                    </div>
                )}

                {/* Seção de Contato */}
                <div className="profile-section">
                    <h3 className="section-title">Contact Information</h3>
                    <div className="profile-details-grid">
                        <p><strong>Email:</strong> {profile.email}</p>
                        {profile.Phone_Number && (
                            <p><strong>Phone:</strong> {profile.Phone_Number}</p>
                        )}
                        {/* Outros detalhes... */}
                    </div>
                </div>

                {/* Detalhes Específicos da Empresa */}
                {isCompany && (
                    <div className="profile-section company-details-section">
                        <h3 className="section-title">Company Details</h3>
                        <div className="profile-details-grid">
                            <p><strong>Company Name:</strong> {profile.company_name}</p>
                            <p><strong>CNPJ:</strong> {profile.cnpj}</p>
                        </div>
                    </div>
                )}
                
                <button 
                    className="btn-edit-profile"
                    onClick={() => { setIsEditing(true); setSaveMessage(null); }} 
                    disabled={loading}
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
}

export default UserProfile;