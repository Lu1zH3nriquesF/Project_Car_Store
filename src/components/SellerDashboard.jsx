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
             alert("Erro Crítico: ID do Usuário não retornado. Verifique o main.py.");
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
        alert("Veículo cadastrado com sucesso! Você será redirecionado para o seu Perfil.");
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
                        <h2>Bem-vindo(a), {sellerInfo?.name || 'Vendedor Pessoa'}!</h2>
                        <p>Por favor, liste seu primeiro carro agora.</p>
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
                        <h2>Registro de Empresa Concluído!</h2>
                        <p>Sua empresa, **{sellerInfo?.company_name}**, foi registrada com sucesso.</p>
                        <button onClick={handleFinalize} className="nav-button active">
                            Ver Meu Perfil
                        </button>
                    </div>
                );
            
            case 'complete':
                return (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h2>Processo Concluído!</h2>
                        <p>Obrigado pelo seu registro e listagem do veículo.</p>
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