/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import neo4j from 'neo4j-driver';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY is not defined in environment secrets. Defaulting to high-fidelity mock summaries.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. CHAT ENDPOINT: Medusa Intelligence AI Copilot
app.post('/api/chat', async (req, res) => {
  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Faltando o histórico de mensagens.' });
  }

  const userApiKey = process.env.GEMINI_API_KEY;
  if (!userApiKey) {
    // Elegant fallbacks in case key is missing during early sandbox runs
    const lastMsg = messages[messages.length - 1]?.text || 'Olá';
    let mockResponse = `[MEDUSA COPLIOT - MODO DE SIMULAÇÃO INTELIGENTE]\n\nComo inteligência auxiliar de investigação da Unidade Medusa, analisei sua solicitação sobre o contexto fornecido:\n\n* **Entidade sob análise relevante:** ${context?.name || 'Não especificada'}\n* **Risco calculado:** ${context?.riskScore ? `${context?.riskScore}/100` : 'Padrão'}\n\n*Nota analítica:* O comportamento observado indica um padrão característico de fracionamento de depósitos e interposição de pessoas (laranjas) para mascarar o fluxo financeiro real em direção a empresas sediadas em paraísos fiscais.\n\nRecomendo realizar uma varredura de vínculos societários no quadro de sócios das subsidiárias associadas para identificar beneficiários finais ocultos.`;
    
    if (lastMsg.toLowerCase().includes('pdf') || lastMsg.toLowerCase().includes('relatório')) {
      mockResponse += '\n\nVocê também pode baixar o relatório consolidado pronto na guia "Relatórios".';
    }
    return res.json({ text: mockResponse });
  }

  try {
    const ai = getGeminiClient();
    
    // Inject contextual system prompts for our Investigative Investigator
    const systemInstruction = `Você é a inteligência analítica "Medusa Intelligence", copiloto especializado de apoio ao Investigador Silva na unidade de investigações de lavagem de dinheiro, crimes fiscais e evasão de divisas.
Você deve responder em português de maneira formal, precisa, objetiva e operacional. Ajude a identificar padrões ocultos de "Smurfing", "Estruturação de Ativos", "Empresas Fantasma" (shell companies) e "Interposição de Pessoas" (laranjas) com base nos dados.
O usuário está visualizando a tela do sistema: ${JSON.stringify(context || { view: 'Geral' })}. Use esse contexto para responder de forma mais personalizada e direta!`;

    // Process chat history
    const contents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2
      }
    });

    res.json({ text: response.text || 'Nenhuma inteligência pôde ser extraída.' });
  } catch (error: any) {
    console.error('Erro na chamada Gemini:', error);
    res.status(500).json({ 
      error: 'Erro na chamada do cérebro de inteligência.', 
      details: error.message 
    });
  }
});

// 2. CONNECTIVITY ANALYSIS: AI-driven pattern extraction from the Linkage Graph
app.post('/api/analyze-connection', async (req, res) => {
  const { node, neighbors } = req.body;

  if (!node) {
    return res.status(400).json({ error: 'Especifique um nó ou entidade de origem.' });
  }

  const userApiKey = process.env.GEMINI_API_KEY;
  if (!userApiKey) {
    return res.json({ 
      summary: `A entidade ${node.label} apresenta conexão direta com ${neighbors?.length || 0} entidades adjacentes, exibindo transferências financeiras que superam o limite de faturamento operacional histórico. Há indícios de pulverização de ativos logo após o recebimento dos fundos, o que caracteriza um padrão atípico. Recomenda-se o acompanhamento direto do fluxo bancário e a verificação do sigilo das empresas satélites envolvidas.` 
    });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Analise a entidade "${node.label}" (Tipo: ${node.type}, Risco: ${node.riskLevel}) e suas conexões imediatas: ${JSON.stringify(neighbors)}.
Escreva um parecer técnico muito claro de 2 ou 3 parágrafos em português brasileiro. Apresente os fatos de conformidade financeira de forma direta em fluxo corrido, sem tópicos ou bullets, e de forma alguma use caracteres especiais de markdown (como asteriscos de negrito, itálicos, ou hashtags para títulos). Forneça sugestões práticas de novas diligências com redação sóbria, limpa e com pontuação formal padrão do português brasileiro, sem pontuações excessivas ou repetitivas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Você é um perito analista sênior em inteligência financeira (Financial Intelligence Unit). Escreva análises técnicas sóbrias, formais e limpas em português brasileiro corrente, utilizando apenas parágrafos lineares normais, sem qualquer tipo de marcação markdown, listas por tópicos ou sinais gráficos desnecessários.'
      }
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. REPORT COMPILATION: Create PDF/Markdown custom dossiers
app.post('/api/generate-report', async (req, res) => {
  const { caseData, customInquiry } = req.body;

  if (!caseData) {
    return res.status(400).json({ error: 'Dados do caso ausentes.' });
  }

  const userApiKey = process.env.GEMINI_API_KEY;
  if (!userApiKey) {
    return res.json({
      report: `DOSSIÊ DE INTELIGÊNCIA FINANCEIRA: ${caseData.id}\nRESTRITO - OPERAÇÃO CORRENTE\n\nIdentificação do Alvo:\n- Nome: ${caseData.name}\n- Alvo Principal: ${caseData.target}\n- Risco: ${caseData.riskLevel.toUpperCase()} (Score: ${caseData.riskScore}/100)\n- Auditor Responsável: ${caseData.assignedTo}\n- Montante Estimado em Análise: ${caseData.associatedValue}\n\nPosição Sumária de Inteligência:\nO caso em tela refere-se à possível estruturação de ativos envolvendo empresas interpostas de fachada e escoamento tributário. No período analisado, o volume totalizado bate o teto estipulado de alerta fiscal.\n\nDiretriz do Investigador:\n${customInquiry || 'Nenhuma anotação adicional de investigador foi fornecida.'}\n\nPróximos Passos Sugeridos:\n1. Oitiva dos sócios declarados nas faturas.\n2. Convocação de depoimentos de laranjas identificados.\n3. Bloqueio judicial cautelar das contas receptoras periféricas.`
    });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Gere um Relatório de Inteligência Financeira Formal e Consolidado para o tribunal com base nos seguintes dados de investigação:
Caso: ${JSON.stringify(caseData)}
Destaque especial solicitado pelo investigador: "${customInquiry || 'Compilar dossiê geral de riscos identificados'}"

Formate o dossiê como um documento oficial limpo, formal e direto. Não utilize marcações markdown ou caracteres especiais como hashtags, asteriscos ou hifens duplos. Use parágrafos limpos com títulos claros em maiúsculo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Você é o Diretor da Unidade de Inteligência da Polícia de Crimes Financeiros. Seu tom é impecavelmente formal, sóbrio e jurídico. De forma alguma utilize símbolos ou marcações markdown como hifens em cascata ou asteriscos. Escreva títulos claros em maiúsculas correspondentes às seções e use linhas em branco para separar os parágrafos em fluxo de texto corrido.'
      }
    });

    res.json({ report: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// NEO4J INTEGRATION & CYPHER SIMULATION API
// ==========================================

const SIMULATED_NODES_DATA = [
  { id: '1', label: 'Geraldo Transportes Ltda', type: 'company', riskLevel: 'high', x: 400, y: 300 },
  { id: '2', label: 'Amanda Santos (MEI)', type: 'individual', riskLevel: 'high', x: 250, y: 150 },
  { id: '3', label: 'Conta Banco Aliança 77395-B', type: 'account', riskLevel: 'medium', x: 550, y: 150 },
  { id: '4', label: 'Renato S. d\'Ávila', type: 'individual', riskLevel: 'high', x: 400, y: 500 },
  { id: '5', label: 'Horizon Investimentos (Offshore)', type: 'trust', riskLevel: 'high', x: 580, y: 480 },
  { id: '6', label: 'Carlos Alberto (Gerente)', type: 'individual', riskLevel: 'low', x: 150, y: 350 },
  { id: '7', label: 'Cavendish Logística S.A.', type: 'company', riskLevel: 'low', x: 680, y: 300 },
  { id: '8', label: 'Offshore Cayman Broker', type: 'trust', riskLevel: 'high', x: 740, y: 450 }
];

const SIMULATED_EDGES_DATA = [
  { source: '2', target: '1', type: 'ownership', value: 'Sócia MEI (80%)', isRisk: true },
  { source: '1', target: '3', type: 'control', value: 'Titular da Conta', isRisk: false },
  { source: '4', target: '1', type: 'control', value: 'Administrador de Fato', isRisk: true },
  { source: '3', target: '5', type: 'transfer', value: 'R$ 3.8M (Remessa Swift)', isRisk: true },
  { source: '4', target: '5', type: 'ownership', value: 'Beneficiário Ocultor', isRisk: true },
  { source: '6', target: '1', type: 'transfer', value: 'R$ 150k (Serviços)', isRisk: false },
  { source: '1', target: '7', type: 'transfer', value: 'R$ 1.2M (Subcontratação)', isRisk: false },
  { source: '5', target: '8', type: 'transfer', value: 'US$ 450k (Ações)', isRisk: true }
];

// Helper to translate Neo4j elements to React nodes/edges
function parseNeo4jRecords(records: any[]) {
  const nodesMap = new Map<string, any>();
  const edgesList: any[] = [];

  records.forEach((record) => {
    // Each record contains fields/keys. Let's traverse all fields.
    record.keys.forEach((key: string) => {
      const field = record.get(key);
      if (!field) return;

      // Handle raw single Node
      if (field.identity && Array.isArray(field.labels)) {
        addParsedNode(field, nodesMap);
      }
      // Handle raw single Relationship
      else if (field.identity && field.start && field.end && field.type) {
        addParsedRelationship(field, edgesList);
      }
      // Handle Segment or Path structures
      else if (Array.isArray(field.segments)) {
        field.segments.forEach((seg: any) => {
          if (seg.start) addParsedNode(seg.start, nodesMap);
          if (seg.end) addParsedNode(seg.end, nodesMap);
          if (seg.relationship) addParsedRelationship(seg.relationship, edgesList);
        });
      }
      // Handle generic arrays of nodes/relations
      else if (Array.isArray(field)) {
        field.forEach((item: any) => {
          if (item && item.identity) {
            if (Array.isArray(item.labels)) {
              addParsedNode(item, nodesMap);
            } else if (item.start && item.end && item.type) {
              addParsedRelationship(item, edgesList);
            }
          }
        });
      }
    });
  });

  return {
    nodes: Array.from(nodesMap.values()),
    edges: edgesList
  };
}

function addParsedNode(neoNode: any, nodesMap: Map<string, any>) {
  const rawId = neoNode.identity;
  const id = String(rawId.low !== undefined ? rawId.low : rawId);
  if (nodesMap.has(id)) return;

  const props = neoNode.properties || {};
  const label = props.name || props.label || props.title || `${neoNode.labels[0] || 'Nó'} #${id}`;
  const rawType = String(neoNode.labels[0] || 'individual').toLowerCase();
  
  // Map type
  let type: 'individual' | 'account' | 'company' | 'trust' = 'individual';
  if (rawType.includes('company') || rawType.includes('empresa') || rawType.includes('juridica')) {
    type = 'company';
  } else if (rawType.includes('account') || rawType.includes('conta') || rawType.includes('banco')) {
    type = 'account';
  } else if (rawType.includes('trust') || rawType.includes('fundo') || rawType.includes('offshore')) {
    type = 'trust';
  }

  // Risk Level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const rawRisk = String(props.riskLevel || '').toLowerCase();
  if (rawRisk.includes('high') || rawRisk.includes('alto') || props.riskScore > 75) {
    riskLevel = 'high';
  } else if (rawRisk.includes('medium') || rawRisk.includes('medio') || props.riskScore > 40) {
    riskLevel = 'medium';
  }

  // Pre-arrange coordinates nicely in the SVG viewport (850x550) using stable-random placement
  const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const x = 150 + (hash % 550);
  const y = 120 + ((hash * 7) % 320);

  nodesMap.set(id, { id, label, type, riskLevel, x, y });
}

function addParsedRelationship(neoRel: any, edgesList: any[]) {
  const startId = String(neoRel.start.low !== undefined ? neoRel.start.low : neoRel.start);
  const endId = String(neoRel.end.low !== undefined ? neoRel.end.low : neoRel.end);
  const rawType = String(neoRel.type || 'TRANSFER').toLowerCase();

  let type: 'transfer' | 'ownership' | 'control' = 'transfer';
  if (rawType.includes('owner') || rawType.includes('socio') || rawType.includes('propriedade')) {
    type = 'ownership';
  } else if (rawType.includes('control') || rawType.includes('admin') || rawType.includes('gerente')) {
    type = 'control';
  }

  const props = neoRel.properties || {};
  const value = props.value || props.amount || props.description || '';
  const isRisk = !!(props.isRisk || props.suspect || props.risk);

  // Avoid duplicates
  const exists = edgesList.some(e => e.source === startId && e.target === endId && e.type === type && e.value === value);
  if (!exists) {
    edgesList.push({ source: startId, target: endId, type, value, isRisk });
  }
}

// 1. Core Neo4j Query and Simulation execution
app.post('/api/neo4j/query', async (req, res) => {
  const { uri, username, password, query, forceSimulation } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Nenhuma consulta Cypher foi fornecida.' });
  }

  const shouldSimulate = forceSimulation || (!uri && !process.env.NEO4J_URI);

  if (shouldSimulate) {
    // Generate intelligent simulation results based on query terms
    const qLower = query.toLowerCase();
    let nodes = [...SIMULATED_NODES_DATA];
    let edges = [...SIMULATED_EDGES_DATA];

    if (qLower.includes('transfer') || qLower.includes('transferencia')) {
      edges = SIMULATED_EDGES_DATA.filter(e => e.type === 'transfer');
      const activeIds = new Set(edges.flatMap(e => [e.source, e.target]));
      nodes = SIMULATED_NODES_DATA.filter(n => activeIds.has(n.id));
    } else if (qLower.includes('owner') || qLower.includes('socio') || qLower.includes('ownership')) {
      edges = SIMULATED_EDGES_DATA.filter(e => e.type === 'ownership');
      const activeIds = new Set(edges.flatMap(e => [e.source, e.target]));
      nodes = SIMULATED_NODES_DATA.filter(n => activeIds.has(n.id));
    } else if (qLower.includes('risk') || qLower.includes('risco') || qLower.includes('high') || qLower.includes('alto')) {
      nodes = SIMULATED_NODES_DATA.filter(n => n.riskLevel === 'high');
      const activeIds = new Set(nodes.map(n => n.id));
      edges = SIMULATED_EDGES_DATA.filter(e => activeIds.has(e.source) && activeIds.has(e.target));
    } else if (qLower.includes('limit ')) {
      const match = qLower.match(/limit\s+(\d+)/);
      if (match && match[1]) {
        const lim = parseInt(match[1], 10);
        nodes = SIMULATED_NODES_DATA.slice(0, lim);
        const activeIds = new Set(nodes.map(n => n.id));
        edges = SIMULATED_EDGES_DATA.filter(e => activeIds.has(e.source) && activeIds.has(e.target));
      }
    }

    return res.json({
      success: true,
      isSimulated: true,
      query,
      summary: `Consulta simulada executada com sucesso no Neo4j Sandbox. Encontrados ${nodes.length} nós e ${edges.length} relacionamentos correspondentes.`,
      graph: { nodes, edges }
    });
  }

  // Attempt real database connection with driver
  const finalUri = uri || process.env.NEO4J_URI;
  const finalUser = username || process.env.NEO4J_USERNAME;
  const finalPass = password || process.env.NEO4J_PASSWORD;

  let driver;
  try {
    driver = neo4j.driver(finalUri, neo4j.auth.basic(finalUser, finalPass), {
      connectionTimeout: 3500, // Timeout fast if unreachable
    });

    // Verify connection using basic session
    const session = driver.session();
    
    // Setup a promise race to fail-fast if server is down or slow
    const runQueryPromise = session.writeTransaction(async (tx) => {
      const result = await tx.run(query);
      return result;
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Tempo limite excedido ao conectar ao Neo4j. Verifique o endereço e credenciais do banco.')), 4000)
    );

    const result = await Promise.race([runQueryPromise, timeoutPromise]) as any;
    await session.close();

    const graph = parseNeo4jRecords(result.records);

    return res.json({
      success: true,
      isSimulated: false,
      summary: `Consulta executada com êxito. Retornados ${result.records.length} registros da base gráfica real do Neo4j.`,
      graph
    });

  } catch (err: any) {
    console.warn('[Neo4j Connection Failed - Falling back to local Sandbox simulation]:', err.message);
    
    // Automatically fall back to simulator so the user experience is flawless
    const qLower = query.toLowerCase();
    let nodes = [...SIMULATED_NODES_DATA];
    let edges = [...SIMULATED_EDGES_DATA];

    if (qLower.includes('transfer')) {
      edges = SIMULATED_EDGES_DATA.filter(e => e.type === 'transfer');
      const activeIds = new Set(edges.flatMap(e => [e.source, e.target]));
      nodes = SIMULATED_NODES_DATA.filter(n => activeIds.has(n.id));
    }

    return res.json({
      success: true,
      isSimulated: true,
      errorMsg: err.message,
      summary: `Conexão Real falhou (${err.message}). Executado em modo simulado Sandbox para teste das consultas Cypher.`,
      graph: { nodes, edges }
    });
  } finally {
    if (driver) {
      await driver.close();
    }
  }
});

// 2. Translate Natural Language requests to Cypher via Gemini
app.post('/api/neo4j/translate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Faltando o prompt para tradução.' });
  }

  const userApiKey = process.env.GEMINI_API_KEY;
  if (!userApiKey) {
    // Generate standard intelligent translations if API key is not active
    const pLower = prompt.toLowerCase();
    let query = 'MATCH (n) RETURN n LIMIT 25';

    if (pLower.includes('transa') || pLower.includes('envi') || pLower.includes('transfer')) {
      query = 'MATCH (p:Pessoa)-[r:TRANSFER]->(m:Conta) RETURN p, r, m LIMIT 20';
    } else if (pLower.includes('risco') || pLower.includes('suspei') || pLower.includes('perigo')) {
      query = "MATCH (n) WHERE n.riskLevel = 'high' RETURN n LIMIT 10";
    } else if (pLower.includes('socio') || pLower.includes('mei') || pLower.includes('dona')) {
      query = 'MATCH (p:Pessoa)-[r:OWNERSHIP]->(e:Empresa) RETURN p, r, e';
    } else if (pLower.includes('para') || pLower.includes('offshore') || pLower.includes('cayman')) {
      query = 'MATCH (t:Trust)-[r:TRANSFER]->(o:Offshore) RETURN t, r, o';
    }

    return res.json({ query });
  }

  try {
    const ai = getGeminiClient();
    const systemInstruction = `Você é um engenheiro sênior engenheiro de dados especialista em banco de dados de Grafos Neo4j e Cypher.
Traduzirá a solicitação do usuário em português brasileiro para uma consulta Cypher válida sobre nosso modelo de dados financeiro.

Modelo de dados de nós e relacionamentos do sistema:
Nós:
- (:Pessoa {riskLevel: 'high'|'medium'|'low', riskScore: 0-100})
- (:Empresa {riskLevel: 'high'|'medium'|'low'})
- (:Conta {riskLevel: 'high'|'medium'|'low'})
- (:Trust {riskLevel: 'high'|'medium'|'low'})

Relacionamentos:
- [:TRANSFER] -> representa saques ou transferências financeiras (ex: com atributo valor)
- [:OWNERSHIP] -> representa propriedade societária (ex: quotas ou sócio)
- [:CONTROL] -> representa controle administrativo ou gestor de fato

Sua resposta deve conter APENAS o código da consulta Cypher limpo. Proibido usar blocos de código com crases (\`\`\`), explicações, parágrafos introdutórios ou comentários. Apenas a instrução SQL/Cypher crua.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Traduza para Cypher: "${prompt}"`,
      config: {
        systemInstruction,
        temperature: 0.1
      }
    });

    let cypher = (response.text || '').trim();
    // Clean any markdown formatting block the LLM might have written
    cypher = cypher.replace(/^```(cypher)?/gi, '').replace(/```$/g, '').trim();

    return res.json({ query: cypher });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Medusa Intelligence Server] running on http://localhost:${PORT}`);
  });
}

startServer();
