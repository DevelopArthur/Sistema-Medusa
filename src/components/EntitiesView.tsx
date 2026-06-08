/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Users,
  Search,
  BadgeAlert
} from 'lucide-react';
import { Entity } from '../types';

interface EntitiesViewProps {
  entities: Entity[];
  selectedEntity: Entity | null;
  setSelectedEntity: (e: Entity | null) => void;
}

export default function EntitiesView({
  entities,
  selectedEntity,
  setSelectedEntity,
}: EntitiesViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [entitySearch, setEntitySearch] = useState<string>('');

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'individual': return 'Pessoa Física';
      case 'account': return 'Conta Bancária';
      case 'company': return 'Pessoa Jurídica';
      case 'trust': return 'Fundo / Trust';
      default: return type;
    }
  };

  // Filter
  const filtered = entities.filter((e) => {
    const matchesCategory = activeCategory === 'all' || e.type === activeCategory;
    const matchesSearch =
      e.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
      e.id.toLowerCase().includes(entitySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex gap-6 relative min-h-[calc(100vh-10rem)] transition-all animate-fade-in">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-xl font-bold font-display text-text-primary">
            Entidades Monitoradas
          </h1>
          <p className="text-xs text-text-secondary">
            Cadastro de pessoas físicas, jurídicas e contas mapeadas no ecossistema suspeito
          </p>
        </div>

        {/* Toggles bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white px-5 py-3 rounded-lg border border-[#e5e5e7]">
          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
            {['all', 'individual', 'account', 'company', 'trust'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-[#f3f3f5]'
                }`}
              >
                {cat === 'all' ? 'Ver Todos' : getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-3.5 h-3.5" />
            <input
              type="text"
              value={entitySearch}
              onChange={(e) => setEntitySearch(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#f3f3f5] focus:bg-white text-xs text-text-primary rounded-[6px] border border-transparent focus:border-[#bfc9c2] outline-none transition"
            />
          </div>
        </div>

        {/* List of entity blocks */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-[#e5e5e0] text-text-secondary">
            <Users className="w-12 h-12 text-[#aeaeae] mx-auto opacity-50" />
            <p className="mt-4 text-sm font-medium">Nenhuma entidade catalogada para este filtro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const isSelected = selectedEntity?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEntity(item)}
                  className={`bg-white rounded-[10px] p-5 border cursor-pointer hover:shadow-sm transition ${
                    isSelected ? 'border-primary ring-1 ring-primary/25' : 'border-[#e5e5e0]'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Squircle representation matching guidelines */}
                    <div className="w-12 h-12 rounded-lg bg-primary/5 border border-[#eeeef0] text-lg flex items-center justify-center shrink-0">
                      {item.avatar}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-text-secondary">
                          {item.id}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            item.riskLevel === 'high'
                              ? 'bg-red-100 text-risk-high'
                              : item.riskLevel === 'medium'
                              ? 'bg-amber-100 text-risk-medium'
                              : 'bg-emerald-100 text-risk-low'
                          }`}
                        >
                          Risco {item.riskScore}
                        </span>
                      </div>

                      <h3 className="font-bold text-xs text-text-primary font-display truncate mt-1">
                        {item.name}
                      </h3>

                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mt-1">
                        Categoria: {getCategoryLabel(item.type)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Entity Profiles side inspector */}
      {selectedEntity && (
        <div className="w-[380px] shrink-0 bg-white border border-[#e5e5e7] rounded-[10px] p-6 shadow-lg h-[calc(100vh-12rem)] sticky top-24 overflow-y-auto animate-slide-in">
          <div className="flex items-center justify-between border-b border-[#f0f0f2] pb-3 mb-4">
            <span className="text-xs font-bold font-mono tracking-wider flex items-center gap-1">
              <BadgeAlert className="w-4 h-4 text-primary" />
              REGISTRO CADASTRAL: {selectedEntity.id}
            </span>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-xs hover:bg-[#f3f3f5] rounded-full px-2 py-1 transition"
            >
              Fechar
            </button>
          </div>

          <div className="flex items-center gap-4 border-b border-[#f0f0f2] pb-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-3xl">
              {selectedEntity.avatar}
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary font-display">
                {selectedEntity.name}
              </h2>
              <span className="text-xs bg-[#e2e2e4] text-[#404944] px-2 py-0.5 rounded font-bold uppercase inline-block mt-1">
                {getCategoryLabel(selectedEntity.type)}
              </span>
            </div>
          </div>

          {/* Metadata Grid dynamically parsed */}
          <div>
            <h4 className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest border-b border-[#f0f0f2] pb-1.5 mb-3.5">
              Metadados de Qualificação
            </h4>

            <div className="space-y-3">
              {Object.entries(selectedEntity.metadata).map(([key, rawValue]) => (
                <div key={key} className="flex justify-between items-start text-xs border-b border-[#f9f9fb] pb-2 last:border-0">
                  <span className="text-text-secondary shrink-0 font-medium">{key}:</span>
                  <strong className="text-text-primary text-right max-w-[200px] break-words">{rawValue}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#f0f0f2]">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-2">
              Sinalização de Risco Operacional
            </span>
            <div className="flex items-center gap-4 bg-[#f9f9fb] border border-[#eeeef0] p-4 rounded-lg">
              <div className="flex-1">
                <span className="text-xs text-text-secondary">Escore de Lavagem:</span>
                <p className="text-xl font-bold font-display text-text-primary mt-0.5">
                  {selectedEntity.riskScore} / 100
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full ring-4 ${
                  selectedEntity.riskLevel === 'high'
                    ? 'bg-risk-high ring-red-100'
                    : selectedEntity.riskLevel === 'medium'
                    ? 'bg-risk-medium ring-orange-100'
                    : 'bg-risk-low ring-emerald-50'
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
