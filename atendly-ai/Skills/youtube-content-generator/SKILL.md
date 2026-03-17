# YouTube Content Generator - Script7

Skill para geração completa de conteúdo otimizado para YouTube, incluindo SEO avançado e geração automática de thumbnails via API.

## Triggers

Esta skill deve ser ativada quando o usuário mencionar:
- "Criar conteúdo para YouTube"
- "Gerar título/descrição/tags para vídeo"
- "Otimizar vídeo para YouTube"
- "SEO para YouTube"
- "Criar thumbnail"
- "Preparar lançamento de vídeo"
- "Conteúdo completo para vídeo"
- "YouTube SEO"
- "/youtube"

## Contexto do Canal

**Canal:** Script7
**Nicho:** Tecnologia, Programação, Low Code, No Code, Inteligência Artificial
**Público:** Iniciantes a profissionais
**Plataforma principal de acesso:** 70% mobile

---

## WORKFLOW OBRIGATÓRIO

### FASE 1: Coleta de Informações

Antes de gerar qualquer conteúdo, pergunte ao usuário:

1. **Tema do vídeo:** Qual é o assunto principal?
2. **Tipo de conteúdo:** Tutorial, Review, Notícia, Comparativo, Dicas?
3. **Ferramenta/Tecnologia principal:** (se aplicável)
4. **Público-alvo específico:** Iniciantes, intermediários, avançados?
5. **Duração estimada:** Curto (<10min), Médio (10-20min), Longo (>20min)?
6. **Diferencial:** O que torna este vídeo único?

---

### FASE 2: Pesquisa de Mercado (OBRIGATÓRIA)

**Antes de gerar títulos, SEMPRE execute:**

1. **Pesquisa de títulos concorrentes:**
   ```
   Use WebSearch para buscar:
   - "[tema] tutorial YouTube"
   - "[ferramenta] como usar YouTube"
   - "[tema] 2024 YouTube BR"
   ```

2. **Análise de tendências:**
   - Buscar Google Trends para o tema
   - Verificar vídeos em alta no nicho tech BR
   - Analisar padrões de títulos que performam bem

3. **Documentar descobertas:**
   - Títulos mais populares encontrados
   - Palavras-chave recorrentes
   - Padrões de formatação

---

### FASE 3: Geração de Títulos (Máximo 10)

**Requisitos técnicos:**
- Entre 50-70 caracteres (ideal para mobile)
- Incluir 1-2 emojis relevantes (início ou fim)
- Incluir 1 hashtag principal quando apropriado
- Usar palavras-chave de alto volume de busca

**Carregar fórmulas de:** `references/title-formulas.md`

**Mix obrigatório de estilos:**
1. 2-3 títulos de **curiosidade** (gatilho mental)
2. 2-3 títulos de **benefício direto** (o que o viewer ganha)
3. 2-3 títulos de **urgência/novidade** (NOVO, 2024, Atualizado)
4. 2-3 títulos de **tutorial/how-to** (Como fazer X)

**Formato de saída:**
```
## 🎯 TÍTULOS OTIMIZADOS (Top 10)

1. 🔥 [Título] #hashtag
2. 🚀 [Título]
3. 💡 [Título]
... (até 10)

**Recomendação:** Título #X
**Justificativa:** [Análise SEO do título recomendado]
```

---

### FASE 4: Palavras-Chave e Tags

**Pesquisa obrigatória via WebSearch:**
- Volume de busca estimado
- Competitividade
- Keywords relacionadas

**Estrutura de tags (máximo 500 caracteres):**

| Categoria | Quantidade | Descrição |
|-----------|------------|-----------|
| Primárias | 3-4 | Alto volume, tema principal |
| Secundárias | 5-6 | Médio volume, menos competição |
| Cauda longa | 4-5 | Específicas, baixa competição |
| Bilíngue | 2-3 | PT-BR e inglês quando relevante |

**Carregar referência de:** `references/keywords-database.md`

**Formato de saída:**
```
## 🏷️ TAGS (XXX/500 caracteres)

tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10...

**Análise:**
- Keywords primárias: [lista]
- Volume estimado: [alto/médio/baixo]
- Competitividade: [alta/média/baixa]
```

---

### FASE 5: Hashtags Estratégicas (8-12)

**Composição obrigatória:**

| Tipo | Quantidade | Exemplos |
|------|------------|----------|
| Marca | 2-3 | #Script7 #MadeInLowCode |
| Tema | 3-4 | Específicas do assunto |
| Trending | 2-3 | Em alta no nicho tech |
| CTA | 1-2 | #Tutorial #AprendaComigo |

**Formato de saída:**
```
## #️⃣ HASHTAGS

#Script7 #MadeInLowCode #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10
```

---

### FASE 6: Descrição Completa

**Carregar template de links:** `assets/links-template.md`

**Estrutura da descrição:**

```markdown
[EMOJI] [GANCHO - 1-2 frases chamativas que criam curiosidade]

📌 Neste vídeo você vai aprender:
• [Benefício 1]
• [Benefício 2]
• [Benefício 3]

⏱️ TIMESTAMPS:
00:00 - Introdução
[Gerar baseado no conteúdo se disponível]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[INSERIR CONTEÚDO DE assets/links-template.md]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Palavras-chave: [3-5 keywords principais]

[HASHTAGS]
```

---

### FASE 7: Geração de Thumbnail (INTERATIVA - OBRIGATÓRIO)

**⚠️ IMPORTANTE: NUNCA gerar thumbnail sem antes interagir com o usuário!**

**Carregar estilos de:** `references/thumbnail-styles.md`

**Estilo padrão Script7:**
- Texto em 2-3 caixas inclinadas alternadamente
- Máximo 6 palavras no total
- Cores vibrantes e alto contraste
- Fundo desfocado ou gradiente tech
- Elemento visual relevante (ícone, logo, screenshot)
- **Aspect Ratio:** 16:9 (formato horizontal YouTube)
- **Resolução:** ~1344x768 pixels (1K) - compatível com YouTube (recomendado: 1280x720)

**Processo de geração:**

1. **PERGUNTAR AO USUÁRIO** antes de gerar:

```
🖼️ Vamos criar a thumbnail juntos!

Preciso que você me informe:

1. **Texto da thumbnail** (máximo 6 palavras)
   Ex: "DOMINA IA EM 10 MIN"

2. **Estilo visual**:
   - tutorial (aprendizado)
   - review (avaliação)
   - news (novidade/lançamento)
   - list (top X, melhores)
   - tips (dicas, hacks)
   - viral (impactante)

3. **Elemento visual principal** (opcional):
   - Logotipo da ferramenta
   - Screenshot/mockup
   - Ícones representativos
   - Outro elemento

4. **Paleta de cores**:
   - blue purple gradient (padrão)
   - orange red gradient (urgente)
   - green cyan gradient (fresco)
   - dark neon (fundo escuro)
   - white black contrast (alto contraste)

Após receber as informações, mostrar o **PREVIEW** e pedir confirmação antes de gerar.
```

2. **Após confirmação do usuário**, chamar o script:

```bash
python scripts/generate-thumbnail.py \
  "[TEXTO]" \
  "[ESTILO]" \
  "[ELEMENTO_VISUAL]" \
  "[CORES]" \
  "[NOME_ARQUIVO]"
```

Ou usar a função interativa:
```bash
python scripts/generate-thumbnail.py --interactive
```

3. **Processar resposta** e salvar em `./thumbnails/[nome-do-video].png`

**Formato de saída:**
```
## 🖼️ THUMBNAIL

**Texto:** [texto escolhido pelo usuário]
**Estilo:** [estilo escolhido]
**Elemento visual:** [elemento escolhido]
**Cores:** [paleta escolhida]

**Prompt gerado:**
[prompt completo enviado para a API]

**Arquivo salvo:** ./thumbnails/[nome].png
```

---

### FASE 8: Análise SEO Final

**Formato de saída:**
```
## 📊 ANÁLISE SEO

| Métrica | Avaliação | Observação |
|---------|-----------|------------|
| Keywords primárias | ⭐⭐⭐⭐⭐ | [comentário] |
| Competitividade | ⭐⭐⭐ | [comentário] |
| Potencial de ranking | ⭐⭐⭐⭐ | [comentário] |
| CTR estimado | ⭐⭐⭐⭐ | [comentário] |

**Recomendações adicionais:**
- [Sugestão 1]
- [Sugestão 2]
```

---

## OUTPUT COMPLETO ESPERADO

Ao final da execução, entregar:

```
═══════════════════════════════════════════════════════════
🎬 CONTEÚDO YOUTUBE - [TEMA DO VÍDEO]
═══════════════════════════════════════════════════════════

## 🎯 TÍTULOS OTIMIZADOS (Top 10)
[10 títulos com emojis e hashtags]
**Recomendação:** [título escolhido + justificativa]

---

## 📝 DESCRIÇÃO COMPLETA
[Descrição formatada com links do template]

---

## 🏷️ TAGS (XXX/500 caracteres)
[Tags otimizadas]

---

## #️⃣ HASHTAGS
[8-12 hashtags estratégicas]

---

## 🖼️ THUMBNAIL
[Informações da thumbnail gerada]

---

## 📊 ANÁLISE SEO
[Análise completa]

═══════════════════════════════════════════════════════════
```

---

## FALLBACKS

**Se API de thumbnail falhar:**
- Gerar apenas sugestão textual detalhada
- Fornecer prompt para uso manual
- Sugerir ferramentas alternativas (Canva, Photoshop)
- Mostrar o erro retornado pela API para debugging

**Se a imagem gerada não abrir:**
- Verificar se o base64 foi extraído corretamente
- A API Gemini pode retornar em formatos diferentes:
  - `inline_data` com `image_uri`
  - Data URI direto: `data:image/png;base64,...`
  - JSON no content
- O script já trata esses formatos, mas pode precisar de ajustes

**Se pesquisa web não disponível:**
- Usar base de conhecimento interna
- Aplicar fórmulas comprovadas de `references/title-formulas.md`
- Informar ao usuário que pesquisa em tempo real não foi possível

---

## ARQUIVOS DE REFERÊNCIA

| Arquivo | Função |
|---------|--------|
| `assets/links-template.md` | Links fixos do canal (editável) |
| `references/title-formulas.md` | Fórmulas de títulos comprovadas |
| `references/keywords-database.md` | Keywords por categoria tech |
| `references/thumbnail-styles.md` | Estilos e prompts para thumbnails |
| `scripts/generate-thumbnail.py` | Script para gerar e salvar thumbnail |

---

## NOTAS IMPORTANTES

1. **SEMPRE pesquisar antes de gerar** - Não inventar baseado apenas em conhecimento interno
2. **Priorizar SEO orgânico** em todas as decisões
3. **Manter identidade visual Script7** nas thumbnails
4. **70% do público é mobile** - Títulos devem ser legíveis em telas pequenas
5. **Links são editáveis** em `assets/links-template.md`
