import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import EmptyState from '../../../../src/components/states/EmptyState';

afterEach(cleanup);

describe('EmptyState', () => {
  it('exibe título e dica para uma busca sem resultados, sem indicar erro', () => {
    render(<EmptyState />);

    const region = screen.getByRole('region', { name: 'Nenhuma cidade encontrada' });
    expect(
      within(region).getByRole('heading', { level: 2, name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(
      within(region).getByText('Verifique o nome da cidade ou tente buscar outra localização.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('aceita título e dica para orientar o estado inicial', () => {
    render(
      <EmptyState title="Busque uma cidade" hint="Digite o nome da cidade para ver o clima." />,
    );

    expect(screen.getByRole('heading', { name: 'Busque uma cidade' })).toBeInTheDocument();
    expect(screen.getByText('Digite o nome da cidade para ver o clima.')).toBeInTheDocument();
  });
});
