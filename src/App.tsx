/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import {
  Bot,
  Plus,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

import { Case, Alert, Entity, ChatMessage } from './types';
import { INITIAL_CASES, INITIAL_ALERTS, INITIAL_ENTITIES, SAMPLE_CASES, SAMPLE_ALERTS, SAMPLE_ENTITIES } from './data';

import { signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from './firebase';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CasesView from './components/CasesView';
import AlertsView from './components/AlertsView';
import EntitiesView from './components/EntitiesView';
import LinkAnalysisView from './components/LinkAnalysisView';
import ReportsView from './components/ReportsView';
import AIIntelligencePanel from './components/AIIntelligencePanel';
import LoginView from './components/LoginView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication & session state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<{ name: string; role: string }>({ name: '', role: '' });

  const handleLoginSuccess = (name: string, role: string) => {
    setIsLoggedIn(true);
    setActiveUser({ name, role });
    localStorage.setItem('medusa_is_logged_in', 'true');
    localStorage.setItem('medusa_active_user', JSON.stringify({ name, role }));
    
    // Set a personalized greeting in chat messages for the logged-in analyst
    setChatMessages([
      {
        id: 'init-1',
        sender: 'ai',
        text: `Olá ${name}. Sou a Unidade de Inteligência Financeira Medusa. Estou analisando as conexões do grafo, fluxos fiscais e alertas em tempo real.\n\nComo posso apoiar sua perícia investigativa hoje?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.warn('Erro ao deslogar do Firebase:', e);
    }
    setIsLoggedIn(false);
    localStorage.removeItem('medusa_is_logged_in');
    localStorage.removeItem('medusa_active_user');
  };

  // Connection state
  const [firebaseStatus, setFirebaseStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  // Stateful databases
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('medusa_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Case[];
        const hasOld = parsed.some((c) => c.id === 'CAS-024' || c.id === 'CAS-102');
        const hasNew = parsed.some((c) => c.id === 'CAS-306');
        if (!hasOld && hasNew && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.warn('Erro ao ler casos salvos:', err);
      }
    }
    return INITIAL_CASES;
  });
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('medusa_alerts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Alert[];
        const hasOld = parsed.some((a) => a.id === 'ALT-156' || a.id === 'ALT-157');
        const hasNew = parsed.some((a) => a.id === 'ALT-356');
        if (!hasOld && hasNew && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.warn('Erro ao ler alertas salvos:', err);
      }
    }
    return INITIAL_ALERTS;
  });
  const [entities, setEntities] = useState<Entity[]>(() => {
    const saved = localStorage.getItem('medusa_entities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Entity[];
        const hasOld = parsed.some((e) => e.id === 'ENT-801' || e.id === 'ENT-802');
        const hasNew = parsed.some((e) => e.id === 'ENT-906');
        if (!hasOld && hasNew && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.warn('Erro ao ler entidades salvas:', err);
      }
    }
    return INITIAL_ENTITIES;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('medusa_chat_messages');
    if (saved) return JSON.parse(saved);
    
    const savedUser = localStorage.getItem('medusa_active_user');
    let uName = 'Arthur';
    if (savedUser) {
      try {
        uName = JSON.parse(savedUser).name || 'Arthur';
      } catch (e) {}
    }
    return [
      {
        id: 'init-1',
        sender: 'ai',
        text: `Olá ${uName}. Sou a Unidade de Inteligência Financeira Medusa. Estou analisando as conexões do grafo, fluxos fiscais e alertas em tempo real.\n\nComo posso apoiar sua perícia investigativa hoje?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Local backups
  useEffect(() => {
    if (firebaseStatus === 'offline') {
      localStorage.setItem('medusa_cases', JSON.stringify(cases));
    }
  }, [cases, firebaseStatus]);

  useEffect(() => {
    if (firebaseStatus === 'offline') {
      localStorage.setItem('medusa_alerts', JSON.stringify(alerts));
    }
  }, [alerts, firebaseStatus]);

  useEffect(() => {
    if (firebaseStatus === 'offline') {
      localStorage.setItem('medusa_entities', JSON.stringify(entities));
    }
  }, [entities, firebaseStatus]);

  useEffect(() => {
    if (firebaseStatus === 'offline') {
      localStorage.setItem('medusa_chat_messages', JSON.stringify(chatMessages));
    }
  }, [chatMessages, firebaseStatus]);

  // Firebase Real-time listeners
  useEffect(() => {
    let active = true;
    
    // Auto Anonymous Login
    signInAnonymously(auth)
      .then(() => {
        if (!active) return;
        setFirebaseStatus('connected');
        console.log('Firebase Autenticado com sucesso!');
      })
      .catch((err) => {
        if (!active) return;
        console.warn('Falha na autenticação Firebase (usando Sandbox local offline):', err);
        setFirebaseStatus('offline');
      });

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        if (active) setFirebaseStatus('offline');
        return;
      }

      setFirebaseStatus('connected');

      // Listen to Cases
      const unsubCases = onSnapshot(collection(db, 'cases'), async (snapshot) => {
        if (!active) return;
        if (!snapshot.empty) {
          const list: Case[] = [];
          let hasOld = false;
          let hasNew = false;
          snapshot.forEach((doc) => {
            const data = doc.data() as Case;
            if (data.id === 'CAS-024' || data.id === 'CAS-102') {
              hasOld = true;
            }
            if (data.id === 'CAS-306') {
              hasNew = true;
            }
            list.push(data);
          });

          if (hasOld || !hasNew) {
            console.log('Old or incomplete cases detected in Firestore. Migrating to 8 AML/Compliance cases...');
            // Delete old documents
            for (const item of list) {
              try {
                await deleteDoc(doc(db, 'cases', item.id));
              } catch (e) {
                console.warn('Could not delete old case:', item.id, e);
              }
            }
            // Add new cases
            for (const item of SAMPLE_CASES) {
              try {
                await setDoc(doc(db, 'cases', item.id), item);
              } catch (e) {
                console.warn('Could not write new case:', item.id, e);
              }
            }
          } else {
            setCases(list);
          }
        } else {
          // If Firestore is completely empty, let's auto-seed the 8 cases
          console.log('Firestore cases are empty. Auto-seeding 8 AML/Compliance cases...');
          for (const item of SAMPLE_CASES) {
            try {
              await setDoc(doc(db, 'cases', item.id), item);
            } catch (e) {
              console.warn('Could not write new case:', item.id, e);
            }
          }
        }
      }, (error) => {
        console.warn('Erro ao carregar casos via Firestore:', error);
      });

      // Listen to Alerts
      const unsubAlerts = onSnapshot(collection(db, 'alerts'), async (snapshot) => {
        if (!active) return;
        if (!snapshot.empty) {
          const list: Alert[] = [];
          let hasOld = false;
          let hasNew = false;
          snapshot.forEach((doc) => {
            const data = doc.data() as Alert;
            if (data.id === 'ALT-156' || data.id === 'ALT-157') {
              hasOld = true;
            }
            if (data.id === 'ALT-356') {
              hasNew = true;
            }
            list.push(data);
          });

          if (hasOld || !hasNew) {
            console.log('Old or incomplete alerts detected in Firestore. Migrating to new aligned alerts...');
            for (const item of list) {
              try {
                await deleteDoc(doc(db, 'alerts', item.id));
              } catch (e) {
                console.warn('Could not delete old alert:', item.id, e);
              }
            }
            for (const item of SAMPLE_ALERTS) {
              try {
                await setDoc(doc(db, 'alerts', item.id), item);
              } catch (e) {
                console.warn('Could not write new alert:', item.id, e);
              }
            }
          } else {
            setAlerts(list);
          }
        } else {
          console.log('Firestore alerts are empty. Auto-seeding new aligned alerts...');
          for (const item of SAMPLE_ALERTS) {
            try {
              await setDoc(doc(db, 'alerts', item.id), item);
            } catch (e) {
              console.warn('Could not write new alert:', item.id, e);
            }
          }
        }
      }, (error) => {
        console.warn('Erro ao carregar alertas via Firestore:', error);
      });

      // Listen to Entities
      const unsubEntities = onSnapshot(collection(db, 'entities'), async (snapshot) => {
        if (!active) return;
        if (!snapshot.empty) {
          const list: Entity[] = [];
          let hasOld = false;
          let hasNew = false;
          snapshot.forEach((doc) => {
            const data = doc.data() as Entity;
            if (data.id === 'ENT-801' || data.id === 'ENT-802') {
              hasOld = true;
            }
            if (data.id === 'ENT-906') {
              hasNew = true;
            }
            list.push(data);
          });

          if (hasOld || !hasNew) {
            console.log('Old or incomplete entities detected in Firestore. Migrating to new aligned entities...');
            for (const item of list) {
              try {
                await deleteDoc(doc(db, 'entities', item.id));
              } catch (e) {
                console.warn('Could not delete old entity:', item.id, e);
              }
            }
            for (const item of SAMPLE_ENTITIES) {
              try {
                await setDoc(doc(db, 'entities', item.id), item);
              } catch (e) {
                console.warn('Could not write new entity:', item.id, e);
              }
            }
          } else {
            setEntities(list);
          }
        } else {
          console.log('Firestore entities are empty. Auto-seeding new aligned entities...');
          for (const item of SAMPLE_ENTITIES) {
            try {
              await setDoc(doc(db, 'entities', item.id), item);
            } catch (e) {
              console.warn('Could not write new entity:', item.id, e);
            }
          }
        }
      }, (error) => {
        console.warn('Erro ao carregar entidades via Firestore:', error);
      });

      // Listen to Chat messages
      const unsubChat = onSnapshot(collection(db, 'chat_messages'), (snapshot) => {
        if (!active) return;
        if (!snapshot.empty) {
          const list: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as ChatMessage);
          });
          list.sort((a, b) => a.id.localeCompare(b.id)); 
          setChatMessages(list);
        }
      }, (error) => {
        console.warn('Erro ao carregar mensagens via Firestore:', error);
      });

      return () => {
        unsubCases();
        unsubAlerts();
        unsubEntities();
        unsubChat();
      };
    });

    return () => {
      active = false;
      unsubscribeAuth();
    };
  }, []);

  // Controls to clear database for mockup demonstration
  const handleClearPrototypeData = async () => {
    if (firebaseStatus === 'connected') {
      try {
        // Clear documents
        for (const obj of cases) {
          await deleteDoc(doc(db, 'cases', obj.id));
        }
        for (const obj of alerts) {
          await deleteDoc(doc(db, 'alerts', obj.id));
        }
        for (const obj of entities) {
          await deleteDoc(doc(db, 'entities', obj.id));
        }
        for (const obj of chatMessages) {
          await deleteDoc(doc(db, 'chat_messages', obj.id));
        }
        triggerToast('Banco de dados em nuvem Firebase limpo com sucesso!');
      } catch (error) {
        console.error('Erro de gravação Firebase ao limpar:', error);
        triggerToast('Falha ao zerar no servidor de nuvem. Executando localmente.');
      }
    }

    setCases([]);
    setAlerts([]);
    setEntities([]);
    
    const freshMessages: ChatMessage[] = [
      {
        id: 'init-1',
        sender: 'ai',
        text: 'Unidade de Inteligência Financeira Medusa limpa e reconfigurada.\n\nPronto para iniciar uma nova perícia do zero. Estou monitorando os fluxos financeiros e sinais de lavagem de dinheiro em tempo real. Como posso ajudar com sua primeira investigação do zero?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setChatMessages(freshMessages);
    
    // Clear inspectors
    setSelectedCase(null);
    setSelectedAlert(null);
    setSelectedEntity(null);

    if (firebaseStatus !== 'connected') {
      triggerToast('Protótipo reiniciado! Casos, alertas, cadastros e mensagens de chat zerados localmente.');
    }
  };

  const handleRestoreSamplePrototypeData = async () => {
    if (firebaseStatus === 'connected') {
      try {
        // Set documents in Firestore
        for (const obj of SAMPLE_CASES) {
          await setDoc(doc(db, 'cases', obj.id), obj);
        }
        for (const obj of SAMPLE_ALERTS) {
          await setDoc(doc(db, 'alerts', obj.id), obj);
        }
        for (const obj of SAMPLE_ENTITIES) {
          await setDoc(doc(db, 'entities', obj.id), obj);
        }
        
        const freshMsg: ChatMessage = {
          id: 'init-1',
          sender: 'ai',
          text: `Olá ${activeUser.name}. Os dados originais de simulação foram restaurados com sucesso. Temos alertas suspeitos na fila e inquéritos em andamento.\n\nComo posso apoiar sua perícia sobre os ativos investigados hoje?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        await setDoc(doc(db, 'chat_messages', freshMsg.id), freshMsg);
        triggerToast('Dados originais restaurados com sucesso no Firebase!');
      } catch (error) {
        console.error('Erro de restauração no Firebase:', error);
        triggerToast('Erro ao restaurar em nuvem. Restaurando localmente.');
      }
    }

    setCases(SAMPLE_CASES);
    setAlerts(SAMPLE_ALERTS);
    setEntities(SAMPLE_ENTITIES);
    
    const freshMessages: ChatMessage[] = [
      {
        id: 'init-1',
        sender: 'ai',
        text: `Olá ${activeUser.name}. Os dados originais de simulação foram restaurados com sucesso. Temos alertas suspeitos na fila e inquéritos em andamento.\n\nComo posso apoiar sua perícia sobre os ativos investigados hoje?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setChatMessages(freshMessages);

    // Clear inspectors
    setSelectedCase(null);
    setSelectedAlert(null);
    setSelectedEntity(null);

    if (firebaseStatus !== 'connected') {
      triggerToast('Dados originais restaurados com sucesso localmente.');
    }
  };

  // Inspector Focus State
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedCaseIdForGraph, setSelectedCaseIdForGraph] = useState<string>('CAS-301');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // AI Panel
  const [isAiPanelOpen, setIsAiPanelOpen] = useState<boolean>(false);

  // New Case Modal State
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState<boolean>(false);
  const [modalCaseName, setModalCaseName] = useState<string>('');
  const [modalTarget, setModalTarget] = useState<string>('');
  const [modalDesc, setModalDesc] = useState<string>('');
  const [modalValue, setModalValue] = useState<string>('R$ 1.5M');
  const [escalatedAlertId, setEscalatedAlertId] = useState<string | null>(null);

  // Success Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenNewCaseModal = () => {
    setModalCaseName('');
    setModalTarget('');
    setModalDesc('');
    setModalValue('R$ 1.5M');
    setEscalatedAlertId(null);
    setIsNewCaseModalOpen(true);
  };

  // Convert an Alert into a pre-filled Case creation flow (Escalation)
  const handleEscalateToCase = (alert: Alert) => {
    setModalCaseName(`Inquérito s/ ${alert.type}`);
    setModalTarget(alert.targetEntity);
    setModalDesc(`Escalonamento automático do alerta de auditoria ${alert.id}. Detalhes: ${alert.description}`);
    setModalValue('R$ 2.5M');
    setEscalatedAlertId(alert.id);
    setIsNewCaseModalOpen(true);
  };

  const handleCreateCase = async (e: FormEvent) => {
    e.preventDefault();
    if (!modalCaseName || !modalTarget) {
      alert('Favor preencher o Nome do Caso e o Alvo Principal.');
      return;
    }

    const nextId = `CAS-${String(cases.length + 100).substring(0, 3)}`;
    const newCase: Case = {
      id: nextId,
      name: modalCaseName,
      target: modalTarget,
      description: modalDesc || 'Sem descrição cadastrada.',
      status: 'active',
      riskScore: 75,
      riskLevel: 'high',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      assignedTo: activeUser.name,
      associatedValue: modalValue,
    };

    // Always update local state immediately to ensure instant synchronization across all dashboard stats, dropdowns & tabs
    setCases((prev) => {
      if (prev.some((c) => c.id === newCase.id)) return prev;
      return [newCase, ...prev];
    });

    if (escalatedAlertId) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === escalatedAlertId ? { ...a, status: 'escalated' } : a))
      );
    }

    if (firebaseStatus === 'connected') {
      try {
        await setDoc(doc(db, 'cases', nextId), newCase);
        // If escalated from an alert, update that alert status as escalated in firestore
        if (escalatedAlertId) {
          const foundAlert = alerts.find((a) => a.id === escalatedAlertId);
          if (foundAlert) {
            await setDoc(doc(db, 'alerts', escalatedAlertId), { ...foundAlert, status: 'escalated' });
          }
        }
      } catch (error) {
        console.error('Erro de gravação do Novo Caso no Firebase:', error);
        handleFirestoreError(error, OperationType.CREATE, `cases/${nextId}`);
      }
    }

    if (selectedAlert?.id === escalatedAlertId && escalatedAlertId) {
      setSelectedAlert((prev) => (prev ? { ...prev, status: 'escalated' } : null));
    }

    setIsNewCaseModalOpen(false);
    triggerToast(`Caso ${nextId} ("${modalCaseName}") autuado com sucesso!`);
    setSelectedCase(newCase);
    setActiveTab('cases');
  };

  const handleSetCases = async (updatedCases: Case[]) => {
    setCases(updatedCases);
    if (firebaseStatus === 'connected') {
      try {
        for (const c of updatedCases) {
          const old = cases.find((o) => o.id === c.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(c)) {
            await setDoc(doc(db, 'cases', c.id), c);
          }
        }
      } catch (error) {
        console.error('Erro ao salvar caso no Firestore:', error);
      }
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (firebaseStatus === 'connected') {
      try {
        await deleteDoc(doc(db, 'cases', caseId));
      } catch (error) {
        console.error('Erro de exclusão de caso no Firebase:', error);
      }
    }
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    if (selectedCase?.id === caseId) {
      setSelectedCase(null);
    }
    triggerToast(`Caso ${caseId} removido do sistema.`);
  };

  const handleSetAlerts = async (updatedAlerts: Alert[]) => {
    setAlerts(updatedAlerts);
    if (firebaseStatus === 'connected') {
      try {
        for (const a of updatedAlerts) {
          const old = alerts.find((o) => o.id === a.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(a)) {
            await setDoc(doc(db, 'alerts', a.id), a);
          }
        }
      } catch (error) {
        console.error('Erro ao salvar alerta no Firestore:', error);
      }
    }
  };

  const handleSetChatMessages = async (
    nextVal: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => {
    const resolved = typeof nextVal === 'function' ? nextVal(chatMessages) : nextVal;
    setChatMessages(resolved);

    if (firebaseStatus === 'connected') {
      try {
        for (const msg of resolved) {
          const old = chatMessages.find((o) => o.id === msg.id);
          if (!old) {
            await setDoc(doc(db, 'chat_messages', msg.id), msg);
          }
        }
      } catch (error) {
        console.error('Erro ao salvar mensagem no Firestore:', error);
      }
    }
  };

  // Active view selective rendering
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            cases={cases}
            alerts={alerts}
            entities={entities}
            setActiveTab={setActiveTab}
            onSelectCase={setSelectedCase}
            onSelectAlert={setSelectedAlert}
            onOpenNewCaseModal={handleOpenNewCaseModal}
          />
        );
      case 'cases':
        return (
          <CasesView
            cases={cases}
            setCases={handleSetCases}
            selectedCase={selectedCase}
            setSelectedCase={setSelectedCase}
            onOpenNewCaseModal={handleOpenNewCaseModal}
            onDeleteCase={handleDeleteCase}
            onViewInGraph={(caseId) => {
              setSelectedCaseIdForGraph(caseId);
              setActiveTab('link-analysis');
            }}
          />
        );
      case 'alerts':
        return (
          <AlertsView
            alerts={alerts}
            setAlerts={handleSetAlerts}
            selectedAlert={selectedAlert}
            setSelectedAlert={setSelectedAlert}
            onEscalateToCase={handleEscalateToCase}
          />
        );
      case 'entities':
        return (
          <EntitiesView
            entities={entities}
            selectedEntity={selectedEntity}
            setSelectedEntity={setSelectedEntity}
          />
        );
      case 'link-analysis':
        return (
          <LinkAnalysisView
            entities={entities}
            cases={cases}
            selectedCaseId={selectedCaseIdForGraph}
            setSelectedCaseId={setSelectedCaseIdForGraph}
            activeUserName={activeUser.name}
          />
        );
      case 'reports':
        return <ReportsView cases={cases} />;
      case 'settings':
        return (
          <div className="bg-white rounded-[10px] border border-[#e5e5e0] p-8 max-w-2xl space-y-6 animate-fade-in">
            <div className="border-b border-[#f0f0f2] pb-4">
              <h1 className="text-xl font-bold font-display text-text-primary">Configurações da Unidade</h1>
              <p className="text-xs text-text-secondary mt-1">Configure parâmetros de conformidade e integrações governamentais</p>
            </div>

            <div className="space-y-4 text-xs font-sans text-text-primary">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="font-bold block">Limiares do Motor de Risco</span>
                  <p className="text-[11px] text-text-secondary mt-0.5">Limite transacional configurado para gatilho automático de rastreamento (Limite do Motor).</p>
                </div>
                <input
                  type="text"
                  defaultValue="R$ 10.000,00"
                  className="bg-white border border-[#e5e5e7] px-3 py-1 rounded font-mono font-bold text-center w-32 outline-none"
                />
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="font-bold block">Bacen</span>
                  <p className="text-[11px] text-text-secondary mt-0.5">Integração cadastral ativa com o Banco Central do Brasil (Bacen).</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-risk-low px-2 py-1 rounded font-bold uppercase">ATIVO</span>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="font-bold block">API do COAF</span>
                  <p className="text-[11px] text-text-secondary mt-0.5">Ponto de extremidade ativo do ecossistema de dados integrados do COAF (Conselho de Controle de Atividades Financeiras).</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-risk-low px-2 py-1 rounded font-bold uppercase">CONECTADO</span>
              </div>
            </div>

            <p className="text-[10px] text-text-secondary italic pt-2 border-t border-slate-100 mt-4">
              Ambiente de homologação restrito. Operador ativo: <strong>{activeUser.name}</strong> ({activeUser.role}). ID de Sessão: SESS-849204A.
            </p>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold cursor-pointer transition inline-flex items-center gap-1.5"
            >
              Encerrar Sessão do Operador
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-text-primary">
      {/* Sidebar fixed left */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewCaseModal={handleOpenNewCaseModal}
        pendingAlertsCount={alerts.filter((a) => a.status === 'pending').length}
        activeCasesCount={cases.filter((c) => c.status !== 'closed').length}
      />

      {/* Main Container scrolled offset */}
      <div className={`ml-[260px] ${activeTab === 'link-analysis' ? 'h-screen overflow-hidden' : 'min-h-screen'} flex flex-col justify-between`}>
        
        {/* Upper Header strip */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          alerts={alerts}
          onSelectAlert={(a) => {
            setSelectedAlert(a);
            setActiveTab('alerts');
          }}
          setActiveTab={setActiveTab}
          firebaseStatus={firebaseStatus}
          userName={activeUser.name}
          userRole={activeUser.role}
        />

        {/* View content area with fluid width safe margins */}
        <main className={`flex-1 max-w-none w-full ${activeTab === 'link-analysis' ? 'p-0 overflow-hidden flex flex-col min-h-0' : 'p-6 md:p-8 lg:p-10'}`}>
          {renderActiveView()}
        </main>

        {/* Humble, clean professional footer representing legal compliance limits */}
        {activeTab !== 'link-analysis' && (
          <footer className="h-14 border-t border-[#e5e5e7] bg-white text-center flex items-center justify-center text-[11px] text-text-secondary select-none">
            <span>Sistema Medusa // Arquitetura Modular para Inteligência Investigativa em Crimes Financeiros // © 2026</span>
          </footer>
        )}
      </div>

      {/* Floating Sparkly Bot button to Toggle Medusa AI Assistance */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
          className="w-12 h-12 rounded-full bg-[#003526] hover:bg-[#0f4d3a] text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all relative group"
          title="Consultar Assistente Medusa AI"
        >
          <Bot className="w-6 h-6 text-[#83bda4]" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-600 border-2 border-white animate-ping" />
        </button>
      </div>

      {/* Global Bot Chat Panel */}
      <AIIntelligencePanel
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
        messages={chatMessages}
        setMessages={handleSetChatMessages}
        activeContext={{
          view: activeTab,
          selectedCase,
          selectedAlert,
          selectedEntity,
        }}
      />

      {/* Custom Global Toast banner messages */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#0f4d3a] border border-[#83bda4] text-white px-5 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-slide-in">
          <CheckCircle className="w-4 h-4 text-[#83bda4]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* COMPLIANCE CASE INIATION MODAL */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl border border-[#e5e5e0] animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#f0f0f2] pb-3 mb-4">
              <h3 className="font-bold font-display text-base text-text-primary flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-primary" />
                Dossiê: Autuar Nova Investigação
              </h3>
              <button
                onClick={() => setIsNewCaseModalOpen(false)}
                className="text-xs text-text-secondary hover:text-text-primary"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs font-sans text-text-primary">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                  Nome do Caso de Investigação
                </label>
                <input
                  type="text"
                  required
                  value={modalCaseName}
                  onChange={(e) => setModalCaseName(e.target.value)}
                  placeholder="Ex: Operação Correnteza"
                  className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-2.5 rounded-[6px] outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                    Alvo Principal (Indivíduo ou CNPJ)
                  </label>
                  <input
                    type="text"
                    required
                    value={modalTarget}
                    onChange={(e) => setModalTarget(e.target.value)}
                    placeholder="Ex: Aliança offshore"
                    className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-2.5 rounded-[6px] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                    Montante de Risco Estimado
                  </label>
                  <input
                    type="text"
                    value={modalValue}
                    onChange={(e) => setModalValue(e.target.value)}
                    className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-2.5 rounded-[6px] outline-none transition font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                  Fatos Apontados e Escopos de Diligência
                </label>
                <textarea
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  rows={4}
                  placeholder="Insira os elementos iniciais da suspeita, vínculos ou quebras urgentes requeridas..."
                  className="w-full bg-[#f3f3f5] focus:bg-white border border-transparent focus:border-[#bfc9c2] p-3 rounded-[6px] outline-none transition resize-none placeholder:text-[#8e8e93]"
                />
              </div>

              {escalatedAlertId && (
                <div className="p-3 bg-amber-50 rounded border border-amber-200 text-[#7c2d12] flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[10px]">
                    Esta investigação será vinculada ao alerta atômico <strong>{escalatedAlertId}</strong>, elevando o status deste último automaticamente para "Escalonado" após a assinatura deste termo.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-[6px] text-xs font-semibold transition mt-6"
              >
                Autuar e Assinar Portaria de Inquérito
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
