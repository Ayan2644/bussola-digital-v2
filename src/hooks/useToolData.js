// Local de Instalação: src/hooks/useToolData.js
// CÓDIGO COMPLETO E CORRIGIDO

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export function useToolData(toolName, initialState) {
  const { user } = useAuth();
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: remoteData, error } = await supabase
          .from('user_tool_data')
          // CORREÇÃO AQUI: Mudamos de .select('data') para .select('*')
          // para garantir que a resposta da API seja sempre um objeto completo.
          .select('*')
          .eq('user_id', user.id)
          .eq('tool_name', toolName)
          .single();

        // Este código de erro (PGRST116) significa "zero linhas retornadas", o que não é um erro real.
        // Apenas significa que o usuário nunca salvou dados para esta ferramenta.
        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Se encontramos dados remotos, usamos eles para definir o estado.
        if (remoteData && remoteData.data) {
          setData(remoteData.data);
        }
      } catch (err) {
        console.error(`Erro ao buscar dados para a ferramenta ${toolName}:`, err);
        // Notifica o usuário apenas se for um erro inesperado.
        if (err.code !== 'PGRST116') {
          toast.error(`Não foi possível carregar os dados de ${toolName}.`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [user, toolName]);

  const saveData = async (currentData) => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar.");
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const { error } = await supabase
        .from('user_tool_data')
        .upsert({
          user_id: user.id,
          tool_name: toolName,
          data: currentData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, tool_name' });

      if (error) throw error;

      toast.success('Dados salvos com sucesso!');
      setSaveStatus('success');
    } catch (err) {
      toast.error('Ocorreu um erro ao salvar os dados.');
      setSaveStatus('error');
      console.error(`Erro ao salvar dados para a ferramenta ${toolName}:`, err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  return { data, setData, isLoading, isSaving, saveStatus, saveData };
}