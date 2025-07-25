import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

// 1. Cria o Contexto
const AuthContext = createContext();

// Componente Wrapper para que possamos usar o hook useNavigate
const AuthProviderWrapper = ({ children }) => {
    const navigate = useNavigate();
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

        // Escuta por mudanças no estado de autenticação (login, logout, etc.)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session ? session.user : null);
                setLoading(false);

                // ***** INÍCIO DA NOVA LÓGICA *****
                // Se o usuário acabou de fazer login E a URL contém 'type=invite',
                // significa que ele veio de um link de convite.
                const urlHash = window.location.hash;
                if (_event === 'SIGNED_IN' && urlHash.includes('type=invite')) {
                    // Nós o redirecionamos para a página de definir senha.
                    navigate('/definir-senha');
                }
                // ***** FIM DA NOVA LÓGICA *****
            }
        );

        // Limpa o listener quando o componente é desmontado
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [navigate]); // Adicionamos navigate como dependência

    // Função de logout que será disponibilizada globalmente
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login'); // Adicionado para garantir o redirecionamento no logout
    };

    const value = {
        user,
        handleLogout,
        loading,
        isLoggedIn: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


// 2. Cria o Provedor do Contexto
export const AuthProvider = ({ children }) => {
    // Nós envolvemos o provedor real com um componente que tem acesso ao router
    // para que possamos usar o hook useNavigate.
    return (
        <AuthProviderWrapper>
            {children}
        </AuthProviderWrapper>
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