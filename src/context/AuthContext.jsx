// Local de Instalação: src/context/AuthContext.jsx
// CÓDIGO FINAL E ESTABILIZADO PARA CORRIGIR O PROBLEMA DE MÚLTIPLAS ABAS

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Começa como true

    useEffect(() => {
        // Pega a sessão inicial para saber se o usuário já está logado
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false); // Termina o carregamento inicial AQUI e NUNCA MAIS
        });

        // O onAuthStateChange é a fonte da verdade para qualquer mudança
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                // Atualiza o estado do usuário. O React cuidará de re-renderizar o que for preciso.
                setUser(session?.user ?? null);

                // Lógica de redirecionamento que só precisa ser verificada quando o estado muda
                const urlHash = window.location.hash;
                if (_event === 'PASSWORD_RECOVERY' || (_event === 'SIGNED_IN' && urlHash.includes('type=invite'))) {
                    navigate('/definir-senha');
                }
            }
        );

        // Limpeza: remove o listener quando o componente AuthProvider é desmontado
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [navigate]); // navigate é estável, então este useEffect só roda uma vez

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const value = {
        user,
        handleLogout,
        loading,
        isLoggedIn: !!user,
    };

    // Renderiza o children apenas se não estiver no carregamento inicial.
    // Como `loading` agora é estável, isso não causará mais o problema de desmontar/remontar.
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};