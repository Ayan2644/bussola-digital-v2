// Local de Instalação: src/components/ui/DropdownInput.jsx
// CÓDIGO COMPLETO DO NOVO COMPONENTE

import React from 'react';

export default function DropdownInput({ options, selected, onChange }) {
    return (
         <select 
            value={selected} 
            onChange={(e) => onChange(e.target.value)} 
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-[#008CFF] outline-none"
        >
            {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
    )
}