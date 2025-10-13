// src/components/VehicleListing.jsx
import React, { useState, useEffect } from 'react';
import CardVehicle from './CardVehicle';

const API_BASE_URL = 'http://localhost:8000';

function VehicleListing() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/vehicle/`);
        
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setVehicles(data);
        
      } catch (err) {
        setError("Could not load the vehicle list. Please check the console for details.");
        console.error("Error fetching vehicles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) {
    return <div>Loading vehicles...</div>;
  }
  
  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>Error loading data: {error}</div>;
  }

  if (vehicles.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No vehicles found at the moment.</div>;
  }

  return (
    <div className="listing-container">
      <h1>Available Vehicles ({vehicles.length})</h1>
      
      {/* Grid container to display the vehicle cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        {vehicles.map(vehicle => (
          // Use a unique ID as the key. Assuming your DB column is 'id' or 'ID'.
          <CardVehicle key={vehicle.id || vehicle.ID} data={vehicle} /> 
        ))}
      </div>
    </div>
  );
}

export default VehicleListing;