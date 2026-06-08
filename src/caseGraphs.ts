/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Node, Edge } from './types';

export interface CaseGraph {
  nodes: Node[];
  edges: Edge[];
}

export const CASE_GRAPHS_DATA: Record<string, CaseGraph> = {
  'CAS-301': {
    // Operação Smurfing Digital (Fintech Nexus & Associados)
    nodes: [
      { id: 'target-nexus', label: 'Fintech Nexus & Associados', type: 'company', riskLevel: 'high', x: 480, y: 250 },
      { id: 'device-ip-nexus', label: 'Proxy Gateway IP: 191.242.10.8', type: 'ip_address', riskLevel: 'medium', x: 180, y: 380 },
      { id: 'bot-master-nexus', label: 'Bot Master: Automat-A9', type: 'device', riskLevel: 'high', x: 300, y: 440 },
      { id: 'wallet-nexus', label: 'Carteira Fria Cripto #8327', type: 'trust', riskLevel: 'high', x: 740, y: 250 },
      
      // Core smurfers connected initially
      { id: 'smurf-1', label: 'Laranja Silva (Conta Virtual)', type: 'account', riskLevel: 'medium', x: 360, y: 155 },
      { id: 'smurf-2', label: 'Laranja Santos (Conta Virtual)', type: 'account', riskLevel: 'medium', x: 440, y: 95 },
      { id: 'smurf-3', label: 'Laranja Costa (Conta Virtual)', type: 'account', riskLevel: 'medium', x: 520, y: 95 },
      { id: 'smurf-4', label: 'Laranja Oliveira (Conta Virtual)', type: 'account', riskLevel: 'medium', x: 600, y: 155 },
      { id: 'smurf-5', label: 'Laranja Pereira (Conta Virtual)', type: 'account', riskLevel: 'medium', x: 300, y: 250 },
      { id: 'smurf-6', label: 'Laranja Souza (Conta Virtual)', type: 'account', riskLevel: 'medium', x: 480, y: 410 },
      
      // Extra newly added smurfs and accounts for high-density connection
      { id: 'smurf-7', label: 'Laranja Barbosa (Conta Virtual)', type: 'account', riskLevel: 'medium', x: 200, y: 190 },
      { id: 'smurf-8', label: 'Laranja Martins (Conta Virtual)', type: 'account', riskLevel: 'medium', x: 760, y: 120 },
      { id: 'smurf-9', label: 'Laranja Carvalho (Conta Virtual)', type: 'account', riskLevel: 'low', x: 670, y: 390 },
      { id: 'smurf-a', label: 'Laranja Farias (Conta Virtual)', type: 'account', riskLevel: 'low', x: 130, y: 280 },
      
      // Secondary nodes
      { id: 'gateway-pay', label: 'Intermediário de Pagos Lux S.A.', type: 'company', riskLevel: 'high', x: 620, y: 330 },
      { id: 'shell-nexus', label: 'Global Nexus Consulting Ltd (Cayman)', type: 'trust', riskLevel: 'high', x: 810, y: 350 },
      { id: 'operator-nexus', label: 'Operador Financeiro: Igor Barbosa', type: 'individual', riskLevel: 'high', x: 480, y: 180 }
    ],
    edges: [
      { source: 'smurf-1', target: 'target-nexus', type: 'transfer', value: 'R$ 350 (PIX)', isRisk: true },
      { source: 'smurf-2', target: 'target-nexus', type: 'transfer', value: 'R$ 280 (PIX)', isRisk: true },
      { source: 'smurf-3', target: 'target-nexus', type: 'transfer', value: 'R$ 150 (PIX)', isRisk: true },
      { source: 'smurf-4', target: 'target-nexus', type: 'transfer', value: 'R$ 320 (PIX)', isRisk: true },
      { source: 'smurf-5', target: 'target-nexus', type: 'transfer', value: 'R$ 290 (PIX)', isRisk: true },
      { source: 'smurf-6', target: 'target-nexus', type: 'transfer', value: 'R$ 310 (PIX)', isRisk: true },
      
      // Dynamic newly added connections for smurfs 7-a
      { source: 'smurf-7', target: 'target-nexus', type: 'transfer', value: 'R$ 340 (PIX)', isRisk: true },
      { source: 'smurf-8', target: 'target-nexus', type: 'transfer', value: 'R$ 270 (PIX)', isRisk: true },
      { source: 'smurf-9', target: 'gateway-pay', type: 'transfer', value: 'R$ 390 (PIX)', isRisk: true },
      { source: 'smurf-a', target: 'gateway-pay', type: 'transfer', value: 'R$ 180 (PIX)', isRisk: true },
      
      // Interconnection linkages
      { source: 'gateway-pay', target: 'target-nexus', type: 'transfer', value: 'R$ 350k (Lote PIX)', isRisk: true },
      { source: 'target-nexus', target: 'shell-nexus', type: 'transfer', value: 'R$ 1.8M (Evasão Privada)', isRisk: true },
      { source: 'shell-nexus', target: 'wallet-nexus', type: 'ownership', isRisk: true },
      { source: 'operator-nexus', target: 'target-nexus', type: 'control', isRisk: false },
      { source: 'operator-nexus', target: 'shell-nexus', type: 'control', isRisk: true },
      
      // Botmaster connections
      { source: 'bot-master-nexus', target: 'smurf-1', type: 'control', isRisk: false },
      { source: 'bot-master-nexus', target: 'smurf-2', type: 'control', isRisk: false },
      { source: 'bot-master-nexus', target: 'smurf-3', type: 'control', isRisk: false },
      { source: 'bot-master-nexus', target: 'smurf-4', type: 'control', isRisk: false },
      { source: 'bot-master-nexus', target: 'smurf-5', type: 'control', isRisk: false },
      { source: 'bot-master-nexus', target: 'smurf-6', type: 'control', isRisk: false },
      { source: 'bot-master-nexus', target: 'smurf-7', type: 'control', isRisk: false },
      { source: 'bot-master-nexus', target: 'smurf-8', type: 'control', isRisk: false },
      { source: 'bot-master-nexus', target: 'smurf-9', type: 'control', isRisk: false },
      { source: 'bot-master-nexus', target: 'smurf-a', type: 'control', isRisk: false },
      { source: 'device-ip-nexus', target: 'bot-master-nexus', type: 'control', isRisk: false }
    ]
  },
  'CAS-302': {
    // Tratado de Commodities Fantasmas (Exportadora Grãos do Oeste S.A.)
    nodes: [
      { id: 'target-commodities', label: 'Exportadora Grãos do Oeste S.A.', type: 'company', riskLevel: 'high', x: 480, y: 250 },
      { id: 'cargo-atlantic', label: 'Navegação Atlântico Ltda (Fretes)', type: 'company', riskLevel: 'high', x: 300, y: 180 },
      { id: 'bank-trade', label: 'Aliança Câmbio S.A. (Intermediação)', type: 'company', riskLevel: 'medium', x: 310, y: 320 },
      { id: 'shell-bvi', label: 'Grãos do Oeste Internacional Ltd (BVI Offshore)', type: 'trust', riskLevel: 'high', x: 680, y: 170 },
      { id: 'shell-cayman', label: 'Sunset Agro Investments (Cayman Sócio)', type: 'trust', riskLevel: 'high', x: 680, y: 320 },
      
      // High-density newly added nodes for CAS-302
      { id: 'director-graca', label: 'Diretor Valter Graça (Alvo Principal)', type: 'individual', riskLevel: 'high', x: 480, y: 100 },
      { id: 'corretora-oeste', label: 'Oeste Agro Corretora de Câmbio S.A.', type: 'company', riskLevel: 'medium', x: 220, y: 110 },
      { id: 'fazenda-fict', label: 'Fazenda Rio Manso (Produtor Sócio)', type: 'company', riskLevel: 'medium', x: 150, y: 220 },
      { id: 'swiss-escrow', label: 'Credit Suisse - Escrow Account CHF', type: 'account', riskLevel: 'high', x: 800, y: 140 },
      { id: 'panama-trust', label: 'Mossack Trust Advisory (Panamá)', type: 'trust', riskLevel: 'high', x: 800, y: 290 },
      { id: 'broker-maritime', label: 'Corretor Marítimo: Jean-Pierre L.', type: 'individual', riskLevel: 'medium', x: 190, y: 380 },
      { id: 'invoice-shell', label: 'Invoice de Frete nº 929-TBML', type: 'account', riskLevel: 'high', x: 580, y: 410 }
    ],
    edges: [
      { source: 'director-graca', target: 'target-commodities', type: 'ownership', isRisk: false },
      { source: 'director-graca', target: 'shell-cayman', type: 'ownership', isRisk: true },
      { source: 'director-graca', target: 'cargo-atlantic', type: 'control', isRisk: false },
      
      { source: 'target-commodities', target: 'cargo-atlantic', type: 'control', isRisk: true },
      { source: 'cargo-atlantic', target: 'shell-bvi', type: 'transfer', value: 'R$ 2.4M (Faturamento TBML)', isRisk: true },
      { source: 'target-commodities', target: 'bank-trade', type: 'transfer', value: 'R$ 4.3M (Câmbio Comercial)', isRisk: false },
      { source: 'bank-trade', target: 'shell-cayman', type: 'transfer', value: 'R$ 4.3M (Evasão Divisas)', isRisk: true },
      { source: 'shell-bvi', target: 'shell-cayman', type: 'ownership', isRisk: true },
      
      // High-density linkages
      { source: 'fazenda-fict', target: 'target-commodities', type: 'transfer', value: 'Nota de Grãos Fictícia', isRisk: true },
      { source: 'corretora-oeste', target: 'target-commodities', type: 'control', isRisk: false },
      { source: 'fazenda-fict', target: 'corretora-oeste', type: 'ownership', isRisk: false },
      { source: 'cargo-atlantic', target: 'invoice-shell', type: 'transfer', value: 'Emissão Invoice Fria', isRisk: true },
      { source: 'invoice-shell', target: 'swiss-escrow', type: 'transfer', value: 'R$ 2.4M (Conta Secreta)', isRisk: true },
      { source: 'panama-trust', target: 'shell-bvi', type: 'control', isRisk: true },
      { source: 'panama-trust', target: 'shell-cayman', type: 'control', isRisk: true },
      { source: 'broker-maritime', target: 'cargo-atlantic', type: 'control', isRisk: false },
      { source: 'swiss-escrow', target: 'shell-bvi', type: 'ownership', isRisk: true }
    ]
  },
  'CAS-303': {
    // Inquérito Rastro Oculto (PEP) (Gabinete e Cônjuges - Circuito Leste)
    nodes: [
      { id: 'target-pep', label: 'Gabinete e Cônjuges - Circuito Leste (PEP)', type: 'individual', riskLevel: 'high', x: 480, y: 250 },
      { id: 'assessor-pep', label: 'Assessor Wagner Dias', type: 'individual', riskLevel: 'high', x: 350, y: 180 },
      { id: 'spouse-pep', label: 'Cônjuge Marieta Albuquerque', type: 'individual', riskLevel: 'medium', x: 350, y: 320 },
      { id: 'shell-pep', label: 'Consultoria Leste Ltda (Empresa Fachada)', type: 'company', riskLevel: 'high', x: 650, y: 250 },
      { id: 'terminal-1', label: 'Terminal ATM Autoatendimento 401', type: 'device', riskLevel: 'medium', x: 180, y: 150 },
      { id: 'terminal-2', label: 'Terminal ATM Autoatendimento 402', type: 'device', riskLevel: 'medium', x: 180, y: 320 },
      
      // High-density newly added nodes for CAS-303
      { id: 'secret-runner', label: 'Operador de Valores: Cabo D', type: 'individual', riskLevel: 'high', x: 500, y: 70 },
      { id: 'lobbyist-henrique', label: 'Lobbyista Dr. Henrique Melo', type: 'individual', riskLevel: 'high', x: 620, y: 130 },
      { id: 'const-public', label: 'Construtora Leste S/A (Repasses)', type: 'company', riskLevel: 'high', x: 780, y: 120 },
      { id: 'delaware-trust', label: 'Albuquerque Family Trust (Delaware)', type: 'trust', riskLevel: 'high', x: 770, y: 330 },
      { id: 'bahamas-acc', label: 'Bahamas Secret Bank Account #993', type: 'account', riskLevel: 'high', x: 840, y: 220 },
      { id: 'terminal-3', label: 'Terminal ATM Autoatendimento 403', type: 'device', riskLevel: 'medium', x: 180, y: 70 },
      { id: 'terminal-4', label: 'Terminal ATM Autoatendimento 404', type: 'device', riskLevel: 'medium', x: 180, y: 410 }
    ],
    edges: [
      { source: 'terminal-1', target: 'assessor-pep', type: 'transfer', value: 'R$ 9.900 (Espécie)', isRisk: true },
      { source: 'terminal-2', target: 'spouse-pep', type: 'transfer', value: 'R$ 9.900 (Espécie)', isRisk: true },
      { source: 'terminal-3', target: 'assessor-pep', type: 'transfer', value: 'R$ 9.500 (Espécie)', isRisk: true },
      { source: 'terminal-4', target: 'spouse-pep', type: 'transfer', value: 'R$ 9.800 (Espécie)', isRisk: true },
      
      { source: 'assessor-pep', target: 'target-pep', type: 'transfer', value: 'R$ 4.2M (PIX em Cadeia)', isRisk: true },
      { source: 'spouse-pep', target: 'target-pep', type: 'transfer', value: 'R$ 3.8M (PIX em Cadeia)', isRisk: true },
      { source: 'target-pep', target: 'shell-pep', type: 'ownership', isRisk: false },
      { source: 'shell-pep', target: 'assessor-pep', type: 'control', isRisk: false },
      
      // Extra dense links
      { source: 'const-public', target: 'shell-pep', type: 'transfer', value: 'R$ 2.4M (Falsas Consultorias)', isRisk: true },
      { source: 'lobbyist-henrique', target: 'shell-pep', type: 'control', isRisk: true },
      { source: 'lobbyist-henrique', target: 'target-pep', type: 'transfer', value: 'Aportes Políticos', isRisk: false },
      { source: 'shell-pep', target: 'target-pep', type: 'transfer', value: 'R$ 1.8M (Retorno Consultoria)', isRisk: true },
      { source: 'target-pep', target: 'delaware-trust', type: 'ownership', isRisk: true },
      { source: 'delaware-trust', target: 'bahamas-acc', type: 'transfer', value: 'Dólares Estruturados', isRisk: true },
      { source: 'secret-runner', target: 'target-pep', type: 'control', isRisk: true },
      { source: 'secret-runner', target: 'const-public', type: 'control', isRisk: true }
    ]
  },
  'CAS-304': {
    // Ciclo da Hotelaria Fantasma (Rede Continental de Hospedagem)
    nodes: [
      { id: 'target-hotel', label: 'Rede Continental de Hospedagem', type: 'company', riskLevel: 'low', x: 480, y: 250 },
      { id: 'holding-hotel', label: 'Holding Continental de Turismo S/A', type: 'company', riskLevel: 'medium', x: 320, y: 250 },
      { id: 'admin-hotel', label: 'Sócio Administrador: Dr. Alberto Antunes', type: 'individual', riskLevel: 'low', x: 480, y: 110 },
      { id: 'agency-hotel', label: 'Empresa de Turismo Estrela do Lume', type: 'company', riskLevel: 'medium', x: 640, y: 250 },
      { id: 'ip-hotel', label: 'IP de Origem: 177.42.19.102', type: 'ip_address', riskLevel: 'low', x: 640, y: 110 },
      
      // High-density newly added nodes for CAS-304
      { id: 'orange-waiter', label: 'Laranja Carlos Eduardo (Garçom)', type: 'individual', riskLevel: 'high', x: 160, y: 140 },
      { id: 'orange-beaut', label: 'Laranja Ana Paula (Esteticista)', type: 'individual', riskLevel: 'high', x: 160, y: 360 },
      { id: 'pos-1', label: 'Maquininha de Cartão POS #931', type: 'device', riskLevel: 'medium', x: 290, y: 120 },
      { id: 'pos-2', label: 'Maquininha de Cartão POS #932', type: 'device', riskLevel: 'medium', x: 290, y: 370 },
      { id: 'horizon-realestate', label: 'Horizonte Incorporadora & Construtora', type: 'company', riskLevel: 'low', x: 610, y: 390 },
      { id: 'cash-vault', label: 'Conta Caixa Central Rio (Hospedagens)', type: 'account', riskLevel: 'high', x: 480, y: 410 }
    ],
    edges: [
      { source: 'admin-hotel', target: 'target-hotel', type: 'ownership', isRisk: false },
      { source: 'holding-hotel', target: 'target-hotel', type: 'ownership', isRisk: false },
      { source: 'agency-hotel', target: 'target-hotel', type: 'transfer', value: 'R$ 8.2M (Simulação Compra)', isRisk: true },
      { source: 'ip-hotel', target: 'agency-hotel', type: 'control', isRisk: false },
      
      // Rich links
      { source: 'orange-waiter', target: 'holding-hotel', type: 'ownership', isRisk: true },
      { source: 'orange-beaut', target: 'holding-hotel', type: 'ownership', isRisk: true },
      { source: 'orange-waiter', target: 'pos-1', type: 'control', isRisk: false },
      { source: 'orange-beaut', target: 'pos-2', type: 'control', isRisk: false },
      { source: 'pos-1', target: 'target-hotel', type: 'transfer', value: 'R$ 950k (Créditos Fictícios)', isRisk: true },
      { source: 'pos-2', target: 'target-hotel', type: 'transfer', value: 'R$ 1.2M (Créditos Fictícios)', isRisk: true },
      { source: 'cash-vault', target: 'target-hotel', type: 'transfer', value: 'Depósitos Ordinários', isRisk: false },
      { source: 'holding-hotel', target: 'horizon-realestate', type: 'transfer', value: 'R$ 3.5M (Aporte Hotéis)', isRisk: false },
      { source: 'target-hotel', target: 'horizon-realestate', type: 'ownership', isRisk: false }
    ]
  },
  'CAS-305': {
    // Triangulação de ONGs e Terceiro Setor (Instituto Amigos da Natureza Viva)
    nodes: [
      { id: 'target-ong', label: 'Instituto Amigos da Natureza Viva', type: 'trust', riskLevel: 'medium', x: 480, y: 250 },
      { id: 'fund-ong', label: 'Fundo do Clima S/A (Verba Pública)', type: 'trust', riskLevel: 'low', x: 300, y: 160 },
      { id: 'president-ong', label: 'Arnaldo Silveira (Presidente)', type: 'individual', riskLevel: 'medium', x: 300, y: 340 },
      { id: 'daughter-ong', label: 'Beatriz Silveira (Diretora / Filha)', type: 'individual', riskLevel: 'medium', x: 660, y: 160 },
      { id: 'subcontract-ong', label: 'Consultoria Silveira & Associados Ltda', type: 'company', riskLevel: 'high', x: 660, y: 340 },
      
      // High-density newly added nodes for CAS-305
      { id: 'amazon-coop', label: 'Cooperativa Agro-Ambiental do Amazonas', type: 'trust', riskLevel: 'medium', x: 150, y: 250 },
      { id: 'board-member-ong', label: 'Conselheiro Fiscal Roberto Lima', type: 'individual', riskLevel: 'low', x: 480, y: 95 },
      { id: 'printing-press', label: 'Gráfica Express Manaus (Fatura Fria)', type: 'company', riskLevel: 'high', x: 580, y: 420 },
      { id: 'switzerland-fund', label: 'Foundation for Earth Conservation (Suíça)', type: 'trust', riskLevel: 'low', x: 740, y: 100 },
      { id: 'bradesco-daughter', label: 'Conta Beatriz Silveira Bradesco PF', type: 'account', riskLevel: 'high', x: 800, y: 230 },
      { id: 'cash-out-guy', label: 'Sacador: Laranja Pedro Silva (Espécie)', type: 'individual', riskLevel: 'high', x: 760, y: 390 }
    ],
    edges: [
      { source: 'fund-ong', target: 'target-ong', type: 'transfer', value: 'R$ 2.9M (Repasse Governal)', isRisk: false },
      { source: 'target-ong', target: 'subcontract-ong', type: 'transfer', value: 'R$ 1.8M (Laudos Técnicos)', isRisk: true },
      { source: 'president-ong', target: 'target-ong', type: 'control', isRisk: false },
      { source: 'daughter-ong', target: 'subcontract-ong', type: 'ownership', isRisk: true },
      { source: 'president-ong', target: 'subcontract-ong', type: 'ownership', isRisk: true },
      
      // Extra rich links
      { source: 'amazon-coop', target: 'target-ong', type: 'transfer', value: 'R$ 1.1M (Intermediação)', isRisk: false },
      { source: 'board-member-ong', target: 'target-ong', type: 'control', isRisk: false },
      { source: 'switzerland-fund', target: 'target-ong', type: 'transfer', value: 'USD 120k (Doação Verde)', isRisk: false },
      { source: 'target-ong', target: 'printing-press', type: 'transfer', value: 'R$ 500k (Faturas Avulsas)', isRisk: true },
      { source: 'subcontract-ong', target: 'bradesco-daughter', type: 'transfer', value: 'R$ 1.2M (Saída de Lucros)', isRisk: true },
      { source: 'printing-press', target: 'cash-out-guy', type: 'control', isRisk: true },
      { source: 'cash-out-guy', target: 'president-ong', type: 'transfer', value: 'R$ 480k (Malote Correlato)', isRisk: true }
    ]
  },
  'CAS-306': {
    // Evasão por Tokens Imobiliários (KriptoReal Incorporadora e Participações)
    nodes: [
      { id: 'target-kripto', label: 'KriptoReal Incorporadora (Target)', type: 'company', riskLevel: 'high', x: 480, y: 250 },
      { id: 'blockchain-portal', label: 'Portal Tokenizador Blockchain.io', type: 'device', riskLevel: 'medium', x: 320, y: 150 },
      { id: 'buyer-igor', label: 'Adquirente Laranja Igor (Tokens)', type: 'individual', riskLevel: 'high', x: 180, y: 140 },
      { id: 'buyer-sonia', label: 'Adquirente Laranja Sonia (Tokens)', type: 'individual', riskLevel: 'high', x: 180, y: 360 },
      { id: 'escrow-smart', label: 'Smart Contract Escrow Wallet ETH', type: 'trust', riskLevel: 'high', x: 320, y: 350 },
      { id: 'tornado-mixer', label: 'Mixer de Cripto: Tornado-Gate', type: 'device', riskLevel: 'high', x: 640, y: 350 },
      { id: 'delaware-llc', label: 'KriptoReal International LLC (Delaware)', type: 'trust', riskLevel: 'high', x: 640, y: 150 },
      { id: 'ceo-marcos', label: 'CEO & Eng: Dr. Marcos Vinicius', type: 'individual', riskLevel: 'medium', x: 480, y: 90 },
      { id: 'panama-bank-kripto', label: 'Panama Bank (Convertido Fiat)', type: 'account', riskLevel: 'high', x: 780, y: 250 }
    ],
    edges: [
      { source: 'ceo-marcos', target: 'target-kripto', type: 'control', isRisk: false },
      { source: 'ceo-marcos', target: 'blockchain-portal', type: 'control', isRisk: false },
      { source: 'buyer-igor', target: 'blockchain-portal', type: 'transfer', value: 'R$ 1.9M (Aporte Virtual)', isRisk: true },
      { source: 'buyer-sonia', target: 'blockchain-portal', type: 'transfer', value: 'R$ 1.9M (Aporte Virtual)', isRisk: true },
      { source: 'blockchain-portal', target: 'escrow-smart', type: 'control', isRisk: false },
      { source: 'escrow-smart', target: 'target-kripto', type: 'transfer', value: 'R$ 3.8M (Integralização)', isRisk: true },
      { source: 'escrow-smart', target: 'tornado-mixer', type: 'transfer', value: 'Cripto Desviada', isRisk: true },
      { source: 'tornado-mixer', target: 'delaware-llc', type: 'transfer', value: 'Valor Misturado', isRisk: true },
      { source: 'delaware-llc', target: 'panama-bank-kripto', type: 'ownership', isRisk: true }
    ]
  },
  'CAS-307': {
    // Esquema de Licitações de Oxigênio (MedLife Logística e Distribuidora Ltda)
    nodes: [
      { id: 'target-medlife', label: 'MedLife Logística e Distribuidora (Target)', type: 'company', riskLevel: 'high', x: 480, y: 250 },
      { id: 'sec-saude-itaborai', label: 'Sec. de Saúde de Itaboraí (Municipal)', type: 'trust', riskLevel: 'medium', x: 300, y: 150 },
      { id: 'sec-silva', label: 'Secretário de Saúde Dr. Jonas Silva', type: 'individual', riskLevel: 'high', x: 300, y: 350 },
      { id: 'bid-broker-marcia', label: 'Pregoeira Oficial Márcia Ferreira', type: 'individual', riskLevel: 'high', x: 160, y: 250 },
      { id: 'rival-medilux', label: 'Medilux Equipamentos (Rival Combinado)', type: 'company', riskLevel: 'high', x: 480, y: 100 },
      { id: 'partner-claudio', label: 'Sócio Majoritário Cláudio Medeiros', type: 'individual', riskLevel: 'medium', x: 650, y: 150 },
      { id: 'accountant-antunes', label: 'Contador: Dr. Sérgio Antunes', type: 'individual', riskLevel: 'medium', x: 650, y: 350 },
      { id: 'cash-van-co', label: 'Transportadora de Valores SafeCash', type: 'device', riskLevel: 'high', x: 780, y: 250 }
    ],
    edges: [
      { source: 'sec-saude-itaborai', target: 'target-medlife', type: 'transfer', value: 'R$ 14.5M (Contrato Suspeito)', isRisk: true },
      { source: 'bid-broker-marcia', target: 'target-medlife', type: 'control', isRisk: true },
      { source: 'bid-broker-marcia', target: 'rival-medilux', type: 'control', isRisk: true },
      { source: 'rival-medilux', target: 'target-medlife', type: 'transfer', value: 'Acordo Proposta Fria', isRisk: true },
      { source: 'target-medlife', target: 'sec-silva', type: 'transfer', value: 'R$ 1.2M (Bônus Corrupção)', isRisk: true },
      { source: 'partner-claudio', target: 'target-medlife', type: 'ownership', isRisk: false },
      { source: 'target-medlife', target: 'accountant-antunes', type: 'control', isRisk: false },
      { source: 'accountant-antunes', target: 'cash-van-co', type: 'transfer', value: 'Solicitação de Saque', isRisk: true },
      { source: 'cash-van-co', target: 'partner-claudio', type: 'transfer', value: 'R$ 2.3M (Espécie Retirado)', isRisk: true }
    ]
  },
  'CAS-308': {
    // Ocultação em Blindagem de Luxo (Diamond Armor Blindagem e Concessionária)
    nodes: [
      { id: 'target-diamond', label: 'Diamond Armor Concessionária (Target)', type: 'company', riskLevel: 'high', x: 480, y: 250 },
      { id: 'buyer-aleman', label: 'Comprador Foragido: Gilberto Alemão', type: 'individual', riskLevel: 'high', x: 280, y: 130 },
      { id: 'car-porsche', label: 'Porsche Cayenne Blindado (XXX-000)', type: 'device', riskLevel: 'medium', x: 280, y: 370 },
      { id: 'orange-tiago', label: 'Sócio Laranja: Tiago Construtor', type: 'individual', riskLevel: 'high', x: 150, y: 250 },
      { id: 'trust-florida', label: 'Diamond Trust Property LLC (Miami)', type: 'trust', riskLevel: 'high', x: 670, y: 140 },
      { id: 'escrow-bofa', label: 'Escrow Account Bank of America', type: 'account', riskLevel: 'high', x: 670, y: 360 },
      { id: 'import-express', label: 'Consultoria de Importações Express Ltda', type: 'company', riskLevel: 'high', x: 800, y: 250 }
    ],
    edges: [
      { source: 'orange-tiago', target: 'target-diamond', type: 'ownership', isRisk: true },
      { source: 'buyer-aleman', target: 'target-diamond', type: 'transfer', value: 'R$ 950k (Espécie Frio)', isRisk: true },
      { source: 'target-diamond', target: 'car-porsche', type: 'control', isRisk: false },
      { source: 'car-porsche', target: 'buyer-aleman', type: 'control', isRisk: true },
      { source: 'target-diamond', target: 'import-express', type: 'transfer', value: 'R$ 750k (Faturas Fibra)', isRisk: true },
      { source: 'import-express', target: 'escrow-bofa', type: 'transfer', value: 'Conversão em Dólar', isRisk: true },
      { source: 'escrow-bofa', target: 'trust-florida', type: 'ownership', isRisk: true }
    ]
  }
};
