// src/components/CompanyList.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

function CompanyList() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/companies/`);
                
                if (!response.ok) {
                    throw new Error(`HTTP Error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                setCompanies(data);
                
            } catch (err) {
                setError("Could not load company list. Please check the console for details.");
                console.error("Error fetching companies:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    if (loading) {
        return <div>Loading companies...</div>;
    }
    
    if (error) {
        return <div style={{ color: 'red', padding: '20px' }}>Error loading data: {error}</div>;
    }

    if (companies.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>No companies found at the moment.</div>;
    }

    return (
        <div className="listing-container">
            <h1>Registered Companies ({companies.length})</h1>
            
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Company Name</th>
                        <th>CNPJ</th>
                        <th>Responsible</th>
                        <th>Email</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map(company => (
                        <tr key={company.id}>
                            <td>{company.company_name || 'N/A'}</td>
                            <td>{company.cnpj || 'N/A'}</td>
                            <td>{company.name}</td>
                            <td>{company.email}</td>
                            <td>{company.phone_number || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CompanyList;