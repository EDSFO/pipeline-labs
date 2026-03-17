-- Migration: 001_create_agents.sql
-- Description: Create agents and agent_documents tables for multi-agent system
-- Date: 2026-03-17

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  agent_type TEXT NOT NULL DEFAULT 'custom',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent Documents table (RAG)
CREATE TABLE IF NOT EXISTS agent_documents (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  website_url TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_documents_agent_id ON agent_documents(agent_id);
