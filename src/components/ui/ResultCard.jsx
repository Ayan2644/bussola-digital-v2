// src/components/ui/ResultCard.jsx
import React from 'react';

export default function ResultCard({ title, value, subtext }) {
    return (
      <div className="bg-[#151515] p-4 rounded-xl border border-zinc-800 hover:shadow-lg transition">
        <h2 className="text-sm text-[#008CFF] mb-1 font-medium">{title}</h2>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
      </div>
    );
}
