import { getAllTemplates } from '@/templates/index';
import EditorClient from './EditorClient';

export function generateStaticParams() {
  return getAllTemplates().map((t) => ({
    category: t.category,
    templateId: t.id,
  }));
}

export default function EditorPage() {
  return <EditorClient />;
}
