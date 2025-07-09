// Local de Instalação: src/pages/Conta.jsx
// CÓDIGO COMPLETO E ATUALIZADO COM MELHOR FEEDBACK DE UX

import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import InfoCard from '../components/ui/InfoCard';
import { User, Shield, Gem, LogOut, Camera, KeyRound, AlertTriangle, Check, LoaderCircle } from 'lucide-react';

const NavLink = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
            isActive
                ? "bg-gradient-to-r from-[#008CFF] to-[#ED195C] text-white shadow-lg"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
        }`}
    >
        <Icon className="w-5 h-5 mr-3" />
        {label}
    </button>
);

const TextInput = ({ label, type = "text", value, onChange, placeholder, disabled = false }) => (
    <div>
        <label className="text-sm text-zinc-400 block mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="input w-full disabled:opacity-50"
        />
    </div>
);

export default function Conta() {
    const [activeTab, setActiveTab] = useState('perfil');
    const { user, handleLogout } = useAuth();

    // Estados para controlar o feedback do botão
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'

    const [userData, setUserData] = useState({
        name: '', email: '', avatarUrl: null, plan: 'Bússola PRO', memberSince: '25 de Junho, 2025'
    });

    useEffect(() => {
        if (user) {
            setUserData(prevData => ({
                ...prevData,
                name: user.user_metadata?.full_name || 'Ayan',
                email: user.email,
            }));
        }
    }, [user]);

    // Função que simula o ato de guardar e atualiza os estados
    const handleSaveChanges = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            // Simula uma chamada de API
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            setSaveStatus('success');
        } catch (error) {
            setSaveStatus('error');
            console.error("Erro ao salvar:", error);
        } finally {
            setIsSaving(false);
            // Volta ao estado normal após 2 segundos
            setTimeout(() => setSaveStatus('idle'), 2000); 
        }
    };

    if (!user) {
        return <div>Carregando informações do usuário...</div>;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'perfil':
                return (
                    <InfoCard title="Informações do Perfil">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                             <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center">
                                    <User className="w-12 h-12 text-zinc-500"/>
                                </div>
                                <button className="absolute -bottom-1 -right-1 bg-[#008CFF] p-2 rounded-full border-2 border-[#161616] hover:bg-blue-400 transition">
                                    <Camera className="w-4 h-4 text-white"/>
                                </button>
                             </div>
                             <div className="flex-1 w-full">
                                <TextInput label="Nome Completo" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} placeholder="Seu nome completo"/>
                             </div>
                        </div>
                         <TextInput label="Endereço de E-mail" type="email" value={userData.email} disabled={true} />
                         <div className="text-right">
                            {/* BOTÃO ATUALIZADO COM LÓGICA DE ESTADO */}
                            <button 
                                className={`btn-legiao py-2 px-6 flex items-center justify-center gap-2 transition-all duration-300 ${
                                    isSaving ? 'opacity-70 cursor-not-allowed' : ''
                                } ${
                                    saveStatus === 'success' ? '!bg-green-500' : ''
                                }`}
                                onClick={handleSaveChanges}
                                disabled={isSaving || saveStatus === 'success'}
                            >
                                {isSaving ? (
                                    <> <LoaderCircle className="animate-spin" /> Salvando... </>
                                ) : saveStatus === 'success' ? (
                                    <> <Check /> Salvo com Sucesso! </>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </button>
                         </div>
                    </InfoCard>
                );
            case 'seguranca':
                return (
                    <>
                        <InfoCard title="Alterar Senha">
                            <TextInput label="Senha Atual" type="password" placeholder="••••••••" />
                            <TextInput label="Nova Senha" type="password" placeholder="••••••••" />
                            <TextInput label="Confirmar Nova Senha" type="password" placeholder="••••••••" />
                            <div className="text-right">
                                <button className="btn-legiao py-2 px-6">Atualizar Senha</button>
                            </div>
                        </InfoCard>
                        <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl">
                             <h3 className="text-xl font-semibold text-red-400 flex items-center gap-2"><AlertTriangle/> Zona de Perigo</h3>
                             <p className="text-sm text-zinc-400 mt-2 mb-4">Ações nesta área são permanentes e não podem ser desfeitas. Tenha a certeza absoluta antes de continuar.</p>
                             <button className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition w-full md:w-auto">
                                Deletar Minha Conta
                             </button>
                        </div>
                    </>
                );
            case 'plano':
                 return (
                    <InfoCard title="Plano & Assinatura">
                        <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-zinc-400 text-sm">Seu Plano Atual</p>
                                    <p className="text-2xl font-bold text-gradient">{userData.plan}</p>
                                </div>
                                <Gem className="w-10 h-10 text-[#008CFF]"/>
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">Membro desde {userData.memberSince}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">Funcionalidades Incluídas:</h4>
                            <ul className="list-disc list-inside text-zinc-300 space-y-1 text-sm">
                                <li>Acesso a todas as ferramentas de cálculo</li>
                                <li>Analisador de Campanhas com IA</li>
                                <li>Sonar de Tráfego Avançado</li>
                                <li>Histórico de Simulações</li>
                                <li>Suporte Prioritário</li>
                            </ul>
                        </div>
                        <div className="text-right border-t border-zinc-700 pt-6">
                            <button className="bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-zinc-600 transition">
                                Gerenciar Assinatura
                             </button>
                        </div>
                    </InfoCard>
                );
            default:
                return null;
        }
    }

    return (
        <div className="text-white px-4 py-10">
            <PageHeader
                title="Minha Conta"
                description="Visualize e administre as informações do seu perfil, segurança e assinatura."
            />
            <div className="w-full max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                    <nav className="space-y-2">
                        <NavLink label="Perfil" icon={User} isActive={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} />
                        <NavLink label="Segurança" icon={Shield} isActive={activeTab === 'seguranca'} onClick={() => setActiveTab('seguranca')} />
                        <NavLink label="Plano & Assinatura" icon={Gem} isActive={activeTab === 'plano'} onClick={() => setActiveTab('plano')} />
                        <div className="pt-4 mt-4 border-t border-zinc-800">
                             <NavLink label="Sair" icon={LogOut} isActive={false} onClick={handleLogout} />
                        </div>
                    </nav>
                </aside>
                <main className="md:col-span-3 space-y-6">
                    {renderContent()}
                </main>
            </div>
        </div>
      )
}