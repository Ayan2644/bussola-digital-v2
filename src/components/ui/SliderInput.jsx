// Local de Instalação: src/components/ui/SliderInput.jsx
// CÓDIGO COMPLETO E CORRIGIDO (sem a 'key' que causava o bug)

import React from 'react';

export default function SliderInput({ label, value, onChange, min, max, step, unit, flash = false }) {
    const formattedValue = unit === "R$" ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : `${value.toLocaleString('pt-BR')}${unit}`;
    
    // A 'key' foi removida desta div para garantir a fluidez do slider.
    // A animação agora é controlada apenas pela classe CSS condicional.
    return (
      <div 
        className={`bg-[#161616] p-5 rounded-xl border border-zinc-800 shadow-lg hover:shadow-[#ED195C]/30 transition duration-300 ${flash ? 'realtime-flash-animation' : ''}`}
      >
        <label className="text-sm text-zinc-300 font-medium">{label}</label>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))} 
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#ED195C] mt-2" 
        />
        <div className="text-right text-[#ED195C] font-bold text-lg mt-1">{formattedValue}</div>
      </div>
    );
}