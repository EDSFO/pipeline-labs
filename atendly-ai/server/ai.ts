import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';

// Initialize MiniMax (compatible with Anthropic API)
const apiKey = process.env.MINIMAX_API_KEY;
const baseURL = process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/anthropic';

if (!apiKey) {
  throw new Error('MINIMAX_API_KEY environment variable is required');
}

const ai = new Anthropic({
  apiKey,
  baseURL,
  defaultHeaders: {
    'Content-Type': 'application/json',
  }
});

// Tool definitions for Claude (MiniMax)
const tools = [
  {
    name: "getServices",
    description: "Get the list of services offered by the business, including prices and duration.",
    input_schema: {
      type: "object",
      properties: {
        tenant_id: { type: "integer", description: "The ID of the business/tenant." }
      },
      required: ["tenant_id"]
    }
  },
  {
    name: "getProfessionals",
    description: "Get the list of professionals working at the business.",
    input_schema: {
      type: "object",
      properties: {
        tenant_id: { type: "integer", description: "The ID of the business/tenant." }
      },
      required: ["tenant_id"]
    }
  },
  {
    name: "checkAvailability",
    description: "Check available appointment slots for a specific date.",
    input_schema: {
      type: "object",
      properties: {
        tenant_id: { type: "integer" },
        date: { type: "string", description: "Date in YYYY-MM-DD format." }
      },
      required: ["tenant_id", "date"]
    }
  },
  {
    name: "createAppointment",
    description: "Schedule a new appointment.",
    input_schema: {
      type: "object",
      properties: {
        tenant_id: { type: "integer" },
        service_name: { type: "string" },
        professional_name: { type: "string" },
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
        time: { type: "string", description: "HH:MM" }
      },
      required: ["tenant_id", "service_name", "professional_name", "customer_name", "customer_phone", "date", "time"]
    }
  }
];

// Helper functions for tools
async function getServices(tenant_id: number) {
  const result = await db.query('SELECT name, price, duration_minutes FROM services WHERE tenant_id = $1', [tenant_id]);
  return result.rows;
}

async function getProfessionals(tenant_id: number) {
  const result = await db.query('SELECT name, specialty FROM professionals WHERE tenant_id = $1', [tenant_id]);
  return result.rows;
}

async function checkAvailability(tenant_id: number, date: string) {
  const allSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const result = await db.query(`
    SELECT to_char(start_time, 'HH24:MI') as time
    FROM appointments
    WHERE tenant_id = $1 AND date(start_time) = $2
  `, [tenant_id, date]);

  const bookedTimes = new Set(result.rows.map((e: any) => e.time));
  return allSlots.filter(slot => !bookedTimes.has(slot));
}

async function createAppointment(args: any) {
  const { tenant_id, service_name, professional_name, customer_name, customer_phone, date, time } = args;

  const serviceRes = await db.query('SELECT id FROM services WHERE tenant_id = $1 AND name ILIKE $2', [tenant_id, `%${service_name}%`]);
  const professionalRes = await db.query('SELECT id FROM professionals WHERE tenant_id = $1 AND name ILIKE $2', [tenant_id, `%${professional_name}%`]);

  const service = serviceRes.rows[0];
  const professional = professionalRes.rows[0];

  if (!service || !professional) {
    return { error: "Service or Professional not found." };
  }

  const start_time = `${date} ${time}:00`;

  try {
    const result = await db.query(`
      INSERT INTO appointments (tenant_id, professional_id, service_id, customer_name, customer_phone, start_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [tenant_id, professional.id, service.id, customer_name, customer_phone, start_time]);
    return { success: true, id: result.rows[0].id, message: "Agendamento confirmado!" };
  } catch (e) {
    return { error: "Failed to create appointment." };
  }
}

// Tool execution handler
async function executeTool(toolName: string, args: any) {
  switch (toolName) {
    case 'getServices':
      return await getServices(args.tenant_id);
    case 'getProfessionals':
      return await getProfessionals(args.tenant_id);
    case 'checkAvailability':
      return await checkAvailability(args.tenant_id, args.date);
    case 'createAppointment':
      return await createAppointment(args);
    default:
      return { error: "Unknown tool" };
  }
}

// New function to scan website
export async function extractInfoFromUrl(url: string) {
  try {
    const res = await fetch(url);
    const html = await res.text();

    const cleanText = html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50000);

    const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.1';

    const result = await ai.messages.create({
      model,
      max_tokens: 4096,
      system: "Você é um assistente de IA especializado em analisar websites de empresas.",
      messages: [{
        role: 'user',
        content: `Analise o conteúdo deste site de uma empresa e extraia as informações relevantes para criar uma Base de Conhecimento (RAG) para um assistente de IA.

Foque em:
1. Nome da empresa e Segmento
2. Descrição sobre quem são (História, missão)
3. Lista de Serviços e Preços (se houver)
4. Horários de Funcionamento
5. Regras, Políticas e Informações de Contato

Formate a saída como um texto corrido e organizado, pronto para ser inserido no contexto da IA.

Conteúdo do site:
${cleanText}`
      }]
    });

    return result.content[0].type === 'text' ? result.content[0].text : 'Failed to extract info';
  } catch (error) {
    console.error("Error scanning website:", error);
    throw new Error("Failed to scan website");
  }
}

export async function handleChat(message: string, tenant_id: number, history: any[], agent_id?: number) {
  // Get Tenant Info for Context
  const tenantRes = await db.query('SELECT name, segment, ai_context FROM tenants WHERE id = $1', [tenant_id]);
  const tenant = tenantRes.rows[0];

  let systemInstruction = '';
  let useRAG = true;

  // If agent_id is provided, use that agent's configuration
  if (agent_id) {
    const agentRes = await db.query('SELECT * FROM agents WHERE id = $1 AND tenant_id = $2', [agent_id, tenant_id]);
    const agent = agentRes.rows[0];

    if (agent && agent.system_prompt) {
      systemInstruction = agent.system_prompt;
      useRAG = agent.agent_type !== 'custom'; // Only use RAG for template agents
    } else {
      // Fallback to default
      systemInstruction = `
Você é o assistente virtual da ${tenant.name} (${tenant.segment}).
Seu objetivo é ajudar clientes a tirar dúvidas sobre serviços, preços e realizar agendamentos.

Seja educado, prestativo e conciso.
Use as ferramentas disponíveis para buscar informações reais de serviços e agenda.
Para agendar, você precisa confirmar: Serviço, Profissional, Data, Hora, Nome do Cliente e Telefone.
Hoje é ${new Date().toLocaleDateString('pt-BR')}.
`;
      useRAG = false;
    }
  } else {
    // Default single-agent mode (legacy)
    systemInstruction = `
Você é o assistente virtual da ${tenant.name} (${tenant.segment}).
Seu objetivo é ajudar clientes a tirar dúvidas sobre serviços, preços e realizar agendamentos.

CONTEXTO ESPECÍFICO DO NEGÓCIO (RAG/Knowledge Base):
"${tenant.ai_context || 'Nenhuma informação adicional fornecida.'}"

Use essas informações para responder dúvidas específicas sobre regras, horários e políticas.

Seja educado, prestativo e conciso.
Use as ferramentas disponíveis para buscar informações reais de serviços e agenda.
Para agendar, você precisa confirmar: Serviço, Profissional, Data, Hora, Nome do Cliente e Telefone.
Hoje é ${new Date().toLocaleDateString('pt-BR')}.
`;
  }

  // Add RAG context if enabled
  if (useRAG && agent_id) {
    const docsRes = await db.query(
      'SELECT content FROM agent_documents WHERE agent_id = $1 ORDER BY created_at DESC LIMIT 5',
      [agent_id]
    );
    if (docsRes.rows.length > 0) {
      const ragContext = docsRes.rows.map((d: any) => d.content).join('\n\n');
      systemInstruction += `\n\nBASE DE CONHECIMENTO:\n${ragContext}`;
    }
  }

  const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.1';

  // Convert history to Anthropic format
  const messages = history.map(h => ({
    role: h.role === 'model' ? 'assistant' : h.role,
    content: h.text
  }));

  messages.push({ role: 'user', content: message });

  try {
    const result = await ai.messages.create({
      model,
      max_tokens: 4096,
      system: systemInstruction,
      messages,
      tools
    });

    // Handle tool use
    const toolUse = result.content.find(c => c.type === 'tool_use');

    if (toolUse) {
      const toolResult = await executeTool(toolUse.name, toolUse.input);

      const toolResultMessage = {
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(toolResult)
        }]
      };

      const finalResult = await ai.messages.create({
        model,
        max_tokens: 4096,
        system: systemInstruction,
        messages: [...messages, { role: 'assistant', content: result.content }, toolResultMessage],
        tools
      });

      return finalResult.content[0].type === 'text' ? finalResult.content[0].text : 'Erro ao processar resposta';
    }

    const textContent = result.content.find(c => c.type === 'text');
    return textContent ? textContent.text : 'Erro ao processar resposta';

  } catch (error) {
    console.error("AI Error:", error);
    return "Desculpe, estou com dificuldades técnicas no momento.";
  }
}

// Detect which agent type best matches the message (for automatic routing)
export async function detectAgentType(message: string, tenant_id: number): Promise<string> {
  const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.1';

  const systemPrompt = `Analise a mensagem do cliente e determine qual tipo de agente é mais adequado para atender.

Tipos disponíveis:
- atendimento: Dúvidas gerais, informações sobre serviços, horários, políticas
- vendas: Interesse em comprar/agendar, orçamentos, negociação
- marketing: Campanhas, promoções, redes sociais, divulgação
- suporte: Problemas técnicos, reclamações, assistance

Responda apenas com o nome do tipo de agente (atendimento/vendas/marketing/suporte).`;

  try {
    const result = await ai.messages.create({
      model,
      max_tokens: 100,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });

    const text = result.content[0].type === 'text' ? result.content[0].text.toLowerCase() : '';

    if (text.includes('vendas')) return 'vendas';
    if (text.includes('marketing')) return 'marketing';
    if (text.includes('suporte')) return 'suporte';
    return 'atendimento';
  } catch (error) {
    console.error("Error detecting agent type:", error);
    return 'atendimento'; // Default fallback
  }
}

// Multi-agent chat with automatic routing
export async function handleMultiAgentChat(
  message: string,
  tenant_id: number,
  history: any[],
  options: {
    agent_id?: number;         // Specific agent to use
    preferred_agent_type?: string; // Preferred type for auto-routing
    auto_route?: boolean;      // Enable automatic routing
  } = {}
) {
  const { agent_id, preferred_agent_type, auto_route = false } = options;

  // If specific agent provided, use it
  if (agent_id) {
    const response = await handleChat(message, tenant_id, history, agent_id);
    return { response, agent_id_used: agent_id, routed: false };
  }

  // If auto-routing is enabled and no specific agent
  if (auto_route) {
    // Detect best agent type for this message
    const detectedType = preferred_agent_type || await detectAgentType(message, tenant_id);

    // Find active agent of that type for this tenant
    const agentRes = await db.query(
      `SELECT id FROM agents WHERE tenant_id = $1 AND agent_type = $2 AND is_active = true LIMIT 1`,
      [tenant_id, detectedType]
    );

    if (agentRes.rows.length > 0) {
      const detectedAgentId = agentRes.rows[0].id;
      const response = await handleChat(message, tenant_id, history, detectedAgentId);
      return {
        response,
        agent_id_used: detectedAgentId,
        agent_type_detected: detectedType,
        routed: true
      };
    }
  }

  // Fallback to default chat
  const response = await handleChat(message, tenant_id, history);
  return { response, agent_id_used: null, routed: false };
}
