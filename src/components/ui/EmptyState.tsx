import { Inbox, type LucideIcon } from 'lucide-react';

interface Props { icon?: LucideIcon; title?: string; text?: string; }

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', text }: Props) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon"><Icon size={48} /></div>
      <div className="empty-state-title">{title}</div>
      {text && <div className="empty-state-text">{text}</div>}
    </div>
  );
}
