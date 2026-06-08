/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Download,
  FolderDot,
  FileCheck2,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { Case, Alert, Entity } from '../types';

interface DashboardViewProps {
  cases: Case[];
  alerts: Alert[];
  entities: Entity[];
  setActiveTab: (tab: string) => void;
  onSelectCase: (c: Case) => void;
  onSelectAlert: (a: Alert) => void;
  onOpenNewCaseModal: () => void;
}

// Helper to extract year, month, and day from various date formats
const getYearMonthDay = (dateStr: string) => {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})[./-](\d{2})[./-](\d{2})/);
  if (match) {
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10) - 1, // 0-indexed
      day: parseInt(match[3], 10),
    };
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
    };
  }
  return null;
};

// Helper to parse currency string (e.g., "R$ 14.2M") to float number
const parseValueToMillions = (valStr: string): number => {
  if (!valStr) return 0;
  const clean = valStr.replace(/R\$\s*/i, '').replace(/M/i, '').replace(',', '.').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

export default function DashboardView({
  cases,
  alerts,
  entities,
  setActiveTab,
  onSelectCase,
  onSelectAlert,
  onOpenNewCaseModal,
}: DashboardViewProps) {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Filter stats
  const activeCasesCount = cases.filter((c) => c.status !== 'closed').length;
  const pendingAlertsCount = alerts.filter((a) => a.status === 'pending').length;

  const isSystemEmpty = cases.length === 0 && alerts.length === 0;

  // Determine current calendar month details
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth(); // 0-11
  const currentMonthDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const currentMonthName = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ][currentMonthIndex];

  // Dynamically map cases and alerts to the respective day of the current month
  const daysData = Array.from({ length: currentMonthDays }, (_, index) => {
    const day = index + 1;
    const label = day < 10 ? `0${day}` : `${day}`;
    
    // Filter cases by matching day number
    const dayCases = cases.filter(c => {
      const dateObj = getYearMonthDay(c.createdAt);
      if (!dateObj) return false;
      return dateObj.day === day;
    });

    // Filter alerts by matching day number (clamp day to max days of current month)
    const dayAlerts = alerts.filter(a => {
      const dateObj = getYearMonthDay(a.detectedAt);
      if (!dateObj) return false;
      const mappedDay = Math.min(dateObj.day, currentMonthDays);
      return mappedDay === day;
    });

    // Calculate sum of financial values
    const totalValue = dayCases.reduce((acc, c) => acc + parseValueToMillions(c.associatedValue), 0);
    const formattedValue = totalValue > 0 ? `R$ ${totalValue.toFixed(1)}M` : 'R$ 0';

    return {
      label,
      day,
      casos: dayCases.length,
      alertas: dayAlerts.length,
      valorTotal: formattedValue
    };
  });

  // Dynamically calculate peak values for grid metrics
  const maxDayValue = Math.max(
    ...daysData.map((d) => Math.max(d.casos, d.alertas)),
    3 // default baseline minimum limit so empty charts look balanced
  );
  
  const limit = maxDayValue < 5 ? 5 : Math.ceil(maxDayValue / 5) * 5;

  const gridLine3 = limit;
  const gridLine2 = Math.round(limit * 0.6);
  const gridLine1 = Math.round(limit * 0.3);

  // Find peak day of activity
  const peakDayObj = daysData.reduce((prev, current) => {
    return (current.casos + current.alertas > prev.casos + prev.alertas) ? current : prev;
  }, { day: 1, casos: 0, alertas: 0, label: '01' });

  const peakActivityText = (peakDayObj.casos + peakDayObj.alertas > 0)
    ? `${peakDayObj.day} de ${currentMonthName}`
    : 'Nenhum';

  const averageResponseTimeText = isSystemEmpty ? '0.0 Horas' : '12.4 Horas';

  // PDF Export Mock
  const [isExporting, setIsExporting] = useState(false);
  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Relatório PDF do Resumo Executivo compilado e pronto para downloads judiciais.');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Section / Executive Summary header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-primary">
            Resumo Executivo
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Status operacional da Unidade de Inteligência
          </p>
        </div>

        {/* Dashboard Filters & Report actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="bg-white border border-[#e5e5e7] hover:bg-[#f3f3f5] rounded-[6px] px-3.5 py-2 text-xs font-semibold text-text-primary flex items-center gap-2 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-text-secondary" />
            <span>{isExporting ? 'Exportando...' : 'Exportar PDF'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (4 Columns exactly like screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: CASOS ABERTOS */}
        <div
          onClick={() => setActiveTab('cases')}
          className="bg-white rounded-[10px] p-6 border border-[#e5e5e0] shadow-[0px_4px_24px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer transition relative"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FolderDot className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[11px] font-bold font-mono text-risk-low bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              {isSystemEmpty ? '0%' : '+4%'}
            </span>
          </div>
          <p className="text-[11px] font-bold tracking-wider text-text-secondary uppercase select-none mt-4">
            Casos Abertos
          </p>
          <h3 className="text-3xl font-bold font-display text-text-primary tracking-tight mt-1">
            {activeCasesCount}
          </h3>
        </div>

        {/* KPI: ALERTAS ATIVOS */}
        <div
          onClick={() => setActiveTab('alerts')}
          className="bg-white rounded-[10px] p-6 border border-[#e5e5e0] shadow-[0px_4px_24px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer transition relative"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-red-50 rounded-lg text-risk-high">
              <ShieldAlert className="w-5 h-5 text-risk-high" />
            </div>
            <span className="text-[11px] font-bold font-mono text-risk-high bg-red-50 px-2 py-0.5 rounded-full">
              {isSystemEmpty ? '0%' : '+12%'}
            </span>
          </div>
          <p className="text-[11px] font-bold tracking-wider text-text-secondary uppercase select-none mt-4">
            Alertas Ativos
          </p>
          <h3 className="text-3xl font-bold font-display text-text-primary tracking-tight mt-1">
            {pendingAlertsCount}
          </h3>
        </div>

        {/* KPI: ENTIDADES MONITORADAS */}
        <div
          onClick={() => setActiveTab('entities')}
          className="bg-white rounded-[10px] p-6 border border-[#e5e5e0] shadow-[0px_4px_24px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer transition relative"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[11px] font-bold font-mono text-risk-low bg-emerald-50 px-2 py-0.5 rounded-full">
              {isSystemEmpty ? '0' : '+210'}
            </span>
          </div>
          <p className="text-[11px] font-bold tracking-wider text-text-secondary uppercase select-none mt-4">
            Entidades Monitoradas
          </p>
          <h3 className="text-3xl font-bold font-display text-text-primary tracking-tight mt-1">
            {entities.length}
          </h3>
        </div>

        {/* KPI: INVESTIGAÇÕES CONCLUÍDAS */}
        <div
          onClick={() => setActiveTab('cases')}
          className="bg-white rounded-[10px] p-6 border border-[#e5e5e0] shadow-[0px_4px_24px_rgba(0,0,0,0.03)] hover:shadow-md cursor-pointer transition relative"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-50 rounded-lg text-risk-low">
              <FileCheck2 className="w-5 h-5 text-risk-low" />
            </div>
            <span className="text-[11px] font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              {isSystemEmpty ? '0%' : '+18%'}
            </span>
          </div>
          <p className="text-[11px] font-bold tracking-wider text-text-secondary uppercase select-none mt-4">
            Investigações Concluídas
          </p>
          <h3 className="text-3xl font-bold font-display text-text-primary tracking-tight mt-1">
            {isSystemEmpty ? 0 : 842}
          </h3>
        </div>
      </div>

      {/* Main Volume Operacional Card */}
      <div className="bg-white rounded-[10px] border border-[#e5e5e0] shadow-[0px_4px_24px_rgba(0,0,0,0.02)] p-6">
        <div className="flex items-center justify-between border-b border-[#f0f0f2] pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold font-display tracking-tight text-text-primary">
              Volume Operacional - {currentMonthName} {currentYear}
            </h2>
            <p className="text-xs text-text-secondary">
              Casos e Alertas processados neste mês ({currentMonthDays} dias)
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-text-secondary">Casos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded shadow-inner bg-[#e2e2e4]" />
              <span className="text-text-secondary">Alertas</span>
            </div>
          </div>
        </div>

        {/* Stunning responsive high-density interactive horizontal/vertical SVG bar charts */}
        <div className="relative w-full mt-4">
          {/* Chart Area with a clear, shared height */}
          <div className="relative h-48 w-full flex items-end justify-between px-2">
            
            {/* Background Grid Lines (perfectly aligned with computed grid values) */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-[#aeaeae] font-mono leading-none z-0">
              <div className="border-t border-[#f0f0f2] w-full pt-1.5 flex justify-between">
                <span>{gridLine3}</span>
              </div>
              <div className="border-t border-[#f0f0f2] w-full pt-1.5 flex justify-between">
                <span>{gridLine2}</span>
              </div>
              <div className="border-t border-[#f0f0f2] w-full pt-1.5 flex justify-between">
                <span>{gridLine1}</span>
              </div>
              <div className="w-full h-0 pt-1.5 border-t border-[#d5d5d7] flex justify-between">
                <span>0</span>
              </div>
            </div>

            {/* Bars */}
            {daysData.map((data, i) => {
              const maxVal = limit;
              // Percentual Heights - computed perfectly relative to the container height (exactly h-48)
              const alertaHeightPercent = Math.min((data.alertas / maxVal) * 100, 100);
              const casoHeightPercent = Math.min((data.casos / maxVal) * 100, 100);
              const isHovered = hoveredBarIndex === i;

              return (
                <div
                  key={data.day}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group z-10"
                  onMouseEnter={() => setHoveredBarIndex(i)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  style={{ minWidth: '4px' }}
                >
                  {/* Floating tooltip */}
                  {isHovered && (
                    <div className="absolute -top-20 bg-primary/95 text-white text-[11px] p-2.5 rounded-lg shadow-xl z-30 flex flex-col pointer-events-none min-w-[120px] border border-white/10 leading-normal backdrop-blur-xs">
                      <span className="font-bold border-b border-white/20 pb-0.5 mb-1 text-center">
                        {data.day} de {currentMonthName}
                      </span>
                      <span className="flex justify-between gap-4">Casos: <strong className="font-mono">{data.casos}</strong></span>
                      <span className="flex justify-between gap-4">Alertas: <strong className="font-mono">{data.alertas}</strong></span>
                      <span className="text-[10px] text-emerald-300 mt-1 pt-0.5 border-t border-white/10 flex justify-between">
                        Fin: <strong className="font-mono font-bold">{data.valorTotal}</strong>
                      </span>
                    </div>
                  )}

                  {/* Compact Side-by-Side vertical columns */}
                  <div className="w-full flex items-end justify-center gap-[1px] sm:gap-[2px] h-full px-[1px]">
                    {/* Case Bar (Green) */}
                    <div
                      style={{ height: `${casoHeightPercent}%` }}
                      className={`w-1.5 sm:w-2.5 rounded-t-[2px] bg-primary transition-all duration-200 ${
                        isHovered ? 'brightness-110 shadow-xs scale-x-110' : 'bg-opacity-85'
                      }`}
                    />

                    {/* Alert bar (lighter bg) */}
                    <div
                      style={{ height: `${alertaHeightPercent}%` }}
                      className={`w-1.5 sm:w-2.5 rounded-t-[2px] bg-[#e2e2e4] transition-all duration-200 ${
                        isHovered ? 'bg-[#d0d0d5] shadow-xs' : ''
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Labels Row */}
          <div className="w-full flex justify-between px-2 border-b border-[#eeeef0] pb-2 pt-3 text-[10px] font-mono font-medium text-text-secondary select-none">
            {daysData.map((data) => {
              const isFirst = data.day === 1;
              const isLast = data.day === currentMonthDays;
              const isFifth = data.day % 5 === 0 && data.day !== currentMonthDays;
              
              const shouldShowLabel = isFirst || isLast || isFifth;

              return (
                <div key={data.day} className="flex-1 flex justify-center text-center">
                  {shouldShowLabel ? (
                    <span className="opacity-95">{data.label}</span>
                  ) : (
                    <span className="text-transparent">.</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Details Section inside Volume Operacional Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Stat 1: Activity Peak */}
          <div className="bg-[#f3f3f5]/50 flex items-center gap-4 p-4 rounded-[8px] border border-[#eeeef0] hover:bg-[#f3f3f5] transition-all">
            <div className="p-3 bg-white rounded-lg text-primary shadow-sm">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-text-secondary uppercase select-none">
                Pico de Atividade
              </span>
              <p className="text-lg font-bold font-display text-text-primary mt-0.5">
                {peakActivityText}
              </p>
            </div>
          </div>

          {/* Stat 2: Medium Response time */}
          <div className="bg-[#f3f3f5]/50 flex items-center gap-4 p-4 rounded-[8px] border border-[#eeeef0] hover:bg-[#f3f3f5] transition-all">
            <div className="p-3 bg-white rounded-lg text-primary shadow-sm">
              <Clock className="w-5 h-5 text-[#3f6658]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#8e8e93] uppercase select-none">
                Tempo Médio de Resposta
              </span>
              <p className="text-lg font-bold font-display text-text-primary mt-0.5">
                {averageResponseTimeText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Under-the-folds recent prioritised cases list */}
      <div className="bg-white rounded-[10px] p-6 border border-[#e5e5e0] shadow-[0px_4px_24px_rgba(0,0,0,0.01)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0f0f2] pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary font-display flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-risk-high" />
              Prioridades da Unidade Investigativa
            </h2>
            <p className="text-xs text-text-secondary">
              Visão consolidada de casos escalados e de risco crítico
            </p>
          </div>

          <div
            onClick={() => setActiveTab('cases')}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Ver todos ({cases.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f2] text-[10px] font-extrabold text-text-secondary uppercase tracking-widest bg-slate-50/50">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Caso</th>
                <th className="py-3 px-4">Alvo Principal</th>
                <th className="py-3 px-4">Montante</th>
                <th className="py-3 px-4">Risco</th>
                <th className="py-3 px-4">Atribuído a</th>
                <th className="py-3 px-4 text-center">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1] text-xs">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-secondary font-sans">
                    Nenhuma investigação ou prioridade crítica catalogada.
                  </td>
                </tr>
              ) : (
                cases.slice(0, 3).map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#f9f9fb] transition cursor-pointer"
                    onClick={() => {
                      onSelectCase(item);
                      setActiveTab('cases');
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-text-secondary">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">
                      {item.target}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-text-primary font-semibold font-tab-nums">
                      {item.associatedValue}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.riskLevel === 'high'
                            ? 'bg-red-50 text-risk-high'
                            : item.riskLevel === 'medium'
                            ? 'bg-amber-50 text-risk-medium'
                            : 'bg-emerald-50 text-risk-low'
                        }`}
                      >
                        {item.riskLevel === 'high' ? 'ALTO' : item.riskLevel === 'medium' ? 'MÉDIO' : 'BAIXO'} ({item.riskScore})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">
                      {item.assignedTo}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="text-primary hover:text-primary-container inline-flex items-center gap-1 font-semibold">
                        <span>Analisar</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
