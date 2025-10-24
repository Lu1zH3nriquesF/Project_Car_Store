    // src/components/CardVehicle.jsx
    import React from 'react';

    /**
     * Componente que exibe um único cartão de veículo e o botão de compra.
     * @param {object} vehicle - O objeto de dados do veículo (com as chaves do DB/JSON).
     * @param {function} onBuyClick - Função de callback do App.jsx para iniciar o checkout.
     */
    const CardVehicle = ({ vehicle, onBuyClick }) => {
        
        // 🎯 CRÍTICO: Desestruturar usando os nomes EXATOS das chaves JSON retornadas pelo FastAPI
        const { 
            id, 
            Mark, 
            Model, 
            Year, 
            Price, 
            Inventory_Status 
        } = vehicle;
        
        // Converte o preço para um número com duas casas decimais
        const formattedPrice = Price ? parseFloat(Price).toFixed(2) : 'N/A';
        
        // Verifica a disponibilidade (usa a chave e o valor exatos do DB)
        const isAvailable = Inventory_Status === 'Available';

        const handleBuy = () => {
            if (!isAvailable) {
                alert("This vehicle isn't available to shooping.");
                return;
            }
            
            const confirmed = window.confirm(`Confirm: Buy ${Mark} ${Model} by R$ ${formattedPrice}?`);
            if (confirmed) {
                // Chama a função passada pelo App.jsx, enviando o objeto completo do veículo
                onBuyClick(vehicle); 
            }
        };

        return (
            <div className={`card-vehicle ${isAvailable ? '' : 'sold'}`}>
                <h3 className="card-title">{Mark} {Model} ({Year})</h3>
                
                <p className="card-price">Price: <strong>R$ {formattedPrice}</strong></p>
                <p className="card-id">ID: {id}</p>
                
                <div className="card-status">
                    Status: 
                    <span className={isAvailable ? 'status-available' : 'status-sold'}>
                        {isAvailable ? 'Available' : 'Sold'}
                    </span>
                </div>

                <button 
                    onClick={handleBuy} 
                    disabled={!isAvailable}
                    className={`buy-button ${isAvailable ? '' : 'disabled'}`}
                >
                    {isAvailable ? 'Buy Now' : 'Sold'}
                </button>
            </div>
        );
    };

    export default CardVehicle;