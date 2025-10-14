// src/components/Sidebar.jsx (Atualizado)
import React from 'react';

const navItems = [
    { key: 'listing', label: 'Ver Veículos' },
    { key: 'auth', label: 'Login / Registrar' }, // NOVO
    { key: 'sell', label: 'Vender Meu Carro' }, // Mantém o nome, mas agora é só o formulário
    { key: 'ai', label: 'Assistente IA' },
    { key: 'companies', label: 'Empresas Registradas' }, 
];

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
            {/* ... footer ... */}
        </div>
    );
}

export default Sidebar;