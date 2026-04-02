# Opensquad Commercial SaaS — Product Requirements & Design

**Data:** 2026-04-02
**Versão:** 1.0
**Status:** Aprovado para implementação

---

## 1. Visão do Produto

**Opensquad** é uma plataforma SaaS multitenante de marketplace para squads de agentes de IA. O usuário se inscreve, adquire squads via Stripe, e executa dentro da plataforma. A empresa cobre os custos de AI com controles de rate limit, quotas e fallbacks.

**Duas línguas:** Português (BR) e Inglês (EUA) — tanto na interface quanto nos conteúdos dos squads.

---

## 2. Modelo de Negócio

### 2.1 Assinatura

- **Base**: Acesso à plataforma + 1 squad
- **Escalonamento**: Preço cresce conforme quantidade de squads ativos
- **Cobrança**: Stripe Billing (subsrições mensais)

### 2.2 Preço dos Squads

- Cada squad tem preço fixo em centavos (BRL ou USD)
- Squads são ativados na assinatura do usuário
- Troca de squad = ajuste na mensalidade Stripe

### 2.3 Fluxo de Pagamento

```
User seleciona squad(s)
    → Stripe Checkout (cria/atualiza assinatura)
    → Webhook: subscription.created/updated
    → Ativar squads na conta do usuário
    → Fatura mensal: Stripe Invoice → webhook → reconciliar
```

---

## 3. Usuários e Mercados

| Persona | Descrição |
|---------|-----------|
| **Comprador Individual** | Creator, freelancer, ou profissional de marketing que quer automatizar produção de conteúdo com agentes de IA |

| Dimensão | Detalhe |
|----------|---------|
| **Público-alvo geográfico** | Brasil (PT-BR) + Internacional (EN-US) |
| **Idiomas da interface** | PT-BR e EN-US com detector de locale |
| **Moeda de cobrança** | BRL (Brasil) + USD (internacional) |

---

## 4. Arquitetura do Sistema

### 4.1 Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend Web** | Next.js 14+ (App Router, SSR, i18n) |
| **Backend API** | Node.js + Fastify |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache/Sessions** | Redis |
| **Filas (Queue)** | BullMQ (Redis) |
| **AI Gateway** | Camada custom (rate limit, token count, fallback) |
| **Pagamentos** | Stripe Billing + Checkout + Webhooks |
| **Email transacional** | Resend |
| **Hosting** | Hetzner (Docker + Docker Compose) |

### 4.2 Arquitetura Hetzner (Self-Hosted)

```
┌──────────────────────────────────────┐
│          Hetzner Server              │
│  ┌────────────────────────────────┐  │
│  │     Docker + Docker Compose    │  │
│  ├────────────────────────────────┤  │
│  │  Nginx (reverse proxy + SSL)   │  │
│  ├──────────┬──────────┬──────────┤  │
│  │ Next.js  │ Fastify  │  Redis   │  │
│  │ (SSR)    │ API +    │ + Queue  │  │
│  │          │ AI Gw    │          │  │
│  ├──────────┴──────────┴──────────┤  │
│  │     PostgreSQL (Prisma)        │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Prós:** Custo fixo, controle total, fácil depuração.
**Contras:** Gerenciamento de server por conta própria, escala vertical.

### 4.3 Diagrama de Domínios

```
┌─────────────────────────────────────────────────────┐
│                  Landing Page (Next.js)             │
│         PT-BR / EN-US | pricing | signup           │
├─────────────────────────────────────────────────────┤
│                 Auth (NextAuth / Lucia)              │
│          email+password, Stripe customer            │
├─────────────────────────────────────────────────────┤
│              User Dashboard (Next.js)               │
│    Marketplace | Meus Squads | Configurações        │
├─────────────────────────────────────────────────────┤
│              Squad Execution Engine                  │
│              (BullMQ workers)                      │
├─────────────────────────────────────────────────────┤
│              AI Gateway (Custom)                    │
│   Rate Limit → Quota Check → Token Count → Call   │
│         Fallback: Anthropic → OpenAI → Google       │
├─────────────────────────────────────────────────────┤
│           Stripe Billing Integration                │
│   Checkout | Subscriptions | Customer Portal         │
└─────────────────────────────────────────────────────┘
```

---

## 5. Modelo de Dados

```prisma
model User {
  id               String   @id @default(cuid())
  email            String   @unique
  passwordHash     String
  name             String?
  locale           String   @default("pt-BR")
  stripeCustomerId String?  @unique
  subscriptionId   String?
  plan             Plan     @default(STARTER)
  squadLimit       Int      @default(1)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  userSquads       UserSquad[]
  aiUsageLogs      AIUsageLog[]
  rateLimitBuckets RateLimitBucket[]
}

enum Plan {
  STARTER   // 1 squad
  GROWTH    // 3 squads
  SCALE     // 5 squads
  ENTERPRISE // ilimitado
}

model Squad {
  id          String   @id @default(cuid())
  slug        String   @unique
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  localizations SquadLocalization[]
  userSquads    UserSquad[]
}

model SquadLocalization {
  id          String  @id @default(cuid())
  squadId     String
  locale      String  // pt-BR | en-US
  name        String
  description String  @db.Text
  price       Int     // centavos

  squad Squad @relation(fields: [squadId], references: [id])

  @@unique([squadId, locale])
}

model UserSquad {
  id              String   @id @default(cuid())
  userId          String
  squadId         String
  stripePaymentId String?
  purchasedAt     DateTime @default(now())
  isActive        Boolean  @default(true)

  user User @relation(fields: [userId], references: [id])
  squad Squad @relation(fields: [squadId], references: [id])

  @@unique([userId, squadId])
}

model AIUsageLog {
  id         String   @id @default(cuid())
  userId     String
  squadExecId String?
  tokensUsed Int
  model      String
  costCents  Int
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

model RateLimitBucket {
  id         String   @id @default(cuid())
  userId     String
  window     String   // "minute" | "hour" | "month"
  tokensUsed Int      @default(0)
  limit      Int
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, window])
}
```

---

## 6. AI Gateway — Controles

### 6.1 Rate Limit

- Bucket por usuário: `minute=100`, `hour=2000`, `month=50000` tokens
- Implementado no Redis com sliding window

### 6.2 Quotas

- Cada plano tem limite de tokens/mês
- Alerta ao atingir 80%
- Bloqueio ao atingir 100% (execuções pausam)

### 6.3 Token Counting

- Estimativa **antes** da chamada (prompt tokens)
- Ajuste **após** resposta (completion tokens)
- Log em `AIUsageLog` para auditoria

### 6.4 Fallback Chain

```
Anthropic (Claude)
    → timeout/5xx → OpenAI (GPT-4o)
        → timeout/5xx → Google (Gemini)
            → erro final + notificar user
```

---

## 7. Landing Page

### 7.1 Seções

| Seção | Conteúdo |
|-------|----------|
| **Hero** | Headline multilingue (PT/EN), CTA "Começar", screenshot do dashboard |
| **Features** | 3-4 benefícios principais com ícones |
| **Como Funciona** | 3 steps visuais (cadastro → escolhe squad → executa) |
| **Squads** | Showcase dos squads disponíveis com preço |
| **Pricing** | Tabela de planos + "a partir de R$XX/mês" |
| **FAQ** | Perguntas frequentes em PT/EN |
| **Footer** | Links, contato, termos, privacidade |

### 7.2 i18n na Landing

- Detector de locale do browser (`navigator.language`)
- Toggle manual PT/EN no header
- SEO: Metadata e Open Graph por locale
- Arquivos de tradução: `locales/pt-BR.json`, `locales/en-US.json`

---

## 8. Dashboard do Usuário

### 8.1 Páginas

| Página | Função |
|--------|--------|
| **Marketplace** | Navegar squads disponíveis (filtro por categoria) |
| **Meus Squads** | Squads ativados + status da assinatura |
| **Executar Squad** | Interface de execução com checkpoint approval |
| **Configurações** | Perfil, senha, locale, billing (link Stripe portal) |

### 8.2 Execução de Squad

- Usuário seleciona squad ativado
- Fornece inputs (variáveis do pipeline)
- Execução roda em background (BullMQ)
- Checkpoints aparecem como modais para aprovação
- Notificação por email quando concluído

---

## 9. Segurança e Compliance

| Aspecto | Implementação |
|---------|---------------|
| **Senhas** | bcrypt com salt rounds 12 |
| **Sessões** | JWT com refresh token (HttpOnly cookie) |
| **Multi-tenancy** | Row-level isolation (todo query filtra por `userId`) |
| **PCI** | Stripe handles card data — platform does not store card info |
| **LGPD (BR)** | Política de privacidade, consentimento, direito de delete |
| **GDPR (EU)** | Similar + direito à portabilidade |
| **Rate limiting** | Aplicação + Redis para prevenir abuso |

---

## 10. Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| MRR (Monthly Recurring Revenue) | Crescimento mensal de 10% |
| Churn Rate | < 5% mensal |
| Squads Vendidos | Crescimento 10% mês |
| Tempo até primeira execução | < 5 minutos pós-signup |
| Conversão Landing → Signup | > 5% |
| Conversão Signup → Ativação | > 30% |

---

## 11. Roadmap de Desenvolvimento

### Fase 1 — Core (MVP)

- [ ] Landing page PT/EN
- [ ] Auth (signup/login)
- [ ] Stripe subscription flow
- [ ] Database schema + Prisma
- [ ] AI Gateway com controles
- [ ] Marketplace básico
- [ ] Execução de squad
- [ ] Dashboard simples

### Fase 2 — Experiência

- [ ] Checkpoint approval UI
- [ ] Notificações por email
- [ ] Stripe customer portal (cancelar, mudar plano)
- [ ] Analytics básico

### Fase 3 — Expansão

- [ ] Mais squads no marketplace
- [ ] Wiki/docs de integração
- [ ] API pública (futuro)

---

## 12. Estrutura de Diretórios

```
opensquad-saas/
├── frontend/              # Next.js app
│   ├── app/
│   │   ├── [locale]/    # i18n routing (pt-BR, en)
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── dashboard/         # User dashboard
│   │   │   ├── marketplace/       # Squad marketplace
│   │   │   ├── meus-squads/       # My squads
│   │   │   └── settings/          # Account settings
│   │   ├── api/                  # API routes (webhooks, etc.)
│   │   └── layout.tsx
│   ├── locales/
│   │   ├── pt-BR.json
│   │   └── en-US.json
│   └── package.json
│
├── backend/              # Fastify API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── squads/
│   │   │   ├── billing/
│   │   │   ├── ai-gateway/
│   │   │   └── executor/
│   │   ├── plugins/
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docker-compose.yml    # Hetzner deployment
├── nginx/
│   └── nginx.conf       # Reverse proxy + SSL
└── .env.example
```

---

## 13. Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/opensquad

# Redis
REDIS_URL=redis://localhost:6379

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_GROWTH=price_...
STRIPE_PRICE_ID_SCALE=price_...

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Email
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=https://opensquad.com
BACKEND_URL=http://localhost:3001
```
