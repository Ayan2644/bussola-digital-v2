// Local de Instalação: src/tests/CPAMaximo.test.jsx
// CÓDIGO FINAL E CORRIGIDO

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import CPAMaximo from '../pages/CPAMaximo';
import React from 'react';

const renderWithProviders = (ui) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
};

vi.mock('../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({ user: { id: 'test-user' } }),
  };
});

vi.mock('../hooks/useToolData', () => ({
  useToolData: vi.fn((toolName, initialState) => ({
    data: initialState,
    setData: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock('../components/ui/PageHeader', () => ({
  default: () => <div data-testid="page-header" />,
}));

describe('Calculadora de CPA Máximo', () => {
  it('deve calcular os valores corretamente com os dados iniciais', () => {
    renderWithProviders(<CPAMaximo />);
    const roi1Card = screen.getByText('ROI 1 (Break Even)').closest('div');
    const roi15Card = screen.getByText('ROI 1.5').closest('div');
    const roi2Card = screen.getByText('ROI 2 (Ideal)').closest('div');

    expect(roi1Card).toHaveTextContent(/161,03/);
    expect(roi15Card).toHaveTextContent(/107,35/);
    expect(roi2Card).toHaveTextContent(/80,52/);
  });
});