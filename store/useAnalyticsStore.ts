import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LogType = 'PAGE_VIEW' | 'ACTION';

export interface AnalyticsLog {
  id: string;
  type: LogType;
  path?: string;
  action?: string;
  details?: any;
  timestamp: number;
  duration?: number;
}

export interface VisitorProfile {
  id: string;
  userAgent: string;
  language?: string;
  platform: string;
  screenResolution: string;
  timeZone: string;
  ipAddress?: string;
  identifiedName?: string;
  identifiedEmail?: string;
  firstSeen: number;
  lastSeen: number;
  totalVisits: number;
  logs: AnalyticsLog[];
}

interface AnalyticsState {
  currentVisitorId: string;
  profiles: Record<string, VisitorProfile>;
  initVisitor: () => void;
  identifyVisitor: (name?: string, email?: string) => void;
  logPageView: (path: string) => string; 
  updatePageDuration: (logId: string, duration: number) => void;
  logAction: (action: string, details?: any) => void;
  clearAllData: () => void;
  deleteProfile: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      currentVisitorId: '',
      profiles: {},
      initVisitor: () => {
        let id = get().currentVisitorId;
        if (!id) {
            id = `vis_${generateId()}`;
        }
        
        const now = Date.now();
        const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown';
        
        const platform = typeof window !== 'undefined' ? (window.navigator as any).platform || 'Unknown' : 'Unknown';
        const screenResolution = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Unknown';
        const timeZone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Unknown';
        const language = typeof window !== 'undefined' ? window.navigator.language || 'en' : 'en';

        set((state) => {
          const existingProfile = state.profiles[id];
          const isNewSession = !existingProfile || (now - existingProfile.lastSeen > 1000 * 60 * 30);

          const profile: VisitorProfile = existingProfile ? {
            ...existingProfile,
            lastSeen: now,
            totalVisits: isNewSession ? existingProfile.totalVisits + 1 : existingProfile.totalVisits,
            userAgent, language, platform, screenResolution, timeZone
          } : {
            id,
            userAgent, language, platform, screenResolution, timeZone,
            firstSeen: now,
            lastSeen: now,
            totalVisits: 1,
            logs: []
          };

          return {
            currentVisitorId: id,
            profiles: { ...state.profiles, [id]: profile }
          };
        });

        // Only fetch IP address if not already resolved for current session
        const existingIp = get().profiles[id]?.ipAddress;
        if (!existingIp) {
          fetch('/api/visitor').then(res => res.json()).then(data => {
            if (data.ip) {
              set((state) => {
                const profile = state.profiles[id];
                if (!profile) return state;
                return {
                  profiles: {
                    ...state.profiles,
                    [id]: { ...profile, ipAddress: data.ip }
                  }
                };
              });
            }
          }).catch(() => { /* ignore */ });
        }
      },
      identifyVisitor: (name, email) => {
        const vid = get().currentVisitorId;
        if (!vid) return;
        set((state) => {
            const profile = state.profiles[vid];
            if (!profile) return state;
            return {
                profiles: {
                    ...state.profiles,
                    [vid]: {
                        ...profile,
                        identifiedName: name || profile.identifiedName,
                        identifiedEmail: email || profile.identifiedEmail
                    }
                }
            };
        });
      },
      logPageView: (path) => {
        const vid = get().currentVisitorId;
        if (!vid) return '';
        const id = generateId();
        const now = Date.now();
        set((state) => {
          const profile = state.profiles[vid];
          if (!profile) return state;
          const updatedLogs = [{ id, type: 'PAGE_VIEW' as LogType, path, timestamp: now }, ...profile.logs].slice(0, 30);
          return {
            profiles: {
              ...state.profiles,
              [vid]: {
                ...profile,
                lastSeen: now,
                logs: updatedLogs
              }
            }
          };
        });
        return id;
      },
      updatePageDuration: (logId, duration) => {
        const vid = get().currentVisitorId;
        if (!vid) return;
        set((state) => {
          const profile = state.profiles[vid];
          if (!profile) return state;
          return {
            profiles: {
              ...state.profiles,
              [vid]: {
                ...profile,
                logs: profile.logs.map(log => log.id === logId ? { ...log, duration } : log)
              }
            }
          };
        });
      },
      logAction: (action, details) => {
        const vid = get().currentVisitorId;
        if (!vid) return;
        const now = Date.now();
        set((state) => {
          const profile = state.profiles[vid];
          if (!profile) return state;
          const updatedLogs = [{ id: generateId(), type: 'ACTION' as LogType, action, details, timestamp: now }, ...profile.logs].slice(0, 30);
          return {
            profiles: {
              ...state.profiles,
              [vid]: {
                ...profile,
                lastSeen: now,
                logs: updatedLogs
              }
            }
          };
        });
      },
      clearAllData: () => set({ profiles: {}, currentVisitorId: '' }),
      deleteProfile: (id) => set((state) => {
        const { [id]: _, ...rest } = state.profiles;
        // If we are deleting our own profile, also clear currentVisitorId so it regenerates
        return { 
          profiles: rest,
          currentVisitorId: state.currentVisitorId === id ? '' : state.currentVisitorId
        };
      })
    }),
    {
      name: 'store-analytics',
    }
  )
);
