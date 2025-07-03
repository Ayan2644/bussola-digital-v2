// src/tests/CPAMaximo.test.jsx (Código completo)

import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import CPAMaximo from '../pages/CPAMaximo';
import PageHeader from '../components/ui/PageHeader';

// Mock do PageHeader para simplificar o teste, já que não precisamos testá-lo aqui
vi.mock('../components/ui/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="page-header"></div>,
}));


describe('Calculadora de CPA Máximo', () => {
  it('deve calcular os valores corretamente com os dados iniciais', () => {
    // Renderiza o componente
    render(<CPAMaximo />);

    // Verifica se os valores iniciais estão corretos (com base no estado inicial do componente)
    // Valor do produto = 197
    // Margem de Contribuição = 197 - (197 * 6.99 / 100 + 2.50) - (197 * 10 / 100) = 197 - 16.27 - 19.7 = 161.03
    // CPA ROI 1 = 161.03
    expect(screen.getByText('R$\xa0161,03')).toBeInTheDocument(); // CPA ROI 1
  });

  it('deve atualizar os cálculos quando o valor do produto é alterado', () => {
    render(<CPAMaximo />);

    // Encontra o input "Valor do Produto (R$)" pelo seu label
    const productPriceInput = screen.getByLabelText(/Valor do Produto/i);

    // Limpa o input e digita um novo valor
    fireEvent.change(productPriceInput, { target: { value: '1000' } });

    // Novos cálculos esperados:
    // Margem de Contribuição = 1000 - (1000 * 6.99 / 100 + 2.50) - (1000 * 10 / 100) = 1000 - 72.4 - 100 = 827.60
    // CPA ROI 1 = 827.60
    // CPA ROI 1.5 = 827.60 / 1.5 = 551.73
    // CPA ROI 2 = 827.60 / 2 = 413.80

    // Verifica se os novos valores aparecem na tela
    expect(screen.getByText('R$\xa0827,60')).toBeInTheDocument();
    expect(screen.getByText('R$\xa0551,73')).toBeInTheDocument();
    expect(screen.getByText('R$\xa0413,80')).toBeInTheDocument();
  });
});