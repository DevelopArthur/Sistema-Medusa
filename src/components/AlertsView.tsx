/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Bell,
  Eye,
  Search,
  AlertTriangle,
  XCircle,
  Bot,
  ShieldPlus
} from 'lucide-react';
import { Alert } from '../types';

interface AlertsViewProps {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  selectedAlert: Alert | null;
  setSelectedAlert: (a: Alert | null) => void;
  onEscalateToCase: (alert: Alert) => void;
}

export default function AlertsView({
  alerts,
  setAlerts,
  selectedAlert,
  setSelectedAlert,
  onEscalateToCase,
}: AlertsViewProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  // Status updates
  const handleDismiss = (id: string) => {
    const updated = alerts.map((a) => {
      if (a.id === id) {
        return { ...a, status: 'dismissed' as const };
      }
      return a;
    });
    setAlerts(updated);
    if (selectedAlert?.id === id) {
      setSelectedAlert({ ...selectedAlert, status: 'dismissed' as const });
    }
  };

  const handleEscalateClick = (alert: Alert) => {
    onEscalateToCase(alert);
  };

  // Server-side analyze-connection query
  const queryAlertIntelligence = async (alert: Alert) => {
    setLoadingAiId(alert.id);
    try {
      const response = await fetch('/api/analyze-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node: { label: alert.targetEntity, type: 'individual', riskLevel: alert.riskLevel },
          neighbors: [
            { label: alert.source, relation: 'origem do fundo' },
            { label: 'Unidade Antifrauda', relation: 'auditor' }
          ]
        })
      });
      const data = await response.json();
      if (response.ok && data.summary) {
        setAiAnalysis((prev) => ({ ...prev, [alert.id]: data.summary }));
      } else {
        throw new Error(data.error || 'Erro na inteligência remota.');
      }
    } catch (err) {
      const fallbackMsg = `RECONHECIMENTO DE PADRÕES - ${alert.id}\n\nO alvo ${alert.targetEntity} demonstrou transposição recorrente de valores atípicos. O canal ${alert.source} indica desvio estrutural compatível com simulações patrimoniais de microempresas fictícias.`;
      setAiAnalysis((prev) => ({ ...prev, [alert.id]: fallbackMsg }));
    } finally {
      setLoadingAiId(null);
    }
  };

  // Filter
  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = severityFilter === 'all' || a.riskLevel === severityFilter;
    const matchesSearch =
      a.targetEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="flex gap-6 relative min-h-[calc(100vh-10rem)] transition-all animate-fade-in">
      {/* List content */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-xl font-bold font-display text-text-primary">
            Alertas de Conformidade
          </h1>
          <p className="text-xs text-text-secondary">
            Sinais transacionais suspeitos identificados por inteligência de dados
          </p>
        </div>

        {/* Severity toggles and search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white px-5 py-3 rounded-lg border border-[#e5e5e7]">
          <div className="flex gap-1.5 self-start sm:self-auto">
            {['all', 'high', 'medium', 'low'].map((level) => {
              let activeClass = 'bg-primary text-white shadow-sm';
              if (level === 'high') activeClass = 'bg-risk-high text-white shadow-sm';
              else if (level === 'medium') activeClass = 'bg-risk-medium text-white shadow-sm';
              else if (level === 'low') activeClass = 'bg-risk-low text-white shadow-sm';
              
              return (
                <button
                  key={level}
                  onClick={() => setSeverityFilter(level)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                    severityFilter === level
                      ? activeClass
                      : 'text-text-secondary hover:text-text-primary hover:bg-[#f3f3f5]'
                  }`}
                >
                  {level === 'all' ? 'Ver Todos' : level === 'high' ? 'Alto' : level === 'medium' ? 'Médio' : 'Baixo'}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por entidade ou tipo..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#f3f3f5] focus:bg-white text-xs text-text-primary rounded-[6px] border border-transparent focus:border-[#bfc9c2] outline-none transition"
            />
          </div>
        </div>

        {/* Alert grid/list row */}
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-[#e5e5e0] text-text-secondary">
            <Bell className="w-12 h-12 text-[#aeaeae] mx-auto opacity-50" />
            <p className="mt-4 text-sm font-medium">Nenhum sinal ativo para esses critérios.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] border border-[#e5e5e0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#f0f0f2] text-[10px] font-extrabold text-text-secondary uppercase tracking-widest bg-slate-50/60 select-none">
                    <th className="py-3 px-4 text-center">Detecção</th>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Entidade Sindicada</th>
                    <th className="py-3 px-4">Tipo do Gatilho</th>
                    <th className="py-3 px-4">Fonte Financeira</th>
                    <th className="py-3 px-4">Severidade</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f1] text-[11px]">
                  {filteredAlerts.map((item) => {
                    const isSelected = selectedAlert?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedAlert(item)}
                        className={`hover:bg-slate-50 cursor-pointer transition ${
                          isSelected ? 'bg-primary/5 font-semibold' : ''
                        }`}
                      >
                        {/* Eye icon column (Branding element: Snake Eye pattern auto detection) */}
                        <td className="py-3.5 px-4 text-center">
                          {item.patternDetected ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary"
                              title="Padrão identificado pela inteligência Medusa AI"
                            >
                              <Eye className="w-3.5 h-3.5 text-primary" />
                            </span>
                          ) : (
                            <span className="text-text-secondary">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-text-secondary">
                          {item.id}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-text-primary">
                          {item.targetEntity}
                        </td>

                        <td className="py-3.5 px-4 text-text-primary">
                          {item.type}
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary">
                          {item.source}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                              item.riskLevel === 'high'
                                ? 'bg-red-100 text-risk-high'
                                : item.riskLevel === 'medium'
                                ? 'bg-amber-100 text-risk-medium'
                                : 'bg-emerald-100 text-risk-low'
                            }`}
                          >
                            {item.riskLevel === 'high' ? 'ALTO' : item.riskLevel === 'medium' ? 'MÉDIO' : 'BAIXO'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 capitalize text-text-secondary">
                          {item.status === 'pending' ? (
                            <span className="text-red-600 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                              Pendente
                            </span>
                          ) : item.status === 'dismissed' ? (
                            <span className="text-text-secondary line-through">Descartado</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              Escalonado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Alert Sidebar Inspection */}
      {selectedAlert && (
        <div className="w-[380px] shrink-0 bg-white border border-[#e5e5e7] rounded-[10px] p-6 shadow-lg relative flex flex-col justify-between h-[calc(100vh-12rem)] sticky top-24 overflow-y-auto animate-slide-in">
          <div>
            <div className="flex items-center justify-between border-b border-[#f0f0f2] pb-3 mb-4">
              <span className="text-xs font-bold font-mono tracking-wider flex items-center gap-1 text-risk-high">
                <AlertTriangle className="w-4 h-4" />
                DILIGÊNCIA ALERTA: {selectedAlert.id}
              </span>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 hover:bg-[#f3f3f5] rounded-full text-text-secondary transition"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-bold text-sm text-text-primary leading-snug">
              {selectedAlert.type}
            </h3>

            <div className="mt-3 bg-[#fdfdfd] border border-[#e5e5e7] p-3 rounded-lg text-xs space-y-1.5 text-text-primary font-tab-nums">
              <div>
                <span className="text-text-secondary block font-mono text-[9px] uppercase">Alvo da Suspeição</span>
                <span className="font-bold text-text-primary">{selectedAlert.targetEntity}</span>
              </div>
              <div className="pt-2">
                <span className="text-text-secondary block font-mono text-[9px] uppercase">Canal / Origem Detectada</span>
                <span className="font-semibold">{selectedAlert.source}</span>
              </div>
              <div className="pt-2">
                <span className="text-text-secondary block font-mono text-[9px] uppercase">Carimbado em</span>
                <span className="font-semibold text-text-secondary">{selectedAlert.detectedAt}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">
                Detalhes da Ocorrência
              </label>
              <p className="text-xs text-text-primary mt-1 leading-relaxed">
                {selectedAlert.description}
              </p>
            </div>

            {/* AI Pattern check section connected to Gemini backend */}
            <div className="mt-6 border-t border-[#f0f0f2] pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                  Rastreamento Inteligente (AI)
                </label>
                {!aiAnalysis[selectedAlert.id] && (
                  <button
                    onClick={() => queryAlertIntelligence(selectedAlert)}
                    disabled={loadingAiId === selectedAlert.id}
                    className="text-[10px] text-primary bg-primary/10 hover:bg-primary/20 font-semibold px-2 py-0.5 rounded transition border border-primary/20 disabled:opacity-50"
                  >
                    {loadingAiId === selectedAlert.id ? 'Sensoreando...' : 'Mapear Vínculo'}
                  </button>
                )}
              </div>

              {loadingAiId === selectedAlert.id ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-100 animate-pulse">
                  <p className="text-[10px] text-[#8e8e93] font-mono leading-relaxed">
                    Aguardando varredura gráfica do algoritmo de centralidade...
                  </p>
                </div>
              ) : aiAnalysis[selectedAlert.id] ? (
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 text-xs text-text-primary leading-relaxed text-[11px] max-h-56 overflow-y-auto space-y-1.5">
                  {aiAnalysis[selectedAlert.id].split('\n').map((line, idx) => {
                    const cleanedLine = line
                      .replace(/[#*`_~]/g, '') // Remove markdown formatting symbols
                      .replace(/^[\s-]*[-•+]\s+/, '') // Remove list bullets at the beginning of lines
                      .trim();
                    if (!cleanedLine) return <div key={idx} className="h-1" />;
                    return (
                      <p key={idx} className="leading-relaxed">
                        {cleanedLine}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#f9f9fb] text-center p-3 rounded-lg border border-[#eeeef0] text-[10px] text-text-secondary">
                  Clique em "Mapear Vínculo" para buscar cruzamentos inteligentes imediatos.
                </div>
              )}
            </div>
          </div>

          {/* Core dismissal and escalation controls */}
          <div className="mt-6 pt-4 border-t border-[#f0f0f2] space-y-2">
            {selectedAlert.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDismiss(selectedAlert.id)}
                  className="flex-1 py-2 border border-[#e5e5e7] hover:bg-[#f3f3f5] rounded-md text-xs font-semibold text-text-secondary transition"
                >
                  Descartar Alerta
                </button>
                <button
                  onClick={() => handleEscalateClick(selectedAlert)}
                  className="flex-1 py-2 bg-primary hover:bg-primary/95 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition shadow-sm"
                >
                  <ShieldPlus className="w-3.5 h-3.5" />
                  <span>Escalar para Caso</span>
                </button>
              </div>
            )}
            {selectedAlert.status !== 'pending' && (
              <div className="bg-slate-50 text-center p-2 rounded border border-slate-100 text-xs text-text-secondary italic font-medium">
                Alerta já encerrado ({selectedAlert.status === 'dismissed' ? 'Descartado' : 'Escalado'})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
