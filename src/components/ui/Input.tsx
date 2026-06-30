import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={[
          'w-full rounded-xl border bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500',
          error
            ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20',
          className,
        ].join(' ')}
        {...props}
      />

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {!error && helperText && (
        <p className="mt-2 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  )
}