import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2 } from 'lucide-react';
import { Tenant } from '../types';

// Icons
const MaterialIcon = ({ icon, className = '' }: { icon: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{icon}</span>
);

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AgentChatPanelProps {
  agent: any;
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentChatPanel({ agent, tenant, isOpen, onClose }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Olá! Sou o ${agent?.name}. Como posso ajudar a configurar seu atendimento?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Reset messages when agent changes
  useEffect(() => {
    if (agent) {
      setMessages([
        { role: 'model', text: `Olá! Sou o ${agent.name}. Como posso ajudar a configurar seu atendimento?` }
      ]);
    }
  }, [agent?.id]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          tenant_id: tenant.id,
          agent_id: agent.id,
          history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }))
        }),
      });

      const data = await res.json();
      const responseText = data.text || data.response || 'Erro ao processar resposta';
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, ocorreu um erro. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[400px] max-w-[90vw] bg-[#0A0A0A] border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: '#F97316' }}>
              <div className="flex items-center gap-3">
                <MaterialIcon icon="smart_toy" className="text-black" />
                <div>
                  <h3 className="text-black font-medium uppercase tracking-tight text-sm">{agent?.name}</h3>
                  <p className="text-black/70 text-[10px] font-mono uppercase">Agente Ativo</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050505]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 text-xs ${
                      msg.role === 'user'
                        ? 'bg-[#F97316] text-black'
                        : 'bg-[#0A0A0A] border border-white/10 text-neutral-300'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#0A0A0A] border border-white/10 p-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[#F97316]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-[#0A0A0A] border-t border-white/5">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 input-dark text-xs font-mono uppercase tracking-wider"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 border border-white/10 text-neutral-400 hover:text-[#F97316] hover:border-[#F97316]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  style={{ backgroundColor: input.trim() && !isLoading ? '#F97316' : 'transparent' }}
                >
                  <Send className="w-4 h-4" style={{ color: input.trim() && !isLoading ? 'black' : 'currentColor' }} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
