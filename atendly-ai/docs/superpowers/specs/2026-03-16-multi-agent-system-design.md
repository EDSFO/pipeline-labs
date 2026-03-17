# Especificação: Sistema de Múltiplos Agentes de IA

**Projeto:** Atendly AI - Plataforma de Agendamento com IA
**Data:** 2026-03-16
**Status:** Design Aprovado (2026-03-17)

---

## 1. Visão Geral do Projeto

Plataforma multi-tenant de agendamento automático com chatbot de IA para pequenos negócios. O novo módulo permitirá que cada empresa tenha múltiplos agentes de IA especializados, cada um com sua própria base de conhecimento (RAG) e personalidade.

---

## 2. Requisitos Coletados

### 2.1 Múltiplos Agentes por Empresa
- [x] Cada empresa pode ter vários tipos de agentes
- [x] Exemplos: Agente de Marketing, Atendimento, Vendas, Suporte
- [x] Empresa pode escolher e conversar com qualquer agente

### 2.2 Sistema RAG (Base de Conhecimento)
- [x] Website scan - Extrair automaticamente do site da empresa
- [x] Upload de arquivos - PDFs, documentos, manuais
- [x] Texto manual - Escrever diretamente no sistema

### 2.3 Skills/Personalidades dos Agentes
- [x] Templates prontos - Perfis predefinidos (Atendimento, Vendas, Suporte, Marketing)
- [x] Personalização manual - Definir prompt/instruções
- [x] Combinação de ambas opções

### 2.4 Comunicação
- [x] Chat do sistema - Interface web
- [x] WhatsApp - Integração via MegaAPI

---

## 3. Arquitetura Proposta

### Abordagem Recomendada: HÍBRIDA

```
┌─────────────────┐     ┌──────────────────┐
│   Chat Web      │     │    WhatsApp     │
└────────┬────────┘     └────────┬────────┘
         │                        │
         └────────┬───────────────┘
                  ▼
         ┌──────────────────┐
         │  Agente Principal │ ← Routing/Triage
         │  (Main Agent)     │
         └────────┬─────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│  Sub-Agente    │  │  Sub-Agente    │
│  Marketing     │  │  Atendimento    │
└────────┬────────┘  └────────┬────────┘
         │                   │
         ▼                   ▼
┌─────────────────────────────────┐
│       Vector Database           │
│    (Knowledge Base / RAG)       │
└─────────────────────────────────┘
```

### Componentes:
1. **Agente Principal** - Faz triagem inicial da mensagem
2. **Sub-Agentes Especializados** - Marketing, Atendimento, Vendas, Suporte
3. **Knowledge Base** - Base de conhecimento compartilhada ou específica
4. **Ferramentas** - Funções para buscar serviços, agenda, etc

---

## 4. Estrutura de Dados Proposta

### Tabelas do Banco:

```sql
-- Agentes por empresa
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,           -- Persona/skill do agente
  agent_type TEXT NOT NULL,     -- 'marketing', 'atendimento', 'vendas', 'suporte', 'custom'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fontes de conhecimento por agente (RAG)
CREATE TABLE agent_documents (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  source_type TEXT NOT NULL,    -- 'website', 'file', 'manual'
  content TEXT,                 -- Texto extraído ou inserido
  file_url TEXT,               -- URL do arquivo se upload
  website_url TEXT,            -- URL do site se scan
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OBS: WhatsApp usa tabela existente whatsapp_config (1 número por empresa)
```

---

## 5. Stack Tecnológico Atual

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL (Supabase)
- **LLM:** MiniMax (API Anthropic-compatible)
- **WhatsApp:** MegaAPI (1 número por empresa via whatsapp_config existente)
- **RAG:** Híbrido (texto estruturado em SQL + documentos em pgvector)

---

### Decisões de Design Confirmadas

- **RAG:** Híbrido - SQL para dados estruturados + pgvector para documentos
- **Routing:** Híbrido - Menu para escolher + IA detecta e sugere
- **WhatsApp:** Híbrido - 1 número, IA detecta contexto e muda modo automaticamente (via whatsapp_config existente)
- **Embedding Model:** MiniMax text-embedding API
- **Nota:** Verificar se extensão pgvector está habilitada no Supabase (`CREATE EXTENSION IF NOT EXISTS vector;`)

---

## 6. Próximos Passos Definidos

1. [ ] Implementar schema do banco (tables agents, agent_documents)
2. [ ] Criar sistema de upload de arquivos para RAG
3. [ ] Implementar scan de website
4. [ ] Criar sistema de templates de agentes
5. [ ] Implementar agente principal com routing
6. [ ] Criar sub-agentes especializados
7. [ ] Integrar com chat web existente
8. [ ] Integrar com WhatsApp (múltiplas instances ou routing)

---

## 7. Observações

- O servidor está rodando em `localhost:3000`
- Banco Supabase já tem 12 empresas cadastradas
- Sistema atual tem chatbot simples (single agent)
- MiniMax API já configurada (substitui Gemini)

---

## 8. Aprovações

| Item | Status |
|------|--------|
| Requisitos coletados | ✅ Concluído |
| Abordagem arquitetura | ✅ Definida (Híbrida) |
| Design aprovado | ✅ Aprovado (2026-03-17) |
| Spec Review | ✅ Aprovado (correções aplicadas) |
| Implementação | ⏳ Pendente |

---

*Documento criado automaticamente durante sessão de brainstorming*
