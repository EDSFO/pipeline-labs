import RichContentRenderer from '../RichContentRenderer';

interface Props {
  content: { elements: any[] };
  onAction?: (action: string, data: any) => void;
}

export default function CompositeRenderer({ content, onAction }: Props) {
  return (
    <div className="space-y-4">
      {content.elements.map((element, idx) => (
        <RichContentRenderer key={idx} content={element} onAction={onAction} />
      ))}
    </div>
  );
}