import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full rounded-lg border border-[var(--color-divider)]",
          "bg-[var(--color-panel)] px-3 py-2",
          "text-sm text-[var(--color-white)] placeholder:text-[var(--color-muted)]",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-vertical min-h-[80px]",
          "font-[var(--font-body)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
