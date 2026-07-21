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
  'aria-describedby': ariaDescribedBy,
  ...props
}: InputProps) {
  const inputId = id ?? props.name
  const errorId = inputId ? `${inputId}-error` : undefined
  const helperId = inputId ? `${inputId}-helper` : undefined

  const describedBy =
    [ariaDescribedBy, error ? errorId : undefined, !error && helperText ? helperId : undefined]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-[#1F1F1F]"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          'w-full rounded-xl border bg-[#FFFEFB] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#9A948A]',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-[#D8D3CA] focus:border-[#2F4F3E] focus:ring-4 focus:ring-[#2F4F3E]/10',
          className,
        ].join(' ')}
        {...props}
      />

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="mt-2 text-sm text-[#7A746B]">
          {helperText}
        </p>
      )}
    </div>
  )
}
