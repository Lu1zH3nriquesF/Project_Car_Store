// src/App.jsx
import React, { useState } from 'react';
import './index.css'; 

// Componentes
import Sidebar from './components/SideBar';
import VehicleListing from './components/VehicleListing';
import AISuggestion from './components/AISuggestion';
import UserProfile from './components/UserProfile';
import CompanyList from './components/CompanyList';
// IMPORTANTE: AuthManager gerencia Login e Registro
import AuthManager from './components/AuthManager'; 
import VehicleRegistration from './components/VehicleRegistration'; 

// Mapeamento de telas
const screenMap = {
  listing: VehicleListing,
  ai: AISuggestion,
  companies: CompanyList,
  profile: UserProfile, 
  auth: AuthManager,       // Tela de autenticação unificada
  sell: VehicleRegistration,    
};

function App() {
  const [activeScreen, setActiveScreen] = useState('listing');
  // Simula o estado de login
  const [loggedInUserId, setLoggedInUserId] = useState(null); 
  // CRÍTICO: 'Person', 'Company', ou null
  const [accountType, setAccountType] = useState(null); 

  /**
   * Chamado após sucesso no Login ou Registro.
   * Assume que o backend retorna o ID e o Tipo de Conta.
   * @param {object} userData - Inclui o account_type
   * @param {number} newUserId - ID retornado
   */
  const handleAuthSuccess = (userData, newUserId) => {
      setLoggedInUserId(newUserId);
      
      // CRÍTICO: Armazena o tipo de conta
      setAccountType(userData.account_type); 
      
      // Redireciona para o perfil após sucesso
      setActiveScreen('profile'); 
  };
  
  /**
   * Chamado quando o cadastro do veículo é concluído.
   */
  const handleVehicleRegistrationComplete = () => {
    // Retorna para a listagem principal após o sucesso
    setActiveScreen('listing'); 
  }

  const renderScreen = () => {
    const CurrentScreen = screenMap[activeScreen];

    // Lógica de Proteção de Rota para 'Vender Carro'
    if (activeScreen === 'sell' && loggedInUserId === null) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>Acesso Negado</h1>
          <p>Você precisa estar logado para vender um carro.</p>
          <button onClick={() => setActiveScreen('auth')} className="nav-button active" style={{ marginTop: '20px' }}>
            Ir para Login/Registro
          </button>
        </div>
      );
    }
    
    // 1. Tela de Login/Registro
    if (activeScreen === 'auth') {
        // Passa o callback de sucesso para o AuthManager
        return <AuthManager onSuccess={handleAuthSuccess} />;
    }
    
    // 2. Tela de Venda (Se logado)
    if (activeScreen === 'sell') {
        return (
            <VehicleRegistration 
                onSuccess={handleVehicleRegistrationComplete} 
                sellerId={loggedInUserId} 
            />
        );
    }
    
    // 3. Tela de Perfil
    if (activeScreen === 'profile') {
        if (loggedInUserId === null) {
             return <div className="error-message" style={{textAlign: 'center'}}>Por favor, faça login para ver seu perfil.</div>;
        }
        return <UserProfile userId={loggedInUserId} />;
    }
    
    // 4. Outras Telas
    return <CurrentScreen />;
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeScreen={activeScreen} 
        onNavigate={setActiveScreen} 
        loggedInUserId={loggedInUserId} // Passa o ID para saber se está logado
        accountType={accountType}       // CRÍTICO: Passa o tipo para o ACL na Sidebar
      />
      
      <main className="content-area">
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;