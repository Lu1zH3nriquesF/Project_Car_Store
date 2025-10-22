// src/components/VehicleListing.jsx
import React, { useState, useEffect } from 'react';
import CardVehicle from './CardVehicle'; 

// 🎯 CRÍTICO: Esta URL deve ser EXATAMENTE a que funcionou no Swagger
const VEHICLES_API = 'http://localhost:8000/api/vehicles/available'; 

/**
 * Componente que lista todos os veículos disponíveis.
 * @param {function} onBuyClick - Função de callback do App.jsx para iniciar o checkout.
 */
const VehicleListing = ({ onBuyClick }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await fetch(VEHICLES_API); 
                
                if (!response.ok) {
                    // Captura erros HTTP como 404, 500, etc.
                    throw new Error(`Falha ao buscar veículos. Status: ${response.status}. Verifique o servidor FastAPI e a URL.`);
                }
                
                const data = await response.json();
                
                // 🎯 Se o problema fosse tuplas em vez de dicionários (DictCursor),
                // o "data" estaria correto aqui agora.
                setVehicles(data);
                setError(null);
                
            } catch (err) {
                console.error("Erro na busca de veículos:", err);
                setError(err.message);
                setVehicles([]); // Limpa a lista em caso de erro
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    if (loading) {
        return <div className="loading-message">Carregando veículos disponíveis...</div>;
    }

    if (error) {
        return <div className="error-message">Erro: {error}. Não foi possível carregar os veículos.</div>;
    }

    if (vehicles.length === 0) {
        return <div className="empty-message">Nenhum veículo disponível para compra no momento.</div>;
    }

    return (
        <div className="vehicle-listing-container">
            <h1>Veículos em Estoque</h1>
            <div className="car-cards-grid">
                {/* 🎯 Loop principal que renderiza CADA CARD */}
                {vehicles.map(vehicle => (
                    <CardVehicle 
                        // O ID do veículo deve ser único para a key
                        key={vehicle.id} 
                        vehicle={vehicle} 
                        // PASSAGEM ESSENCIAL: onBuyClick -> CardVehicle
                        onBuyClick={onBuyClick} 
                    />
                ))}
            </div>
        </div>
    );
};

export default VehicleListing;