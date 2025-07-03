// src/components/AuthLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4">
      <img
          src="/logo-legiao.png"
          alt="Logo Legião"
          className="w-40 md:w-60 mb-6 drop-shadow-[0_0_20px_rgba(0,140,255,0.4)]"
      />
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-800">
        {/* As páginas de Login, Esqueci Senha, etc., serão renderizadas aqui dentro */}
        <Outlet />
      </div>
    </div>
  );
}