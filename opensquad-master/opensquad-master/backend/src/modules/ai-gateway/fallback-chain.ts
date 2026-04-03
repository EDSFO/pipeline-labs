export interface AIResponse {
  content: string
  model: string
  provider: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AICallOptions {
  prompt: string
  model: string
  maxTokens?: number
  temperature?: number
}

// Provider implementations would use actual SDKs
// For now, we define the interface and a mock implementation

async function callAnthropic(options: AICallOptions): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: options.model,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
      messages: [
        {
          role: 'user',
          content: options.prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${error}`)
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>
    usage: { input_tokens: number; output_tokens: number }
  }

  return {
    content: data.content[0]?.text ?? '',
    model: options.model,
    provider: 'anthropic',
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
  }
}

async function callOpenAI(options: AICallOptions): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
      messages: [
        {
          role: 'user',
          content: options.prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${error}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  }

  return {
    content: data.choices[0]?.message?.content ?? '',
    model: options.model,
    provider: 'openai',
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  }
}

async function callGoogle(options: AICallOptions): Promise<AIResponse> {
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: options.prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: options.maxTokens ?? 1024,
          temperature: options.temperature ?? 0.7,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google API error: ${response.status} - ${error}`)
  }

  const data = await response.json() as {
    candidates: Array<{
      content: {
        parts: Array<{ text: string }>
      }
    }>
    usageMetadata?: {
      promptTokenCount?: number
      candidateTokenCount?: number
      totalTokenCount?: number
    }
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const usage = data.usageMetadata

  return {
    content: text,
    model: options.model,
    provider: 'google',
    usage: usage
      ? {
          promptTokens: usage.promptTokenCount ?? 0,
          completionTokens: usage.candidateTokenCount ?? 0,
          totalTokens: usage.totalTokenCount ?? 0,
        }
      : undefined,
  }
}

// Map model names to their providers
function getProviderForModel(model: string): 'anthropic' | 'openai' | 'google' {
  if (model.startsWith('claude')) return 'anthropic'
  if (model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3')) return 'openai'
  return 'google'
}

// Fallback chain order: Anthropic → OpenAI → Google
const FALLBACK_ORDER = ['anthropic', 'openai', 'google'] as const

export async function callWithFallback(prompt: string, model: string): Promise<AIResponse> {
  // Determine which provider to try first based on model
  const primaryProvider = getProviderForModel(model)

  // Create ordered list starting with primary, then fallbacks
  const providers = [
    primaryProvider,
    ...FALLBACK_ORDER.filter((p) => p !== primaryProvider),
  ]

  let lastError: Error | null = null

  for (const provider of providers) {
    try {
      switch (provider) {
        case 'anthropic':
          return await callAnthropic({ prompt, model })
        case 'openai':
          return await callOpenAI({ prompt, model })
        case 'google':
          return await callGoogle({ prompt, model })
      }
    } catch (error) {
      lastError = error as Error
      console.error(`Provider ${provider} failed, trying next fallback:`, error)
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`)
}
