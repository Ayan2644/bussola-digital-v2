// Local de Instalação: src/hooks/useToolData.js
// CÓDIGO ATUALIZADO: Adicionado um callback para notificar sobre atualizações em tempo real.

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Adicionamos um novo parâmetro: onRealtimeUpdate
export function useToolData(toolName, initialState, onRealtimeUpdate) {
  const { user } = useAuth();
  const [data, setData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  const stableInitialState = useRef(initialState);

  // Criamos uma referência para o callback para que ele não precise ser
  // uma dependência do useEffect, evitando recriações do listener.
  const onRealtimeUpdateRef = useRef(onRealtimeUpdate);
  useEffect(() => {
    onRealtimeUpdateRef.current = onRealtimeUpdate;
  }, [onRealtimeUpdate]);


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

  useEffect(() => {
    if (!user) return;

    let subscribedChannel = null;

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
              const newData = payload.new.data;
              setData(newData);

              // AQUI ESTÁ A MÁGICA:
              // Se a função de callback (onRealtimeUpdate) existir, nós a chamamos
              // passando os dados antigos e os novos para comparação.
              if (onRealtimeUpdateRef.current) {
                onRealtimeUpdateRef.current(data, newData);
              }
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

        subscribedChannel = channel;

    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (subscribedChannel) {
        console.log(`[Realtime] Desconectando do canal: ${subscribedChannel.topic}`);
        supabase.removeChannel(subscribedChannel);
      }
    };
  }, [user, toolName, data]); // Adicionamos 'data' aqui para ter acesso ao estado antigo no callback

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