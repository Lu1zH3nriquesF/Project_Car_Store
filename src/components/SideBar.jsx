// src/components/Sidebar.jsx (Atualizado)
import React from 'react';

const navItems = [
    { key: 'listing', label: 'Ver Veículos (Comprar)' },
    { key: 'sell', label: 'Vender Meu Carro' },
    { key: 'ai', label: 'Assistente IA' },
    { key: 'companies', label: 'Empresas Registradas' }, // NOVO
];

// Recebe showProfile do App.jsx
function Sidebar({ activeScreen, onNavigate, showProfile }) {
    return (
        <div className="sidebar">
            <h2 className="sidebar-title">Car Hub</h2>
            <nav>
                <ul className="nav-list">
                    {navItems.map(item => (
                        <li key={item.key}>
                            <button
                                onClick={() => onNavigate(item.key)}
                                className={activeScreen === item.key ? 'nav-button active' : 'nav-button'}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                    
                    {/* Botão de Perfil Condicional */}
                    {showProfile && (
                        <li>
                            <button
                                onClick={() => onNavigate('profile')}
                                className={activeScreen === 'profile' ? 'nav-button active' : 'nav-button'}
                            >
                                Meu Perfil
                            </button>
                        </li>
                    )}
                </ul>
            </nav>
            <div className="sidebar-footer">
                <p>&copy; 2025</p>
            </div>
        </div>
    );
}

export default Sidebar;