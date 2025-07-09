// Local de Instalação: src/hooks/useToolData.js
// VERSÃO FINAL E MAIS ROBUSTA

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export function useToolData(toolName, initialState) {
  const { user } = useAuth();
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // MUDANÇA PRINCIPAL: Não usamos mais .single()
      // Pedimos uma lista e depois verificamos se ela está vazia.
      const { data: remoteDataArray, error } = await supabase
        .from('user_tool_data')
        .select('data')
        .eq('user_id', user.id)
        .eq('tool_name', toolName);

      if (error) {
        // Se houver um erro real de banco de dados, nós o lançamos.
        throw error;
      }

      // Verificamos se a lista retornada tem algum item.
      if (remoteDataArray && remoteDataArray.length > 0) {
        // Se tiver, usamos os dados do primeiro item.
        setData(remoteDataArray[0].data);
      } else {
        // Se a lista estiver vazia, usamos os dados iniciais da ferramenta.
        setData(initialState);
      }
    } catch (err) {
      console.error(`Erro ao buscar dados para a ferramenta ${toolName}:`, err);
      toast.error(`Não foi possível carregar os dados de ${toolName}.`);
    } finally {
      setIsLoading(false);
    }
  }, [user, toolName, JSON.stringify(initialState)]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
        .upsert(
          {
            user_id: user.id,
            tool_name: toolName,
            data: currentData,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id, tool_name',
          }
        );

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