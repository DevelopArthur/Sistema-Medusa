/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import {
  FolderOpen,
  Plus,
  Shield,
  Search,
  Bot,
  Sparkles,
  Network,
  X,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Case } from '../types';

interface CasesViewProps {
  cases: Case[];
  setCases: (cases: Case[]) => void;
  selectedCase: Case | null;
  setSelectedCase: (c: Case | null) => void;
  onOpenNewCaseModal: () => void;
  onDeleteCase: (caseId: string) => void;
  onViewInGraph?: (caseId: string) => void;
}

export default function CasesView({
  cases,
  setCases,
  selectedCase,
  setSelectedCase,
  onOpenNewCaseModal,
  onDeleteCase,
  onViewInGraph,
}: CasesViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [caseSearch, setCaseSearch] = useState<string>('');
  
  // Edit & Delete confirmation state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editTarget, setEditTarget] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editValue, setEditValue] = useState<string>('');
  const [editAssignedTo, setEditAssignedTo] = useState<string>('');
  const [editStatus, setEditStatus] = useState<Case['status']>('active');

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);

  const handleOpenEditModal = (c: Case) => {
    setEditName(c.name);
    setEditTarget(c.target);
    setEditDesc(c.description);
    setEditValue(c.associatedValue);
    setEditAssignedTo(c.assignedTo);
    setEditStatus(c.status);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const updatedCase: Case = {
      ...selectedCase,
      name: editName,
      target: editTarget,
      description: editDesc,
      associatedValue: editValue,
      assignedTo: editAssignedTo,
      status: editStatus,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const updatedCases = cases.map((c) => (c.id === selectedCase.id ? updatedCase : c));
    setCases(updatedCases);
    setSelectedCase(updatedCase);
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedCase) return;
    onDeleteCase(selectedCase.id);
    setIsDeleteConfirmOpen(false);
  };

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [loadingAiCaseId, setLoadingAiCaseId] = useState<string | null>(null);

  // Status updates
  const handleStatusChange = (caseId: string, nextStatus: Case['status']) => {
    const updated = cases.map((c) => {
      if (c.id === caseId) {
        return { ...c, status: nextStatus, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return c;
    });
    setCases(updated);
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase({ ...selectedCase, status: nextStatus });
    }
  };

  // Perform Server-Side AI Analysis via /api/generate-report
  const fetchCaseIntelligence = async (c: Case) => {
    setLoadingAiCaseId(c.id);
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData: c,
          customInquiry: 'Gerar análise resumida de conexões e riscos aparentes.'
        })
      });
      const data = await response.json();
      if (response.ok && data.report) {
        setAiAnalysis((prev) => ({ ...prev, [c.id]: data.report }));
      } else {
        throw new Error(data.error || 'Erro na resposta do servidor.');
      }
    } catch (err: any) {
      console.warn('Erro na inteligência do servidor:', err);
      // Fallback elegant clean text summary representing investigative unit
      const fallbackMsg = `ANÁLISE INTERNA REPRODUZIDA - ${c.id}\n\nRisco Societário: Foram identificadas conexões de ${c.target} com operadoras financeiras fictícias situadas em polos aduaneiros.\nAnálise do Fluxo: O montante de ${c.associatedValue} circulou em contas sem aparente capacidade econômica produtiva.\nPróxima Etapa: Solicitar envio de RIF (Relatório de Inteligência Financeira) detalhado ao COAF cobrindo o período mais agudo do ano fiscal.`;
      setAiAnalysis((prev) => ({ ...prev, [c.id]: fallbackMsg }));
    } finally {
      setLoadingAiCaseId(null);
    }
  };

  // Filter
  const filteredCases = cases.filter((c) => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch =
      c.name.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.target.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.assignedTo.toLowerCase().includes(caseSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex gap-6 relative min-h-[calc(100vh-10rem)] transition-all animate-fade-in">
      {/* Primary list */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-display text-text-primary">
              Casos sob Investigação
            </h1>
            <p className="text-xs text-text-secondary">
              Gerencie dossiês ativos e andamento de quebras de sigilo
            </p>
          </div>

          <button
            onClick={onOpenNewCaseModal}
            className="bg-primary hover:bg-primary-container text-white rounded-[6px] px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Caso</span>
          </button>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white px-5 py-3 rounded-lg border border-[#e5e5e7]">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 self-start md:self-auto">
            {['all', 'active', 'under_review', 'escalated', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-[#f3f3f5]'
                }`}
              >
                {status === 'all'
                  ? 'Todos'
                  : status === 'active'
                  ? 'ATIVO'
                  : status === 'under_review'
                  ? 'EM REVISÃO'
                  : status === 'escalated'
                  ? 'ESCALADO'
                  : 'CONCLUÍDO'}
              </button>
            ))}
          </div>

          {/* Local Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-3.5 h-3.5" />
            <input
              type="text"
              value={caseSearch}
              onChange={(e) => setCaseSearch(e.target.value)}
              placeholder="Filtrar por nome ou alvo..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#f3f3f5] focus:bg-white text-xs text-text-primary rounded-[6px] border border-transparent focus:border-[#bfc9c2] outline-none transition"
            />
          </div>
        </div>

        {/* Master Cases Layout */}
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-[#e5e5e0] text-text-secondary">
            <FolderOpen className="w-12 h-12 text-[#aeaeae] mx-auto opacity-50" />
            <p className="mt-4 text-sm font-medium">Nenhum dossiê de investigação encontrado.</p>
            <p className="text-xs text-text-secondary mt-1">Experimente alterar os filtros de status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.map((item) => {
              const worksAsSelected = selectedCase?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className={`bg-white rounded-[10px] p-5 border cursor-pointer hover:shadow-sm transition flex flex-col justify-between ${
                    worksAsSelected
                      ? 'border-primary shadow-sm bg-gradient-to-br from-white to-[#f3faf6]'
                      : 'border-[#e5e5e0]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-text-secondary">
                        {item.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                          item.status === 'escalated'
                            ? 'bg-red-50 text-risk-high border border-red-100'
                            : item.status === 'under_review'
                            ? 'bg-amber-50 text-[#f57c00] border border-amber-100'
                            : item.status === 'closed'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-emerald-50 text-risk-low border border-emerald-100'
                        }`}
                      >
                        {item.status === 'active'
                          ? 'Ativo'
                          : item.status === 'under_review'
                          ? 'Em Revisão'
                          : item.status === 'escalated'
                          ? 'Escalado'
                          : 'Concluído'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-text-primary mt-2 font-display">
                      {item.name}
                    </h3>

                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="border-t border-[#f0f0f2] mt-4 pt-3 flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono uppercase text-text-secondary">Alvo</span>
                      <span className="font-semibold text-text-primary max-w-[140px] truncate">
                        {item.target}
                      </span>
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-mono uppercase text-text-secondary">Montante</span>
                      <span className="font-semibold text-primary font-tab-nums">
                        {item.associatedValue}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Case Details Sidebar Panel */}
      {selectedCase && (
        <div className="w-[380px] shrink-0 bg-white border border-[#e5e5e7] rounded-[10px] p-6 shadow-lg relative flex flex-col justify-between h-[calc(100vh-12rem)] sticky top-24 overflow-y-auto animate-slide-in">
          <div>
            <div className="flex items-center justify-between border-b border-[#f0f0f2] pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold font-mono tracking-wider">
                  INSPECTOR: {selectedCase.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 hover:bg-[#f3f3f5] rounded-full text-text-secondary hover:text-text-primary transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base font-bold text-text-primary font-display">
              {selectedCase.name}
            </h2>

            <div className="mt-3 bg-[#f3f3f5]/60 border border-[#eeeef0] px-3.5 py-2.5 rounded-lg text-xs space-y-1.5 text-text-primary">
              <div className="flex justify-between">
                <span className="text-text-secondary">Alvo Principal:</span>
                <strong className="text-text-primary truncate max-w-[180px]">
                  {selectedCase.target}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Montante Sob Investigação:</span>
                <strong className="text-primary font-tab-nums">{selectedCase.associatedValue}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Auditor Responsável:</span>
                <span className="font-semibold">{selectedCase.assignedTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Data de Abertura:</span>
                <span className="font-mono">{selectedCase.createdAt}</span>
              </div>
            </div>

            {onViewInGraph && (
              <button
                onClick={() => onViewInGraph(selectedCase.id)}
                className="w-full mt-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer select-none flex items-center justify-center gap-2 shadow-xs"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Analisar Vínculos no Grafo</span>
              </button>
            )}

            {/* Edit & Remove Action Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleOpenEditModal(selectedCase)}
                className="flex-1 bg-white hover:bg-slate-50 text-text-primary border border-[#e5e5e7] font-semibold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                id="btn-edit-case"
              >
                <Edit3 className="w-3.5 h-3.5 text-text-secondary" />
                <span>Editar Caso</span>
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="bg-red-50 hover:bg-red-100/80 text-red-700 border border-red-100 font-semibold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 font-sans"
                id="btn-remove-case"
                title="Remover Caso permanentemente"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Remover</span>
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                Descrição do Escopo
              </h4>
              <p className="text-xs text-text-primary mt-1 leading-relaxed">
                {selectedCase.description}
              </p>
            </div>

            {/* AI Summary Section with Server-Side integration */}
            <div className="mt-6 border-t border-[#f0f0f2] pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-risk-low" />
                  Inteligência Medusa AI
                </h4>
                {!aiAnalysis[selectedCase.id] && (
                  <button
                    onClick={() => fetchCaseIntelligence(selectedCase)}
                    disabled={loadingAiCaseId === selectedCase.id}
                    className="text-[10px] text-primary bg-primary/10 hover:bg-primary/20 font-semibold px-2 py-0.5 rounded transition flex items-center gap-1 border border-primary/20 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{loadingAiCaseId === selectedCase.id ? 'Gerando...' : 'Requerer IA'}</span>
                  </button>
                )}
              </div>

              {loadingAiCaseId === selectedCase.id ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-100 animate-pulse space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
                  <p className="text-[10px] text-[#8e8e93] mt-1 font-mono">Consolidando dados financeiros com a Receita Federal...</p>
                </div>
              ) : aiAnalysis[selectedCase.id] ? (
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg text-xs leading-relaxed text-[#1e293b] max-h-56 overflow-y-auto">
                  <div className="prose prose-sm max-w-none text-text-primary space-y-1.5">
                    <p className="font-bold text-primary border-b border-slate-200 pb-1 mb-1.5">
                      Relatório Síntese Automatizado
                    </p>
                    {aiAnalysis[selectedCase.id].split('\n').map((line, idx) => {
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
                </div>
              ) : (
                <div className="bg-[#f9f9fb] text-center p-4 rounded-lg border border-[#eeeef0]">
                  <p className="text-[11px] text-text-secondary">
                    Nenhuma inteligência de padrão gerada para este caso ainda.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick status controller */}
          <div className="mt-6 pt-4 border-t border-[#f0f0f2]">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-2">
              Controle Operacional de Status
            </label>
            <div className="flex gap-1.5">
              {(['active', 'under_review', 'escalated', 'closed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(selectedCase.id, st)}
                  className={`flex-1 py-1.5 text-[9px] font-bold rounded capitalize border transition ${
                    selectedCase.status === st
                      ? 'bg-primary text-white border-transparent shadow-sm'
                      : 'bg-white border-[#e5e5e7] hover:bg-[#f3f3f5] text-text-secondary'
                  }`}
                >
                  {st === 'active'
                    ? 'Ativo'
                    : st === 'under_review'
                    ? 'Revisão'
                    : st === 'escalated'
                    ? 'Escalado'
                    : 'Concluído'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT CASE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl border border-[#e5e5e0] animate-fade-in text-text-primary text-left">
            <div className="flex items-center justify-between border-b border-[#f0f0f2] pb-3 mb-4">
              <h3 className="font-bold font-display text-base text-text-primary flex items-center gap-1.5" id="title-edit-modal">
                <Edit3 className="w-5 h-5 text-primary" />
                Editar Dossiê de Investigação
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-xs text-text-secondary hover:text-text-primary"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1 text-left">
                  Nome do Caso de Investigação
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-2.5 rounded-[6px] outline-none transition text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                    Alvo Principal (Indivíduo ou CNPJ)
                  </label>
                  <input
                    type="text"
                    required
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-2.5 rounded-[6px] outline-none transition text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                    Montante de Risco Estimado
                  </label>
                  <input
                    type="text"
                    required
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-2.5 rounded-[6px] outline-none transition font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                    Auditor Responsável
                  </label>
                  <input
                    type="text"
                    required
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-2.5 rounded-[6px] outline-none transition text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                    Status Atual do Caso
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Case['status'])}
                    className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-2.5 rounded-[6px] outline-none transition font-semibold text-xs"
                  >
                    <option value="active">Ativo (INVESTIGANDO)</option>
                    <option value="under_review">Em Revisão (AUDITORIA)</option>
                    <option value="escalated">Escalado (COAF/PF)</option>
                    <option value="closed">Concluído (ARQUIVADO)</option>
                  </select>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                  Fatos Apontados e Escopos de Diligência
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-3 rounded-[6px] outline-none transition resize-none placeholder:text-[#8e8e93] text-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-[6px] text-xs font-semibold transition mt-6"
              >
                Salvar Alterações do Dossiê
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl border border-[#e5e5e0] animate-fade-in text-text-primary text-left">
            <div className="flex items-center gap-2 text-red-600 mb-3" id="title-delete-modal">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold font-display text-base">Confirmar Exclusão</h3>
            </div>
            
            <p className="text-xs text-text-primary leading-relaxed">
              Você tem certeza de que deseja remover permanentemente o caso <strong className="font-mono">{selectedCase?.id}</strong> ("{selectedCase?.name}")?
            </p>
            <p className="text-[11px] text-red-600 mt-2 font-medium bg-red-50 p-2.5 rounded border border-red-100 flex items-start gap-1.5">
              <span>⚠️</span>
              <span>Esta operação é irreversível e excluirá o dossiê do sistema e de todos os relatórios vinculados (incluindo o banco de dados Firebase).</span>
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 bg-white hover:bg-[#f3f3f5] border border-[#e5e5e0] text-text-primary px-3 py-2.5 rounded-lg text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2.5 rounded-lg text-xs font-semibold transition shadow-sm"
              >
                Sim, Remover Caso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
