import { describe, expect, it } from 'vitest';

import {
  dentroDaJanela,
  formatDateCivil,
  formatTimestampFortaleza,
  isPrazoVencido,
  isRejeitadaWithinGracePeriod,
  obterSemanaReferencia,
  parseDateCivil,
  podeRejeitarWeekly,
} from '@/features/weeklies/utils/dateUtils';

describe('dateUtils', () => {
  describe('dentroDaJanela', () => {
    it('deve retornar true na Sexta-feira às 10:00 (America/Fortaleza)', () => {
      // 2026-10-09 é Sexta-feira
      const sexta = new Date('2026-10-09T13:00:00Z'); // 10:00 em Fortaleza (UTC-3)
      expect(dentroDaJanela(sexta)).toBe(true);
    });

    it('deve retornar true no Sábado, Domingo e Segunda-feira', () => {
      const sabado = new Date('2026-10-10T15:00:00Z');
      const domingo = new Date('2026-10-11T15:00:00Z');
      const segunda = new Date('2026-10-12T15:00:00Z');

      expect(dentroDaJanela(sabado)).toBe(true);
      expect(dentroDaJanela(domingo)).toBe(true);
      expect(dentroDaJanela(segunda)).toBe(true);
    });

    it('deve retornar false na Terça, Quarta e Quinta-feira', () => {
      const terca = new Date('2026-10-13T15:00:00Z');
      const quarta = new Date('2026-10-14T15:00:00Z');
      const quinta = new Date('2026-10-15T15:00:00Z');

      expect(dentroDaJanela(terca)).toBe(false);
      expect(dentroDaJanela(quarta)).toBe(false);
      expect(dentroDaJanela(quinta)).toBe(false);
    });

    it('deve retornar true quando forceBypass for true mesmo fora da janela', () => {
      const quarta = new Date('2026-10-14T15:00:00Z');
      expect(dentroDaJanela(quarta, true)).toBe(true);
    });
  });

  describe('obterSemanaReferencia', () => {
    it('deve retornar a próxima segunda de fechamento na Sexta-feira', () => {
      // 2026-10-09 (Sexta) -> fecha em 2026-10-12 (Segunda)
      const sexta = new Date('2026-10-09T15:00:00Z');
      expect(obterSemanaReferencia(sexta)).toBe('2026-10-12');
    });

    it('deve retornar a próxima segunda de fechamento no Domingo', () => {
      // 2026-10-11 (Domingo) -> fecha em 2026-10-12 (Segunda)
      const domingo = new Date('2026-10-11T15:00:00Z');
      expect(obterSemanaReferencia(domingo)).toBe('2026-10-12');
    });

    it('deve retornar a própria segunda na Segunda-feira', () => {
      // 2026-10-12 (Segunda) -> 2026-10-12
      const segunda = new Date('2026-10-12T15:00:00Z');
      expect(obterSemanaReferencia(segunda)).toBe('2026-10-12');
    });

    it('deve retornar a segunda que acabou de passar na Terça a Quinta', () => {
      // 2026-10-13 (Terça) -> 2026-10-12
      const terca = new Date('2026-10-13T15:00:00Z');
      expect(obterSemanaReferencia(terca)).toBe('2026-10-12');

      // 2026-10-15 (Quinta) -> 2026-10-12
      const quinta = new Date('2026-10-15T15:00:00Z');
      expect(obterSemanaReferencia(quinta)).toBe('2026-10-12');
    });
  });

  describe('Datas civis', () => {
    it('formatDateCivil deve formatar YYYY-MM-DD para DD/MM/YYYY sem deslocamento de timezone', () => {
      expect(formatDateCivil('2026-10-05')).toBe('05/10/2026');
      expect(formatDateCivil('2026-01-01')).toBe('01/01/2026');
      expect(formatDateCivil('')).toBe('-');
      expect(formatDateCivil(null)).toBe('-');
    });

    it('parseDateCivil deve criar Date às 00:00 locais', () => {
      const d = parseDateCivil('2026-10-05');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(9); // Outubro é 9
      expect(d.getDate()).toBe(5);
    });

    it('isPrazoVencido deve identificar datas passadas em relação a hoje', () => {
      // Hoje sendo 2026-10-10
      const hoje = new Date('2026-10-10T12:00:00Z');
      expect(isPrazoVencido('2026-10-09', hoje)).toBe(true);
      expect(isPrazoVencido('2026-10-10', hoje)).toBe(false);
      expect(isPrazoVencido('2026-10-11', hoje)).toBe(false);
    });
  });

  describe('formatTimestampFortaleza', () => {
    it('deve formatar timestamp UTC no fuso oficial America/Fortaleza', () => {
      // 2026-10-03T18:30:00Z -> 15:30 em Fortaleza
      const formatted = formatTimestampFortaleza('2026-10-03T18:30:00Z');
      expect(formatted).toContain('03/10/2026');
      expect(formatted).toContain('15:30');
    });

    it('deve normalizar timestamp sem offset assumindo UTC', () => {
      const formatted = formatTimestampFortaleza('2026-10-03T18:30:00');
      expect(formatted).toContain('15:30');
    });
  });

  describe('isRejeitadaWithinGracePeriod', () => {
    it('deve retornar true dentro de 24 horas da avaliação', () => {
      const avaliadaEm = '2026-10-05T12:00:00Z';
      const momentoDentro = new Date('2026-10-06T11:59:00Z'); // 23h59min depois
      expect(isRejeitadaWithinGracePeriod(avaliadaEm, momentoDentro)).toBe(
        true,
      );
    });

    it('deve retornar false após 24 horas da avaliação', () => {
      const avaliadaEm = '2026-10-05T12:00:00Z';
      const momentoFora = new Date('2026-10-06T12:01:00Z'); // 24h01min depois
      expect(isRejeitadaWithinGracePeriod(avaliadaEm, momentoFora)).toBe(false);
    });
  });

  describe('podeRejeitarWeekly', () => {
    it('deve retornar true até quarta-feira 23:59:59 da semana de referência', () => {
      // Semana de referência: 2026-10-05 (Segunda)
      // Quarta é 2026-10-07. 23:59:59 America/Fortaleza = 2026-10-08T02:59:59Z
      const dentro = new Date('2026-10-07T20:00:00Z');
      expect(podeRejeitarWeekly('2026-10-05', dentro)).toBe(true);

      const limite = new Date('2026-10-08T02:59:50Z');
      expect(podeRejeitarWeekly('2026-10-05', limite)).toBe(true);
    });

    it('deve retornar false na quinta-feira após o prazo de rejeição', () => {
      const fora = new Date('2026-10-08T03:00:01Z');
      expect(podeRejeitarWeekly('2026-10-05', fora)).toBe(false);
    });
  });
});
