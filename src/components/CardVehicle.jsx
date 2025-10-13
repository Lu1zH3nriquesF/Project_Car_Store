// src/components/CardVehicle.jsx
import React from 'react';

// Receives vehicle data as 'data' prop
const CardVehicle = ({ data }) => {
    // Destructuring fields using the backend's casing (Initial Capitalization)
    const { 
        Mark, 
        Model, 
        Year, 
        Price, 
        Mileage, 
        Fuel_type, 
        Color, 
        Status, 
        description // 'description' is lowercase in your DB query
    } = data;

    return (
        <div className="vehicle-card">
            <h2>{Mark} {Model} ({Year})</h2>
            
            <div className="details">
                {/* Formatting price for locale currency */}
                <p><strong>Price:</strong> US$ {Price ? Price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'N/A'}</p>
                <p><strong>Mileage:</strong> {Mileage} miles</p>
                <p><strong>Fuel Type:</strong> {Fuel_type}</p>
                <p><strong>Color:</strong> {Color}</p>
                <p><strong>Status:</strong> {Status}</p>
            </div>
            
            {description && (
                <p className="description">
                    <strong>Description:</strong> {description}
                </p>
            )}
        </div>
    );
};

export default CardVehicle;