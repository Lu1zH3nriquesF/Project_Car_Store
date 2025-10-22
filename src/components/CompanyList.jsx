// src/components/CompanyList.jsx
import React, { useState, useEffect } from 'react';

// URL CRÍTICA: Mantenha a URL do seu endpoint do FastAPI
const COMPANIES_API = 'http://localhost:8000/api/companies'; 

/**
 * Componente que busca e exibe a lista de empresas parceiras.
 */
const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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

    // ----------------------------------------------------
    // Lógica de Renderização Condicional
    // ----------------------------------------------------

    if (loading) {
        return <div className="loading-message">Carregando lista de empresas...</div>;
    }

    if (error) {
        return <div className="error-message">Error loading data: {error}</div>;
    }

    if (companies.length === 0) {
        return <div className="empty-message">Nenhuma empresa registrada.</div>;
    }

    // ----------------------------------------------------
    // Renderização da Lista de Empresas (Adaptação para as chaves do Backend)
    // ----------------------------------------------------
    
    return (
        <div className="company-list-container">
            <h1>Empresas Parceiras</h1>
            <ul className="company-list">
                {companies.map(company => (
                    // 🎯 CORREÇÃO 1: Usando 'user_id' como a chave única da lista
                    <li key={company.user_id} className="company-item">
                        <div className="company-name">
                            {/* 🎯 CORREÇÃO 2: Usando 'company_name' para exibir o nome */}
                            <strong>Nome: {company.company_name}</strong> 
                        </div>
                        
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CompanyList;