interface CardContent {
  title?: string;
  description?: string;
  image?: string;
  actions?: Array<{ label: string; type: string; data?: any }>;
}

interface Props {
  content: CardContent;
  onAction?: (action: string, data: any) => void;
}

export default function CardRenderer({ content, onAction }: Props) {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 overflow-hidden">
      {content.image && (
        <img src={content.image} alt={content.title || ''} className="w-full h-32 object-cover" />
      )}
      <div className="p-4">
        {content.title && (
          <h4 className="text-white font-medium text-lg mb-2">{content.title}</h4>
        )}
        {content.description && (
          <p className="text-neutral-400 text-sm mb-4">{content.description}</p>
        )}
        {content.actions && content.actions.length > 0 && (
          <div className="flex gap-2">
            {content.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onAction?.(action.type, action.data)}
                className="px-3 py-1 text-[10px] font-mono uppercase border border-[#F97316]/50 text-[#F97316] hover:bg-[#F97316]/10"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}