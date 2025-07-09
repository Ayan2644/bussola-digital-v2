// Local de Instalação: src/components/ui/LabeledSlider.jsx
// CÓDIGO COMPLETO DO NOVO COMPONENTE

import React from 'react';

export default function LabeledSlider({ label, value, onChange, min, max, step, format, color = 'blue' }) {
    const accentColor = color === 'blue' ? 'accent-[#008CFF]' : 'accent-[#ED195C]';
    const textColor = color === 'blue' ? 'text-[#008CFF]' : 'text-[#ED195C]';
    
    return (
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <label htmlFor={label} className="text-sm text-zinc-300">{label}</label>
          <span className={`font-bold text-lg ${textColor}`}>{format(value)}</span>
        </div>
        <input 
            id={label} 
            type="range" 
            min={min} 
            max={max} 
            step={step} 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))} 
            className={`w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer ${accentColor}`} 
        />
      </div>
    );
}