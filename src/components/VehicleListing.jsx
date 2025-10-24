// src/components/VehicleListing.jsx
import React, { useState, useEffect, useMemo } from 'react';
import CardVehicle from './CardVehicle'; 
import SearchBar from './SearchBar'; // 🎯 NOVO IMPORT: Barra de Pesquisa

const VEHICLES_API = 'http://localhost:8000/api/vehicles/available'; 

/**
 * Componente que lista todos os veículos disponíveis, com funcionalidade de pesquisa local.
 * @param {function} onBuyClick - Função de callback do App.jsx para iniciar o checkout.
 */
const VehicleListing = ({ onBuyClick }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 🎯 NOVO ESTADO: Termo de pesquisa
    const [searchTerm, setSearchTerm] = useState(''); 

    useEffect(() => {
        // Função original para buscar dados, roda apenas na montagem
        const fetchVehicles = async () => {
            try {
                const response = await fetch(VEHICLES_API); 
                
                if (!response.ok) {
                    throw new Error(`Fail to search the vehicle. Status: ${response.status}..`);
                }
                
                const data = await response.json();
                
                setVehicles(data);
                setError(null);
                
            } catch (err) {
                console.error("Fail to search the vehicle:", err);
                setError(err.message);
                setVehicles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []); // Array de dependência vazio: roda apenas uma vez

    // 🎯 LÓGICA DE FILTRAGEM: Re-filtra somente quando 'vehicles' (dados) ou 'searchTerm' (busca) mudam
    const filteredVehicles = useMemo(() => {
        if (!searchTerm) return vehicles;

        const term = searchTerm.toLowerCase().trim();

        return vehicles.filter(vehicle => {
            const mark = vehicle.mark || vehicle.Mark || '';
            const model = vehicle.model || vehicle.Model || '';
            const year = (vehicle.year || vehicle.Year || '').toString();

            const searchString = `${mark} ${model} ${year}`.toLowerCase();
            return searchString.includes(term);
            });
        }, [vehicles, searchTerm]); // Dependências que disparam o recálculo

    
    if (loading) {
        return <div className="loading-message">Carregando veículos disponíveis...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}. It wasn't to search a vehicle.</div>;
    }

    return (
        <div className="vehicle-listing-container">
            <h1>Vehicles on Sale</h1>

            {/* 🎯 INTEGRAÇÃO DA BARRA DE PESQUISA */}
            <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm} // Esta função atualiza o estado e dispara a filtragem via useMemo
                placeholder="Search by Mark, Model, Year..."
            />
            
            {/* Mensagem de Sem Resultados após a filtragem */}
            {filteredVehicles.length === 0 ? (
                 <div className="empty-message">
                    {searchTerm ? (
                        `Any vehicle is found: "${searchTerm}"`
                    ) : (
                        `Any vehicle is avaliable at the moment.`
                    )}
                 </div>
            ) : (
                <div className="car-cards-grid">
                    {/* Renderiza APENAS a lista FILTRADA */}
                    {filteredVehicles.map(vehicle => (
                        <CardVehicle 
                            key={vehicle.id} 
                            vehicle={vehicle} 
                            onBuyClick={onBuyClick} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default VehicleListing;