import { db } from '../config/db';
import type { Superadmin, Formateur, Apprenant, Formation, Session, SessionApprenant, Presence, PresenceFormateur, Rapport } from '../config/db';

/**
 * Utilitaires pour la gestion du stockage IndexedDB
 */

// === SUPERADMINS ===
export const superadminStorage = {
  async create(data: Omit<Superadmin, 'id_superadmin' | 'created_at'>): Promise<number> {
    return await db.superadmins.add(data);
  },

  async getById(id: number): Promise<Superadmin | undefined> {
    return await db.superadmins.get(id);
  },

  async getByEmail(email: string): Promise<Superadmin | undefined> {
    return await db.superadmins.where('email').equals(email).first();
  },

  async getAll(): Promise<Superadmin[]> {
    return await db.superadmins.toArray();
  },

  async update(id: number, data: Partial<Superadmin>): Promise<number> {
    return await db.superadmins.update(id, data);
  },

  async delete(id: number): Promise<void> {
    await db.superadmins.delete(id);
  }
};

// === FORMATEURS ===
export const formateurStorage = {
  async create(data: Omit<Formateur, 'id_formateur' | 'created_at'>): Promise<number> {
    return await db.formateurs.add(data);
  },

  async getById(id: number): Promise<Formateur | undefined> {
    return await db.formateurs.get(id);
  },

  async getByEmail(email: string): Promise<Formateur | undefined> {
    return await db.formateurs.where('email').equals(email).first();
  },

  async getAll(): Promise<Formateur[]> {
    return await db.formateurs.toArray();
  },

  async update(id: number, data: Partial<Formateur>): Promise<number> {
    return await db.formateurs.update(id, data);
  },

  async delete(id: number): Promise<void> {
    await db.formateurs.delete(id);
  },

  async search(query: string): Promise<Formateur[]> {
    return await db.formateurs
      .filter(formateur => 
        formateur.nom.toLowerCase().includes(query.toLowerCase()) ||
        formateur.prenom.toLowerCase().includes(query.toLowerCase()) ||
        formateur.email.toLowerCase().includes(query.toLowerCase())
      )
      .toArray();
  }
};

// === APPRENANTS ===
export const apprenantStorage = {
  async create(data: Omit<Apprenant, 'id_apprenant' | 'created_at'>): Promise<number> {
    return await db.apprenants.add(data);
  },

  async getById(id: number): Promise<Apprenant | undefined> {
    return await db.apprenants.get(id);
  },

  async getAll(): Promise<Apprenant[]> {
    return await db.apprenants.toArray();
  },

  async update(id: number, data: Partial<Apprenant>): Promise<number> {
    return await db.apprenants.update(id, data);
  },

  async delete(id: number): Promise<void> {
    await db.apprenants.delete(id);
  },

  async search(query: string): Promise<Apprenant[]> {
    return await db.apprenants
      .filter(apprenant => 
        apprenant.nom.toLowerCase().includes(query.toLowerCase()) ||
        apprenant.prenom.toLowerCase().includes(query.toLowerCase()) ||
        (apprenant.email?.toLowerCase().includes(query.toLowerCase()) || false)
      )
      .toArray();
  },

  async bulkCreate(apprenants: Omit<Apprenant, 'id_apprenant' | 'created_at'>[]): Promise<number[]> {
    return await db.apprenants.bulkAdd(apprenants, { allKeys: true }) as number[];
  }
};

// === FORMATIONS ===
export const formationStorage = {
  async create(data: Omit<Formation, 'id_formation' | 'created_at'>): Promise<number> {
    return await db.formations.add(data);
  },

  async getById(id: number): Promise<Formation | undefined> {
    return await db.formations.get(id);
  },

  async getAll(): Promise<Formation[]> {
    return await db.formations.toArray();
  },

  async getByFormateur(formateurId: number): Promise<Formation[]> {
    return await db.formations.where('id_formateur').equals(formateurId).toArray();
  },

  async update(id: number, data: Partial<Formation>): Promise<number> {
    return await db.formations.update(id, data);
  },

  async delete(id: number): Promise<void> {
    await db.formations.delete(id);
  },

  async search(query: string): Promise<Formation[]> {
    return await db.formations
      .filter(formation => 
        formation.nom_formation.toLowerCase().includes(query.toLowerCase()) ||
        formation.description.toLowerCase().includes(query.toLowerCase())
      )
      .toArray();
  }
};

// === SESSIONS ===
export const sessionStorage = {
  async create(data: Omit<Session, 'id_session' | 'created_at'>): Promise<number> {
    return await db.sessions.add(data);
  },

  async getById(id: number): Promise<Session | undefined> {
    return await db.sessions.get(id);
  },

  async getAll(): Promise<Session[]> {
    return await db.sessions.toArray();
  },

  async getByFormation(formationId: number): Promise<Session[]> {
    return await db.sessions.where('id_formation').equals(formationId).toArray();
  },

  async getByFormateur(formateurId: number): Promise<Session[]> {
    return await db.sessions.where('id_formateur').equals(formateurId).toArray();
  },

  async getByDate(date: string): Promise<Session[]> {
    return await db.sessions.where('date_session').equals(date).toArray();
  },

  async getByMonth(year: number, month: number): Promise<Session[]> {
    // Filtrer les sessions par mois/année
    const sessions = await db.sessions.toArray();
    return sessions.filter(session => {
      const sessionDate = new Date(session.date_session);
      return sessionDate.getFullYear() === year && sessionDate.getMonth() === month;
    });
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    const sessions = await db.sessions.toArray();
    return sessions.filter(session => {
      return session.date_session >= startDate && session.date_session <= endDate;
    });
  },

  async update(id: number, data: Partial<Session>): Promise<number> {
    return await db.sessions.update(id, data);
  },

  async delete(id: number): Promise<void> {
    await db.sessions.delete(id);
  },

  async getSessionsWithDetails(formateurId?: number): Promise<(Session & { formateurNom?: string; formationNom?: string })[]> {
    const sessions = formateurId 
      ? await db.sessions.where('id_formateur').equals(formateurId).toArray()
      : await db.sessions.toArray();

    return await Promise.all(
      sessions.map(async (session) => {
        const formateur = await db.formateurs.get(session.id_formateur);
        const formation = await db.formations.get(session.id_formation);
        return {
          ...session,
          formateurNom: formateur ? `${formateur.prenom} ${formateur.nom}` : undefined,
          formationNom: formation?.nom_formation
        };
      })
    );
  }
};

// === SESSION-APPRENANTS (Liaison) ===
export const sessionApprenantStorage = {
  async assignApprenant(idSession: number, idApprenant: number): Promise<number> {
    // Vérifier si l'assignation existe déjà
    const existing = await db.session_apprenants
      .where(['id_session', 'id_apprenant'])
      .equals([idSession, idApprenant])
      .first();
    
    if (existing) {
      throw new Error('Apprenant déjà assigné à cette session');
    }

    return await db.session_apprenants.add({
      id_session: idSession,
      id_apprenant: idApprenant
    });
  },

  async assignMultipleApprenants(idSession: number, idsApprenants: number[]): Promise<number[]> {
    const assignments = idsApprenants.map(idApprenant => ({
      id_session: idSession,
      id_apprenant: idApprenant
    }));

    return await db.session_apprenants.bulkAdd(assignments, { allKeys: true });
  },

  async removeApprenant(idSession: number, idApprenant: number): Promise<void> {
    await db.session_apprenants
      .where(['id_session', 'id_apprenant'])
      .equals([idSession, idApprenant])
      .delete();
  },

  async getApprenantsBySession(idSession: number): Promise<Apprenant[]> {
    const assignments = await db.session_apprenants
      .where('id_session')
      .equals(idSession)
      .toArray();
    
    const apprenantIds = assignments.map(a => a.id_apprenant);
    return await db.apprenants.where('id_apprenant').anyOf(apprenantIds).toArray();
  },

  async getSessionsByApprenant(idApprenant: number): Promise<Session[]> {
    const assignments = await db.session_apprenants
      .where('id_apprenant')
      .equals(idApprenant)
      .toArray();
    
    const sessionIds = assignments.map(a => a.id_session);
    return await db.sessions.where('id_session').anyOf(sessionIds).toArray();
  },

  async getAllAssignments(): Promise<SessionApprenant[]> {
    return await db.session_apprenants.toArray();
  },

  async removeAllApprenantsFromSession(idSession: number): Promise<void> {
    await db.session_apprenants.where('id_session').equals(idSession).delete();
  },

  async getSessionsWithApprenants(): Promise<Array<{
    session: Session;
    apprenants: Apprenant[];
    formateur?: Formateur;
  }>> {
    const sessions = await db.sessions.toArray();
    
    return await Promise.all(
      sessions.map(async (session) => {
        const apprenants = await this.getApprenantsBySession(session.id_session!);
        const formateur = await db.formateurs.get(session.id_formateur);
        
        return {
          session,
          apprenants,
          formateur
        };
      })
    );
  }
};

// === PRESENCES ===
export const presenceStorage = {
  async create(data: Omit<Presence, 'id_presence' | 'created_at'>): Promise<number> {
    return await db.presences.add(data);
  },

  async getById(id: number): Promise<Presence | undefined> {
    return await db.presences.get(id);
  },

  async getBySession(sessionId: number): Promise<Presence[]> {
    return await db.presences.where('id_session').equals(sessionId).toArray();
  },

  async getByApprenant(apprenantId: number): Promise<Presence[]> {
    return await db.presences.where('id_apprenant').equals(apprenantId).toArray();
  },

  async update(id: number, data: Partial<Presence>): Promise<number> {
    return await db.presences.update(id, data);
  },

  async delete(id: number): Promise<void> {
    await db.presences.delete(id);
  },

  async markPresence(sessionId: number, apprenantId: number, present: boolean): Promise<number> {
    // Vérifier si une présence existe déjà
    const existingPresence = await db.presences
      .where(['id_session', 'id_apprenant'])
      .equals([sessionId, apprenantId])
      .first();

    const presenceData = {
      id_session: sessionId,
      id_apprenant: apprenantId,
      heure_enregistrement: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      present
    };

    if (existingPresence) {
      await db.presences.update(existingPresence.id_presence!, presenceData);
      return existingPresence.id_presence!;
    } else {
      return await db.presences.add(presenceData);
    }
  },

  async getPresenceWithDetails(sessionId: number) {
    const presences = await db.presences.where('id_session').equals(sessionId).toArray();
    const presencesWithDetails = [];
    
    for (const presence of presences) {
      const apprenant = await db.apprenants.get(presence.id_apprenant);
      
      presencesWithDetails.push({
        ...presence,
        apprenant: apprenant ? `${apprenant.prenom} ${apprenant.nom}` : 'Apprenant inconnu',
        apprenantEmail: apprenant?.email || '',
        apprenantTelephone: apprenant?.numero_telephone || ''
      });
    }
    
    return presencesWithDetails;
  }
};

// === PRESENCES FORMATEUR ===
export const presenceFormateurStorage = {
  async create(data: Omit<PresenceFormateur, 'id_presence_formateur' | 'created_at'>): Promise<number> {
    return await db.presences_formateur.add(data);
  },

  async getBySession(sessionId: number): Promise<PresenceFormateur | undefined> {
    return await db.presences_formateur.where('id_session').equals(sessionId).first();
  },

  async getByFormateur(formateurId: number): Promise<PresenceFormateur[]> {
    return await db.presences_formateur.where('id_formateur').equals(formateurId).toArray();
  },

  async update(id: number, data: Partial<PresenceFormateur>): Promise<number> {
    return await db.presences_formateur.update(id, data);
  },

  async markPresence(sessionId: number, formateurId: number, present: boolean): Promise<number> {
    // Vérifier si une présence existe déjà
    const existingPresence = await db.presences_formateur
      .where(['id_session', 'id_formateur'])
      .equals([sessionId, formateurId])
      .first();

    const presenceData = {
      id_session: sessionId,
      id_formateur: formateurId,
      heure_enregistrement: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      present
    };

    if (existingPresence) {
      await db.presences_formateur.update(existingPresence.id_presence_formateur!, presenceData);
      return existingPresence.id_presence_formateur!;
    } else {
      return await db.presences_formateur.add(presenceData);
    }
  }
};

// === RAPPORTS ===
export const rapportStorage = {
  async create(data: Omit<Rapport, 'id_rapport' | 'created_at'>): Promise<number> {
    return await db.rapports.add(data);
  },

  async getById(id: number): Promise<Rapport | undefined> {
    return await db.rapports.get(id);
  },

  async getBySession(sessionId: number): Promise<Rapport | undefined> {
    return await db.rapports.where('id_session').equals(sessionId).first();
  },

  async getByFormateur(formateurId: number): Promise<Rapport[]> {
    return await db.rapports.where('id_formateur').equals(formateurId).toArray();
  },

  async getAll(): Promise<Rapport[]> {
    return await db.rapports.toArray();
  },

  async update(id: number, data: Partial<Rapport>): Promise<number> {
    return await db.rapports.update(id, data);
  },

  async delete(id: number): Promise<void> {
    await db.rapports.delete(id);
  },

  async getAllWithDetails() {
    const rapports = await db.rapports.toArray();
    
    return await Promise.all(
      rapports.map(async (rapport) => {
        const session = await db.sessions.get(rapport.id_session);
        const formateur = await db.formateurs.get(rapport.id_formateur);
        const formation = session ? await db.formations.get(session.id_formation) : null;
        
        return {
          ...rapport,
          session_nom: formation?.nom_formation || 'Session inconnue',
          formateur_nom: formateur?.nom || 'Inconnu',
          formateur_prenom: formateur?.prenom || 'Formateur',
        };
      })
    );
  }
};

// === UTILITAIRES GÉNÉRAUX ===
export const storageUtils = {
  async clearAllData(): Promise<void> {
    await db.transaction('rw', [
      db.superadmins,
      db.formateurs,
      db.apprenants,
      db.formations,
      db.sessions,
      db.presences,
      db.presences_formateur,
      db.rapports
    ], async () => {
      await db.superadmins.clear();
      await db.formateurs.clear();
      await db.apprenants.clear();
      await db.formations.clear();
      await db.sessions.clear();
      await db.presences.clear();
      await db.presences_formateur.clear();
      await db.rapports.clear();
    });
  },

  async exportData(): Promise<{
    superadmins: Superadmin[];
    formateurs: Formateur[];
    apprenants: Apprenant[];
    formations: Formation[];
    sessions: Session[];
    presences: Presence[];
    presences_formateur: PresenceFormateur[];
    rapports: Rapport[];
    exportDate: string;
  }> {
    return {
      superadmins: await db.superadmins.toArray(),
      formateurs: await db.formateurs.toArray(),
      apprenants: await db.apprenants.toArray(),
      formations: await db.formations.toArray(),
      sessions: await db.sessions.toArray(),
      presences: await db.presences.toArray(),
      presences_formateur: await db.presences_formateur.toArray(),
      rapports: await db.rapports.toArray(),
      exportDate: new Date().toISOString()
    };
  },

  async importData(data: {
    superadmins?: Superadmin[];
    formateurs?: Formateur[];
    apprenants?: Apprenant[];
    formations?: Formation[];
    sessions?: Session[];
    presences?: Presence[];
    presences_formateur?: PresenceFormateur[];
    rapports?: Rapport[];
  }): Promise<void> {
    await db.transaction('rw', [
      db.superadmins,
      db.formateurs,
      db.apprenants,
      db.formations,
      db.sessions,
      db.presences,
      db.presences_formateur,
      db.rapports
    ], async () => {
      if (data.superadmins) await db.superadmins.bulkPut(data.superadmins);
      if (data.formateurs) await db.formateurs.bulkPut(data.formateurs);
      if (data.apprenants) await db.apprenants.bulkPut(data.apprenants);
      if (data.formations) await db.formations.bulkPut(data.formations);
      if (data.sessions) await db.sessions.bulkPut(data.sessions);
      if (data.presences) await db.presences.bulkPut(data.presences);
      if (data.presences_formateur) await db.presences_formateur.bulkPut(data.presences_formateur);
      if (data.rapports) await db.rapports.bulkPut(data.rapports);
    });
  }
};