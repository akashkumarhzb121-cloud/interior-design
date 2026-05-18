import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(
  ({ className, type, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            'flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

const Textarea = forwardRef(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          className={cn(
            'flex min-h-[120px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

const Select = forwardRef(
  ({ className, label, error, id, options = [], ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={cn(
            'flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value ?? option.label} value={option.value ?? option.label}>
              {option.label ?? option.value}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Input, Textarea, Select, Textarea as TextArea }
