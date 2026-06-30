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
          className="mb-2 block text-sm font-medium text-[#1F1F1F]"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={[
          'w-full rounded-xl border bg-[#FFFEFB] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#9A948A]',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
            : 'border-[#D8D3CA] focus:border-[#2F4F3E] focus:ring-4 focus:ring-[#2F4F3E]/10',
          className,
        ].join(' ')}
        {...props}
      />

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {!error && helperText && (
        <p className="mt-2 text-sm text-[#7A746B]">{helperText}</p>
      )}
    </div>
  )
}