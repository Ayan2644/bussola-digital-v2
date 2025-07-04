// Local de Instalação: src/components/GerirProdutosModal.jsx
// CÓDIGO ATUALIZADO E CORRIGIDO

import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2, LoaderCircle, AlertTriangle } from 'lucide-react';

export default function GerirProdutosModal({ isOpen, onClose, products, onProductsUpdate }) {
  const { user } = useAuth();
  const [newProductName, setNewProductName] = useState('');
  const [newProductTicket, setNewProductTicket] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductTicket) {
      toast.error('Por favor, preencha o nome e o ticket do produto.');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: newProductName,
          ticket: parseFloat(newProductTicket),
        });
      if (error) throw error;
      toast.success('Produto adicionado com sucesso!');
      setNewProductName('');
      setNewProductTicket('');
      onProductsUpdate();
    } catch (error) {
      toast.error('Erro ao adicionar produto: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const { data: metrics, error: metricsError } = await supabase
        .from('daily_metrics')
        .select('id')
        .eq('product_id', productId)
        .limit(1);

      if (metricsError) throw metricsError;

      if (metrics.length > 0) {
        toast.error('Não é possível excluir. Este produto possui dados no Diário de Bordo.');
        setProductToDelete(null);
        return;
      }
      
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      toast.success('Produto excluído com sucesso!');
      onProductsUpdate();
    } catch (error) {
      toast.error('Erro ao excluir produto: ' + error.message);
    } finally {
      setProductToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-gradient mb-6">Gerir Produtos</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-6">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="bg-zinc-800 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{product.name}</p>
                    {/* LINHA CORRIGIDA ABAIXO */}
                    <p className="text-sm text-zinc-400">
                      Ticket: {typeof product.ticket === 'number'
                        ? product.ticket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'Não definido'}
                    </p>
                  </div>
                  <button onClick={() => setProductToDelete(product)} className="text-zinc-500 hover:text-red-500 transition p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-center py-4">Nenhum produto cadastrado.</p>
            )}
          </div>

          <div className="border-t border-zinc-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Adicionar Novo Produto</h3>
            <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4">
              <input type="text" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} className="input flex-grow" placeholder="Nome do Produto" required />
              <input type="number" step="0.01" value={newProductTicket} onChange={(e) => setNewProductTicket(e.target.value)} className="input w-full md:w-40" placeholder="Ticket (R$)" required />
              <button type="submit" className="btn-legiao py-2 px-4 whitespace-nowrap flex items-center justify-center gap-2" disabled={isSaving}>
                {isSaving ? <LoaderCircle className="animate-spin" /> : <Plus />}
                Adicionar
              </button>
            </form>
          </div>
        </div>
      </div>

      {productToDelete && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-zinc-800 rounded-2xl p-8 max-w-md text-center border border-red-500/50">
                <AlertTriangle className="mx-auto text-red-500" size={48}/>
                <h3 className="text-xl font-bold mt-4">Confirmar Exclusão</h3>
                <p className="text-zinc-300 mt-2">
                    Tem a certeza de que deseja excluir o produto "<strong>{productToDelete.name}</strong>"? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-4 mt-6">
                    <button onClick={() => setProductToDelete(null)} className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-2 px-4 rounded-lg transition">
                        Cancelar
                    </button>
                    <button onClick={() => handleDeleteProduct(productToDelete.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">
                        Sim, Excluir
                    </button>
                </div>
              </div>
          </div>
      )}
    </>
  );
}