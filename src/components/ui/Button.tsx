import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export default function Button({ children, variant = 'primary', size, loading, className = '', ...props }: Props) {
  const cls = ['btn', `btn-${variant}`, size && `btn-${size}`, className].filter(Boolean).join(' ');
  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}
