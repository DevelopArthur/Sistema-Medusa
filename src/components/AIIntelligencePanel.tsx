/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AIIntelligencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext: any;
  messages?: ChatMessage[];
  setMessages?: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function AIIntelligencePanel({
  isOpen,
  onClose,
  activeContext,
  messages: propMessages,
  setMessages: propSetMessages,
}: AIIntelligencePanelProps) {
   const [localMessages, setLocalMessages] = useState<ChatMessage[]>(() => {
    let uName = 'Arthur';
    const saved = localStorage.getItem('medusa_active_user');
    if (saved) {
      try {
        uName = JSON.parse(saved).name || 'Arthur';
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

  const messages = propMessages !== undefined ? propMessages : localMessages;
  const setMessages = propSetMessages !== undefined ? propSetMessages : setLocalMessages;
  const [inputMsg, setInputMsg] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: activeContext || { currentView: 'Geral' }
        })
      });
      const data = await response.json();
      
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.text || 'Processamento indisponível no momento.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.warn('Erro ao chamar chat do backend:', err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Falta configurar as chaves de segurança (GEMINI_API_KEY) nos segredos corporativos de desenvolvimento, mas simulando minhas conexões com receita: o escore indica alta chance de as contas em Barueri pertencerem a empresas de prateleira fictícias direcionando dinheiro via Cayman.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-[380px] h-screen bg-white/95 backdrop-blur-md border-l border-[#e5e5e7] shadow-2xl fixed right-0 top-0 z-50 flex flex-col justify-between animate-slide-in">
      {/* Panel Header */}
      <div className="p-4 bg-[#003526] text-white flex items-center justify-between border-b border-[#0f4d3a]">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#83bda4]" />
          <div>
            <span className="text-sm font-bold font-display tracking-tight">
              Painel de Inteligência Medusa
            </span>
            <p className="text-[9px] font-mono tracking-wider text-[#83bda4] uppercase select-none">
              AI Copilot Ativo
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-[#0f4d3a] rounded-full text-white/80 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages layout scroll area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-white to-[#f9f9fb]">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} max-w-[90%] ${
                isAi ? '' : 'ml-auto'
              }`}
            >
              <div
                className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                  isAi
                    ? 'bg-[#f4f4f6] text-text-primary border border-[#e5e5e0]'
                    : 'bg-primary text-white font-medium'
                }`}
              >
                {/* Format markdown ticks within text */}
                {m.text.split('\n').map((line, idx) => (
                  <p key={idx} className="mt-1 first:mt-0">
                    {line}
                  </p>
                ))}
              </div>
              <span className="text-[9px] font-mono text-text-secondary mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 bg-[#f3f3f5] rounded-lg max-w-[120px] ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce delay-75" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce delay-150" />
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input box */}
      <div className="p-4 border-t border-[#f0f0f2] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputMsg);
          }}
          className="flex gap-2 relative"
        >
          <input
            id="copilot-text-input"
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Pergunte sobre crimes financeiros..."
            className="flex-1 bg-[#f3f3f5] hover:bg-[#eeeef0] focus:bg-white text-xs text-text-primary rounded-[6px] pl-3.5 pr-10 py-2.5 outline-none border border-transparent focus:border-[#bfc9c2] transition placeholder:text-[#8e8e93]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-primary/10 text-primary rounded-md transition"
            title="Enviar mensagem"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
