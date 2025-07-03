// Local de Instalação: src/tests/Planejamento.test.jsx
// CÓDIGO FINAL E CORRIGIDO

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Planejamento from '../pages/Planejamento';
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

vi.mock('../components/ui/InfoCard', () => ({
    default: ({ title, children }) => <div data-testid="info-card"><h2>{title}</h2>{children}</div>
}));

vi.mock('../context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: () => ({ user: { id: 'test-user' } }),
    };
  });

vi.mock('../hooks/useToolData', () => ({
  useToolData: (toolName, initialState) => ({
    data: initialState,
    setData: vi.fn(),
    isLoading: false,
  }),
}));

describe('Página de Planejamento Estratégico', () => {
  it('deve renderizar e calcular os valores corretamente com os dados iniciais', () => {
    renderWithProviders(<Planejamento />);
    expect(screen.getByText(/R\$\s*9\.390,86/i)).toBeInTheDocument();
    expect(screen.getByText('254')).toBeInTheDocument();
  });
});