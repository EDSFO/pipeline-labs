# i18n: Sistema de Internacionalização pt-BR / en

## Visão Geral

Adicionar suporte a múltiplos idiomas (português e inglês) em toda a aplicação Atendly AI, permitindo que o usuário escolha o idioma via seletor no header.

## Objetivos

- Traduzir toda a interface do usuário (UI)
- Traduzir mensagens e respostas do chatbot
- Traduzir o fluxo de agendamento (BookingFlow)
- Permitir troca de idioma pelo usuário sem reload

## Arquitetura

### Estrutura de Arquivos

```
src/
├── i18n/
│   ├── pt-BR.json    # Traduções português (default)
│   ├── en.json        # Traduções inglês
│   └── index.tsx      # I18nContext + useTranslation hook
```

### Fluxo de Dados

1. LanguageSelector no header permite troca a qualquer momento
2. Idioma selecionado persistido em `localStorage` (chave: `atendly-language`)
3. I18nContext prove tradução para toda a aplicação
4. Hook `useTranslation()` disponibilizada para componentes

## Componentes Afetados

### Frontend (src/)

| Componente | Traduzir |
|------------|----------|
| `App.tsx` | LoginPage, CreateCompany, TenantApp header |
| `AdminDashboard.tsx` | Todas abas (Agentes, WhatsApp, Configurações) |
| `BookingFlow.tsx` | Todo o fluxo de agendamento |
| `ChatWidget.tsx` | Labels e placeholders |

### Backend (server/)

| Arquivo | Mudança |
|---------|---------|
| `server/ai.ts` | Receber `language` param e responder no idioma |

## Design da Solução

### 1. I18n Context (src/i18n/index.tsx)

```typescript
interface I18nContextType {
  language: 'pt-BR' | 'en';
  setLanguage: (lang: 'pt-BR' | 'en') => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState<'pt-BR'|'en'>(() => {
    return localStorage.getItem('atendly-language') as 'pt-BR' | 'en' || 'pt-BR';
  });

  useEffect(() => {
    localStorage.setItem('atendly-language', language);
  }, [language]);

  const t = useCallback((key: string) => {
    const translations = language === 'pt-BR' ? ptBR : en;
    return translations[key] || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
}
```

### 2. Language Selector

Componente minimalista no header:

```tsx
function LanguageSelector() {
  const { language, setLanguage } = useTranslation();
  return (
    <select
      value={language}
      onChange={e => setLanguage(e.target.value as 'pt-BR' | 'en')}
      className="bg-transparent text-white text-xs font-mono uppercase"
    >
      <option value="pt-BR">PT</option>
      <option value="en">EN</option>
    </select>
  );
}
```

### 3. API - Chatbot Language

Enviar language no body da requisição:

```typescript
// ChatWidget
const sendMessage = async (text: string) => {
  await fetch('/api/agent/chat', {
    method: 'POST',
    body: JSON.stringify({ message: text, language }) // <--
  });
};
```

## Formato dos JSONs

### pt-BR.json (exemplo)

```json
{
  "app_name": "Atendly AI",
  "login_select_company": "Selecione sua empresa",
  "login_enter": "Entrar",
  "booking_title": "Agendamento Online",
  "booking_choose_service": "Escolha um serviço",
  "booking_choose_professional": "Escolha um profissional",
  "booking_choose_datetime": "Escolha data e horário",
  "booking_your_data": "Seus dados",
  "booking_confirm": "Confirmar Agendamento",
  "booking_success": "Agendado!",
  "booking_success_message": "Seu horário foi confirmado com sucesso."
}
```

### en.json (exemplo)

```json
{
  "app_name": "Atendly AI",
  "login_select_company": "Select your company",
  "login_enter": "Enter",
  "booking_title": "Online Booking",
  "booking_choose_service": "Choose a service",
  "booking_choose_professional": "Choose a professional",
  "booking_choose_datetime": "Choose date and time",
  "booking_your_data": "Your details",
  "booking_confirm": "Confirm Booking",
  "booking_success": "Booked!",
  "booking_success_message": "Your appointment has been confirmed."
}
```

## Escopo de Tradução

### UI Principal (App.tsx)
- LoginPage: todos os textos estáticos
- CreateCompany: labels e placeholders
- TenantApp header: botões e menus

### AdminDashboard
- Aba Agentes: títulos, botões, modais
- Aba WhatsApp: labels e mensagens
- Aba Configurações: labels e placeholders

### BookingFlow
- Todos os 5 steps do fluxo de agendamento
- Mensagens de erro
- Textos de confirmação

### ChatWidget
- Placeholder de input
- Labels de status

## Decisões de Implementação

1. **Sem biblioteca externa** - React Context nativo é suficiente para 2 idiomas
2. **localStorage para persistência** - Idioma mantido entre sessões
3. **Fallback para pt-BR** - Se chave não encontrada, retorna a própria key
4. **Language no chat API** - Backend recebe e pode usar para contextualizar respostas

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Textos hardcoded esquecidos | Review checklist ao finalizar |
| Nomes de chaves inconsistentes | Usar convenção: `area_action` (ex: `booking_confirm`) |
| Backend não processar language | Feature flag, fallback funciona mesmo sem |

## Checklist de Implementação

- [ ] Criar src/i18n/pt-BR.json
- [ ] Criar src/i18n/en.json
- [ ] Criar src/i18n/index.tsx com context e hook
- [ ] Criar componente LanguageSelector
- [ ] Integrar I18nProvider no App.tsx
- [ ] Adicionar LanguageSelector no TenantApp header
- [ ] Substituir textos em LoginPage
- [ ] Substituir textos em CreateCompany
- [ ] Substituir textos em AdminDashboard
- [ ] Substituir textos em BookingFlow
- [ ] Substituir textos em ChatWidget
- [ ] Enviar language no chat API request
- [ ] Server AI: receber e usar language param
