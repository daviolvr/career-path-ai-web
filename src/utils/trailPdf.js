import jsPDF from 'jspdf';

// A IA devolve fases com duração própria (ex.: "2 meses"); elas são mostradas como vieram,
// sem convertê-las em semanas nem completar ou cortar o plano.
export const formatPhases = (developmentPhases) => {
  if (!Array.isArray(developmentPhases)) {
    return [];
  }

  return developmentPhases.map((phase, index) => ({
    number: index + 1,
    title: phase.phase || `Fase ${index + 1}`,
    duration: phase.duration || '',
    focus: phase.focus || '',
    topics: phase.topics || [],
    projects: phase.projects || [],
    learningOutcomes: phase.learning_outcomes || [],
  }));
};

// Um tópico vem como "Título - descrição" ou "Título: descrição".
export const splitTopic = (topic) => {
  const parts = topic.split(/ - |: /);
  return { title: parts[0], description: parts.length > 1 ? parts.slice(1).join(' - ') : '' };
};

export const trailPdfFileName = (trail, now = new Date()) =>
  `Trilha_Desenvolvimento_${trail.id}_${now.toISOString().split('T')[0]}.pdf`;

// Monta o PDF da trilha e devolve o documento (quem chama decide salvar).
export const buildTrailPdf = (trail) => {
  const developmentData = trail.development_trail || {};
  const phases = formatPhases(developmentData.development_phases || []);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Função auxiliar para adicionar nova página se necessário
  const checkPageBreak = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Função para adicionar texto com quebra de linha
  const addText = (text, fontSize = 10, isBold = false, color = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
    checkPageBreak(lines.length * (fontSize * 0.5) + 5);
    
    lines.forEach(line => {
      if (yPosition + fontSize * 0.5 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5 + 2;
    });
    
    yPosition += 3;
  };

  // Cabeçalho
  doc.setFillColor(59, 130, 246); // Azul
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Plano de Desenvolvimento Personalizado', margin, 25);
  
  yPosition = 50;

  // Informações do perfil
  if (developmentData.user_profile_summary) {
    const profile = developmentData.user_profile_summary;
    
    addText('INFORMAÇÕES DO PERFIL', 14, true, [59, 130, 246]);
    yPosition += 2;
    
    if (profile.current_profile) {
      addText(`Perfil Atual: ${profile.current_profile}`, 10);
    }

    if (profile.strengths?.length > 0) {
      addText(`Pontos Fortes: ${profile.strengths.join('; ')}`, 10);
    }

    if (profile.improvement_areas?.length > 0) {
      addText(`Áreas de Melhoria: ${profile.improvement_areas.join('; ')}`, 10);
    }

    yPosition += 5;
  }

  // Fases
  if (phases.length > 0) {
    addText('FASES DO PLANO', 14, true, [59, 130, 246]);
    yPosition += 5;

    phases.forEach((phase, phaseIndex) => {
      checkPageBreak(50);

      // Título da fase (pode ocupar mais de uma linha)
      const titleLines = doc.splitTextToSize(phase.title, maxWidth - 10);
      const barHeight = 9 + titleLines.length * 6;
      doc.setFillColor(139, 92, 246); // Roxo
      doc.roundedRect(margin, yPosition - 8, maxWidth, barHeight, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text(titleLines, margin + 5, yPosition);

      yPosition += barHeight - 3;
      doc.setTextColor(0, 0, 0);

      if (phase.duration) {
        addText(`Duração: ${phase.duration}`, 10, false, [100, 100, 100]);
      }

      // Foco da fase
      if (phase.focus) {
        addText(`Foco: ${phase.focus}`, 11, true, [100, 100, 100]);
      }

      // Tópicos
      if (phase.topics.length > 0) {
        addText('Tópicos de Estudo:', 11, true);
        phase.topics.forEach(topic => {
          const { title, description } = splitTopic(topic);
          addText(`  • ${description ? `${title} - ${description}` : title}`, 10);
        });
      }

      // Projetos
      if (phase.projects.length > 0) {
        addText('Projetos Práticos:', 11, true);
        phase.projects.forEach(project => {
          addText(`  • ${project}`, 10);
        });
      }

      // Resultados Esperados
      if (phase.learningOutcomes.length > 0) {
        addText('Resultados Esperados:', 11, true);
        phase.learningOutcomes.forEach(outcome => {
          addText(`  • ${outcome}`, 10);
        });
      }

      // Espaço entre fases (exceto na última)
      if (phaseIndex < phases.length - 1) {
        yPosition += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });
  }

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${totalPages} - CareerPathAI`,
      pageWidth - margin - 60,
      pageHeight - 10
    );
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      margin,
      pageHeight - 10
    );
  }

  return doc;
};
