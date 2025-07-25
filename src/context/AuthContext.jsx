// src/context/AuthContext.jsx (Código definitivo com verificação contínua)

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

const AuthProviderWrapper = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Função central de segurança
    const validateAndSetUser = useCallback(async (session) => {
        if (!session?.user) {
            setUser(null);
            return;
        }

        // SEMPRE vamos buscar os dados mais recentes do utilizador
        const { data: { user: freshUser }, error } = await supabase.auth.getUser();

        if (error || !freshUser) {
            await supabase.auth.signOut();
            setUser(null);
            return;
        }

        const subscriptionStatus = freshUser.user_metadata?.subscription_status;

        if (subscriptionStatus === 'inactive') {
            await supabase.auth.signOut();
            setUser(null);
            navigate('/login');
            toast.error("O seu acesso foi revogado.");
        } else {
            setUser(freshUser);
        }
    }, [navigate]);


    useEffect(() => {
        // Verificação inicial ao carregar a aplicação
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            await validateAndSetUser(session);
            setLoading(false);
        };
        getInitialSession();

        // Listener para eventos de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                await validateAndSetUser(session);
                setLoading(false);

                const urlHash = window.location.hash;
                if (_event === 'SIGNED_IN' && urlHash.includes('type=invite')) {
                    navigate('/definir-senha');
                } else if (_event === 'PASSWORD_RECOVERY') {
                    navigate('/definir-senha');
                }
            }
        );
        
        // O "SEGURANÇA A FAZER A RONDA" (a cada 5 minutos)
        const interval = setInterval(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await validateAndSetUser(session);
            }
        }, 300000); // 300000 ms = 5 minutos

        // Limpeza ao desmontar
        return () => {
            authListener?.subscription.unsubscribe();
            clearInterval(interval);
        };
    }, [validateAndSetUser, navigate]);


    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const value = { user, handleLogout, loading, isLoggedIn: !!user };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};


export const AuthProvider = ({ children }) => (
    <AuthProviderWrapper>{children}</AuthProviderWrapper>
);


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};