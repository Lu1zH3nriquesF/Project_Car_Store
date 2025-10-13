// src/App.jsx
import React, { useState } from 'react';
import './index.css'; 

// Importação de todos os componentes de tela e layout
import Sidebar from './components/SideBar';
import VehicleListing from './components/VehicleListing';
import SellerDashboard from './components/SellerDashboard';
import AISuggestion from './components/AISuggestion';
import UserProfile from './components/UserProfile';
import CompanyList from './components/CompanyList'; 

// Mapeamento de chaves da Sidebar para os componentes de tela
const screenMap = {
  listing: VehicleListing,
  sell: SellerDashboard,
  ai: AISuggestion,
  companies: CompanyList,
  profile: UserProfile,
};

function App() {
  // Estado para controlar a tela atualmente ativa (ex: 'listing', 'sell', 'profile')
  const [activeScreen, setActiveScreen] = useState('listing');
  
  // Estado para armazenar o ID do usuário recém-registrado, simulando um login
  const [loggedInUserId, setLoggedInUserId] = useState(null); 

  // Função chamada pelo SellerDashboard ao completar o registro/venda
  const handleRegistrationComplete = (newUserId) => {
      // Se o SellerDashboard retornar um ID, significa que um usuário foi registrado
      if (newUserId) {
          setLoggedInUserId(newUserId);
          setActiveScreen('profile'); // Redireciona para o Perfil
      } else {
          // Se não houver ID (ex: só completou o cadastro de carro), volta para a listagem
          setActiveScreen('listing');
      }
  };

  // Função para renderizar o componente ativo com suas props necessárias
  const renderScreen = () => {
    
    // 1. Fluxo de Venda (Registro/Dashboard)
    if (activeScreen === 'sell') {
        // Passa o callback para lidar com o ID do novo usuário
        return <SellerDashboard onComplete={handleRegistrationComplete} />;
    }
    
    // 2. Perfil do Usuário
    if (activeScreen === 'profile') {
        // É crucial passar o ID do usuário para o componente de Perfil
        if (loggedInUserId === null) {
            return <h2>Please register or log in to view your profile.</h2>;
        }
        return <UserProfile userId={loggedInUserId} />;
    }
    
    // 3. Outras Telas (Listing, AI, Companies)
    const CurrentScreen = screenMap[activeScreen] || VehicleListing;
    return <CurrentScreen />;
  };

  return (
    <div className="app-container">
      
      {/* 1. Sidebar */}
      <Sidebar 
        activeScreen={activeScreen} 
        onNavigate={setActiveScreen} 
        // Indica se a opção 'Meu Perfil' deve aparecer
        showProfile={loggedInUserId !== null}
      />
      
      {/* 2. Conteúdo Principal */}
      <main className="content-area">
        {/* Verifica se a tela ativa é 'profile' e se o usuário não está 'logado' */}
        {activeScreen === 'profile' && loggedInUserId === null ? (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h1>Access Denied</h1>
                <p>Please register a new account through "Vender Meu Carro" to view your profile.</p>
            </div>
        ) : (
            renderScreen()
        )}
      </main>
      
    </div>
  );
}

export default App;