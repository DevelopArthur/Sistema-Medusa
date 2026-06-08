/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, Bell, Shield, Clock } from 'lucide-react';
import { Alert } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  setActiveTab: (tab: string) => void;
  firebaseStatus?: 'connecting' | 'connected' | 'offline';
  userName?: string;
  userRole?: string;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  alerts,
  onSelectAlert,
  setActiveTab,
  firebaseStatus = 'offline',
  userName = 'Arthur',
  userRole = 'Analista Sênior',
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const pendingAlerts = alerts.filter((a) => a.status === 'pending');

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A';

  const handleNotificationClick = (alert: Alert) => {
    onSelectAlert(alert);
    setActiveTab('alerts');
    setShowNotifications(false);
  };

  return (
    <header className="h-16 border-b border-[#e5e5e7] bg-white px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar matching screenshot */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
        <input
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar Entidades, Casos ou IDs..."
          className="w-full pl-10 pr-4 py-2 bg-[#f3f3f5] hover:bg-[#eeeef0] focus:bg-white text-sm text-text-primary rounded-[6px] border border-transparent focus:border-[#bfc9c2] outline-none transition-all placeholder:text-[#8e8e93]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary uppercase"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Action tray */}
      <div className="flex items-center gap-6">
        {/* Real-time Alerts Notification Bell */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-[#f3f3f5] rounded-full text-[#404944] relative transition"
            title="Alertas de conformidade"
          >
            <Bell className="w-5 h-5" />
            {pendingAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-risk-high rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-[#e5e5e7] shadow-lg py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-[#f0f0f2] flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary tracking-wider uppercase">
                  Alertas Ativos de Inteligência
                </span>
                <span className="text-[10px] bg-red-100 text-risk-high font-bold px-2 py-0.5 rounded-full">
                  {pendingAlerts.length} Novos
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {pendingAlerts.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-text-secondary">
                    Nenhum alerta pendente detectado.
                  </div>
                ) : (
                  pendingAlerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => handleNotificationClick(alert)}
                      className="w-full text-left px-4 py-3 hover:bg-[#f9f9fb] border-b border-[#f0f0f2] last:border-b-0 transition flex gap-3"
                    >
                      <div className="mt-0.5">
                        <Shield className="w-4 h-4 text-risk-high" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-text-primary truncate">
                            {alert.type}
                          </span>
                          <span className="text-[10px] font-mono text-text-secondary shrink-0">
                            {alert.id}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                          {alert.targetEntity}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-text-secondary" />
                          <span className="text-[10px] text-text-secondary font-mono">
                            {alert.detectedAt}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-[#e5e5e7]" />

        {/* Investigator profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-xs font-semibold text-text-primary leading-tight">
              {userName}
            </span>
            <span className="block text-[10px] text-text-secondary font-medium leading-tight mt-0.5">
              {userRole}
            </span>
            {firebaseStatus === 'connected' ? (
              <span className="text-[9px] text-emerald-600 font-bold flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block animate-pulse" />
                NUVEM ATIVA
              </span>
            ) : firebaseStatus === 'connecting' ? (
              <span className="text-[9px] text-amber-600 font-bold flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-amber-500 inline-block animate-pulse" />
                CONECTANDO...
              </span>
            ) : null}
          </div>

          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center border border-[#e5e5e7] hover:ring-2 hover:ring-primary/30 transition cursor-pointer overflow-hidden">
            <span className="text-xs font-bold tracking-wider">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
