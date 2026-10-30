import jsPDF from 'jspdf';

export const formatWeeks = (developmentPhases) => {
  if (!developmentPhases || !Array.isArray(developmentPhases)) {
    return [];
  }

  // Converte fases em semanas
  const weeks = [];
  let weekNumber = 1;

  developmentPhases.forEach((phase, index) => {
    // Extrai duração da fase (ex: "2-3 semanas" ou "2 meses")
    const duration = phase.duration || '';
    const weeksMatch = duration.match(/(\d+)\s*semanas?/i);
    const monthsMatch = duration.match(/(\d+)\s*meses?/i);
    
    let phaseWeeks = 1;
    if (weeksMatch) {
      phaseWeeks = parseInt(weeksMatch[1]);
    } else if (monthsMatch) {
      phaseWeeks = parseInt(monthsMatch[1]) * 4; // Aproximação: 1 mês = 4 semanas
    }

    // Cria semanas baseadas na fase
    for (let i = 0; i < phaseWeeks && weekNumber <= 6; i++) {
      weeks.push({
        weekNumber: weekNumber,
        phase: phase.phase || `Fase ${index + 1}`,
        focus: phase.focus || '',
        topics: phase.topics || [],
        projects: phase.projects || [],
        learningOutcomes: phase.learning_outcomes || [],
      });
      weekNumber++;
    }
  });

  // Preenche até 6 semanas se necessário
  while (weeks.length < 6) {
    weeks.push({
      weekNumber: weeks.length + 1,
      phase: 'Consolidação',
      focus: 'Revisão e prática',
      topics: ['Revisão dos tópicos anteriores'],
      projects: ['Projeto de consolidação'],
      learningOutcomes: ['Aplicação prática dos conhecimentos'],
    });
  }

  return weeks.slice(0, 6); // Garante máximo de 6 semanas
};

export const trailPdfFileName = (trail, now = new Date()) =>
  `Trilha_Desenvolvimento_${trail.id}_${now.toISOString().split('T')[0]}.pdf`;

// Monta o PDF da trilha e devolve o documento (quem chama decide salvar).
export const buildTrailPdf = (trail) => {
  const developmentData = trail.development_trail || {};
  const weeks = formatWeeks(developmentData.development_phases || []);

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
    
    if (profile.professional_goal) {
      addText(`Objetivo Profissional: ${profile.professional_goal}`, 11, true);
    }
    
    if (profile.current_level) {
      addText(`Nível Atual: ${profile.current_level}`, 10);
    }
    
    if (profile.goal_timeframe) {
      addText(`Prazo Estimado: ${profile.goal_timeframe}`, 10);
    }
    
    yPosition += 5;
  }

  // Semanas
  if (weeks && weeks.length > 0) {
    addText('PLANO SEMANAL DE ESTUDOS', 14, true, [59, 130, 246]);
    yPosition += 5;

    weeks.forEach((week, weekIndex) => {
      checkPageBreak(50);
      
      // Título da semana
      doc.setFillColor(139, 92, 246); // Roxo
      doc.roundedRect(margin, yPosition - 8, maxWidth, 15, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`SEMANA ${week.weekNumber}`, margin + 5, yPosition);
      
      yPosition += 12;
      doc.setTextColor(0, 0, 0);

      // Foco da semana
      if (week.focus) {
        addText(`Foco: ${week.focus}`, 11, true, [100, 100, 100]);
      }

      // Tópicos
      if (week.topics && week.topics.length > 0) {
        addText('Tópicos de Estudo:', 11, true);
        week.topics.forEach(topic => {
          const parts = topic.split(/ - |: /);
          const title = parts[0];
          const description = parts.length > 1 ? parts.slice(1).join(' - ') : '';
          const fullText = description ? `${title} - ${description}` : title;
          addText(`  • ${fullText}`, 10);
        });
      }

      // Projetos
      if (week.projects && week.projects.length > 0) {
        addText('Projetos Práticos:', 11, true);
        week.projects.forEach(project => {
          addText(`  • ${project}`, 10);
        });
      }

      // Resultados Esperados
      if (week.learningOutcomes && week.learningOutcomes.length > 0) {
        addText('Resultados Esperados:', 11, true);
        week.learningOutcomes.forEach(outcome => {
          addText(`  • ${outcome}`, 10);
        });
      }

      // Espaço entre semanas (exceto na última)
      if (weekIndex < weeks.length - 1) {
        yPosition += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });
  }

  // Rodapé
  const totalPages = doc.internal.pages.length - 1;
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
