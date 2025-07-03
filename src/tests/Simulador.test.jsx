// Local de Instalação: src/tests/Simulador.test.jsx
// CÓDIGO FINAL E CORRIGIDO

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Simulador from '../pages/Simulador';
import React from 'react';

const renderWithProviders = (ui) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
};

vi.mock('../components/ui/PageHeader', () => ({
  default: () => <div data-testid="page-header" />,
}));

vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
}));

vi.mock('../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({ user: { id: 'test-user' } }),
  };
});

vi.mock('../hooks/useToolData', () => ({
    useToolData: (toolName, initialState) => {
        const [data, setData] = React.useState(initialState);
        return { data, setData, isLoading: false, isSaving: false, saveStatus: 'idle', saveData: vi.fn() };
    },
}));

describe('Simulador Inteligente de Escala', () => {
  it('deve calcular os resultados corretamente após preencher o formulário', async () => {
    renderWithProviders(<Simulador />);

    fireEvent.change(screen.getByLabelText(/Valor do Produto/i), { target: { value: '197' } });
    fireEvent.change(screen.getByLabelText(/Valor Gasto/i), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText(/Vendas Realizadas/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/CTR/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/CPC/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Frequência/i), { target: { value: '1.5' } });

    const analisarButton = screen.getByRole('button', { name: /Analisar Campanha/i });
    fireEvent.click(analisarButton);

    await waitFor(() => {
        expect(screen.getByText(/CPA: R\$\s*50\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/ROAS:\s*3\.94/i)).toBeInTheDocument();
        expect(screen.getByText(/Faturamento: R\$\s*985\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Lucro: R\$\s*735\.00/i)).toBeInTheDocument();
    });
  });
});