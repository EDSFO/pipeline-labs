import { db } from './db';

// Agent Templates
export const AGENT_TEMPLATES = {
  marketing: {
    name: 'Agente de Marketing',
    description: 'Especializado em campanhas, promoções e marketing digital',
    system_prompt: `Você é um assistente virtual especializado em MARKETING para uma empresa.

Sua função é:
- Criar e sugerir campanhas de marketing
- Informar sobre promoções e ofertas
- Convidar clientes para seguirem nas redes sociais
- Divulgar eventos e novidades da empresa
- Analisar preferências dos clientes para ofertas personalizadas

Instruções:
- Seja persuasivo e criativo
- Foque em aumentar o engajamento do cliente
- Sempre sugira próximos passos
- Mantenha tom profissional mas amigável`,
    agent_type: 'marketing'
  },
  atendimento: {
    name: 'Agente de Atendimento',
    description: 'Especializado em suporte ao cliente e dúvidas gerais',
    system_prompt: `Você é um assistente virtual de ATENDIMENTO para uma empresa.

Sua função é:
- Responder dúvidas sobre serviços oferecidos
- Informar horários de funcionamento
- Esclarecer políticas da empresa
- Guiar clientes para os serviços adequados
- Manter comunicação educada e eficiente

Instruções:
- Seja claro e objetivo
- Use linguagem simples
- Confirme entendimento do cliente
- Encaminhe para outro setor quando necessário
- Sempre seja prestativo`,
    agent_type: 'atendimento'
  },
  vendas: {
    name: 'Agente de Vendas',
    description: 'Especializado em conversão e fechamento de vendas',
    system_prompt: `Você é um assistente virtual de VENDAS para uma empresa.

Sua função é:
- Identificar necessidades do cliente
- Apresentar serviços adequados
- Informar preços e condições
- Negociar e fechar vendas
- Realizar agendamentos de serviços

Instruções:
- Seja proativo na identificação de oportunidades
- Destaque benefícios dos serviços
- Use técnicas de vendas éticas
- Siga até o fechamento
- Sempre confirme agendamentos`,
    agent_type: 'vendas'
  },
  suporte: {
    name: 'Agente de Suporte',
    description: 'Especializado em resolução de problemas e suporte técnico',
    system_prompt: `Você é um assistente virtual de SUPORTE para uma empresa.

Sua função é:
- Auxiliar clientes com problemas
- Responder dúvidas técnicas
- Guiar passo a passo em procedimentos
- Registrar reclamações e feedback
- Acompanhar resolução de issues

Instruções:
- Seja paciente e detalhista
- Peça informações necessárias para diagnóstico
- Forneça soluções passo a passo
- Escal quando necessário
- Acompanhe até resolução`,
    agent_type: 'suporte'
  },
  custom: {
    name: 'Agente Personalizado',
    description: 'Agente com configuração customizada',
    system_prompt: '',
    agent_type: 'custom'
  }
};

// Get all agents for a tenant
export async function getAgents(tenantId: number) {
  const result = await db.query(
    'SELECT * FROM agents WHERE tenant_id = $1 ORDER BY created_at DESC',
    [tenantId]
  );
  return result.rows;
}

// Get agent by ID
export async function getAgent(agentId: number) {
  const result = await db.query('SELECT * FROM agents WHERE id = $1', [agentId]);
  return result.rows[0];
}

// Create agent
export async function createAgent(data: {
  tenant_id: number;
  name: string;
  description?: string;
  system_prompt?: string;
  agent_type?: string;
}) {
  const result = await db.query(
    `INSERT INTO agents (tenant_id, name, description, system_prompt, agent_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.tenant_id,
      data.name,
      data.description || null,
      data.system_prompt || null,
      data.agent_type || 'custom'
    ]
  );
  return result.rows[0];
}

// Create agent from template
export async function createAgentFromTemplate(data: {
  tenant_id: number;
  template_key: string;
  custom_name?: string;
  custom_description?: string;
  custom_prompt?: string;
}) {
  const template = AGENT_TEMPLATES[data.template_key as keyof typeof AGENT_TEMPLATES];
  if (!template) {
    throw new Error('Template não encontrado');
  }

  const result = await db.query(
    `INSERT INTO agents (tenant_id, name, description, system_prompt, agent_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.tenant_id,
      data.custom_name || template.name,
      data.custom_description || template.description,
      data.custom_prompt || template.system_prompt,
      template.agent_type
    ]
  );
  return result.rows[0];
}

// Update agent
export async function updateAgent(agentId: number, data: {
  name?: string;
  description?: string;
  system_prompt?: string;
  is_active?: boolean;
}) {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.system_prompt !== undefined) {
    updates.push(`system_prompt = $${paramCount++}`);
    values.push(data.system_prompt);
  }
  if (data.is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(data.is_active);
  }

  if (updates.length === 0) {
    return getAgent(agentId);
  }

  values.push(agentId);
  const result = await db.query(
    `UPDATE agents SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0];
}

// Delete agent
export async function deleteAgent(agentId: number) {
  await db.query('DELETE FROM agents WHERE id = $1', [agentId]);
  return { success: true };
}

// Add document to agent (RAG)
export async function addDocument(data: {
  agent_id: number;
  source_type: string;
  content?: string;
  file_url?: string;
  website_url?: string;
}) {
  const result = await db.query(
    `INSERT INTO agent_documents (agent_id, source_type, content, file_url, website_url, processed_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING *`,
    [
      data.agent_id,
      data.source_type,
      data.content || null,
      data.file_url || null,
      data.website_url || null
    ]
  );
  return result.rows[0];
}

// Get documents for agent
export async function getDocuments(agentId: number) {
  const result = await db.query(
    'SELECT * FROM agent_documents WHERE agent_id = $1 ORDER BY created_at DESC',
    [agentId]
  );
  return result.rows;
}

// Delete document
export async function deleteDocument(documentId: number) {
  await db.query('DELETE FROM agent_documents WHERE id = $1', [documentId]);
  return { success: true };
}

// Search documents (simple text search for now)
export async function searchDocuments(agentId: number, query: string) {
  const result = await db.query(
    `SELECT * FROM agent_documents
     WHERE agent_id = $1 AND content ILIKE $2
     ORDER BY created_at DESC`,
    [agentId, `%${query}%`]
  );
  return result.rows;
}
