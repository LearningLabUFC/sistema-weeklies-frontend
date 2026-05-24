import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('deve renderizar o botão com o texto Hello World', () => {
    render(<App />);

    const buttonElement = screen.getByRole('button', { name: /hello world/i });

    expect(buttonElement).toBeInTheDocument();
  });
});
