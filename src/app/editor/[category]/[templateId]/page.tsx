import { getAllTemplates } from '@/templates/index';
import EditorClient from './EditorClient';

export function generateStaticParams() {
  const paths = getAllTemplates().map((t) => ({
    category: t.category,
    templateId: t.id,
  }));

  // Add blank templates
  paths.push({ category: 'resume', templateId: 'blank' });
  paths.push({ category: 'cv', templateId: 'blank' });
  paths.push({ category: 'cover-letter', templateId: 'blank' });
  paths.push({ category: 'resume', templateId: 'resume-neo-modern-gradient-grid' });

  return paths;
}

export default function EditorPage() {
  return <EditorClient />;
}
