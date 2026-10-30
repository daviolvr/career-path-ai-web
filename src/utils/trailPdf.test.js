import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildTrailPdf, formatWeeks, trailPdfFileName } from './trailPdf';

const phase = (overrides = {}) => ({
  phase: 'Base',
  duration: '2 semanas',
  focus: 'Fundamentos de Python',
  topics: ['Tipos - dados básicos'],
  projects: ['CLI de tarefas'],
  learning_outcomes: ['Ler código alheio'],
  ...overrides,
});

const trailWith = (phases, profile) => ({
  id: 7,
  development_trail: {
    user_profile_summary: profile,
    development_phases: phases,
  },
});

const PROFILE = {
  professional_goal: 'Back-End Júnior',
  current_level: 'iniciante',
  goal_timeframe: '3 meses',
};

// O jsPDF grava o texto sem compressão: dá para procurá-lo no conteúdo do arquivo.
const pdfText = (doc) => doc.output();

describe('formatWeeks', () => {
  it('devolve lista vazia quando não há fases em formato de lista', () => {
    expect(formatWeeks(undefined)).toEqual([]);
    expect(formatWeeks(null)).toEqual([]);
    expect(formatWeeks('fases')).toEqual([]);
  });

  it('cria uma semana por semana de duração da fase', () => {
    const weeks = formatWeeks([phase({ duration: '3 semanas' })]);

    expect(weeks.slice(0, 3).map((w) => w.phase)).toEqual(['Base', 'Base', 'Base']);
    expect(weeks[3].phase).not.toBe('Base');
  });

  it('converte meses em quatro semanas cada (limitado a 6 no total)', () => {
    const weeks = formatWeeks([phase({ duration: '2 meses' })]);

    expect(weeks).toHaveLength(6);
    expect(weeks.every((w) => w.phase === 'Base')).toBe(true);
  });

  // BUG CONHECIDO (MELHORIAS.md da API): a expressão procura "meses?" e não reconhece "mês",
  // com acento, então "1 mês" vira 1 semana em vez de 4. `it.fails` passa enquanto o bug existe
  // e falha quando for corrigido: nesse momento, troque por `it`.
  it.fails('reconhece "1 mês" (singular, com acento) como quatro semanas', () => {
    const weeks = formatWeeks([phase({ duration: '1 mês' })]);

    expect(weeks.filter((w) => w.phase === 'Base')).toHaveLength(4);
  });

  it('usa uma semana quando a duração não é reconhecida ou não existe', () => {
    for (const duration of ['em breve', '', undefined]) {
      const weeks = formatWeeks([phase({ duration })]);
      expect(weeks.filter((w) => w.phase === 'Base')).toHaveLength(1);
    }
  });

  it('numera as semanas em sequência atravessando as fases', () => {
    const weeks = formatWeeks([phase({ phase: 'A', duration: '2 semanas' }), phase({ phase: 'B' })]);

    expect(weeks.map((w) => w.weekNumber)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(weeks.slice(0, 4).map((w) => w.phase)).toEqual(['A', 'A', 'B', 'B']);
  });

  it('copia foco, tópicos, projetos e resultados da fase', () => {
    const [week] = formatWeeks([phase()]);

    expect(week).toMatchObject({
      focus: 'Fundamentos de Python',
      topics: ['Tipos - dados básicos'],
      projects: ['CLI de tarefas'],
      learningOutcomes: ['Ler código alheio'],
    });
  });

  it('nomeia a fase pela posição quando ela não tem nome', () => {
    const weeks = formatWeeks([phase({ phase: undefined })]);

    expect(weeks[0].phase).toBe('Fase 1');
  });

  // Comportamento ATUAL, registrado em MELHORIAS.md como a ser revisto: a lista sempre tem
  // exatamente 6 semanas, completando com semanas genéricas ou cortando o excedente.
  describe('limite fixo de 6 semanas (comportamento atual)', () => {
    it('completa com semanas de consolidação até chegar a 6', () => {
      const weeks = formatWeeks([phase({ duration: '1 semana' })]);

      expect(weeks).toHaveLength(6);
      expect(weeks.slice(1).every((w) => w.phase === 'Consolidação')).toBe(true);
    });

    it('corta o que passa de 6 semanas', () => {
      const weeks = formatWeeks([phase({ duration: '5 meses' })]);

      expect(weeks).toHaveLength(6);
      expect(weeks.every((w) => w.phase === 'Base')).toBe(true);
    });
  });
});

describe('trailPdfFileName', () => {
  it('usa o ID da trilha e a data', () => {
    expect(trailPdfFileName({ id: 12 }, new Date('2026-03-05T12:00:00Z'))).toBe(
      'Trilha_Desenvolvimento_12_2026-03-05.pdf',
    );
  });
});

describe('buildTrailPdf', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('gera um arquivo PDF válido', () => {
    const output = pdfText(buildTrailPdf(trailWith([phase()], PROFILE)));

    expect(output.startsWith('%PDF-')).toBe(true);
    expect(output.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('escreve o título, o perfil e as seis semanas', () => {
    const output = pdfText(buildTrailPdf(trailWith([phase()], PROFILE)));

    expect(output).toContain('Plano de Desenvolvimento Personalizado');
    expect(output).toContain('INFORMAÇÕES DO PERFIL');
    expect(output).toContain('Objetivo Profissional: Back-End Júnior');
    expect(output).toContain('Nível Atual: iniciante');
    expect(output).toContain('Prazo Estimado: 3 meses');
    for (let n = 1; n <= 6; n += 1) {
      expect(output).toContain(`SEMANA ${n}`);
    }
    expect(output).not.toContain('SEMANA 7');
  });

  it('escreve foco, tópicos, projetos e resultados esperados da semana', () => {
    const output = pdfText(buildTrailPdf(trailWith([phase()], PROFILE)));

    expect(output).toContain('Foco: Fundamentos de Python');
    expect(output).toContain('Tópicos de Estudo:');
    expect(output).toContain('Tipos - dados básicos');
    expect(output).toContain('Projetos Práticos:');
    expect(output).toContain('CLI de tarefas');
    expect(output).toContain('Resultados Esperados:');
    expect(output).toContain('Ler código alheio');
  });

  it('omite o bloco de perfil quando a trilha não tem resumo do perfil', () => {
    const output = pdfText(buildTrailPdf(trailWith([phase()], undefined)));

    expect(output).not.toContain('INFORMAÇÕES DO PERFIL');
    expect(output).toContain('SEMANA 1');
  });

  it('numera cada página do rodapé com o total real de páginas', () => {
    const doc = buildTrailPdf(trailWith([phase()], PROFILE));
    const output = pdfText(doc);
    const total = doc.getNumberOfPages();

    expect(total).toBeGreaterThan(1);
    for (let page = 1; page <= total; page += 1) {
      expect(output).toContain(`Página ${page} de ${total} - CareerPathAI`);
    }
    expect(output).not.toContain(`Página ${total + 1} de`);
  });

  it('passa para novas páginas quando o conteúdo é longo, sem perder nenhuma semana', () => {
    const many = Array.from({ length: 12 }, (_, i) => `Tópico longo número ${i + 1} - descrição`);
    const doc = buildTrailPdf(
      trailWith([phase({ duration: '6 semanas', topics: many, projects: many })], PROFILE),
    );
    const output = pdfText(doc);
    const total = doc.getNumberOfPages();

    expect(total).toBeGreaterThan(3);
    for (let n = 1; n <= 6; n += 1) {
      expect(output).toContain(`SEMANA ${n}`);
    }
    expect(output).toContain('Tópico longo número 12');
    expect(output).toContain(`Página ${total} de ${total} - CareerPathAI`);
  });

  it('quebra textos longos em várias linhas em vez de cortá-los', () => {
    const longTopic = Array.from({ length: 40 }, (_, i) => `palavra${i}`).join(' ');
    const output = pdfText(buildTrailPdf(trailWith([phase({ topics: [longTopic] })], PROFILE)));

    expect(output).toContain('palavra0');
    expect(output).toContain('palavra39');
  });

  it('escreve a data de geração no formato brasileiro', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-05T12:00:00Z'));

    const output = pdfText(buildTrailPdf(trailWith([phase()], PROFILE)));

    expect(output).toContain('Gerado em 05/03/2026');
  });

  it('não falha com uma trilha sem fases', () => {
    const doc = buildTrailPdf({ id: 1 });
    const output = pdfText(doc);

    expect(output).toContain('Plano de Desenvolvimento Personalizado');
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('não altera a trilha recebida', () => {
    const trail = trailWith([phase()], PROFILE);
    const before = JSON.stringify(trail);

    buildTrailPdf(trail);

    expect(JSON.stringify(trail)).toBe(before);
  });
});
