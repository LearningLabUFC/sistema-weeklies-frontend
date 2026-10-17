/**
 * Utilitários de data, timezone e controle da janela de submissão de Weeklies.
 * Fuso horário oficial: America/Fortaleza (UTC-3 fixo, sem horário de verão).
 *
 * Alinhado com o backend: app/weeklies/timezone_utils.py.
 */

export const FUSO_LLAB = 'America/Fortaleza';

/**
 * Converte uma data qualquer para um objeto Date ajustado com as horas locais de America/Fortaleza.
 */
export function getNowInFortaleza(baseDate: Date = new Date()): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_LLAB,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(baseDate);
  const map: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = parseInt(part.value, 10);
    }
  }

  // Cria data correspondente às coordenadas de calendário de Fortaleza
  return new Date(
    map.year,
    map.month - 1,
    map.day,
    map.hour || 0,
    map.minute || 0,
    map.second || 0,
  );
}

/**
 * Formata um objeto Date civil para 'YYYY-MM-DD' sem interferência de fuso horário.
 */
export function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Verifica se o momento está dentro da janela de submissão:
 * Abre: Sexta-feira 00:00:00 (America/Fortaleza)
 * Fecha: Segunda-feira 23:59:59 (America/Fortaleza)
 *
 * Dias da semana em JS (getDay()):
 * 0 = Domingo (ABERTA)
 * 1 = Segunda (ABERTA)
 * 2 = Terça (FECHADA)
 * 3 = Quarta (FECHADA)
 * 4 = Quinta (FECHADA)
 * 5 = Sexta (ABERTA)
 * 6 = Sábado (ABERTA)
 */
export function dentroDaJanela(
  now: Date = new Date(),
  forceBypass?: boolean,
): boolean {
  if (
    forceBypass ??
    (import.meta.env.MODE !== 'test' &&
      import.meta.env.VITE_IGNORAR_JANELA_WEEKLY === 'true')
  ) {
    return true;
  }
  const fortalezaDate = getNowInFortaleza(now);
  const day = fortalezaDate.getDay();
  return day === 5 || day === 6 || day === 0 || day === 1;
}

/**
 * Retorna a data 'YYYY-MM-DD' da segunda-feira de fechamento da janela de referência.
 * Regra:
 * - Sexta (5): +3 dias
 * - Sábado (6): +2 dias
 * - Domingo (0): +1 dia
 * - Segunda (1): o próprio dia
 * - Terça a Quinta (2, 3, 4): segunda-feira que acabou de fechar
 */
export function obterSemanaReferencia(now: Date = new Date()): string {
  const fortalezaDate = getNowInFortaleza(now);
  const day = fortalezaDate.getDay();

  const target = new Date(
    fortalezaDate.getFullYear(),
    fortalezaDate.getMonth(),
    fortalezaDate.getDate(),
  );

  if (day === 5) {
    target.setDate(target.getDate() + 3);
  } else if (day === 6) {
    target.setDate(target.getDate() + 2);
  } else if (day === 0) {
    target.setDate(target.getDate() + 1);
  } else if (day === 1) {
    // É a própria segunda
  } else if (day === 2) {
    target.setDate(target.getDate() - 1);
  } else if (day === 3) {
    target.setDate(target.getDate() - 2);
  } else if (day === 4) {
    target.setDate(target.getDate() - 3);
  }

  return toISODateString(target);
}

/**
 * Formata datas civis 'YYYY-MM-DD' para 'DD/MM/YYYY' sem deslocamento por timezone.
 */
export function formatDateCivil(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const clean = dateStr.trim().split('T')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

/**
 * Converte data civil 'YYYY-MM-DD' para objeto Date local às 00:00:00.
 */
export function parseDateCivil(dateStr: string): Date {
  const clean = dateStr.trim().split('T')[0];
  const [year, month, day] = clean.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Verifica se uma data civil 'YYYY-MM-DD' é anterior a hoje em America/Fortaleza.
 */
export function isPrazoVencido(
  prazoStr: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!prazoStr) return false;
  const hojeFortaleza = toISODateString(getNowInFortaleza(now));
  const prazoClean = prazoStr.trim().split('T')[0];
  return prazoClean < hojeFortaleza;
}

/**
 * Normaliza e formata timestamps UTC da API para exibição legível no fuso America/Fortaleza ('DD/MM/YYYY HH:mm').
 */
export function formatTimestampFortaleza(
  timestampStr: string | null | undefined,
): string {
  if (!timestampStr) return '-';
  let iso = timestampStr.trim();
  // Se vier sem indicador de offset/Z, assume UTC
  if (!iso.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(iso)) {
    iso = `${iso}Z`;
  }

  const d = new Date(iso);
  if (isNaN(d.getTime())) return timestampStr;

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_LLAB,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Verifica se uma weekly REJEITADA está dentro do prazo de carência de 24h a partir de `avaliada_em`.
 */
export function isRejeitadaWithinGracePeriod(
  avaliadaEm: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!avaliadaEm) return false;
  let iso = avaliadaEm.trim();
  if (!iso.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(iso)) {
    iso = `${iso}Z`;
  }
  const avaliadaDate = new Date(iso);
  if (isNaN(avaliadaDate.getTime())) return false;

  const deadline = new Date(avaliadaDate.getTime() + 24 * 60 * 60 * 1000);
  return now.getTime() <= deadline.getTime();
}

/**
 * Verifica se o momento atual permite rejeição de weekly:
 * Rejeição só é aceita pelo backend até Quarta-feira 23:59:59 da semana de referência.
 * A semana de referência é a segunda-feira de fechamento.
 * Quarta-feira correspondente = segunda + 2 dias às 23:59:59 (America/Fortaleza).
 */
export function podeRejeitarWeekly(
  semanaReferencia: string,
  now: Date = new Date(),
): boolean {
  if (!semanaReferencia) return false;
  const refParts = semanaReferencia.trim().split('-');
  if (refParts.length !== 3) return false;

  const [y, m, d] = refParts.map(Number);
  // Segunda de referência: quarta é + 2 dias
  const quartaLimite = new Date(Date.UTC(y, m - 1, d + 2, 23 + 3, 59, 59)); // +3 horas do UTC-3 para 23:59:59 America/Fortaleza

  return now.getTime() <= quartaLimite.getTime();
}

/**
 * Gera uma lista de segundas-feiras de referência recentes para seleção em dashboards.
 * @param qtdAnteriores Quantidade de semanas anteriores a incluir além da atual (padrão: 8).
 * @param now Momento base opcional.
 */
export function gerarSemanasReferencia(
  qtdAnteriores = 8,
  now: Date = new Date(),
): { label: string; value: string }[] {
  const atualStr = obterSemanaReferencia(now);
  const atual = parseDateCivil(atualStr);
  const semanas: { label: string; value: string }[] = [];

  for (let i = 0; i <= qtdAnteriores; i++) {
    const d = new Date(atual);
    d.setDate(d.getDate() - i * 7);
    const val = toISODateString(d);
    semanas.push({
      label:
        i === 0
          ? `${formatDateCivil(val)} (Semana Atual)`
          : formatDateCivil(val),
      value: val,
    });
  }

  return semanas;
}
