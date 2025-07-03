// Local de Instalação: src/hooks/useToolData.js
// CÓDIGO COMPLETO E ATUALIZADO

import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast'; // <- IMPORTANDO O TOAST

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
          .select('data')
          .eq('user_id', user.id)
          .eq('tool_name', toolName)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }
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
  }, [user, toolName]);

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

      // FEEDBACK DE SUCESSO
      toast.success('Dados salvos com sucesso!');
      setSaveStatus('success');
    } catch (err) {
      // FEEDBACK DE ERRO
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