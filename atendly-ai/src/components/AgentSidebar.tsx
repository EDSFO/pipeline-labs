import { Bot } from 'lucide-react';

interface UserAgent {
  id: number;
  agent_id: number;
  agent_name: string;
  agent_type: string;
  is_orchestrator: boolean;
}

interface Props {
  agents: UserAgent[];
  selectedAgentId?: number;
  onSelectAgent: (agent: UserAgent) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AgentSidebar({ agents, selectedAgentId, onSelectAgent, isCollapsed, onToggleCollapse }: Props) {
  if (isCollapsed) {
    return (
      <div className="w-16 bg-[#0A0A0A] border-r border-white/5 flex flex-col items-center py-4">
        <button onClick={onToggleCollapse} className="p-2 hover:bg-white/5">
          <Bot className="w-5 h-5 text-neutral-500" />
        </button>
        {agents.slice(0, 5).map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent)}
            className="p-2 mt-2 hover:bg-white/5"
          >
            <div className="w-8 h-8 bg-[#F97316]/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#F97316]" />
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col">
      <div className="p-4 border-b border-white/5">
        <h3 className="text-white text-sm font-medium uppercase tracking-tight">
          Meus Agentes
        </h3>
        <p className="text-neutral-500 text-xs mt-1">
          {agents.length} agente(s)
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent)}
            className={`w-full p-3 flex items-center gap-3 transition-colors ${
              selectedAgentId === agent.agent_id
                ? 'bg-[#F97316]/10 border border-[#F97316]/30'
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className={`w-10 h-10 flex items-center justify-center ${
              selectedAgentId === agent.agent_id ? 'bg-[#F97316]' : 'bg-white/10'
            }`}>
              <Bot className={`w-5 h-5 ${selectedAgentId === agent.agent_id ? 'text-black' : 'text-neutral-400'}`} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{agent.agent_name}</p>
              <p className="text-neutral-500 text-xs uppercase">{agent.agent_type}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}