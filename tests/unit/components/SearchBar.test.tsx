import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../../../src/components/SearchBar';

afterEach(cleanup);

describe('SearchBar', () => {
  it('oferece região de busca, label e botão acessíveis', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toHaveValue('');
    expect(screen.getByLabelText('Cidade')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([
    'button',
    'enter',
  ])('busca uma única vez por %s e remove espaços externos', async (action) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), '  São Paulo  ');
    expect(onSearch).not.toHaveBeenCalled();

    if (action === 'button') {
      await user.click(screen.getByRole('button', { name: 'Buscar' }));
    } else {
      await user.keyboard('{Enter}');
    }

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it.each([
    '',
    '   ',
    '\t\n\u00a0',
  ])('rejeita entrada vazia %j com orientação acessível', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value } });

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Digite uma cidade para buscar.');
    expect(screen.getByRole('alert')).toHaveTextContent('Digite uma cidade para buscar.');
  });

  it('limpa a validação ao editar e permite tentar novamente', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await user.type(screen.getByRole('searchbox'), 'Salvador');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-invalid', 'false');
    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Salvador');
  });

  it('bloqueia edição e submissão quando disabled e permite reativar', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox'), 'Recife');

    rerender(<SearchBar onSearch={onSearch} disabled />);

    expect(screen.getByRole('searchbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).not.toHaveBeenCalled();

    rerender(<SearchBar onSearch={onSearch} disabled={false} />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Recife');
  });

  it('associa cada label ao seu próprio campo em múltiplas instâncias', () => {
    render(
      <>
        <SearchBar onSearch={vi.fn()} />
        <SearchBar onSearch={vi.fn()} />
      </>,
    );

    const inputs = screen.getAllByLabelText('Cidade');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });
});
