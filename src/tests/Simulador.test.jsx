// src/tests/Simulador.test.jsx (Código completo)

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Simulador from '../pages/Simulador';

// Mock do PageHeader e do Chart.js para focar apenas na lógica do Simulador
vi.mock('../components/ui/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="page-header"></div>,
}));

vi.mock('react-chartjs-2', () => ({
    Bar: () => <div data-testid="bar-chart"></div>,
}));


describe('Simulador Inteligente de Escala', () => {

  const fillForm = () => {
    // Encontra os inputs pelos seus labels
    fireEvent.change(screen.getByLabelText(/Valor do Produto/i), { target: { value: '197' } });
    fireEvent.change(screen.getByLabelText(/Orçamento Diário/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Valor Gasto/i), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText(/Vendas Realizadas/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/CTR/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/CPC/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/CPM/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Frequência/i), { target: { value: '1.5' } });
  };

  it('deve calcular os resultados corretamente após preencher o formulário', async () => {
    render(<Simulador />);

    // Preenche o formulário
    fillForm();

    // Clica no botão para analisar
    const analisarButton = screen.getByRole('button', { name: /Analisar Campanha/i });
    fireEvent.click(analisarButton);

    // Aguarda os resultados aparecerem
    await waitFor(() => {
        // Cálculos esperados:
        // Faturamento = 5 * 197 = 985
        // Lucro = 985 - 250 = 735
        // CPA = 250 / 5 = 50
        // ROAS = 985 / 250 = 3.94

        expect(screen.getByText(/R\$ 50.00/i)).toBeInTheDocument(); // CPA
        expect(screen.getByText(/3.94/i)).toBeInTheDocument();      // ROAS
        expect(screen.getByText(/R\$ 985.00/i)).toBeInTheDocument(); // Faturamento
        expect(screen.getByText(/R\$ 735.00/i)).toBeInTheDocument(); // Lucro
        expect(screen.getByText(/ESCALAR VERTICAL/i)).toBeInTheDocument(); // Status
    });
  });
});