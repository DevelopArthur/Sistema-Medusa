/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LayoutDashboard,
  Briefcase,
  BellRing,
  GitCommit,
  Fingerprint,
  FileSpreadsheet,
  Settings,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewCaseModal: () => void;
  pendingAlertsCount: number;
  activeCasesCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenNewCaseModal,
  pendingAlertsCount,
  activeCasesCount,
}: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'cases',
      label: 'Casos',
      icon: Briefcase,
      badge: activeCasesCount > 0 ? activeCasesCount : null,
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: BellRing,
      badge: pendingAlertsCount > 0 ? pendingAlertsCount : null,
    },
    {
      id: 'entities',
      label: 'Entidades',
      icon: Fingerprint,
      badge: null,
    },
    {
      id: 'link-analysis',
      label: 'Análise de Vínculos',
      icon: GitCommit,
      badge: null,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-[260px] border-r border-[#e5e5e7] bg-white flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Brand logo header with custom inline Masterpiece SVG Serpent's Eye */}
      <div className="pt-6 pl-7 pr-5 pb-4 flex items-center gap-1.5 border-b border-[#f3f3f5]">
        <div className="w-16 h-16 -ml-2 -mr-1.5 shrink-0 relative flex items-center justify-center overflow-hidden">
          <img 
            src="/assets/medusa-logo.png" 
            alt="Medusa Logo" 
            className="w-full h-full object-contain" 
            referrerPolicy="no-referrer" 
          />
        </div>
        
        <div className="leading-tight">
          <div className="flex items-center gap-1">
            <span className="font-display font-bold text-sm tracking-[0.14em] text-[#003526]">MEDUSA</span>
            <span className="text-[9px] text-white bg-[#003526] px-1 py-0.5 rounded font-bold">AML</span>
          </div>
          <p className="text-[9px] font-mono uppercase tracking-wider text-text-secondary mt-0.5">Inteligência Financeira</p>
        </div>
      </div>

      {/* Nav menu */}
      <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-[8px] transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-[#f3f3f5]'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                />
                <span className="text-sm font-sans tracking-wide">
                  {item.label}
                </span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[10px] h-4 min-w-4 px-1 flex items-center justify-center font-bold font-mono rounded-full ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-[#eeeef0] text-text-secondary'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Action and bottom controls */}
      <div className="p-4">
        {/* "+ New Investigation" Button matching screenshot */}
        <button
          id="btn-new-investigation"
          onClick={onOpenNewCaseModal}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-[6px] text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Investigação</span>
        </button>
      </div>
    </aside>
  );
}
