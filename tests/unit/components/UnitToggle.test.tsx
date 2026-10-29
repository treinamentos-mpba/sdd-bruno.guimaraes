import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../../src/components/UnitToggle';

afterEach(cleanup);

describe('UnitToggle', () => {
  it('expõe as unidades como botões em um grupo e indica a unidade selecionada', () => {
    render(<UnitToggle unit="celsius" onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('solicita alteração de unidade ao ativar um botão', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
  });

  it.each([
    ['ArrowRight', 'celsius', 'fahrenheit'],
    ['ArrowLeft', 'fahrenheit', 'celsius'],
    ['End', 'celsius', 'fahrenheit'],
    ['Home', 'fahrenheit', 'celsius'],
  ] as const)('navega com %s e seleciona %s a partir de %s', async (key, currentUnit, nextUnit) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit={currentUnit} onChange={onChange} />);
    const currentButton = screen.getByRole('button', {
      name: currentUnit === 'celsius' ? '°C' : '°F',
    });
    const nextButton = screen.getByRole('button', {
      name: nextUnit === 'celsius' ? '°C' : '°F',
    });

    currentButton.focus();
    await user.keyboard(`{${key}}`);

    expect(nextButton).toHaveFocus();
    expect(onChange).toHaveBeenCalledExactlyOnceWith(nextUnit);
  });
});
