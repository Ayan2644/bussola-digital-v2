// src/pages/Login.jsx (Versão final com a nova copy)

import { useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TEXTO ATUALIZADO AQUI */}
      <h1 className="text-3xl font-bold text-center mb-2 text-gradient">
        Acessar a Bússola
      </h1>
      <p className="text-center text-zinc-400 text-sm mb-6">
        Faça login para comandar suas métricas.
      </p>
      {/* FIM DO TEXTO ATUALIZADO */}

      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input w-full" placeholder="seu@email.com" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input w-full" placeholder="••••••••••" required />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button type="submit" className="btn-legiao w-full" disabled={loading}>
          {loading ? 'Aguarde...' : 'Entrar'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link to="/esqueci-senha" className="text-sm text-zinc-400 hover:text-white hover:underline">
          Esqueceu a sua senha?
        </Link>
      </div>
    </>
  );
}