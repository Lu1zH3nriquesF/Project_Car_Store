// src/components/Checkout.jsx
import React, { useState } from 'react';

const CHECKOUT_API = 'http://localhost:8000/api/vendas/checkout'; // A URL do seu endpoint de venda

/**
 * Componente de Checkout para finalizar a compra de um veículo.
 * @param {object} vehicleData - O objeto do veículo selecionado (retornado do FastAPI).
 * @param {number} clienteId - O ID do usuário logado (cliente).
 * @param {function} onSuccess - Callback chamado após sucesso na transação.
 * @param {function} onCancel - Callback chamado após o cancelamento.
 */
const Checkout = ({ vehicleData, clienteId, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🎯 CRÍTICO: Garantir que os dados essenciais estão presentes
    if (!vehicleData || !clienteId) {
        return (
            <div className="checkout-container">
                <h1 className="error-message">Checkout Error: Incomplet informations.</h1>
                <button onClick={onCancel} className="btn-cancel">Back to listing</button>
            </div>
        );
    }
    
    // Desestruturação dos dados do veículo para uso local
    // Use as chaves EXATAS retornadas pelo FastAPI (ex: Mark, Price, id)
    const { 
        id: car_id, 
        Mark, 
        Model, 
        Year, 
        Price: total_value 
    } = vehicleData;
    
    // Formatações
    const formattedPrice = parseFloat(total_value).toFixed(2);

    const handleConfirmPurchase = async () => {
        setLoading(true);
        setError(null);

        // Objeto que a API do FastAPI espera (modelo SellsIn)
        const sellData = {
            client_id: clienteId,
            car_id: car_id, // Usamos o id do veículo
            total_value: parseFloat(total_value), // Envia o valor como número
        };

        try {
            const response = await fetch(CHECKOUT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sellData),
            });

            const result = await response.json();

            if (response.ok) {
                // Sucesso na transação
                alert(`Congradulations! You bought the ${Mark} ${Model}.\nSell ID: ${result.Sell_id}`);
                onSuccess(); // Volta para a listagem (e recarrega)

            } else {
                // Erros de API (400, 404, 500, etc.)
                const errorMessage = result.detail || "Unknown error with the transation.";
                setError(errorMessage);
                alert(`Fail with the shopping: ${errorMessage}`);
            }
        } catch (err) {
            // Erros de Rede/Servidor
            setError("Erro de conexão com a API de vendas.");
            console.error("Erro no fetch de checkout:", err);
            alert("Erro de conexão com o servidor. Verifique se o FastAPI está rodando.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-container">
            <h1>Confirmação de Compra</h1>
            
            <div className="summary-card">
                <h2>Detalhes do Veículo</h2>
                <p><strong>Carro:</strong> {Mark} {Model} ({Year})</p>
                <p><strong>ID do Veículo:</strong> {car_id}</p>
                <p className="price-label">Valor Total:</p>
                <p className="final-price">R$ {formattedPrice}</p>
                <p><strong>Seu ID de Cliente:</strong> {clienteId}</p>
            </div>

            {error && <div className="transaction-error">Erro: {error}</div>}
            
            <div className="checkout-actions">
                <button 
                    onClick={handleConfirmPurchase} 
                    disabled={loading}
                    className="btn-confirm-buy"
                >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
                
                <button 
                    onClick={onCancel} 
                    disabled={loading}
                    className="btn-cancel"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default Checkout;