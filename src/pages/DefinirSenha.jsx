// src/pages/DefinirSenha.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function DefinirSenha() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Esta função verifica se há um erro na URL, o que pode acontecer
    // se o link de recuperação de senha tiver expirado.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Se o usuário já está logado e chegou aqui, talvez seja melhor redirecioná-lo.
        // Mas vamos focar no fluxo de reset.
      } else {
         const hash = window.location.hash;
         if (hash.includes('error_code=401')) {
            setError("O link de recuperação de senha expirou. Por favor, peça um novo.");
         }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Senha atualizada com sucesso! A redirecionar para o login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-2 text-gradient">
        Definir Nova Senha
      </h1>
      <p className="text-center text-zinc-400 text-sm mb-6">
        Insira a sua nova senha abaixo.
      </p>

      <form onSubmit={handleSetPassword} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input w-full"
          placeholder="••••••••••"
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="text-green-500 text-sm text-center">{message}</p>}
        <button type="submit" className="btn-legiao w-full" disabled={loading}>
          {loading ? 'Aguarde...' : 'Salvar Nova Senha'}
        </button>
      </form>
    </>
  );
}