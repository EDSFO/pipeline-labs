import { useState, useEffect } from 'react';
import { RichContent } from '../types';

interface User {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
}

interface UserAgent {
  id: number;
  agent_id: number;
  agent_name: string;
  agent_type: string;
  is_orchestrator: boolean;
  custom_personality?: any;
  system_prompt?: string;
}

export function useAgentWorkspace(userId: number | null) {
  const [user, setUser] = useState<User | null>(null);
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<UserAgent | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user and agents
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      fetch(`/api/users/${userId}`).then(r => r.json()),
      fetch(`/api/users/${userId}/agents`).then(r => r.json())
    ]).then(([userData, agentsData]) => {
      setUser(userData);
      setAgents(agentsData);

      // Auto-select orchestrator if available
      const orchestrator = agentsData.find((a: UserAgent) => a.is_orchestrator);
      if (orchestrator) {
        setSelectedAgent(orchestrator);
      } else if (agentsData.length > 0) {
        setSelectedAgent(agentsData[0]);
      }
    }).catch(err => {
      console.error('Error fetching workspace data:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [userId]);

  return { user, agents, selectedAgent, setSelectedAgent, loading };
}