// src/context/AuthContext.jsx (Código completo e ATUALIZADO)

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor do Contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verifica a sessão do usuário quando o app carrega
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session ? session.user : null);
            setLoading(false);
        };

        getSession();

        // Escuta por mudanças no estado de autenticação (login, logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session ? session.user : null);
                setLoading(false);
            }
        );

        // Limpa o listener quando o componente é desmontado
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Função de logout que será disponibilizada globalmente
    const handleLogout = async () => {
        await supabase.auth.signOut();
        // A navegação será tratada pelo ProtectedRoute
    };

    const value = {
        user,
        handleLogout,
        loading, // Exporta o estado de loading
        isLoggedIn: !!user,
    };

    // Renderiza o children (seu app)
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Cria um hook customizado para usar o contexto mais facilmente
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};