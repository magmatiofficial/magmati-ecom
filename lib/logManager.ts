import { AnalyticsLog, VisitorProfile, useAnalyticsStore } from '@/store/useAnalyticsStore';

export interface LogFilterOptions {
  searchQuery?: string;
  logType?: 'ALL' | 'PAGE_VIEW' | 'ACTION';
  visitorId?: string;
  userEmail?: string;
}

/**
 * Centralized User & Visitor Log Manager
 * Controls all visitor profile logs, user action tracking, and log export/clear functions.
 */
export const LogManager = {
  /**
   * Retrieves all visitor profiles from the analytics store
   */
  getProfiles(): Record<string, VisitorProfile> {
    return useAnalyticsStore.getState().profiles;
  },

  /**
   * Retrieves a list of sorted profiles by last seen timestamp
   */
  getSortedProfiles(): VisitorProfile[] {
    const profiles = Object.values(useAnalyticsStore.getState().profiles);
    return profiles.sort((a, b) => b.lastSeen - a.lastSeen);
  },

  /**
   * Get a specific profile by Visitor ID
   */
  getProfile(visitorId: string): VisitorProfile | undefined {
    return useAnalyticsStore.getState().profiles[visitorId];
  },

  /**
   * Filter logs across all profiles or for a specific profile
   */
  filterLogs(options: LogFilterOptions = {}): { profile: VisitorProfile; log: AnalyticsLog }[] {
    const profiles = Object.values(useAnalyticsStore.getState().profiles);
    const results: { profile: VisitorProfile; log: AnalyticsLog }[] = [];

    const query = (options.searchQuery || '').toLowerCase().trim();

    profiles.forEach((profile) => {
      if (options.visitorId && profile.id !== options.visitorId) return;
      if (options.userEmail && profile.identifiedEmail?.toLowerCase() !== options.userEmail.toLowerCase()) return;

      profile.logs.forEach((log) => {
        if (options.logType && options.logType !== 'ALL' && log.type !== options.logType) return;

        if (query) {
          const matchId = profile.id.toLowerCase().includes(query);
          const matchName = profile.identifiedName?.toLowerCase().includes(query) || false;
          const matchEmail = profile.identifiedEmail?.toLowerCase().includes(query) || false;
          const matchIp = profile.ipAddress?.toLowerCase().includes(query) || false;
          const matchPath = log.path?.toLowerCase().includes(query) || false;
          const matchAction = log.action?.toLowerCase().includes(query) || false;

          if (!matchId && !matchName && !matchEmail && !matchIp && !matchPath && !matchAction) {
            return;
          }
        }

        results.push({ profile, log });
      });
    });

    return results.sort((a, b) => b.log.timestamp - a.log.timestamp);
  },

  /**
   * Export all user and visitor logs as JSON file for backup/analysis
   */
  exportLogsAsJSON(visitorId?: string): void {
    if (typeof window === 'undefined') return;
    const storeProfiles = useAnalyticsStore.getState().profiles;
    const profilesToExport = visitorId ? { [visitorId]: storeProfiles[visitorId] } : storeProfiles;
    
    if (visitorId && !storeProfiles[visitorId]) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profilesToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const fileName = visitorId ? `visitor_${visitorId}_logs_${new Date().toISOString().slice(0, 10)}.json` : `user_visitor_logs_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * Export all user logs as CSV file for Excel/Sheets analysis
   */
  exportLogsAsCSV(visitorId?: string): void {
    if (typeof window === 'undefined') return;
    
    let profiles = Object.values(useAnalyticsStore.getState().profiles);
    if (visitorId) {
      profiles = profiles.filter(p => p.id === visitorId);
      if (profiles.length === 0) return;
    }

    const headers = ['Visitor ID', 'User Name', 'User Email', 'IP Address', 'Platform', 'Type', 'Path/Action', 'Details', 'Duration(s)', 'Timestamp'];
    
    const rows: string[] = [headers.join(',')];

    profiles.forEach((profile) => {
      profile.logs.forEach((log) => {
        const row = [
          `"${profile.id}"`,
          `"${profile.identifiedName || 'Guest'}"`,
          `"${profile.identifiedEmail || 'N/A'}"`,
          `"${profile.ipAddress || 'Unknown'}"`,
          `"${profile.platform || 'Unknown'}"`,
          `"${log.type}"`,
          `"${log.path || log.action || ''}"`,
          `"${log.details ? JSON.stringify(log.details).replace(/"/g, '""') : ''}"`,
          `"${log.duration || 0}"`,
          `"${new Date(log.timestamp).toISOString()}"`
        ];
        rows.push(row.join(','));
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    const fileName = visitorId ? `visitor_${visitorId}_logs_${new Date().toISOString().slice(0, 10)}.csv` : `user_visitor_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * Clear all visitor & user logs from storage
   */
  clearAllLogs(): void {
    useAnalyticsStore.getState().clearAllData();
  },
  
  /**
   * Delete a specific visitor profile
   */
  deleteProfile(visitorId: string): void {
    useAnalyticsStore.getState().deleteProfile(visitorId);
  },

  /**
   * Get log summary statistics
   */
  getStats() {
    const profiles = Object.values(useAnalyticsStore.getState().profiles);
    let totalLogs = 0;
    let pageViews = 0;
    let userActions = 0;

    profiles.forEach((p) => {
      totalLogs += p.logs.length;
      p.logs.forEach((l) => {
        if (l.type === 'PAGE_VIEW') pageViews++;
        if (l.type === 'ACTION') userActions++;
      });
    });

    return {
      totalVisitors: profiles.length,
      totalLogs,
      pageViews,
      userActions
    };
  }
};
