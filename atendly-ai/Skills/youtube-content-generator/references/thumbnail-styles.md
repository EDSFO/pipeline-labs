# Estilos de Thumbnail - Script7

## Estilo Padrão Script7

### Características Visuais
- **Dimensões:** 1280x720px (16:9)
- **Texto:** 2-3 caixas inclinadas alternadamente
- **Palavras:** Máximo 6 palavras no total
- **Cores:** Vibrantes e alto contraste
- **Fundo:** Desfocado ou gradiente tech
- **Elementos:** Ícones, logos, screenshots relevantes

### Paleta de Cores Padrão

| Uso | Cor | Hex |
|-----|-----|-----|
| Primária | Azul Tech | #0066FF |
| Secundária | Roxo | #7C3AED |
| Accent | Laranja | #FF6B00 |
| Accent 2 | Verde Neon | #00FF88 |
| Texto | Branco | #FFFFFF |
| Destaque | Amarelo | #FFD700 |
| Fundo Dark | Azul Escuro | #0A1628 |

---

## Prompts Base para API Nanobanana

### Template Geral
```
Create a YouTube thumbnail (1280x720px) with:
- Bold, eye-catching text in 2-3 angled text boxes
- Maximum 6 words total: "[TEXTO]"
- Vibrant tech color scheme (blue, purple gradients)
- [ELEMENTO VISUAL] as the main visual element
- Modern, clean design with high contrast
- Professional look suitable for tech/programming channel
- Text should be easily readable on mobile
```

### Prompt - Tutorial
```
Create a YouTube thumbnail for a tutorial video:
- Text: "[TEXTO - máx 6 palavras]"
- Style: Modern tech, educational
- Colors: Blue gradient background (#0066FF to #7C3AED)
- Include: [ÍCONE/LOGO da ferramenta]
- Text boxes: Angled, white text with colored backgrounds
- Add subtle code elements in background
- 1280x720px, high contrast, mobile-readable
```

### Prompt - Review/Comparativo
```
Create a YouTube thumbnail for a comparison/review video:
- Text: "[FERRAMENTA A] vs [FERRAMENTA B]"
- Style: Split design showing both options
- Include logos of both tools
- VS symbol in the center with glow effect
- Dramatic lighting, tech aesthetic
- Colors: Contrasting colors for each side
- 1280x720px, bold readable text
```

### Prompt - Novidade/Notícia
```
Create a YouTube thumbnail for a news/announcement video:
- Text: "[NOVO/URGENTE] [TEMA]"
- Style: Breaking news, urgent feel
- Colors: Red accent (#FF0000), dark background
- Include: Alert icons, attention-grabbing elements
- Text: Bold, white with red accents
- Excited/surprised reaction space (optional)
- 1280x720px, high impact design
```

### Prompt - Lista/Top
```
Create a YouTube thumbnail for a list/top video:
- Text: "TOP [NÚMERO] [TEMA]"
- Style: Clean, organized
- Include: Number prominently displayed
- Colors: Gold/yellow accents for numbers
- Grid or stack of icons representing items
- Modern gradient background
- 1280x720px, clear hierarchy
```

### Prompt - Dica/Hack
```
Create a YouTube thumbnail for a tips/hacks video:
- Text: "[NÚMERO] [DICAS/TRUQUES]"
- Style: Helpful, insider knowledge feel
- Include: Light bulb or brain icon
- Colors: Bright, optimistic (yellow, orange accents)
- Secret/exclusive feeling
- 1280x720px, engaging design
```

---

## Elementos Visuais por Categoria

### IA / ChatGPT / Claude
- Ícone de robô/cérebro
- Chips/circuitos
- Interface de chat
- Logo da ferramenta
- Gradiente roxo/azul

### Programação / Código
- Trechos de código no fundo
- Terminal/IDE screenshot
- Símbolos: </> { }
- Teclado iluminado
- Matrix-style elementos

### Low Code / No Code
- Blocos conectados
- Interface drag-and-drop
- Logo da plataforma
- Fluxograma visual
- Cores vibrantes

### WhatsApp / Bots
- Ícone do WhatsApp
- Balões de mensagem
- Interface de chat
- Robô/automação
- Verde WhatsApp

### Ferramentas Dev
- Logo da ferramenta
- Screenshot da interface
- Ícones de configuração
- Terminal
- Ambiente de desenvolvimento

---

## Layouts Aprovados

### Layout 1: Texto Diagonal
```
┌─────────────────────────────────┐
│                    ╱──────────╲ │
│                   │ PALAVRA 1 │ │
│                    ╲──────────╱ │
│  [VISUAL]    ╱────────────────╲ │
│             │ PALAVRA 2 E 3   │ │
│              ╲────────────────╱ │
│                                 │
└─────────────────────────────────┘
```

### Layout 2: Split Vertical
```
┌────────────────┬────────────────┐
│                │                │
│   OPÇÃO A      │    OPÇÃO B     │
│   [LOGO]       │    [LOGO]      │
│                │                │
│       VS       │                │
│                │                │
└────────────────┴────────────────┘
```

### Layout 3: Número Grande
```
┌─────────────────────────────────┐
│                                 │
│    ┌───┐                        │
│    │ 5 │   MELHORES             │
│    └───┘   FERRAMENTAS          │
│                                 │
│        [ÍCONES]                 │
└─────────────────────────────────┘
```

### Layout 4: Face + Texto
```
┌─────────────────────────────────┐
│                 ╱─────────────╲ │
│                │ TEXTO LINE 1 │ │
│   [ROSTO/      ╲─────────────╱ │
│    REAÇÃO]    ╱───────────────╲ │
│              │ TEXTO LINE 2   │ │
│               ╲───────────────╱ │
└─────────────────────────────────┘
```

---

## Textos que Funcionam

### Estruturas de 3-4 Palavras
- "ISSO MUDA TUDO"
- "VOCÊ PRECISA VER"
- "NINGUÉM TE CONTA"
- "TESTEI E FUNCIONOU"
- "MELHOR QUE [X]"
- "GRÁTIS E INCRÍVEL"
- "TUTORIAL COMPLETO"
- "PASSO A PASSO"

### Estruturas de 5-6 Palavras
- "COMO [AÇÃO] EM [TEMPO]"
- "[NÚMERO] DICAS QUE FUNCIONAM"
- "O SEGREDO DE [RESULTADO]"
- "PARE DE FAZER [ERRO]"
- "TOP [N] FERRAMENTAS 2024"

---

## Checklist de Qualidade

### Antes de Gerar
- [ ] Texto tem no máximo 6 palavras?
- [ ] Palavras são de impacto?
- [ ] Tema está claro?
- [ ] Elemento visual definido?
- [ ] Estilo escolhido?

### Após Gerar
- [ ] Texto está legível em mobile?
- [ ] Cores têm bom contraste?
- [ ] Elemento visual está visível?
- [ ] Não está poluído demais?
- [ ] Dimensões corretas (1280x720)?
- [ ] Arquivo salvo corretamente?

---

## Exemplos de Prompts Completos

### Exemplo 1: Tutorial Claude Code
```
Create a YouTube thumbnail (1280x720px):
- Text in 2 angled boxes: "CLAUDE CODE" and "TUTORIAL COMPLETO"
- Background: Dark blue to purple gradient
- Include: Claude AI logo, code editor screenshot faded in background
- Style: Modern tech, professional
- Text: Bold white with slight glow
- High contrast for mobile readability
```

### Exemplo 2: Comparativo
```
Create a YouTube thumbnail (1280x720px):
- Split design: Cursor IDE vs Claude Code
- Left side: Blue tones with Cursor logo
- Right side: Purple tones with Claude logo
- Center: Large "VS" with electric effect
- Text at top: "QUAL O MELHOR?"
- Professional, tech aesthetic
```

### Exemplo 3: Lista de Ferramentas
```
Create a YouTube thumbnail (1280x720px):
- Large "5" number with golden glow
- Text: "FERRAMENTAS IA GRÁTIS"
- Background: Dark gradient with subtle tech patterns
- Include: Small icons of AI tools arranged around the number
- Style: Premium, valuable content feeling
- High contrast white text
```
