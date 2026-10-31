import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildTrailPdf, formatPhases, splitTopic, trailPdfFileName } from './trailPdf';

const phase = (overrides = {}) => ({
  phase: 'Base',
  duration: '2 meses',
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

// Mesmos campos que a API devolve em `user_profile_summary` (app/schemas/ai_outputs.py).
const PROFILE = {
  current_profile: 'Desenvolvedor júnior com base em Python',
  strengths: ['Python', 'Lógica de programação'],
  improvement_areas: ['Banco de dados', 'Testes automatizados'],
};

// O jsPDF grava o texto sem compressão: dá para procurá-lo no conteúdo do arquivo.
const pdfText = (doc) => doc.output();

describe('formatPhases', () => {
  it('devolve lista vazia quando não há fases em formato de lista', () => {
    expect(formatPhases(undefined)).toEqual([]);
    expect(formatPhases(null)).toEqual([]);
    expect(formatPhases('fases')).toEqual([]);
  });

  it('mostra cada fase da IA, na ordem, sem completar nem cortar o plano', () => {
    const phases = formatPhases([
      phase({ phase: 'Fase 1: Base', duration: '2 meses' }),
      phase({ phase: 'Fase 2: Prática', duration: '4 meses' }),
      phase({ phase: 'Fase 3: Projetos', duration: '5 meses' }),
    ]);

    expect(phases.map((p) => p.title)).toEqual(['Fase 1: Base', 'Fase 2: Prática', 'Fase 3: Projetos']);
    expect(phases.map((p) => p.duration)).toEqual(['2 meses', '4 meses', '5 meses']);
    expect(phases.map((p) => p.number)).toEqual([1, 2, 3]);
  });

  it('não inventa fases para um plano curto', () => {
    expect(formatPhases([phase()])).toHaveLength(1);
  });

  it('copia foco, tópicos, projetos e resultados da fase', () => {
    const [first] = formatPhases([phase()]);

    expect(first).toMatchObject({
      focus: 'Fundamentos de Python',
      topics: ['Tipos - dados básicos'],
      projects: ['CLI de tarefas'],
      learningOutcomes: ['Ler código alheio'],
    });
  });

  it('nomeia a fase pela posição quando ela não tem nome', () => {
    expect(formatPhases([phase({ phase: undefined })])[0].title).toBe('Fase 1');
  });

  it('aceita fase sem duração, foco ou listas', () => {
    const [first] = formatPhases([{ phase: 'Só o nome' }]);

    expect(first).toEqual({
      number: 1,
      title: 'Só o nome',
      duration: '',
      focus: '',
      topics: [],
      projects: [],
      learningOutcomes: [],
    });
  });
});

describe('splitTopic', () => {
  it.each([
    ['Tipos - dados básicos', { title: 'Tipos', description: 'dados básicos' }],
    ['Tipos: dados básicos', { title: 'Tipos', description: 'dados básicos' }],
    ['Só o título', { title: 'Só o título', description: '' }],
    ['A - b - c', { title: 'A', description: 'b - c' }],
  ])('separa %j', (topic, expected) => {
    expect(splitTopic(topic)).toEqual(expected);
  });
});

describe('trailPdfFileName', () => {
  it('usa o ID da trilha e a data', () => {
    expect(trailPdfFileName({ id: 12 }, new Date('2026-03-05T12:00:00Z'))).toBe(
      'Trilha_Desenvolvimento_12_2026-03-05.pdf',
    );
  });
});

const longPhases = () => {
  const many = Array.from({ length: 12 }, (_, i) => `Tópico longo número ${i + 1} - descrição`);
  return [
    phase({ phase: 'Fase 1: Base', duration: '2 meses', topics: many, projects: many }),
    phase({ phase: 'Fase 2: Prática', duration: '4 meses', topics: many, projects: many }),
    phase({ phase: 'Fase 3: Projetos', duration: '5 meses', topics: many, projects: many }),
  ];
};

describe('buildTrailPdf', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('gera um arquivo PDF válido', () => {
    const output = pdfText(buildTrailPdf(trailWith([phase()], PROFILE)));

    expect(output.startsWith('%PDF-')).toBe(true);
    expect(output.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('escreve o título e o perfil com os campos que a API devolve', () => {
    const output = pdfText(buildTrailPdf(trailWith([phase()], PROFILE)));

    expect(output).toContain('Plano de Desenvolvimento Personalizado');
    expect(output).toContain('INFORMAÇÕES DO PERFIL');
    expect(output).toContain('Perfil Atual: Desenvolvedor júnior com base em Python');
    expect(output).toContain('Pontos Fortes: Python; Lógica de programação');
    expect(output).toContain('Áreas de Melhoria: Banco de dados; Testes automatizados');
  });

  it('escreve todas as fases da IA com a duração, sem criar semanas', () => {
    const output = pdfText(
      buildTrailPdf(
        trailWith(
          [
            phase({ phase: 'Fase 1: Fundamentos', duration: '2 meses' }),
            phase({ phase: 'Fase 2: Especialização', duration: '4 meses' }),
            phase({ phase: 'Fase 3: Aprofundamento', duration: '5 meses' }),
          ],
          PROFILE,
        ),
      ),
    );

    expect(output).toContain('FASES DO PLANO');
    for (const title of ['Fase 1: Fundamentos', 'Fase 2: Especialização', 'Fase 3: Aprofundamento']) {
      expect(output).toContain(title);
    }
    for (const duration of ['Duração: 2 meses', 'Duração: 4 meses', 'Duração: 5 meses']) {
      expect(output).toContain(duration);
    }
    expect(output).not.toMatch(/SEMANA|Consolidação/);
  });

  it('escreve foco, tópicos, projetos e resultados esperados da fase', () => {
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
    expect(output).toContain('FASES DO PLANO');
  });

  it('numera cada página do rodapé com o total real de páginas', () => {
    const doc = buildTrailPdf(trailWith(longPhases(), PROFILE));
    const output = pdfText(doc);
    const total = doc.getNumberOfPages();

    expect(total).toBeGreaterThan(1);
    for (let page = 1; page <= total; page += 1) {
      expect(output).toContain(`Página ${page} de ${total} - CareerPathAI`);
    }
    expect(output).not.toContain(`Página ${total + 1} de`);
  });

  it('um plano curto cabe em uma página', () => {
    const doc = buildTrailPdf(trailWith([phase()], PROFILE));

    expect(doc.getNumberOfPages()).toBe(1);
    expect(pdfText(doc)).toContain('Página 1 de 1 - CareerPathAI');
  });

  it('passa para novas páginas quando o conteúdo é longo, sem perder nenhuma fase', () => {
    const doc = buildTrailPdf(trailWith(longPhases(), PROFILE));
    const output = pdfText(doc);
    const total = doc.getNumberOfPages();

    expect(total).toBeGreaterThan(2);
    for (const title of ['Fase 1: Base', 'Fase 2: Prática', 'Fase 3: Projetos']) {
      expect(output).toContain(title);
    }
    expect(output).toContain('Tópico longo número 12');
    expect(output).toContain(`Página ${total} de ${total} - CareerPathAI`);
  });

  it('quebra o título longo de uma fase em várias linhas em vez de cortá-lo', () => {
    const title = `Fase 1: ${Array.from({ length: 20 }, (_, i) => `termo${i}`).join(' ')}`;
    const output = pdfText(buildTrailPdf(trailWith([phase({ phase: title })], PROFILE)));

    expect(output).toContain('termo0');
    expect(output).toContain('termo19');
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
