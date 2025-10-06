// Service d'intégration API Backend
export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class BackendApiService {
  private static instance: BackendApiService;
  private config: ApiConfig;
  private isOnline: boolean = navigator.onLine;

  constructor(config: ApiConfig) {
    this.config = config;
    this.setupOnlineStatusListener();
  }

  static getInstance(config?: ApiConfig): BackendApiService {
    if (!BackendApiService.instance) {
      if (!config) {
        throw new Error('Configuration requise pour initialiser le service API');
      }
      BackendApiService.instance = new BackendApiService(config);
    }
    return BackendApiService.instance;
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline) {
      return {
        success: false,
        error: 'Connexion internet requise'
      };
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      defaultHeaders['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Erreur API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  // Méthodes d'authentification
  async login(email: string, password: string): Promise<ApiResponse<{
    user: Record<string, unknown>;
    token: string;
    refreshToken: string;
  }>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{
    token: string;
    refreshToken: string;
  }>> {
    return this.makeRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Méthodes pour les formateurs
  async getFormateurs(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.makeRequest('/formateurs');
  }

  async createFormateur(formateur: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest('/formateurs', {
      method: 'POST',
      body: JSON.stringify(formateur),
    });
  }

  async updateFormateur(id: number, formateur: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest(`/formateurs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formateur),
    });
  }

  async deleteFormateur(id: number): Promise<ApiResponse> {
    return this.makeRequest(`/formateurs/${id}`, {
      method: 'DELETE',
    });
  }

  // Méthodes pour les apprenants
  async getApprenants(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.makeRequest('/apprenants');
  }

  async createApprenant(apprenant: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest('/apprenants', {
      method: 'POST',
      body: JSON.stringify(apprenant),
    });
  }

  // Méthodes pour les formations
  async getFormations(): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.makeRequest('/formations');
  }

  async createFormation(formation: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest('/formations', {
      method: 'POST',
      body: JSON.stringify(formation),
    });
  }

  // Méthodes pour les sessions
  async getSessions(params?: {
    formateurId?: number;
    date?: string;
    status?: string;
  }): Promise<ApiResponse<Record<string, unknown>[]>> {
    const searchParams = new URLSearchParams();
    if (params?.formateurId) searchParams.set('formateurId', params.formateurId.toString());
    if (params?.date) searchParams.set('date', params.date);
    if (params?.status) searchParams.set('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/sessions${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  async createSession(session: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async updateSession(id: number, session: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(session),
    });
  }

  // Méthodes pour les présences
  async getPresences(sessionId: number): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.makeRequest(`/sessions/${sessionId}/presences`);
  }

  async markPresence(data: {
    sessionId: number;
    apprenantId: number;
    present: boolean;
    heureEnregistrement: string;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest(`/sessions/${data.sessionId}/presences`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markPresenceFormateur(data: {
    sessionId: number;
    formateurId: number;
    present: boolean;
    heureEnregistrement: string;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest(`/sessions/${data.sessionId}/presence-formateur`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Méthodes pour les rapports
  async getRapports(params?: {
    formateurId?: number;
    sessionId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<Record<string, unknown>[]>> {
    const searchParams = new URLSearchParams();
    if (params?.formateurId) searchParams.set('formateurId', params.formateurId.toString());
    if (params?.sessionId) searchParams.set('sessionId', params.sessionId.toString());
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);

    const queryString = searchParams.toString();
    const endpoint = `/rapports${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  async createRapport(rapport: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest('/rapports', {
      method: 'POST',
      body: JSON.stringify(rapport),
    });
  }

  // Méthodes pour les justifications d'absence
  async getJustifications(apprenantId: number): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.makeRequest(`/apprenants/${apprenantId}/justifications`);
  }

  async createJustification(justification: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest('/justifications', {
      method: 'POST',
      body: JSON.stringify(justification),
    });
  }

  async updateJustificationStatus(
    id: number, 
    status: 'approved' | 'rejected', 
    commentaire?: string
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest(`/justifications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, commentaire }),
    });
  }

  // Méthodes pour les statistiques
  async getStatistiques(params?: {
    dateFrom?: string;
    dateTo?: string;
    formateurId?: number;
    formationId?: number;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    const searchParams = new URLSearchParams();
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
    if (params?.formateurId) searchParams.set('formateurId', params.formateurId.toString());
    if (params?.formationId) searchParams.set('formationId', params.formationId.toString());

    const queryString = searchParams.toString();
    const endpoint = `/statistiques${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  // Méthodes pour les notifications
  async getNotifications(userId: number): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.makeRequest(`/users/${userId}/notifications`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async registerForPushNotifications(data: {
    userId: number;
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }): Promise<ApiResponse> {
    return this.makeRequest('/notifications/push/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Synchronisation des données hors ligne
  private async syncOfflineData(): Promise<void> {
    try {
      // Récupérer les données en attente de synchronisation depuis IndexedDB
      const pendingData = await this.getPendingSyncData();
      
      for (const item of pendingData) {
        await this.syncDataItem(item);
      }
      
      // Nettoyer les données synchronisées
      await this.clearSyncedData();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  }

  private async getPendingSyncData(): Promise<Record<string, unknown>[]> {
    // Implémenter la récupération des données en attente depuis IndexedDB
    return [];
  }

  private async syncDataItem(item: Record<string, unknown>): Promise<void> {
    // Implémenter la synchronisation d'un élément spécifique
    switch (item.type) {
      case 'presence':
        await this.markPresence(item.data as {
          sessionId: number;
          apprenantId: number;
          present: boolean;
          heureEnregistrement: string;
        });
        break;
      case 'rapport':
        await this.createRapport(item.data as Record<string, unknown>);
        break;
      case 'justification':
        await this.createJustification(item.data as Record<string, unknown>);
        break;
    }
  }

  private async clearSyncedData(): Promise<void> {
    // Implémenter le nettoyage des données synchronisées
  }

  // Upload de fichiers
  async uploadFile(file: File, type: 'rapport' | 'justification'): Promise<ApiResponse<{
    url: string;
    filename: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.makeRequest('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Ne pas définir Content-Type pour FormData
      },
    });
  }

  // Vérification de la santé de l'API
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    version: string;
  }>> {
    return this.makeRequest('/health');
  }
}