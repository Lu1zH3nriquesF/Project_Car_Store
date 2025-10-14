// src/components/UserProfile.jsx (COMPLETO E ATUALIZADO)
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Exibe o perfil do usuário logado (Pessoa ou Empresa).
 * @param {number} userId - O ID do usuário logado.
 */
function UserProfile({ userId }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setError("User ID is required to load profile.");
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Chama a nova rota de perfil do FastAPI
                const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to fetch user profile.');
                }

                const data = await response.json();
                setProfile(data);

            } catch (err) {
                console.error("Profile Fetch Error:", err);
                setError(`Could not load user profile. ${err.message}`);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]); // Executa novamente se o userId mudar

    if (loading) {
        return <div className="loading-message">Loading profile...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }
    
    if (!profile) {
        return <div className="info-message">No profile data available.</div>;
    }

    const isCompany = profile.Account_Type === 'Company';
    
    return (
        <div className="profile-container">
            <h1>{isCompany ? profile.company_name : profile.name}'s Profile</h1>
            <p className="account-type-tag">Account Type: **{profile.Account_Type}**</p>

            <div className="profile-details-grid">
                
                <h2>Contact Information</h2>
                <p><strong>Email:</strong> {profile.email}</p>
                
                {profile.Phone_Number && (
                    <p><strong>Phone:</strong> {profile.Phone_Number}</p>
                )}
                
                {/* Detalhes Específicos da Empresa */}
                {isCompany && (
                    <>
                        <div style={{ gridColumn: 'span 2', marginTop: '20px' }}>
                            <h2>Company Details</h2>
                        </div>
                        <p><strong>CNPJ:</strong> {profile.cnpj}</p>
                        {/* Se a empresa tiver um nome de contato na users.name, você pode mostrá-lo aqui */}
                        {profile.name && <p><strong>Contact Name:</strong> {profile.name}</p>}
                    </>
                )}
            </div>
            
            {/* Aqui você pode adicionar mais funcionalidades, como histórico de vendas, etc. */}
        </div>
    );
}

export default UserProfile;