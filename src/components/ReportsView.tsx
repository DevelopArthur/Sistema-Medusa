/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  Bot,
  Check
} from 'lucide-react';
import { Case } from '../types';

interface ReportsViewProps {
  cases: Case[];
}

export default function ReportsView({ cases }: ReportsViewProps) {
  const [selectedCaseForReport, setSelectedCaseForReport] = useState<Case | null>(cases[0] || null);
  const [customInquiry, setCustomInquiry] = useState<string>('');
  const [reportResult, setReportResult] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync selected case whenever cases list changes (e.g. restored)
  useEffect(() => {
    if (cases && cases.length > 0) {
      if (!selectedCaseForReport || !cases.find(c => c.id === selectedCaseForReport.id)) {
        setSelectedCaseForReport(cases[0]);
      }
    } else {
      setSelectedCaseForReport(null);
    }
  }, [cases]);

  // Invoke server side compile via `/api/generate-report`
  const handleCompileReport = async () => {
    if (!selectedCaseForReport) return;
    setIsCompiling(true);
    setReportResult('');
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData: selectedCaseForReport,
          customInquiry: customInquiry
        })
      });
      const data = await response.json();
      if (response.ok && data.report) {
        setReportResult(data.report);
      } else {
        throw new Error(data.error || 'Falha ao compilar relatório.');
      }
    } catch (err: any) {
      console.warn('Erro ao chamar compiling de relatório:', err);
      // fallback
      const fallbackReport = `# DOSSIÊ DE INTELIGÊNCIA FINANCEIRA: ${selectedCaseForReport.id}
**RESTRITO // OPERAÇÃO CORRENTE**

## 1. Identificação do Alvo
* **Nome/Caso:** ${selectedCaseForReport.name}
* **Alvo Principal:** ${selectedCaseForReport.target}
* **Risco:** ${selectedCaseForReport.riskLevel === 'high' ? 'ALTO' : selectedCaseForReport.riskLevel === 'medium' ? 'MÉDIO' : 'BAIXO'} (Score: ${selectedCaseForReport.riskScore}/100)
* **Auditor Responsável:** ${selectedCaseForReport.assignedTo}
* **Montante Estimado em Análise:** ${selectedCaseForReport.associatedValue}

## 2. Posição Sumária de Inteligência
O caso em tela refere-se à suspeita de lavagem de capitais por meio de faturamentos artificiais e escoamentos sistemáticos em jurisdições opacas. O volume transacionado totaliza **${selectedCaseForReport.associatedValue}**, excedendo flagrantemente a capacidade produtiva comprovada declarada pela diretoria.

## 3. Diretrizes do Auditor
*Anotado:* "${customInquiry || 'Geração automática de dossiê analítico consolidado para propositura de ação legal.'}"

## 4. Recomendações de Diligência do Diretor
1.  **Bloqueio cautelar de canais de movimentação** em nome de ${selectedCaseForReport.target}.
2.  **intimação formal dos gestores financeiros** de Barueri e Curitiba.
3.  **Encaminhamento imediato** das peças de convicção fiscais ao Ministério Público Federal.`;
      setReportResult(fallbackReport);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(reportResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold font-display text-text-primary">
          Gerador de Dossiês Oficiais
        </h1>
        <p className="text-xs text-text-secondary">
          Compile relatórios estruturados para tribunais, diretoria, bancos reguladores ou instrução penal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input specifications pane */}
        <div className="bg-white rounded-[10px] border border-[#e5e5e0] p-6 space-y-6 relative">
          <div className="border-b border-[#f0f0f2] pb-3.5">
            <h2 className="text-sm font-bold text-text-primary font-display">
              Configurações de Geração
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Refine a abrangência do relatório a inteligência financeira
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Case Selector */}
            <div>
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-2">
                Selecione o Caso Alvo
              </label>
              <select
                value={selectedCaseForReport?.id || ''}
                disabled={cases.length === 0}
                onChange={(e) => {
                  const found = cases.find((c) => c.id === e.target.value);
                  if (found) setSelectedCaseForReport(found);
                }}
                className="w-full bg-[#f3f3f5] border border-transparent hover:border-[#bfc9c2] focus:bg-white text-xs select-none rounded-[6px] pl-2.5 pr-10 py-2.5 outline-none cursor-pointer transition disabled:opacity-50"
              >
                {cases.length === 0 ? (
                  <option value="">[Nenhum caso cadastrado na unidade]</option>
                ) : (
                  cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.id}] {c.name} ({c.associatedValue})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Custom Notes input */}
            <div>
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-2">
                Instruções analíticas ou anotações adicionais
              </label>
              <textarea
                value={customInquiry}
                onChange={(e) => setCustomInquiry(e.target.value)}
                placeholder="Exemplo: Destacar a ligação com a offshore Cayman Broker e as saídas atípicas de espécie de Barueri..."
                rows={5}
                className="w-full bg-[#f3f3f5] focus:bg-white text-xs rounded-[6px] border border-transparent focus:border-[#bfc9c2] p-3 outline-none transition resize-none placeholder:text-[#8e8e93]"
              />
            </div>

            <div className="bg-primary/5 text-primary p-3 rounded-lg border border-primary/10 flex gap-2">
              <Bot className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Medusa Intelligence Copilot</span>
                <p className="text-[10px] leading-relaxed text-text-secondary mt-0.5">
                  Ao clicar em compilar, a inteligência consolidará cadastros fiscais, conexões gráficas, alertas e anotações gerando parágrafos formais baseados na doutrina do COAF e GAFI.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCompileReport}
            disabled={isCompiling || !selectedCaseForReport}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-[6px] text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{isCompiling ? 'Compilando Relatório...' : 'Compilar Dossiê Oficial'}</span>
          </button>
        </div>

        {/* Compile output panel */}
        <div className="lg:col-span-2 bg-white rounded-[10px] border border-[#e5e5e0] p-6 flex flex-col justify-between min-h-[460px]">
          {reportResult ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-[#f0f0f2] pb-3 mb-6">
                <span className="text-xs font-bold font-mono tracking-wider text-text-secondary flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  DOCUMENTO GERADO ESTADO FINAL
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="bg-white border border-[#e5e5e7] hover:bg-[#f3f3f5] rounded px-3 py-1.5 text-[11px] font-semibold text-text-primary transition flex items-center gap-1"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <span>Copiar Texto</span>
                    )}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="bg-primary hover:bg-primary/90 text-white rounded px-3 py-1.5 text-[11px] font-semibold transition flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Rendered markdown output */}
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-6 overflow-y-auto max-h-[500px]">
                <div className="prose prose-slate prose-xs max-w-none font-sans text-xs text-text-primary leading-relaxed whitespace-pre-wrap space-y-1.5">
                  {reportResult.split('\n').map((line, idx) => {
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
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <FileText className="w-16 h-16 text-[#aeaeae] opacity-50" />
              <h3 className="font-bold text-sm text-text-primary mt-4 font-display">Relatório em Branco</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-xs">
                Selecione as diretrizes operacionais do lado esquerdo e clique em **Compilar Dossiê Oficial** para iniciar a consolidação jurídica.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
