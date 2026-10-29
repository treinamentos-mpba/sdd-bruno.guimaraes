import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ErrorState from '../../../../src/components/states/ErrorState';

afterEach(cleanup);

describe('ErrorState', () => {
  it('anuncia a mensagem sem tentar novamente automaticamente', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Não foi possível carregar o clima." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o clima.');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveAttribute(
      'type',
      'button',
    );
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('solicita uma nova tentativa ao clicar', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Sem conexão." onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });

  it.each(['{Enter}', ' '])('permite tentar novamente pelo teclado com %s', async (key) => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="A consulta demorou demais." onRetry={onRetry} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard(key);

    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });
});
