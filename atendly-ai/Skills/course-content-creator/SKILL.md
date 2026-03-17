---
name: course-content-creator
description: Create comprehensive course materials including detailed schedules, technology summaries, lesson ideas, and educational infographics. Use when the user requests: (1) Creating course schedules/cronogramas with modules and lessons, (2) Technology summaries for Claude Code, Vibe coding, n8n, programming, or other tech topics, (3) Lesson themes and ideas, (4) Educational infographics about technical concepts, (5) Extracting and processing content from URLs (documentation, articles, videos) to create course materials. Outputs are delivered in markdown format with rich detail including objectives, topics, code examples, and practical activities.
---

# Course Content Creator

Create comprehensive educational materials for technology courses covering Claude Code, Vibe coding, n8n, programming, and related technologies.

## Setup

Before using the scripts, install required Python dependencies:

```bash
pip install -r requirements.txt
```

For infographic generation, set the OpenRouter API key:

```bash
# Windows
set OPENROUTER_API_KEY=your_api_key_here

# Linux/Mac
export OPENROUTER_API_KEY=your_api_key_here
```

## Core Workflows

### 1. Creating Course Schedules (Cronogramas)

Generate detailed, multi-module course schedules with complete learning objectives, activities, and assessments.

**Process:**
1. Identify the main topic and scope
2. Read `assets/cronograma_template.md` as the base structure
3. Read `references/course_topics.md` for technology-specific context
4. Read `references/content_structure.md` for structural guidance
5. Create detailed schedule with:
   - Clear learning objectives
   - Module breakdown with durations
   - Individual lesson plans with topics and activities
   - Practical exercises and projects
   - Assessment criteria
   - Required tools and resources

**Output:** Full markdown document with very detailed content including code examples and hands-on activities.

### 2. Creating Technology Summaries

Generate comprehensive summaries of technologies with concepts, examples, and best practices.

**Process:**
1. Identify the technology (Claude Code, n8n, Vibe coding, etc.)
2. Read `assets/resumo_template.md` as the base structure
3. Read `references/course_topics.md` for existing technology information
4. If user provides URL, use `scripts/fetch_url_content.py` to extract content first
5. Create detailed summary with:
   - Introduction and use cases
   - Fundamental concepts and terminology
   - Main features with practical examples
   - Installation and setup instructions
   - Code examples (basic, intermediate, advanced)
   - Best practices and common pitfalls
   - Additional resources

**Output:** Complete markdown document with rich technical detail and multiple code examples.

### 3. Generating Lesson Ideas

Create structured lesson themes with objectives, activities, and resources.

**Process:**
1. Understand the topic area and target audience
2. Read `references/content_structure.md` section "Estrutura de Tema/Ideia de Aula"
3. Generate lesson idea with:
   - Compelling title
   - Learning objectives
   - Proposed structure with time allocations
   - Required resources
   - Practical exercises

**Output:** Markdown document with complete lesson plan structure.

### 4. Creating Educational Infographics

Generate visual educational content using the OpenRouter API.

**Process:**
1. Understand the concept to visualize
2. Read `references/content_structure.md` section "Estrutura de Infográfico" for prompt guidance
3. Craft detailed prompt following the pattern:
   - Educational style
   - Key concepts (3-5 main points)
   - Professional color scheme
   - Clear visual hierarchy
   - Icons and illustrations
4. Use `scripts/generate_infographic.py` to generate the image
5. Save to `assets/infographics/` or project location

**Script usage:**
```bash
python scripts/generate_infographic.py "Create an educational infographic about [TOPIC] with modern design, including [KEY POINTS], using professional colors, vertical layout with clear hierarchy" --output path/to/infographic.png
```

**Requirements:**
- OPENROUTER_API_KEY environment variable must be set
- Script handles base64 conversion automatically

### 5. Processing URLs for Content

Extract content from documentation, articles, or tutorials to incorporate into course materials.

**Process:**
1. Use `scripts/fetch_url_content.py` to extract content
2. Parse and structure the extracted information
3. Integrate relevant parts into the course material being created

**Script usage:**
```bash
python scripts/fetch_url_content.py "https://example.com/article" --output extracted_content.md
```

**Supported content types:**
- Official documentation
- Technical articles and tutorials
- Blog posts
- Any HTML-based content

## Best Practices

1. **Detail Level:** Always create very detailed content with complete examples, not just outlines
2. **Code Examples:** Include practical, working code examples in appropriate languages
3. **Hands-on Focus:** Emphasize practical activities and real-world applications
4. **Progressive Learning:** Structure content from basic to advanced
5. **Resource Links:** Include relevant documentation and community resources
6. **Visual Support:** Suggest or create infographics for complex concepts
7. **Assessment:** Always include evaluation criteria and practical projects

## Technology Context

For detailed information about specific technologies, always read:
- `references/course_topics.md` - Core technologies covered in courses
- User-provided URLs when available

## Templates and References

**Templates (in `assets/`):**
- `cronograma_template.md` - Full course schedule structure
- `resumo_template.md` - Technology summary structure

**References (in `references/`):**
- `course_topics.md` - Technology information and concepts
- `content_structure.md` - Structural patterns for all content types

**Scripts (in `scripts/`):**
- `fetch_url_content.py` - Extract content from URLs
- `generate_infographic.py` - Create educational infographics via API

## Example Requests

"Crie um cronograma completo sobre Claude Code para iniciantes"
→ Read templates and references, create detailed multi-module schedule

"Faça um resumo detalhado sobre n8n com exemplos práticos"
→ Read templates and topics, create comprehensive technology summary

"Gere um infográfico sobre os conceitos principais de Vibe coding"
→ Create detailed prompt and use generate_infographic.py script

"Extraia o conteúdo desta URL e crie material de aula sobre o tema"
→ Use fetch_url_content.py first, then create appropriate course material

## Output Format

All course materials are delivered in markdown format with:
- Clear heading hierarchy
- Code blocks with syntax highlighting
- Emoji icons for visual organization
- Structured lists and tables
- Rich detail with examples and explanations
