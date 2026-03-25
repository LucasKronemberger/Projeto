import React from 'react';
import { supabase } from '../supabaseClient'; // Importe o cliente do supabase

const CarCard = ({ car, onUpdate }) => {
  const isOpportunity = car.roi > 15;

  const toggleFavorite = async () => {
    const { error } = await supabase
      .from('cars')
      .update({ favorite: !car.favorite })
      .eq('id', car.id);

    if (error) console.error("Erro ao favoritar:", error);
    else if (onUpdate) onUpdate(); // Avisa o App.jsx para recarregar os dados
  };

  return (
    <div className="car-card">
      <div style={{ position: 'relative' }}>
        <img src={car.image_url} alt={car.model} className="car-image" />
        <button 
          onClick={toggleFavorite}
          className="btn-favorite"
          style={{ color: car.favorite ? '#f6e05e' : '#cbd5e0' }}
        >
          {car.favorite ? '★' : '☆'}
        </button>
      </div>
      
      <div className="car-info">
        <p className="car-title">{car.model} ({car.year})</p>
        <p className="car-price">R$ {car.price?.toLocaleString('pt-BR')}</p>
        <div className="roi-badge" style={{ backgroundColor: isOpportunity ? '#c6f6d5' : '#feebc8', color: isOpportunity ? '#22543d' : '#744210' }}>
          ROI: {car.roi}%
        </div>
        <a href={car.source_url} target="_blank" rel="noreferrer" className="btn-view">
          Ver Anúncio
        </a>
      </div>
    </div>
  );
};

export default CarCard;