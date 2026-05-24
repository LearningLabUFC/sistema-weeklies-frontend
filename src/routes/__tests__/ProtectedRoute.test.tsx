import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve redirecionar para "/" se o usuário NÃO estiver autenticado', () => {
    localStorage.removeItem('@SeuApp:token');

    render(
      <MemoryRouter initialEntries={['/rota-protegida']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/rota-protegida" element={<h1>Conteúdo Secreto</h1>} />
          </Route>
          <Route path="/" element={<h1>Página de Login</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Página de Login')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Secreto')).not.toBeInTheDocument();
  });

  it('deve renderizar o conteúdo (Outlet) se o usuário ESTIVER autenticado', () => {
    localStorage.setItem('@SeuApp:token', 'token-falso-123');

    render(
      <MemoryRouter initialEntries={['/rota-protegida']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/rota-protegida" element={<h1>Conteúdo Secreto</h1>} />
          </Route>
          <Route path="/" element={<h1>Página de Login</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Conteúdo Secreto')).toBeInTheDocument();
  });
});
