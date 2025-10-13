// src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

// Recebe o ID do usuário atualmente "logado"
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setError("No user ID provided. Please register or log in first.");
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/${userId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP Error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                setUser(data);
                
            } catch (err) {
                setError("Could not load user profile. Check the console for details.");
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (loading) {
        return <div>Loading profile...</div>;
    }
    
    if (error) {
        return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
    }
    
    if (!user) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>No profile data found.</div>;
    }

    return (
        <div className="registration-container">
            <h1>Your Profile</h1>
            
            <div className="details" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Account Type:</strong> {user.account_type}</p>
                <p><strong>Phone:</strong> {user.phone_number || 'N/A'}</p>
                
                {user.account_type === 'Company' && (
                    <div style={{ borderTop: '1px solid #ccc', marginTop: '15px', paddingTop: '15px' }}>
                        <h3>Company Details</h3>
                        <p><strong>Company Name:</strong> {user.company_name}</p>
                        <p><strong>CNPJ:</strong> {user.cnpj}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile;