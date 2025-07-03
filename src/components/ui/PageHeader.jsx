// src/components/ui/PageHeader.jsx

import React from 'react';

export default function PageHeader({ title, description }) {
  return (
    <div className="flex flex-col items-center text-center mb-10">
      {/* LOGO DESTACADA */}
      <img
        src="/logo-legiao.png"
        alt="Logo Legião"
        className="w-40 md:w-60 mb-6 drop-shadow-[0_0_20px_rgba(0,140,255,0.4)] transition duration-300"
      />

      {/* TÍTULO */}
      <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#008CFF] via-white to-[#ED195C] text-transparent bg-clip-text animate-pulse">
        {title}
      </h1>

      {/* DESCRIÇÃO */}
      <p className="text-zinc-400 text-sm md:text-base mt-3 max-w-2xl">
        {description}
      </p>
    </div>
  );
}
