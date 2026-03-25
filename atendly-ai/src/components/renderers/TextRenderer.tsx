interface Props {
  content: { content: string } | string;
}

export default function TextRenderer({ content }: Props) {
  const text = typeof content === 'string' ? content : content.content;

  return (
    <div className="prose prose-invert max-w-none">
      <p className="text-white whitespace-pre-wrap">{text}</p>
    </div>
  );
}