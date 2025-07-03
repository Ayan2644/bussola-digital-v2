// src/components/ui/SliderInput.jsx
import React from 'react';

export default function SliderInput({ label, value, onChange, min, max, step, unit }) {
    return (
      <div className="bg-[#161616] p-5 rounded-xl border border-zinc-800 shadow-md hover:shadow-[#008cff40] transition">
        <label className="text-sm text-zinc-300">{label}</label>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-[#008CFF] mt-2"
        />
        <div className="text-right text-cyan-400 font-bold text-lg">
          {value.toLocaleString('pt-BR')}
          <span className="text-sm text-zinc-400 font-normal ml-1">{unit}</span>
        </div>
      </div>
    );
}
