// src/pages/EsqueciSenha.jsx

import { useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/definir-senha`,
      });
      if (error) throw error;
      setMessage('Email de recuperação enviado! Verifique a sua caixa de entrada.');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-2 text-gradient">
        Recuperar Senha
      </h1>
      <p className="text-center text-zinc-400 text-sm mb-6">
        Insira o seu email para receber um link de recuperação.
      </p>

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input w-full"
          placeholder="seu@email.com"
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}
        <button type="submit" className="btn-legiao w-full" disabled={loading}>
          {loading ? 'Aguarde...' : 'Enviar Link de Recuperação'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-zinc-400 hover:text-white hover:underline">
          Voltar para o Login
        </Link>
      </div>
    </>
  );
}