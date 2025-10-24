// src/components/SearchBar.jsx

import React from 'react';
import PropTypes from 'prop-types'; 

/**
 * Componente genérico para uma barra de pesquisa.
 * É um componente 'controlado' pelo seu componente pai (VehicleListing).
 * * @param {string} searchTerm - O termo de pesquisa atual.
 * @param {function} onSearchChange - Função para atualizar o termo de pesquisa.
 * @param {string} placeholder - Texto de placeholder.
 */
function SearchBar({ searchTerm, onSearchChange, placeholder = "Search Vehicles..." }) {
    
    const handleInputChange = (event) => {
        // Repassa o novo valor do input para a função de callback do pai
        onSearchChange(event.target.value);
    };

    const handleClear = () => {
        // Limpa o termo de pesquisa chamando a função com string vazia
        onSearchChange('');
    };

    return (
        <div className="search-bar-container">
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleInputChange}
                className="search-input"
            />
            
            {/* Botão de Limpar, visível apenas se houver um termo de pesquisa */}
            {searchTerm && (
                <button 
                    onClick={handleClear} 
                    className="clear-button"
                    title="Limpar pesquisa"
                >
                    &times; {/* Símbolo X */}
                </button>
            )}
        </div>
    );
}

SearchBar.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

export default SearchBar;

// Não esqueça de adicionar o 'prop-types' no seu projeto: npm install prop-types