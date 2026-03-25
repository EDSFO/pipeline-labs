import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  title?: string;
  image?: string;
  caption?: string;
  description?: string;
}

interface Props {
  content: { items: CarouselItem[] } | CarouselItem[];
  onAction?: (action: string, data: any) => void;
}

export default function CarouselRenderer({ content, onAction }: Props) {
  const items = Array.isArray(content) ? content : content.items;
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => setCurrentIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  if (!items || items.length === 0) {
    return <p className="text-neutral-500">Nenhum conteúdo disponível</p>;
  }

  const current = items[currentIndex];

  return (
    <div className="relative">
      <div className="bg-[#0A0A0A] border border-white/10 p-4">
        {current.image && (
          <img src={current.image} alt={current.title || ''} className="w-full h-48 object-cover mb-3" />
        )}
        {current.title && (
          <h4 className="text-white font-medium text-lg mb-2">{current.title}</h4>
        )}
        {current.caption && (
          <p className="text-neutral-300 text-sm mb-2">{current.caption}</p>
        )}
        {current.description && (
          <p className="text-neutral-400 text-xs">{current.description}</p>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button onClick={prev} className="p-2 border border-white/10 hover:border-white/30">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-neutral-500 text-xs font-mono">
            {currentIndex + 1} / {items.length}
          </span>
          <button onClick={next} className="p-2 border border-white/10 hover:border-white/30">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}