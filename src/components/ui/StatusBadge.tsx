const STATUS_MAP: Record<string, string> = {
  DRAFT: 'neutral', PUBLISHED: 'success', CANCELLED: 'danger', POSTPONED: 'warning', COMPLETED: 'info',
  PENDING: 'warning', CONFIRMED: 'success', EXPIRED: 'neutral',
  AVAILABLE: 'success', LOCKED: 'warning', BOOKED: 'danger',
  ACTIVE: 'success', USED: 'info',
};


export default function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_MAP[status] || 'neutral';
  return <span className={`badge badge-${variant}`}>{status}</span>;
}
