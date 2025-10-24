// src/components/SellerDashboard.jsx
import React, { useState } from 'react';
import UserRegistration from './UserRegistration';
import VehicleRegistration from './VehicleRegistration';

/**
 * Gerencia o fluxo completo de registro de vendedor e listagem inicial do veículo.
 * @param {function} onComplete - Callback que notifica o App.jsx do ID do usuário logado.
 */
function SellerDashboard({ onComplete }) {
    // step: 'register', 'vehicle_form', 'company_complete', 'complete'
    const [step, setStep] = useState('register'); 
    const [sellerInfo, setSellerInfo] = useState(null); // Guarda dados do vendedor e o ID

    /**
     * Lida com o sucesso do registro de conta.
     * @param {object} userData - Dados do formulário (inclui account_type).
     * @param {number} newUserId - ID retornado pelo backend.
     */
    const handleRegistrationSuccess = (userData, newUserId) => { 
        
        if (!newUserId) {
             // Esta mensagem não deve mais ocorrer se o backend estiver corrigido
             alert("Error Critic: User Id not return.");
             setStep('register');
             return;
        }

        // Armazena o ID e o tipo para uso no fluxo
        setSellerInfo({ ...userData, id: newUserId }); 
        
        if (userData.account_type === 'Person') {
            // VENDEDOR PESSOA: Transiciona para o formulário do carro
            setStep('vehicle_form'); 
        } else if (userData.account_type === 'Company') {
            // VENDEDOR EMPRESA: Transiciona para a conclusão
            setStep('company_complete'); 
        }
    };
    
    /**
     * Lida com o sucesso do cadastro do veículo (após o 'Person' preencher).
     */
    const handleVehicleRegistrationSuccess = () => {
        alert("Vehicle successfully registered. Redirecting you to your profile");
        setStep('complete');
    };

    /**
     * Finaliza o fluxo e notifica o App.jsx, passando o ID do usuário.
     */
    const handleFinalize = () => {
        if (onComplete) {
            // Passa o ID do usuário de volta para o App.jsx (para exibir o perfil)
            onComplete(sellerInfo?.id); 
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'register':
                return (
                    <UserRegistration onSuccess={handleRegistrationSuccess} />
                );
            
            case 'vehicle_form':
                return (
                    <div>
                        <h2>Welcome, {sellerInfo?.name || 'People Seller'}!</h2>
                        <p>Please, listing your first vehicle right now.</p>
                        {/* 🌟 CORREÇÃO DE CHAVE ESTRANGEIRA: Passando o ID do vendedor */}
                        <VehicleRegistration 
                            onSuccess={handleVehicleRegistrationSuccess}
                            sellerId={sellerInfo?.id} 
                        />
                    </div>
                );
            
            case 'company_complete':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h2>Company register is completed!</h2>
                        <p>Your company, **{sellerInfo?.company_name}**, was successfully registerd.</p>
                        <button onClick={handleFinalize} className="nav-button active">
                            See your profiel
                        </button>
                    </div>
                );
            
            case 'complete':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h2>Process is complet!</h2>
                        <p>Thanks to register your vehicle.</p>
                        <button onClick={handleFinalize} className="nav-button active">
                            Ir para Listagem Principal
                        </button>
                    </div>
                );
            
            default:
                return <UserRegistration onSuccess={handleRegistrationSuccess} />;
        }
    };

    return (
        <div className="seller-dashboard-container">
            {renderContent()}
        </div>
    );
}

export default SellerDashboard;