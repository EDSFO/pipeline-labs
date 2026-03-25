import { RichContent } from '../types';
import TextRenderer from './renderers/TextRenderer';
import ImageRenderer from './renderers/ImageRenderer';
import CardRenderer from './renderers/CardRenderer';
import CarouselRenderer from './renderers/CarouselRenderer';
import LinkRenderer from './renderers/LinkRenderer';
import CodeRenderer from './renderers/CodeRenderer';
import CompositeRenderer from './renderers/CompositeRenderer';

interface Props {
  content: RichContent;
  onAction?: (action: string, data: any) => void;
}

export default function RichContentRenderer({ content, onAction }: Props) {
  switch (content.type) {
    case 'text':
      return <TextRenderer content={content.content} />;
    case 'image':
      return <ImageRenderer content={content.content} />;
    case 'card':
      return <CardRenderer content={content.content} onAction={onAction} />;
    case 'carousel':
      return <CarouselRenderer content={content.content} onAction={onAction} />;
    case 'link':
      return <LinkRenderer content={content.content} />;
    case 'code':
      return <CodeRenderer content={content.content} />;
    case 'composite':
      return <CompositeRenderer content={content.content} onAction={onAction} />;
    default:
      return <TextRenderer content={String(content.content)} />;
  }
}