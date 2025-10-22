// src/components/Sidebar.jsx (COMPLETO E ATUALIZADO com ACL)
import React from 'react';

const navItems = [
    { key: 'listing', label: 'Vehicles' },
    { key: 'auth', label: 'Login / Register' }, 
    { key: 'sell', label: 'Sell a Car' }, 
    { key: 'ai', label: 'AI Assistent' },
    { key: 'companies', label: 'Company List' }, 
];

/**
 * Componente de Navegação Lateral.
 * @param {string} accountType - 'Person', 'Company' ou null.
 * @param {number|null} loggedInUserId - ID do usuário logado.
 */
function Sidebar({ activeScreen, onNavigate, loggedInUserId, accountType }) {
    
    const isLogged = loggedInUserId !== null;
    
    // Filtra os itens da navegação com base no estado e no tipo de conta
    const filteredNavItems = navItems.filter(item => {
        
        // 1. Sempre visível: Listagem de Veículos
        if (item.key === 'listing') {
            return true;
        }
        
        // 2. Autenticação: Visível apenas quando o usuário NÃO está logado
        if (item.key === 'auth') {
            return !isLogged;
        }
        
        // Se o usuário não está logado, ele não pode ver o resto
        if (!isLogged) {
            return false;
        }

        // 3. Controle de Acesso por Tipo de Conta (ACL)
        
        // Acesso de Empresa (Company): Apenas 'sell' e 'ai'
        if (accountType === 'Company') {
            return item.key === 'sell' || item.key === 'ai';
        }
        
        // Acesso de Pessoa (Person): Vê 'sell', 'ai' e 'companies'
        if (accountType === 'Person') {
            return item.key === 'sell' || item.key === 'ai' || item.key === 'companies';
        }
        
        // Default (cai aqui se loggedIn, mas sem accountType definido - deve ser raro)
        return true; 
    });

    return (
        <div className="sidebar">
            <h2 className="sidebar-title">Car Store</h2>
            <nav>
                <ul className="nav-list">
                    {filteredNavItems.map(item => (
                        <li key={item.key}>
                            <button
                                onClick={() => onNavigate(item.key)}
                                className={activeScreen === item.key ? 'nav-button active' : 'nav-button'}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                    
                    {/* Perfil (visível apenas quando logado) */}
                    {isLogged && (
                        <li>
                            <button
                                onClick={() => onNavigate('profile')}
                                className={activeScreen === 'profile' ? 'nav-button active' : 'nav-button'}
                            >
                                My Profile
                            </button>
                        </li>
                    )}
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;