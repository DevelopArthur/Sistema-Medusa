/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Case, Alert, Entity, Node, Edge } from './types';

export const INTUITIVE_CASES_DATA: Case[] = [
  {
    id: 'CAS-301',
    name: 'Operação Smurfing Digital',
    target: 'Fintech Nexus & Associados',
    description: 'Identificação de milhares de transferências PIX de valores baixos em cadeia de forma continuada (smurfing) direcionadas a carteiras frias de criptoativos e contas de fachada abertas de forma automatizada por bots em bancos digitais.',
    status: 'active',
    riskScore: 74,
    riskLevel: 'medium',
    createdAt: '2026-05-15',
    updatedAt: '2026-06-03',
    assignedTo: 'Amadeus',
    associatedValue: 'R$ 1.8M'
  },
  {
    id: 'CAS-302',
    name: 'Tratado de Commodities Fantasmas',
    target: 'Exportadora Grãos do Oeste S.A.',
    description: 'Indícios severos de Lavagem Baseada em Comércio (TBML). Utilização de faturas superfaturadas de fretes marítimos fictícios de soja e simulação de contratos de câmbio internacional para realização de evasão de divisas.',
    status: 'under_review',
    riskScore: 82,
    riskLevel: 'high',
    createdAt: '2026-05-10',
    updatedAt: '2026-06-01',
    assignedTo: 'Arthur',
    associatedValue: 'R$ 4.3M'
  },
  {
    id: 'CAS-303',
    name: 'Inquérito Rastro Oculto (PEP)',
    target: 'Gabinete e Cônjuges - Circuito Leste',
    description: 'Movimentação financeira atípica em contas correntes pertencentes a familiares e assessores de Pessoa Exposta Politicamente (PEP). Depósitos sequenciais e fracionados em espécie logo após sessões e saques imediatos.',
    status: 'escalated',
    riskScore: 95,
    riskLevel: 'high',
    createdAt: '2026-05-20',
    updatedAt: '2026-06-04',
    assignedTo: 'João Vitor',
    associatedValue: 'R$ 11.5M'
  },
  {
    id: 'CAS-304',
    name: 'Ciclo da Hotelaria Fantasma',
    target: 'Rede Continental de Hospedagem',
    description: 'Dossiê sobre holding hoteleira usada para mesclar recursos lícitos de diárias reais com aportes fictícios em dinheiro para integralização de capital oriundo de fraudes corporativas. Finalizado com relatório ao Ministério Público Federal.',
    status: 'closed',
    riskScore: 25,
    riskLevel: 'low',
    createdAt: '2026-04-12',
    updatedAt: '2026-05-28',
    assignedTo: 'Analista Souza',
    associatedValue: 'R$ 8.2M'
  },
  {
    id: 'CAS-305',
    name: 'Triangulação de ONGs e Terceiro Setor',
    target: 'Instituto Amigos da Natureza Viva',
    description: 'Fluxos financeiros atípicos com repasses de verbas públicas de fomento ambiental que são imediatamente escoadas sob a falsa justificativa de consultorias técnicas a empresas integradas por fundadores do próprio núcleo.',
    status: 'active',
    riskScore: 60,
    riskLevel: 'medium',
    createdAt: '2026-05-25',
    updatedAt: '2026-06-02',
    assignedTo: 'João Vitor',
    associatedValue: 'R$ 2.9M'
  },
  {
    id: 'CAS-306',
    name: 'Evasão por Tokens Imobiliários',
    target: 'KriptoReal Incorporadora e Participações',
    description: 'Empresa de tokenização imobiliária de alta tecnologia sob suspeita extrema de dispersão de capitais e evasão cambial via mixers descentralizados por meio de contratos inteligentes e compradores corporativos inexistentes.',
    status: 'active',
    riskScore: 89,
    riskLevel: 'high',
    createdAt: '2026-05-28',
    updatedAt: '2026-06-05',
    assignedTo: 'Amadeus',
    associatedValue: 'R$ 3.8M'
  },
  {
    id: 'CAS-307',
    name: 'Esquema de Licitações de Oxigênio',
    target: 'MedLife Logística e Distribuidora Ltda',
    description: 'Investigação de conluio e ajuste de lances em editais de saúde municipal no estado do Rio de Janeiro. Pulverização de lucros obtidos ilicitamente por meio de saques massivos em espécie coordenados por contadores e transportadoras.',
    status: 'escalated',
    riskScore: 92,
    riskLevel: 'high',
    createdAt: '2026-05-30',
    updatedAt: '2026-06-05',
    assignedTo: 'Arthur',
    associatedValue: 'R$ 14.5M'
  },
  {
    id: 'CAS-308',
    name: 'Ocultação em Blindagem de Luxo',
    target: 'Diamond Armor Blindagem e Concessionária',
    description: 'Ocultação patrimonial de veículos superesportivos zero quilômetro por interposição de laranjas cadastrados e empresas de fachada. Compensação financeira e repasses finalizados em contas bancárias de investimentos em Miami, Flórida.',
    status: 'under_review',
    riskScore: 68,
    riskLevel: 'medium',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-05',
    assignedTo: 'Arthur',
    associatedValue: 'R$ 950k'
  }
];

export const INITIAL_CASES: Case[] = [...INTUITIVE_CASES_DATA];

export const SAMPLE_CASES: Case[] = [...INTUITIVE_CASES_DATA];

export const INTUITIVE_ALERTS_DATA: Alert[] = [
  {
    id: 'ALT-351',
    type: 'Fracionamento de Depósitos PIX',
    source: 'Gateway Pagamentos Nexus',
    targetEntity: 'Fintech Nexus & Associados',
    riskLevel: 'medium',
    status: 'pending',
    detectedAt: '2026-06-03 14:12',
    patternDetected: true,
    description: 'Detecção de mais de 4.500 transferências recebidas via PIX de valores idênticos (R$ 150 a R$ 350) disparadas por bots para contas virtuais temporárias.'
  },
  {
    id: 'ALT-352',
    type: 'Faturamento Baseado em Comércio Atípico (TBML)',
    source: 'Fatura de Exportação nº 829/A',
    targetEntity: 'Exportadora Grãos do Oeste S.A.',
    riskLevel: 'high',
    status: 'pending',
    detectedAt: '2026-06-01 09:15',
    patternDetected: true,
    description: 'Superfaturamento de fretes em invoices de exportação de soja para o exterior, incompatível com os pesos reais declarados nos canais alfandegários.'
  },
  {
    id: 'ALT-353',
    type: 'Movimentação Pulverizada de PEP',
    source: 'Conta Corrente Unificada',
    targetEntity: 'Gabinete e Cônjuges - Circuito Leste',
    riskLevel: 'high',
    status: 'pending',
    detectedAt: '2026-06-04 11:30',
    patternDetected: true,
    description: 'Depósitos sequenciais efetuados em terminais de autoatendimento (caixa rápido) com posterior saque em espécie após poucos minutos da compensação.'
  },
  {
    id: 'ALT-354',
    type: 'Mescla de Recursos de Caixa Frio',
    source: 'Terminal POS Cartões Rede Continental',
    targetEntity: 'Rede Continental de Hospedagem',
    riskLevel: 'low',
    status: 'dismissed',
    detectedAt: '2026-05-28 17:40',
    patternDetected: false,
    description: 'Lançamento de hospedagens e eventos corporativos de alto valor pagos em espécie, sem correspondência com o fluxo operacional físico do estabelecimento.'
  },
  {
    id: 'ALT-355',
    type: 'Desvio de Verba de Fomento Público',
    source: 'Fundo Estadual de Clima e Sustentabilidade',
    targetEntity: 'Instituto Amigos da Natureza Viva',
    riskLevel: 'medium',
    status: 'escalated',
    detectedAt: '2026-06-02 15:45',
    patternDetected: true,
    description: 'Subcontratação de consultoria fantasma com parentes do diretor-presidente usando recursos integrais recebidos como convênio governamental.'
  },
  {
    id: 'ALT-356',
    type: 'Conversão de Dividendos em Cripto',
    source: 'Ledger Multissig KriptoReal',
    targetEntity: 'KriptoReal Incorporadora e Participações',
    riskLevel: 'high',
    status: 'pending',
    detectedAt: '2026-06-05 08:30',
    patternDetected: true,
    description: 'Fracionamento e dispersão de fundos de compra imobiliária em carteira de criptoativos não identificadas com posterior evasão via mixer.'
  },
  {
    id: 'ALT-357',
    type: 'Conluio em Pregão Presencial',
    source: 'Portal de Licitações SUS Itaboraí',
    targetEntity: 'MedLife Logística e Distribuidora Ltda',
    riskLevel: 'high',
    status: 'pending',
    detectedAt: '2026-06-05 10:15',
    patternDetected: true,
    description: 'Propostas com arquivos digitais de metadados idênticos enviados por concorrentes (MedLife e Medilux), sugerindo concorrência fictícia e divisão de lotes.'
  },
  {
    id: 'ALT-358',
    type: 'Fracionamento Físico de Reserva',
    source: 'Caixa Interno Diamond Armor',
    targetEntity: 'Diamond Armor Blindagem e Concessionária',
    riskLevel: 'medium',
    status: 'pending',
    detectedAt: '2026-06-05 13:45',
    patternDetected: true,
    description: 'Aquisição de veículo utilitário Porsche de R$ 950.000 integralmente liquidado por meio de saques e depósitos fracionados de R$ 9.800 em agências bancárias distintas.'
  }
];

export const INITIAL_ALERTS: Alert[] = [...INTUITIVE_ALERTS_DATA];

export const SAMPLE_ALERTS: Alert[] = [...INTUITIVE_ALERTS_DATA];

export const INTUITIVE_ENTITIES_DATA: Entity[] = [
  {
    id: 'ENT-901',
    name: 'Fintech Nexus & Associados',
    type: 'company',
    riskLevel: 'high',
    riskScore: 74,
    flagged: true,
    metadata: {
      'CNPJ': '33.456.789/0001-44',
      'Data de Abertura': '12/05/2023',
      'Capital Social': 'R$ 5.000.000',
      'Atividade': 'Gateway de Pagamentos e Custódia',
      'Sede': 'São Paulo, SP'
    },
    avatar: '🏢'
  },
  {
    id: 'ENT-902',
    name: 'Exportadora Grãos do Oeste S.A.',
    type: 'company',
    riskLevel: 'high',
    riskScore: 82,
    flagged: true,
    metadata: {
      'CNPJ': '14.882.903/0002-11',
      'Data de Abertura': '04/10/2012',
      'Capital Social': 'R$ 25.000.000',
      'Atividade': 'Exportação de Commodities',
      'Sede': 'Sorriso, MT'
    },
    avatar: '🏢'
  },
  {
    id: 'ENT-903',
    name: 'Gabinete e Cônjuges - Circuito Leste',
    type: 'individual',
    riskLevel: 'high',
    riskScore: 95,
    flagged: true,
    metadata: {
      'Vínculos Principais': 'Pessoas Expostas Politicamente (PEP)',
      'Contas Relacionadas': 'Assessores e Familiares Próximos',
      'Status Operacional': 'Sob Perícia Especial',
      'Localidade': 'Brasília, DF'
    },
    avatar: '👤'
  },
  {
    id: 'ENT-904',
    name: 'Rede Continental de Hospedagem',
    type: 'company',
    riskLevel: 'low',
    riskScore: 25,
    flagged: false,
    metadata: {
      'CNPJ': '07.221.849/0001-33',
      'Atividade': 'Hospedagem e Eventos de Lazer',
      'Capital Social': 'R$ 8.200.000',
      'Sede': 'Rio de Janeiro, RJ'
    },
    avatar: '🏨'
  },
  {
    id: 'ENT-905',
    name: 'Instituto Amigos da Natureza Viva',
    type: 'trust',
    riskLevel: 'medium',
    riskScore: 60,
    flagged: true,
    metadata: {
      'CNPJ': '22.904.111/0001-02',
      'Natureza Jurídica': 'ONG / Terceiro Setor',
      'Atividade': 'Fomento à Preservação Ambiental',
      'Sede': 'Manaus, AM'
    },
    avatar: '🌿'
  },
  {
    id: 'ENT-906',
    name: 'KriptoReal Incorporadora e Participações',
    type: 'company',
    riskLevel: 'high',
    riskScore: 89,
    flagged: true,
    metadata: {
      'CNPJ': '44.567.890/0001-55',
      'Data de Abertura': '28/05/2021',
      'Capital Social': 'R$ 15.000.000',
      'Atividade': 'Tokenização de Ativos Imobiliários',
      'Sede': 'São Paulo, SP'
    },
    avatar: '🏢'
  },
  {
    id: 'ENT-907',
    name: 'MedLife Logística e Distribuidora Ltda',
    type: 'company',
    riskLevel: 'high',
    riskScore: 92,
    flagged: true,
    metadata: {
      'CNPJ': '55.678.901/0001-66',
      'Data de Abertura': '30/11/2019',
      'Capital Social': 'R$ 10.000.000',
      'Atividade': 'Distribuição de Insumos Médicos',
      'Sede': 'Rio de Janeiro, RJ'
    },
    avatar: '🚚'
  },
  {
    id: 'ENT-908',
    name: 'Diamond Armor Blindagem e Concessionária',
    type: 'company',
    riskLevel: 'medium',
    riskScore: 68,
    flagged: true,
    metadata: {
      'CNPJ': '66.789.012/0001-77',
      'Data de Abertura': '01/03/2024',
      'Capital Social': 'R$ 4.500.000',
      'Atividade': 'Blindagem e Operações Automotivas',
      'Sede': 'Campinas, SP'
    },
    avatar: '🛡️'
  }
];

export const INITIAL_ENTITIES: Entity[] = [...INTUITIVE_ENTITIES_DATA];

export const SAMPLE_ENTITIES: Entity[] = [...INTUITIVE_ENTITIES_DATA];

// Topology for Link Analysis Graph
export const GRAPH_NODES: Node[] = [];
export const GRAPH_EDGES: Edge[] = [];
