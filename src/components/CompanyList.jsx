// src/components/CompanyList.jsx
import React, { useState, useEffect } from 'react';

const COMPANIES_API = 'http://localhost:8000/api/companies'; 

// Componente simples para renderizar um único Card de Empresa
const CompanyCard = ({ company }) => (
    <div className="company-card">
        {/* Usando as chaves do seu backend: company_name e user_id (como ID) */}
        <h3 className="card-title">{company.company_name}</h3>
        <p className="card-detail">
            <strong>ID:</strong> {company.user_id}
        </p>
        <p className="card-detail">
            <strong>CNPJ:</strong> {company.cnpj}
        </p>
        {company.email && (
            <p className="card-detail">
                <strong>Email:</strong> {company.email}
            </p>
        )}
        {company.address && (
            <p className="card-detail">
                <strong>Endereço:</strong> {company.address}
            </p>
        )}
    </div>
);


const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // ... (Lógica de fetch idêntica à anterior)
        const fetchCompanies = async () => {
            try {
                const response = await fetch(COMPANIES_API); 
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Status ${response.status}: ${errorData.detail || 'Erro desconhecido.'}`);
                }
                
                const data = await response.json();
                
                setCompanies(data);
                setError(null);
                
            } catch (err) {
                console.error("Erro na busca de empresas:", err);
                setError(`Could not load company list. Please check the console for details. (Detalhe: ${err.message})`);
                setCompanies([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    if (loading) {
        return <div className="loading-message">Carregando lista de empresas...</div>;
    }

    if (error) {
        return <div className="error-message">Error loading data: {error}</div>;
    }

    if (companies.length === 0) {
        return <div className="empty-message">Nenhuma empresa registrada.</div>;
    }
    
    return (
        <div className="company-list-container">
            <h1>Empresas Parceiras</h1>
            {/* 🎯 AQUI: Container que usará CSS Grid ou Flexbox para organizar os cards */}
            <div className="company-cards-grid"> 
                {companies.map(company => (
                    // Passamos o objeto 'company' para o novo componente Card
                    <CompanyCard key={company.user_id} company={company} />
                ))}
            </div>
        </div>
    );
};

export default CompanyList;