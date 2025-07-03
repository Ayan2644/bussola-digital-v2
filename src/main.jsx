// src/main.jsx (Código completo, final e com todas as rotas)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

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


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas de Autenticação com o Layout próprio */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/definir-senha" element={<DefinirSenha />} />
          </Route>

          {/* Rotas protegidas da Aplicação Principal com o Layout principal */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              {/* Redirecionamento da página inicial para o planejamento */}
              <Route index element={<Navigate to="/planejamento" replace />} />

              {/* AQUI ESTÃO TODAS AS SUAS ROTAS, AGORA COMPLETAS */}
              <Route path="planejamento" element={<Planejamento />} />
              <Route path="simulador" element={<Simulador />} />
              <Route path="sonar" element={<Sonar />} />
              <Route path="metricas-agendamento" element={<MetricasAgendamento />} />
              <Route path="cpa-maximo" element={<CPAMaximo />} />
              <Route path="analisador-ia" element={<AnalisadorIA />} />
              <Route path="conta" element={<Conta />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);