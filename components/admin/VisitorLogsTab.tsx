'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { ResponsiveTableContainer } from '@/components/ui/ResponsiveTableContainer';

interface LogItem {
  id: string;
  timestamp: number;
  type: 'PAGE_VIEW' | 'ACTION';
  path?: string;
  action?: string;
  duration?: number;
  details?: any;
}

interface VisitorProfile {
  id: string;
  identifiedName?: string;
  identifiedEmail?: string;
  ipAddress?: string;
  platform: string;
  userAgent: string;
  lastSeen: number;
  firstSeen: number;
  totalVisits: number;
  logs: LogItem[];
}

interface AnalyticsType {
  profiles: { [key: string]: VisitorProfile };
  clearAllData: () => void;
  deleteProfile: (id: string) => void;
}

interface LogManagerType {
  exportLogsAsCSV: (profileId?: string) => void;
  exportLogsAsJSON: (profileId?: string) => void;
}

interface VisitorLogsTabProps {
  selectedVisitorId: string | null;
  setSelectedVisitorId: (id: string | null) => void;
  analytics: AnalyticsType;
  LogManager: LogManagerType;
  confirmClearLogs: boolean;
  setConfirmClearLogs: (val: boolean) => void;
  deletingProfileId: string | null;
  setDeletingProfileId: (id: string | null) => void;
}

export const VisitorLogsTab: React.FC<VisitorLogsTabProps> = ({
  selectedVisitorId,
  setSelectedVisitorId,
  analytics,
  LogManager,
  confirmClearLogs,
  setConfirmClearLogs,
  deletingProfileId,
  setDeletingProfileId,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-4 sm:p-6 shadow-xs">
        {!selectedVisitorId ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
              <div>
                <h3 className="font-sans text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  User & Visitor Log Control Center
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="bg-zinc-100 px-3 py-1.5 rounded-xl text-zinc-700">
                  Unique Profiles: {Object.keys(analytics.profiles || {}).length}
                </span>
                <button 
                  type="button"
                  onClick={() => LogManager.exportLogsAsCSV()} 
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Export CSV
                </button>
                <button 
                  type="button"
                  onClick={() => LogManager.exportLogsAsJSON()} 
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Export JSON
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (!confirmClearLogs) {
                      setConfirmClearLogs(true);
                      setTimeout(() => setConfirmClearLogs(false), 3000);
                    } else {
                      analytics.clearAllData();
                      setConfirmClearLogs(false);
                    }
                  }} 
                  className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                    confirmClearLogs
                      ? 'bg-red-600 text-white border border-red-700 shadow-sm'
                      : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  {confirmClearLogs ? 'Confirm Clear All' : 'Clear All Logs'}
                </button>
              </div>
            </div>

            <ResponsiveTableContainer showScrollCues={true}>
              <table className="w-full text-left text-xs whitespace-nowrap border-collapse min-w-[700px]">
                <thead className="bg-zinc-100 text-zinc-600 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <tr>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Visitor ID / Name</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">IP Address</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Platform</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Browser</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Last Seen</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-right">Visits</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-right">Events</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {Object.values(analytics.profiles || {}).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 border-b border-r border-zinc-200 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                        No visitor activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    Object.values(analytics.profiles || {})
                      .sort((a, b) => b.lastSeen - a.lastSeen)
                      .map((profile) => (
                        <tr
                          key={profile.id}
                          onClick={() => setSelectedVisitorId(profile.id)}
                          className="hover:bg-amber-50/40 cursor-pointer transition-colors group"
                        >
                          <td className="px-3 py-1.5 border-b border-r border-zinc-200">
                            <div className="text-xs font-bold font-mono text-zinc-800 group-hover:text-primary transition-colors">
                              {profile.identifiedName ? `${profile.identifiedName} (${profile.id})` : profile.id}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 border-b border-r border-zinc-200">
                            <div className="text-xs font-semibold text-emerald-600">
                              {profile.ipAddress || 'Pending'}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 border-b border-r border-zinc-200">
                            <div className="text-xs text-zinc-600 font-medium">
                              {profile.platform}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 border-b border-r border-zinc-200">
                            <div className="text-xs text-zinc-600 truncate max-w-[120px]" title={profile.userAgent}>
                              {(profile.userAgent || '').split(' ')[0]}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 border-b border-r border-zinc-200">
                            <div className="text-xs text-zinc-500 font-medium">
                              {new Date(profile.lastSeen).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 border-b border-r border-zinc-200 text-right">
                            <div className="text-xs font-bold text-zinc-600">
                              {profile.totalVisits}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 border-b border-r border-zinc-200 text-right">
                            <div className="text-2xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full inline-block border border-blue-100">
                              {(profile.logs || []).length}
                            </div>
                          </td>
                          <td className="px-3 py-1.5 border-b border-r border-zinc-200 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button 
                                type="button"
                                title="Export CSV"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  LogManager.exportLogsAsCSV(profile.id);
                                }} 
                                className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-2xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                              >
                                CSV
                              </button>
                              <button 
                                type="button"
                                title="Export JSON"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  LogManager.exportLogsAsJSON(profile.id);
                                }} 
                                className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-2xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                              >
                                JSON
                              </button>
                              <button 
                                type="button"
                                title={deletingProfileId === profile.id ? "Click to confirm deletion" : "Delete Profile"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (deletingProfileId !== profile.id) {
                                    setDeletingProfileId(profile.id);
                                    setTimeout(() => setDeletingProfileId(null), 3000);
                                  } else {
                                    analytics.deleteProfile(profile.id);
                                    setDeletingProfileId(null);
                                  }
                                }} 
                                className={`px-1.5 py-0.5 rounded text-2xs font-bold transition-colors cursor-pointer ${
                                  deletingProfileId === profile.id 
                                    ? 'bg-red-600 text-white border border-red-700 shadow-xs' 
                                    : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                }`}
                              >
                                {deletingProfileId === profile.id ? 'Confirm' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </ResponsiveTableContainer>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-100">
              <div>
                <button onClick={() => setSelectedVisitorId(null)} className="text-xs font-bold text-primary hover:underline mb-2 flex items-center gap-1 cursor-pointer">
                  &larr; Back to Visitors List
                </button>
                <h3 className="font-sans text-lg font-bold text-zinc-800">
                  Visitor Log Detail: <span className="font-mono text-zinc-500 text-sm bg-zinc-100 px-2 py-1 rounded ml-2">
                    {analytics.profiles[selectedVisitorId]?.identifiedName ? `${analytics.profiles[selectedVisitorId].identifiedName} - ` : ''}
                    {analytics.profiles[selectedVisitorId]?.identifiedEmail ? `${analytics.profiles[selectedVisitorId].identifiedEmail} ` : ''}
                    ({selectedVisitorId})
                  </span>
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-2xs font-bold mt-3">
                  <button 
                    type="button"
                    onClick={() => selectedVisitorId && LogManager.exportLogsAsCSV(selectedVisitorId)} 
                    className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Export CSV
                  </button>
                  <button 
                    type="button"
                    onClick={() => selectedVisitorId && LogManager.exportLogsAsJSON(selectedVisitorId)} 
                    className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Export JSON
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (selectedVisitorId) {
                        if (deletingProfileId !== selectedVisitorId) {
                          setDeletingProfileId(selectedVisitorId);
                          setTimeout(() => setDeletingProfileId(null), 3000);
                        } else {
                          analytics.deleteProfile(selectedVisitorId);
                          setDeletingProfileId(null);
                          setSelectedVisitorId(null);
                        }
                      }
                    }} 
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      deletingProfileId === selectedVisitorId 
                        ? 'bg-red-600 text-white border border-red-700 shadow-sm' 
                        : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {deletingProfileId === selectedVisitorId ? 'Confirm Delete' : 'Delete Profile'}
                  </button>
                </div>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs text-zinc-600 space-y-1">
                <div><span className="font-bold text-zinc-800">First Seen:</span> {analytics.profiles[selectedVisitorId] ? new Date(analytics.profiles[selectedVisitorId].firstSeen).toLocaleString() : ''}</div>
                <div><span className="font-bold text-zinc-800">Last Seen:</span> {analytics.profiles[selectedVisitorId] ? new Date(analytics.profiles[selectedVisitorId].lastSeen).toLocaleString() : ''}</div>
                <div><span className="font-bold text-zinc-800">Total Visits:</span> {analytics.profiles[selectedVisitorId]?.totalVisits}</div>
                <div><span className="font-bold text-zinc-800">IP Address:</span> {analytics.profiles[selectedVisitorId]?.ipAddress || 'Unknown'}</div>
              </div>
            </div>

            <ResponsiveTableContainer showScrollCues={true}>
              <table className="w-full text-left text-xs whitespace-nowrap border-collapse min-w-[600px]">
                <thead className="bg-zinc-100 text-zinc-600 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <tr>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 w-32">Date & Time</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Type</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100">Action / Path</th>
                    <th className="px-3 py-2 border-b border-r border-zinc-200 bg-zinc-100 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {(analytics.profiles[selectedVisitorId]?.logs || []).map((log) => (
                    <tr key={log.id} className="hover:bg-amber-50/40 transition-colors group">
                      <td className="px-3 py-1.5 border-b border-r border-zinc-200">
                        <div className="text-2xs font-mono text-zinc-500">
                          {new Date(log.timestamp).toLocaleDateString()}
                          <span className="ml-1.5 text-zinc-400">
                            {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 border-b border-r border-zinc-200">
                        <span className={`px-1.5 py-0.5 rounded text-2xs font-bold uppercase tracking-wider ${
                          log.type === 'PAGE_VIEW' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {log.type === 'PAGE_VIEW' ? 'Page View' : 'Action'}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 border-b border-r border-zinc-200 max-w-[300px] truncate" title={log.path || (log.details ? JSON.stringify(log.details) : log.action)}>
                        <div className="text-xs font-semibold text-zinc-700">
                          {log.type === 'PAGE_VIEW' ? log.path : log.action}
                        </div>
                        {log.type === 'ACTION' && log.details && (
                          <div className="text-2xs text-zinc-400 truncate mt-0.5">
                            {JSON.stringify(log.details)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 border-b border-r border-zinc-200 text-right">
                        {log.duration !== undefined ? (
                          <span className="text-2xs font-mono font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                            {log.duration}s
                          </span>
                        ) : (
                          <span className="text-2xs text-zinc-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTableContainer>
          </>
        )}
      </div>
    </div>
  );
};
