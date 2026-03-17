# Atendly AI - Projeto de Agendamento com IA

## Visão Geral

Plataforma multi-tenant de agendamento automático com chatbot de IA para pequenos negócios (salões, clínicas, barbearias, etc.).

- **Stack**: React + Vite + TailwindCSS / Express.js + TypeScript / PostgreSQL (Supabase)
- **IA**: Google Gemini API
- **WhatsApp**: MegaAPI

## Estrutura

```
atendly-ai/
├── server/           # Backend (Express + TypeScript)
│   ├── db.ts        # Conexão PostgreSQL
│   ├── ai.ts        # Integração Gemini + Ferramentas
│   └── whatsapp.ts  # Webhook e envio de mensagens
├── src/             # Frontend (React)
│   └── components/  # Componentes React
└── Skills/          # Skills do Claude Code
```

## Banco de Dados

- ** tenants**: Empresas cadastradas
- ** professionals**: Profissionais de cada empresa
- ** services**: Serviços oferecidos
- ** appointments**: Agendamentos
- ** whatsapp_config**: Configuração WhatsApp por tenant
- ** messages**: Histórico de chat

## Comandos Úteis

```bash
npm install    # Instalar dependências
npm run dev    # Iniciar servidor (porta 3000)
npm run build  # Build produção
```

## Contextos Importantes

### Credenciais (NÃO COMMITAR)
- GEMINI_API_KEY: variável de ambiente
- Banco Supabase: já exposto em `server/db.ts` - **CORRIGIR**

### Integração WhatsApp
- MegaAPI: `https://apibusiness1.megaapi.com.br`
- Webhook: `/api/whatsapp/webhook/:instanceKey`

## Regras de Desenvolvimento

1. **Segurança**: Nunca expor credenciais no código
2. **Tipos**: Usar TypeScript em todos os arquivos
3. **Testes**: Criar testes para novas funcionalidades
4. **Mensagens**: pt-BR para interface e responses

## Skills Relevantes

Use as skills em `Skills/` quando apropriado:

- `software-engineer` - Para implementações complexas
- `code-quality-check` - Para revisões de código
- `fullstack-dev` - Para features fullstack
- `seo-optimizer` - Para otimização SEO se necessário
