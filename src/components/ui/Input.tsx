import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, ...props }: InputProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <input className="form-input" id={id} {...props} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, id, children, ...props }: SelectProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <select className="form-select" id={id} {...props}>
        {children}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
