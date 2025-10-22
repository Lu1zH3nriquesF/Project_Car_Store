// src/App.jsx (VERSÃO FINALIZADA)
import React, { useState } from 'react';
import './index.css'; 

// Importação de todos os Componentes
import Sidebar from './components/SideBar';
import VehicleListing from './components/VehicleListing';
import AISuggestion from './components/AISuggestion';
import UserProfile from './components/UserProfile';
import CompanyList from './components/CompanyList';
import AuthManager from './components/AuthManager'; // Onde a lógica de Auth/Reg/Reset está
import VehicleRegistration from './components/VehicleRegistration'; 
import Checkout from './components/Checkout'; 
import PasswordResetForm from './components/PasswordResetForm'; // Manter a importação

function App() {
    const [activeScreen, setActiveScreen] = useState('listing');
    const [loggedInUserId, setLoggedInUserId] = useState(null); 
    const [accountType, setAccountType] = useState(null); 
    const [vehicleToCheckout, setVehicleToCheckout] = useState(null); 

    /**
     * Função de Logout
     */
    const handleLogout = () => {
        setLoggedInUserId(null);
        setAccountType(null);
        setVehicleToCheckout(null); 
        setActiveScreen('listing'); 
        alert("Você foi desconectado.");
    }

    /**
     * Chamado após sucesso no Login ou Registro.
     */
    const handleAuthSuccess = (userData, newUserId) => {
        setLoggedInUserId(newUserId);
        const userAccountType = userData.account_type || userData.Account_Type; 
        setAccountType(userAccountType); 
        
        // Se houver um veículo pendente, vai para o checkout, senão vai para o perfil
        const nextScreen = vehicleToCheckout ? 'checkout' : 'profile';
        setActiveScreen(nextScreen); 
    };
    
    // ... (handleVehicleRegistrationComplete, handleStartCheckout, handleCheckoutComplete permanecem iguais)
    const handleVehicleRegistrationComplete = () => {
        setActiveScreen('listing'); 
    }
    
    const handleStartCheckout = (vehicle) => {
        setVehicleToCheckout(vehicle); 
        
        if (loggedInUserId === null) {
            alert("Você precisa estar logado para comprar um carro. Redirecionando para Login.");
            setActiveScreen('auth'); 
            return;
        }
        setActiveScreen('checkout');
    };

    const handleCheckoutComplete = () => {
        setVehicleToCheckout(null); 
        setActiveScreen('listing'); 
    }
    // ...

    const renderScreen = () => {
        const isProtectedScreen = ['sell', 'profile', 'checkout'].includes(activeScreen);
        
        // 1. Lógica de Proteção de Rota
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
        
        // 🎯 NOVO PONTO 1: Tela de Redefinição de Senha
        if (activeScreen === 'reset-password') {
            return (
                <div className="reset-password-container">
                    {/* O componente PasswordResetForm agora precisa de um botão "Voltar" */}
                    <PasswordResetForm 
                        // Após redefinir ou cancelar, volta para a tela de login
                        onSuccess={() => setActiveScreen('auth')}
                        onCancel={() => setActiveScreen('auth')}
                    />
                </div>
            );
        }
        
        // 2. Tela de Login/Registro
        if (activeScreen === 'auth') {
            return (
                <AuthManager 
                    onSuccess={handleAuthSuccess} 
                    // 🎯 NOVO PONTO 2: Passar função para ir à tela de reset
                    onForgotPassword={() => setActiveScreen('reset-password')}
                />
            );
        }
        
        // 3. Tela de Venda (após verificação de loggedInUserId)
        if (activeScreen === 'sell') {
            return (
                <VehicleRegistration 
                    onSuccess={handleVehicleRegistrationComplete} 
                    sellerId={loggedInUserId} 
                />
            );
        }
        
        // 4. Tela de Perfil (após verificação de loggedInUserId)
        if (activeScreen === 'profile') {
            if (loggedInUserId === null) return null; 
            return <UserProfile userId={loggedInUserId} onLogout={handleLogout} />;
        }

        // 5. Tela de Listagem
        if (activeScreen === 'listing') {
            return <VehicleListing onBuyClick={handleStartCheckout} />;
        }

        // 6. Tela de Checkout
        if (activeScreen === 'checkout') {
            if (!vehicleToCheckout || loggedInUserId === null) {
                return <div className="error-message">Erro: Dados de compra ou ID de usuário ausentes.</div>;
            }
            return (
                <Checkout 
                    vehicleData={vehicleToCheckout} 
                    clienteId={loggedInUserId} 
                    onSuccess={handleCheckoutComplete} 
                    onCancel={handleCheckoutComplete} 
                />
            );
        }
        
        // 7. Outras Telas (Simples)
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
                onLogout={handleLogout}
            />
            
            <main className="content-area">
                {renderScreen()}
            </main>
        </div>
    );
}

export default App;