// Local: src/hooks/useToolData.js

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Atualize o caminho do import
import { useAuth } from '../context/AuthContext';

export function useToolData(toolName, initialState) {
  const { user } = useAuth();
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'success', 'error'

  // Efeito para buscar os dados quando o componente monta
  useEffect(() => {
    // Não faz nada se ainda não tivermos o usuário
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: remoteData, error } = await supabase
          .from('user_tool_data')
          .select('data')
          .eq('user_id', user.id)
          .eq('tool_name', toolName)
          .single();

        // Código 'PGRST116' significa que nenhuma linha foi encontrada, o que é normal na primeira vez.
        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Se encontramos dados, atualizamos o estado local.
        if (remoteData) {
          setData(remoteData.data);
        }
      } catch (err) {
        console.error(`Erro ao buscar dados para a ferramenta ${toolName}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, toolName]); // Roda novamente se o usuário ou a ferramenta mudar

  // Função para salvar os dados
  const saveData = async (currentData) => {
    if (!user) return;

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
      setSaveStatus('success');
    } catch (err) {
      setSaveStatus('error');
      console.error(`Erro ao salvar dados para a ferramenta ${toolName}:`, err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  return { data, setData, isLoading, isSaving, saveStatus, saveData };
}