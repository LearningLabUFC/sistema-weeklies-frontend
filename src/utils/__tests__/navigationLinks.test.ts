import { describe, it, expect } from 'vitest';
import { getNavigationLinks, getRoleDetails } from '../navigationLinks';
import { adminLinks, leaderLinks, userLinks } from '@/data/data';

describe('navigationLinks utility', () => {
  describe('getNavigationLinks', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_SHOW_ALL_LINKS', 'false');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('deve retornar links de admin para a role "admin"', () => {
      expect(getNavigationLinks('admin')).toEqual(adminLinks);
    });

    it('deve retornar links de leader para a role "leader"', () => {
      expect(getNavigationLinks('leader')).toEqual(leaderLinks);
    });

    it('deve retornar links base para qualquer outra role', () => {
      expect(getNavigationLinks('aluno')).toEqual(userLinks);
      expect(getNavigationLinks('')).toEqual(userLinks);
    });

    it('deve retornar todos os links quando VITE_SHOW_ALL_LINKS for true', () => {
      const allLinks = [...adminLinks, ...leaderLinks, ...userLinks].filter(
        (link, index, self) =>
          index === self.findIndex(item => item.to === link.to),
      );

      vi.stubEnv('VITE_SHOW_ALL_LINKS', 'true');
      expect(getNavigationLinks('aluno')).toEqual(allLinks);
    });
  });

  describe('getRoleDetails', () => {
    it('deve retornar detalhes corretos para "admin"', () => {
      const details = getRoleDetails('admin');
      expect(details.label).toBe('Administrador');
      expect(details.color).toContain('bg-purple-100');
    });

    it('deve retornar detalhes corretos para "leader"', () => {
      const details = getRoleDetails('leader');
      expect(details.label).toBe('Líder');
      expect(details.color).toContain('bg-amber-100');
    });

    it('deve retornar detalhes padrão (Aluno) para roles desconhecidas', () => {
      const details = getRoleDetails('visitante');
      expect(details.label).toBe('Aluno');
      expect(details.color).toContain('bg-indigo-100');
    });
  });
});
