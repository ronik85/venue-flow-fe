import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props { page: number; totalPages: number; onPageChange: (page: number) => void; }

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button className="pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={16} /></button>
      {start > 1 && <><button className="pagination-btn" onClick={() => onPageChange(1)}>1</button><span className="pagination-info">…</span></>}
      {pages.map((p) => (
        <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      {end < totalPages && <><span className="pagination-info">…</span><button className="pagination-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button></>}
      <button className="pagination-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={16} /></button>
    </div>
  );
}
