// src/App.jsx
import React, { useState } from 'react';
import './index.css'; 

// Importação de todos os Componentes
import Sidebar from './components/SideBar';
import VehicleListing from './components/VehicleListing';
import AISuggestion from './components/AISuggestion';
import UserProfile from './components/UserProfile';
import CompanyList from './components/CompanyList';
import AuthManager from './components/AuthManager'; 
import VehicleRegistration from './components/VehicleRegistration'; 
import Checkout from './components/Checkout'; // Certifique-se de que esta importação está correta

function App() {
  const [activeScreen, setActiveScreen] = useState('listing');
  const [loggedInUserId, setLoggedInUserId] = useState(null); 
  const [accountType, setAccountType] = useState(null); 
  
  // ESTADO CHAVE: Armazena o objeto completo do veículo selecionado para checkout
  const [vehicleToCheckout, setVehicleToCheckout] = useState(null); 

  /**
   * Chamado após sucesso no Login ou Registro.
   */
  const handleAuthSuccess = (userData, newUserId) => {
      setLoggedInUserId(newUserId);
      setAccountType(userData.account_type); 
      
      // Se houver um veículo pendente, vai para o checkout, senão vai para o perfil
      const nextScreen = vehicleToCheckout ? 'checkout' : 'profile';
      setActiveScreen(nextScreen); 
  };
  
  /**
   * Chamado quando o cadastro do veículo é concluído.
   */
  const handleVehicleRegistrationComplete = () => {
    setActiveScreen('listing'); 
  }
  
  /**
   * Inicia o processo de checkout.
   * Chamado a partir do VehicleListing (que recebe do CardVehicle).
   */
  const handleStartCheckout = (vehicle) => {
    setVehicleToCheckout(vehicle); // Salva o veículo no estado
    
    if (loggedInUserId === null) {
      alert("Você precisa estar logado para comprar um carro. Redirecionando para Login.");
      setActiveScreen('auth'); // Redireciona para login/registro
      return; // CRÍTICO: Para a execução
    }
    setActiveScreen('checkout');
  };

  /**
   * Chamado após o checkout ser concluído (sucesso, falha ou cancelamento).
   */
  const handleCheckoutComplete = () => {
    setVehicleToCheckout(null); // Limpa o veículo do estado
    setActiveScreen('listing');  // Volta para a listagem
  }

  const renderScreen = () => {
    // Lógica de Proteção de Rota - Nível 1
    const isProtectedScreen = ['sell', 'profile', 'checkout'].includes(activeScreen);

    if (isProtectedScreen && loggedInUserId === null && activeScreen !== 'auth') {
      return (
        <div className="access-denied">
          <h1>Acesso Negado</h1>
          <p>Você precisa estar logado para acessar esta página.</p>
          <button onClick={() => setActiveScreen('auth')} className="nav-button">
            Ir para Login/Registro
          </button>
        </div>
      );
    }
    
    // 1. Tela de Login/Registro
    if (activeScreen === 'auth') {
        return <AuthManager onSuccess={handleAuthSuccess} />;
    }
    
    // 2. Tela de Venda (após verificação de loggedInUserId)
    if (activeScreen === 'sell') {
        return (
            <VehicleRegistration 
                onSuccess={handleVehicleRegistrationComplete} 
                sellerId={loggedInUserId} 
            />
        );
    }
    
    // 3. Tela de Perfil (após verificação de loggedInUserId)
    if (activeScreen === 'profile') {
        if (loggedInUserId === null) return null; 
        return <UserProfile userId={loggedInUserId} />;
    }

    // 4. Tela de Listagem (CRÍTICA: Ponto de partida do checkout)
    if (activeScreen === 'listing') {
      return <VehicleListing onBuyClick={handleStartCheckout} />;
    }

    // 5. Tela de Checkout (após verificação de loggedInUserId e vehicleToCheckout)
    if (activeScreen === 'checkout') {
      // 🚨 MENSAGEM DE ERRO/DEBUG: Se o estado estiver inválido, mostra a mensagem de erro.
      if (!vehicleToCheckout || loggedInUserId === null) {
        return <div className="error-message">Erro: Dados de compra ou ID de usuário ausentes.</div>;
      }
      return (
        <Checkout 
          vehicleData={vehicleToCheckout} 
          // 🚨 VERIFIQUE O NOME DESTA PROP NO CHECKOUT.JSX
          clienteId={loggedInUserId} 
          onSuccess={handleCheckoutComplete} 
          onCancel={handleCheckoutComplete} 
        />
      );
    }
    
    // 6. Outras Telas (Simples)
    if (activeScreen === 'ai') return <AISuggestion />;
    if (activeScreen === 'companies') return <CompanyList />;
    
    return <div className="content-placeholder">Página não encontrada.</div>;
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeScreen={activeScreen} 
        onNavigate={setActiveScreen} 
        loggedInUserId={loggedInUserId} 
        accountType={accountType}       
      />
      
      <main className="content-area">
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;