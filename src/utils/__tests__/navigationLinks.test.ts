import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  adminLinks,
  leaderLinks,
  superAdminLinks,
  userLinks,
} from '@/config/navigation';
import { ROLE_IDS } from '@/config/roles';
import { getNavigationLinks, getRoleDetails } from '@/utils/navigationLinks';

describe('navigationLinks utility', () => {
  describe('getNavigationLinks', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_SHOW_ALL_LINKS', 'false');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('deve retornar links de admin para a role correspondente', () => {
      expect(getNavigationLinks(ROLE_IDS.ADMIN)).toEqual(adminLinks);
    });

    it('deve retornar links de leader para a role correspondente', () => {
      expect(getNavigationLinks(ROLE_IDS.LEADER)).toEqual(leaderLinks);
    });

    it('deve retornar links base para a role de aluno ou qualquer outra role desconhecida', () => {
      expect(getNavigationLinks(ROLE_IDS.ALUNO)).toEqual(userLinks);
      expect(getNavigationLinks('')).toEqual(userLinks);
    });

    it('deve retornar todos os links quando VITE_SHOW_ALL_LINKS for true', () => {
      const allLinks = [
        ...superAdminLinks,
        ...leaderLinks,
        ...userLinks,
      ].filter(
        (link, index, self) =>
          index === self.findIndex(item => item.to === link.to),
      );

      vi.stubEnv('VITE_SHOW_ALL_LINKS', 'true');
      expect(getNavigationLinks(ROLE_IDS.ALUNO)).toEqual(allLinks);
    });
  });

  describe('getRoleDetails', () => {
    it('deve retornar detalhes corretos para Administrador', () => {
      const details = getRoleDetails(ROLE_IDS.ADMIN);
      expect(details.label).toBe('Administrador');
      expect(details.color).toContain('bg-[#8204EE]');
    });

    it('deve retornar detalhes corretos para Líder', () => {
      const details = getRoleDetails(ROLE_IDS.LEADER);
      expect(details.label).toBe('Líder');
      expect(details.color).toContain('bg-[#FFBF00]');
    });

    it('deve retornar detalhes padrão (Aluno) para roles desconhecidas', () => {
      const details = getRoleDetails('visitante');
      expect(details.label).toBe('Aluno');
      expect(details.color).toContain('bg-[#457EFF]');
    });
  });
});
