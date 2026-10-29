import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LoadingState from '../../../../src/components/states/LoadingState';

afterEach(cleanup);

describe('LoadingState', () => {
  it('anuncia o carregamento com role status e texto em pt-BR', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');
  });

  it('exibe uma mensagem específica da consulta', () => {
    render(<LoadingState message="Carregando previsão..." />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando previsão...');
  });
});
