// src/components/VehicleRegistration.jsx
import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

const initialVehicleState = {
    mark: '',
    model: '',
    year: '',
    mileage: 0,
    price: 0.0,
    fuel_type: 'Gasoline', 
    color: '',
    status: 'Used', 
    description: '',
};

/**
 * Formulário de registro de veículos.
 * @param {function} onSuccess - Callback chamado após o registro bem-sucedido.
 * @param {number} sellerId - O ID do vendedor (Chave Estrangeira).
 */
function VehicleRegistration({ onSuccess, sellerId }) {
    const [vehicleData, setVehicleData] = useState(initialVehicleState);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        const finalValue = type === 'number' ? (name === 'mileage' ? parseInt(value) : parseFloat(value)) : value;
        
        setVehicleData({ ...vehicleData, [name]: finalValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        // 🌟 CORREÇÃO CRÍTICA: Impedir envio se o ID do vendedor estiver faltando
        if (!sellerId) {
            setError("Fatal Error: Missing Seller ID. Please go back to the registration page.");
            setLoading(false);
            return;
        }

        try {
            // 🌟 CORREÇÃO: Montar o objeto final com o Seller_ID para o backend
            const dataToSend = {
                ...vehicleData,
                seller_id: sellerId // Anexando a chave estrangeira
            };
            
            const response = await fetch(`${API_BASE_URL}/vehicle/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend), 
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || 'Unknown vehicle registration failure.');
            }

            setMessage(responseData.Message || 'Vehicle successfully registered!');
            setVehicleData(initialVehicleState); // Limpa o formulário
                
            if (onSuccess) {
                // Este onSuccess agora será o handleVehicleRegistrationComplete do App.jsx,
                // que apenas navega, sem alert().
                onSuccess(); 
            }


        } catch (err) {
            setError(`Registration Error: ${err.message || 'Check your network connection.'}`);
            console.error('Vehicle registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <h3>List Your Vehicle</h3>
            
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                {/* Campos do Formulário (Marca, Modelo, etc.) - Omitted for brevity, but they are here */}
                <input type="text" name="mark" placeholder="Mark" value={vehicleData.mark} onChange={handleChange} required />
                <input type="text" name="model" placeholder="Model" value={vehicleData.model} onChange={handleChange} required />
                <input type="text" name="year" placeholder="Year" value={vehicleData.year} onChange={handleChange} required />
                <input type="number" name="mileage" placeholder="Mileage (km)" value={vehicleData.mileage} onChange={handleChange} required min="0" />
                <input type="number" name="price" placeholder="Price (R$)" value={vehicleData.price} onChange={handleChange} required min="0" step="0.01" />
                <input type="text" name="color" placeholder="Color" value={vehicleData.color} onChange={handleChange} required />
                
                <select name="fuel_type" value={vehicleData.fuel_type} onChange={handleChange} required>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Ethanol">Ethanol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                </select>
                
                <select name="status" value={vehicleData.status} onChange={handleChange} required>
                    <option value="Used">Used</option>
                    <option value="Semi-new">Semi-new</option>
                    <option value="New">New</option>
                </select>

                <textarea 
                    name="description" 
                    placeholder="Description (Optional)" 
                    value={vehicleData.description} 
                    onChange={handleChange} 
                    style={{ gridColumn: 'span 2' }}
                />

                <button type="submit" disabled={loading} style={{ gridColumn: 'span 2' }}>
                    {loading ? 'Registering Vehicle...' : 'List Car for Sale'}
                </button>
            </form>
        </div>
    );
}

export default VehicleRegistration;