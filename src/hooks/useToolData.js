// Local de Instalação: src/hooks/useToolData.js
// VERSÃO FINAL, ESTABILIZADA E COM OTIMIZAÇÃO DE CONSOLE

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export function useToolData(toolName, initialState) {
  const { user } = useAuth();
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  // Usamos useRef para ter uma referência estável do estado inicial
  const stableInitialState = useRef(initialState);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setData(stableInitialState.current);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: remoteDataArray, error } = await supabase
        .from('user_tool_data')
        .select('data')
        .eq('user_id', user.id)
        .eq('tool_name', toolName)
        .limit(1);

      if (error) throw error;

      if (remoteDataArray && remoteDataArray.length > 0) {
        setData(remoteDataArray[0].data);
      } else {
        setData(stableInitialState.current);
      }
    } catch (err) {
      console.error(`Erro ao buscar dados para a ferramenta ${toolName}:`, err);
      toast.error(`Não foi possível carregar os dados de ${toolName}.`);
      setData(stableInitialState.current);
    } finally {
      setIsLoading(false);
    }
  }, [user, toolName]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // EFEITO PARA OUVIR MUDANÇAS EM TEMPO REAL COM OTIMIZAÇÃO
  useEffect(() => {
    if (!user) return;

    let subscribedChannel = null;

    // Adicionamos um pequeno delay para evitar condições de corrida durante a navegação
    const timeoutId = setTimeout(() => {
        const channelId = `tool-${toolName}-${user.id}`;
        const channel = supabase.channel(channelId, {
          config: { broadcast: { ack: true } },
        });

        channel.on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_tool_data',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new?.tool_name === toolName) {
              console.log(`[Realtime] Atualização recebida para ${toolName}`);
              setData(payload.new.data);
            }
          }
        );

        channel.subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[Realtime] Conectado ao canal: ${channelId}`);
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`[Realtime] Problema no canal ${channelId}:`, err || 'Timeout');
          }
        });

        // Guardamos o canal para poder desconectar na limpeza
        subscribedChannel = channel;

    }, 100); // Delay de 100ms

    // Função de limpeza
    return () => {
      clearTimeout(timeoutId); // Limpa o timeout se o componente desmontar antes
      if (subscribedChannel) {
        console.log(`[Realtime] Desconectando do canal: ${subscribedChannel.topic}`);
        supabase.removeChannel(subscribedChannel);
      }
    };
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
        .upsert(
          {
            user_id: user.id,
            tool_name: toolName,
            data: currentData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, tool_name' }
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