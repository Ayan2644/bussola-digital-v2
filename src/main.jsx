// Local de Instalação: src/main.jsx
// CÓDIGO COMPLETO E CORRIGIDO COM CODE SPLITTING

import React, { lazy, Suspense } from 'react'; // Passo 1: Importar lazy e Suspense
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
import { LoaderCircle } from 'lucide-react';

// Passo 2: Alterar a importação das páginas para usar React.lazy
const Login = lazy(() => import('./pages/Login'));
const EsqueciSenha = lazy(() => import('./pages/EsqueciSenha'));
const DefinirSenha = lazy(() => import('./pages/DefinirSenha'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Planejamento = lazy(() => import('./pages/Planejamento'));
const Simulador = lazy(() => import('./pages/Simulador'));
const Sonar = lazy(() => import('./pages/Sonar'));
const MetricasAgendamento = lazy(() => import('./pages/MetricasAgendamento'));
const CPAMaximo = lazy(() => import('./pages/CPAMaximo'));
const AnalisadorIA = lazy(() => import('./pages/AnalisadorIA'));
const Conta = lazy(() => import('./pages/Conta'));
const DiarioDeBordo = lazy(() => import('./pages/DiarioDeBordo'));

// Componente de Carregamento (Fallback)
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen bg-[#0f0f0f] text-white">
    <LoaderCircle className="animate-spin text-legiao-blue" size={32} />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ /* ... */ }} />
        {/* Passo 3: Envolver as rotas com o componente Suspense */}
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);