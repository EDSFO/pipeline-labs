interface Props {
  content: { url: string; title?: string; description?: string };
}

export default function LinkRenderer({ content }: Props) {
  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#0A0A0A] border border-white/10 p-4 hover:border-[#F97316]/50 transition-colors"
    >
      {content.title && <h4 className="text-white font-medium">{content.title}</h4>}
      {content.description && <p className="text-neutral-400 text-sm">{content.description}</p>}
      <span className="text-[#F97316] text-xs font-mono">{content.url}</span>
    </a>
  );
}