// src/supabase.js (Código completo e atualizado)

import { createClient } from '@supabase/supabase-js'

// Lê a URL e a chave do Supabase a partir das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cria e exporta o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);