// Local de Instalação: src/main.jsx
// CÓDIGO COMPLETO E ATUALIZADO

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

// Páginas de Autenticação
import Login from './pages/Login';
import EsqueciSenha from './pages/EsqueciSenha';
import DefinirSenha from './pages/DefinirSenha';

// Páginas das Ferramentas da Aplicação
import Planejamento from './pages/Planejamento';
import Simulador from './pages/Simulador';
import Sonar from './pages/Sonar';
import MetricasAgendamento from './pages/MetricasAgendamento';
import CPAMaximo from './pages/CPAMaximo';
import AnalisadorIA from './pages/AnalisadorIA';
import Conta from './pages/Conta';
import DiarioDeBordo from './pages/DiarioDeBordo'; // <- IMPORTAR NOVA PÁGINA

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ /* ... */ }} />
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/definir-senha" element={<DefinirSenha />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/planejamento" replace />} />
              <Route path="planejamento" element={<Planejamento />} />
              <Route path="simulador" element={<Simulador />} />
              <Route path="sonar" element={<Sonar />} />
              <Route path="metricas-agendamento" element={<MetricasAgendamento />} />
              <Route path="cpa-maximo" element={<CPAMaximo />} />
              <Route path="analisador-ia" element={<AnalisadorIA />} />
              <Route path="conta" element={<Conta />} />
              <Route path="diario-de-bordo" element={<DiarioDeBordo />} /> {/* <- ADICIONAR NOVA ROTA */}
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);