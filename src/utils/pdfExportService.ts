import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Étendre le type jsPDF pour inclure autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export interface RapportData {
  session: {
    nom_formation: string;
    date_session: string;
    heure_debut: string;
    heure_fin: string;
  };
  formateur: {
    nom: string;
    prenom: string;
    email: string;
  };
  presences: Array<{
    apprenant: {
      nom: string;
      prenom: string;
    };
    present: boolean;
    heure_enregistrement: string;
  }>;
  rapport?: {
    contenu: string;
    date_soumission: string;
  };
}

export class PDFExportService {
  private static instance: PDFExportService;

  static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService();
    }
    return PDFExportService.instance;
  }

  // Exporter un rapport de session en PDF
  exportRapportSession(data: RapportData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // En-tête du document
    this.addHeader(doc, pageWidth);
    
    // Titre principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DE SESSION DE FORMATION', pageWidth / 2, 50, { align: 'center' });
    
    let yPosition = 70;
    
    // Informations de la session
    yPosition = this.addSessionInfo(doc, data.session, yPosition);
    
    // Informations du formateur
    yPosition = this.addFormateurInfo(doc, data.formateur, yPosition);
    
    // Statistiques de présence
    yPosition = this.addPresenceStats(doc, data.presences, yPosition);
    
    // Tableau des présences
    yPosition = this.addPresenceTable(doc, data.presences, yPosition);
    
    // Contenu du rapport si disponible
    if (data.rapport) {
      this.addRapportContent(doc, data.rapport, yPosition);
    }
    
    // Pied de page
    this.addFooter(doc);
    
    // Générer le nom du fichier
    const fileName = `rapport_${data.session.nom_formation.replace(/\s+/g, '_')}_${data.session.date_session}.pdf`;
    
    // Télécharger le PDF
    doc.save(fileName);
  }

  // Exporter les présences d'un apprenant en PDF
  exportPresencesApprenant(
    apprenant: { nom: string; prenom: string; email?: string },
    presences: Array<{
      formation: string;
      date: string;
      horaires: string;
      present: boolean;
      heure_enregistrement: string;
    }>
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    this.addHeader(doc, pageWidth);
    
    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORIQUE DES PRÉSENCES', pageWidth / 2, 50, { align: 'center' });
    
    // Informations de l'apprenant
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Apprenant: ${apprenant.prenom} ${apprenant.nom}`, 20, 70);
    if (apprenant.email) {
      doc.text(`Email: ${apprenant.email}`, 20, 80);
    }
    doc.text(`Période: ${this.getPeriodString(presences)}`, 20, 90);
    
    // Statistiques
    const stats = this.calculatePresenceStats(presences);
    doc.text(`Total sessions: ${stats.total}`, 20, 105);
    doc.text(`Présences: ${stats.present}`, 20, 115);
    doc.text(`Absences: ${stats.absent}`, 20, 125);
    doc.text(`Taux de présence: ${stats.percentage}%`, 20, 135);
    
    // Tableau des présences
    const tableData = presences.map(p => [
      p.formation,
      new Date(p.date).toLocaleDateString('fr-FR'),
      p.horaires,
      p.present ? 'Présent' : 'Absent',
      p.heure_enregistrement
    ]);

    doc.autoTable({
      startY: 150,
      head: [['Formation', 'Date', 'Horaires', 'Statut', 'Heure enregistrement']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        3: { 
          cellWidth: 25,
          fillColor: (rowIndex: number) => {
            return presences[rowIndex]?.present ? [220, 252, 231] : [254, 226, 226];
          }
        }
      }
    });
    
    this.addFooter(doc);
    
    const fileName = `presences_${apprenant.prenom}_${apprenant.nom}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  // Exporter les statistiques globales
  exportStatistiques(data: {
    periode: string;
    formations: Array<{
      nom: string;
      sessions: number;
      participants: number;
      tauxPresence: number;
    }>;
    formateurs: Array<{
      nom: string;
      prenom: string;
      sessions: number;
      tauxPresence: number;
    }>;
  }): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    this.addHeader(doc, pageWidth);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('STATISTIQUES DE PRÉSENCE', pageWidth / 2, 50, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Période: ${data.periode}`, pageWidth / 2, 65, { align: 'center' });
    
    let yPosition = 85;
    
    // Statistiques par formation
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques par Formation', 20, yPosition);
    yPosition += 10;
    
    const formationData = data.formations.map(f => [
      f.nom,
      f.sessions.toString(),
      f.participants.toString(),
      `${f.tauxPresence}%`
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Formation', 'Sessions', 'Participants', 'Taux présence']],
      body: formationData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    yPosition = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 0 + 20;
    
    // Statistiques par formateur
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques par Formateur', 20, yPosition);
    yPosition += 10;
    
    const formateurData = data.formateurs.map(f => [
      `${f.prenom} ${f.nom}`,
      f.sessions.toString(),
      `${f.tauxPresence}%`
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Formateur', 'Sessions', 'Taux présence']],
      body: formateurData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    this.addFooter(doc);
    
    const fileName = `statistiques_${data.periode.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  }

  private addHeader(doc: jsPDF, pageWidth: number): void {
    // Logo ou en-tête de l'organisation
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SYSTÈME DE GESTION DES PRÉSENCES', pageWidth / 2, 20, { align: 'center' });
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, 25, pageWidth - 20, 25);
  }

  private addSessionInfo(doc: jsPDF, session: RapportData['session'], yPosition: number): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DE LA SESSION', 20, yPosition);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Formation: ${session.nom_formation}`, 20, yPosition + 15);
    doc.text(`Date: ${new Date(session.date_session).toLocaleDateString('fr-FR')}`, 20, yPosition + 25);
    doc.text(`Horaires: ${session.heure_debut} - ${session.heure_fin}`, 20, yPosition + 35);
    
    return yPosition + 50;
  }

  private addFormateurInfo(doc: jsPDF, formateur: RapportData['formateur'], yPosition: number): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMATEUR', 20, yPosition);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nom: ${formateur.prenom} ${formateur.nom}`, 20, yPosition + 15);
    doc.text(`Email: ${formateur.email}`, 20, yPosition + 25);
    
    return yPosition + 40;
  }

  private addPresenceStats(doc: jsPDF, presences: RapportData['presences'], yPosition: number): number {
    const stats = this.calculatePresenceStats(presences);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STATISTIQUES DE PRÉSENCE', 20, yPosition);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total apprenants: ${stats.total}`, 20, yPosition + 15);
    doc.text(`Présents: ${stats.present}`, 20, yPosition + 25);
    doc.text(`Absents: ${stats.absent}`, 20, yPosition + 35);
    doc.text(`Taux de présence: ${stats.percentage}%`, 20, yPosition + 45);
    
    return yPosition + 60;
  }

  private addPresenceTable(doc: jsPDF, presences: RapportData['presences'], yPosition: number): number {
    const tableData = presences.map(p => [
      `${p.apprenant.prenom} ${p.apprenant.nom}`,
      p.present ? 'Présent' : 'Absent',
      p.heure_enregistrement
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Apprenant', 'Statut', 'Heure enregistrement']],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        1: { 
          cellWidth: 30,
          fillColor: (rowIndex: number) => {
            return presences[rowIndex]?.present ? [220, 252, 231] : [254, 226, 226];
          }
        }
      }
    });
    
    return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 0 + 20;
  }

  private addRapportContent(doc: jsPDF, rapport: RapportData['rapport'], yPosition: number): number {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DE FORMATION', 20, yPosition);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date de soumission: ${new Date(rapport!.date_soumission).toLocaleDateString('fr-FR')}`, 20, yPosition + 15);
    
    // Contenu du rapport avec gestion des retours à la ligne
    const splitContent = doc.splitTextToSize(rapport!.contenu, 170);
    doc.text(splitContent, 20, yPosition + 30);
    
    return yPosition + 30 + (splitContent.length * 5) + 20;
  }

  private addFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 
              pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  private calculatePresenceStats(presences: Array<{ present: boolean }>): {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  } {
    const total = presences.length;
    const present = presences.filter(p => p.present).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, percentage };
  }

  private getPeriodString(presences: Array<{ date: string }>): string {
    if (presences.length === 0) return 'Aucune donnée';
    
    const dates = presences.map(p => new Date(p.date)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = dates[0].toLocaleDateString('fr-FR');
    const endDate = dates[dates.length - 1].toLocaleDateString('fr-FR');
    
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  }
}