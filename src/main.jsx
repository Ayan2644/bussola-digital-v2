// Local de Instalação: src/main.jsx
// CÓDIGO FINAL E CORRIGIDO

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { Toaster } from 'react-hot-toast';

// Contexto e Rota Protegida
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';

// Páginas
import Login from './pages/Login';
import EsqueciSenha from './pages/EsqueciSenha';
import DefinirSenha from './pages/DefinirSenha';
import Dashboard from './pages/Dashboard';
import Planejamento from './pages/Planejamento';
import Simulador from './pages/Simulador';
import Sonar from './pages/Sonar';
import MetricasAgendamento from './pages/MetricasAgendamento';
import CPAMaximo from './pages/CPAMaximo';
import AnalisadorIA from './pages/AnalisadorIA';
import Conta from './pages/Conta';
import DiarioDeBordo from './pages/DiarioDeBordo';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ /* ... */ }} />
        <Routes>
          {/* Rotas de Autenticação (públicas) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/definir-senha" element={<DefinirSenha />} />
          </Route>

          {/* Rotas Protegidas (dentro da aplicação) */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="planejamento" element={<Planejamento />} />
              <Route path="simulador" element={<Simulador />} />
              <Route path="sonar" element={<Sonar />} />
              <Route path="metricas-agendamento" element={<MetricasAgendamento />} />
              <Route path="cpa-maximo" element={<CPAMaximo />} />
              <Route path="analisador-ia" element={<AnalisadorIA />} />
              <Route path="conta" element={<Conta />} />
              <Route path="diario-de-bordo" element={<DiarioDeBordo />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);