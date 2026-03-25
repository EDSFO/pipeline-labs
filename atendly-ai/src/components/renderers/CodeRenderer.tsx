interface Props {
  content: { language?: string; code: string } | string;
}

export default function CodeRenderer({ content }: Props) {
  const language = typeof content === 'string' ? 'text' : content.language || 'text';
  const code = typeof content === 'string' ? content : content.code;

  return (
    <pre className="bg-[#0A0A0A] border border-white/10 p-4 overflow-x-auto">
      <code className="text-green-400 text-xs font-mono">{code}</code>
    </pre>
  );
}