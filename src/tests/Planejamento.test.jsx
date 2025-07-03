// src/tests/Planejamento.test.jsx (Código completo)

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Planejamento from '../pages/Planejamento';

// Mock do PageHeader, pois não precisamos testá-lo aqui.
// Isso isola o nosso teste apenas à página de Planejamento.
vi.mock('../components/ui/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="page-header"></div>,
}));

describe('Página de Planejamento Estratégico', () => {

  it('deve renderizar e calcular os valores corretamente com os dados iniciais', () => {
    render(<Planejamento />);

    // Com os valores iniciais do componente:
    // Meta Faturamento: R$ 50.000
    // Preço Produto: R$ 197
    // Eventos por Venda: 20
    // Custo por Evento: R$ 8
    //
    // Lucro Bruto Esperado = 50000 - ((50000 / 197) * 20 * 8) = R$ 9.390,86

    // Usamos uma expressão regular (regex) para encontrar o texto, ignorando pequenas diferenças de formatação.
    // O `\s` significa "espaço em branco", e o `i` no final ignora maiúsculas/minúsculas.
    const lucroBrutoElement = screen.getByText(/R\$\s*9\.390,86/i);
    expect(lucroBrutoElement).toBeInTheDocument();

    // Vendas Necessárias = ceil(50000 / 197) = 254
    const vendasNecessariasElement = screen.getByText('254');
    expect(vendasNecessariasElement).toBeInTheDocument();
  });

  it('deve recalcular o lucro quando a meta de faturamento é alterada no slider', async () => {
    render(<Planejamento />);

    // Encontra o slider pelo seu texto de label
    const metaFaturamentoSlider = screen.getByLabelText(/Quanto quer faturar por mês?/i);

    // Altera o valor do slider para 100.000
    fireEvent.change(metaFaturamentoSlider, { target: { value: '100000' } });

    // Agora, o React precisa de um momento para atualizar a tela (DOM).
    // Usamos `waitFor` para esperar que o novo valor apareça.
    await waitFor(() => {
      // Novo Lucro Bruto Esperado = 100000 - ((100000 / 197) * 20 * 8) = R$ 18.781,73
      const novoLucroBrutoElement = screen.getByText(/R\$\s*18\.781,73/i);
      expect(novoLucroBrutoElement).toBeInTheDocument();
    });
  });
});