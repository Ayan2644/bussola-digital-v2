// src/components/ProtectedRoute.jsx (Código completo)

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Se ainda estiver a verificar o utilizador, pode mostrar uma mensagem de carregamento
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-[#0f0f0f] text-white">
            Carregando...
        </div>
    );
  }

  // Se não houver utilizador logado (e já não estiver a carregar), redireciona para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o utilizador estiver logado, permite o acesso à página solicitada (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;