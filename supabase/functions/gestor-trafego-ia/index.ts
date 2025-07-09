// Local de Instalação: supabase/functions/gestor-trafego-ia/index.ts
// CÓDIGO FINAL COM O NOME DO MODELO CORRIGIDO

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const knowledgeBase = `
Sobre o orçamento de campanha Advantage: O Orçamento de Campanha Advantage é mais adequado para campanhas com pelo menos dois conjuntos de anúncios. Ele gerencia automaticamente o orçamento da campanha em conjuntos de anúncios a fim de oferecer os melhores resultados gerais, distribuindo continuamente em tempo real para os conjuntos de anúncios com as melhores oportunidades.
Sobre orçamentos diários: O valor médio que você deseja gastar por dia. A Meta pode gastar até 75% acima do seu orçamento diário em alguns dias, mas não gastará mais do que sete vezes seu orçamento diário em uma semana (domingo a sábado).
Fase de aprendizado: É o período em que o sistema de veiculação ainda precisa aprender como um conjunto de anúncios pode ser veiculado. O desempenho é menos estável e o CPA geralmente é mais alto. Um conjunto de anúncios sai da fase de aprendizado após cerca de 50 eventos de otimização na semana após a última edição significativa.
Edições significativas: Qualquer alteração no direcionamento, criativo, evento de otimização, adicionar um novo anúncio, ou pausar por mais de 7 dias reinicia a fase de aprendizado. Grandes alterações no orçamento ou lance também podem reiniciar a fase.
Aprendizado limitado: Ocorre quando um conjunto de anúncios não está recebendo eventos de otimização suficientes para sair da fase de aprendizado, geralmente devido ao público pequeno, orçamento baixo, ou controle de lance/custo muito restritivo.
Estratégias de lance: Volume mais alto (gastar o orçamento para obter o máximo de resultados), Meta de custo por resultado (manter o CPA em torno de um valor), Meta de ROAS (manter o retorno em torno de um valor), e Limite de lance (controle manual máximo).
`;

const masterPrompt = `
Você é o "Gestor de Tráfego Sênior", um especialista supremo em Facebook Ads.

🧠 Contexto:
Seu QI é 180. Você é brutalmente honesto, direto e orientado a performance.
Você já gerenciou e escalou múltiplas contas com milhões investidos e construiu empresas bilionárias a partir de campanhas de aquisição.
Você domina o ecossistema da Meta, pensando em sistemas, ciclos e alavancas.
Você é um grande analisador de canibalização de tráfego e entende os momentos ideais para escala vertical e horizontal.
Sua principal fonte de conhecimento técnico sobre a plataforma Meta Ads é a base de conhecimento fornecida. Use-a para embasar suas análises.

🎯 Sua missão é:
Analisar os dados da campanha que fornecerei.
Diagnosticar os erros e gargalos mais críticos com base nos dados e na sua base de conhecimento.
Propor um plano de otimização com foco em alavancagem máxima.
Reestruturar campanhas, conjuntos e anúncios se necessário.
Analisar padrões históricos de campanha e otimizar com base em CPA, CPC e CTR.

Você sempre entrega a sua análise na seguinte estrutura:
1.  **ANÁLISE GERAL:** Um diagnóstico honesto da situação atual.
2.  **CLASSIFICAÇÃO DE CAMPANHAS:** Classifique cada campanha/criativo como ✅ Verde (Escalar), 🟡 Amarelo (Testar/Otimizar) ou ❌ Vermelho (Descartar), explicando o porquê com base nos dados.
3.  **PLANO DE AÇÃO DETALHADO:** Um passo a passo claro do que eu devo executar nas próximas 24h. Inclua sugestões de estrutura (ex: 1-2-1), público, criativos e orçamento.
4.  **DIRETRIZ FINAL:** Uma recomendação final e uma pergunta estratégica para me forçar a pensar no próximo nível, como um amigo e parceiro de negócios.

Agora, aguarde os dados da campanha do usuário para analisá-los.
`;


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { campaignData } = await req.json()

    if (!campaignData || typeof campaignData !== 'string' || campaignData.length > 10000) {
      return new Response(JSON.stringify({ error: 'Dados da campanha inválidos ou excedem o limite de 10.000 caracteres.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'Chave da API do Gemini não configurada nos secrets do projeto.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ***** INÍCIO DA CORREÇÃO *****
    // Alteramos 'gemini-pro' para 'gemini-1.5-flash-latest' que é um modelo mais recente e suportado.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`
    // ***** FIM DA CORREÇÃO *****

    const chatHistory = [
        { role: 'user', parts: [{ text: masterPrompt }] },
        { role: 'model', parts: [{ text: 'Entendido. Estou pronto para atuar.' }] },
        { role: 'user', parts: [{ text: `Use o seguinte documento como sua base de conhecimento: \n\n${knowledgeBase}` }] },
        { role: 'model', parts: [{ text: 'Base de conhecimento integrada. Pode enviar os dados.' }] },
        { role: 'user', parts: [{ text: `Excelente. Aqui estão os dados para análise:\n\n${campaignData}` }] }
    ];

    const payload = {
        contents: chatHistory,
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
    };

    const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text();
        console.error('Erro da API do Gemini:', errorBody); 
        return new Response(JSON.stringify({ error: `Erro na API do Gemini: ${errorBody}` }), {
            status: geminiResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const result = await geminiResponse.json();
    const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível obter uma análise.";

    return new Response(
      JSON.stringify({ analysis: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Erro inesperado na função:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})