import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"

    const variants = {
      default:     "bg-[var(--color-accent)] text-white hover:opacity-90",
      outline:     "border border-[var(--color-divider)] text-[var(--color-white)] bg-transparent hover:bg-[var(--color-panel)]",
      ghost:       "text-[var(--color-muted)] bg-transparent hover:bg-[var(--color-panel)] hover:text-[var(--color-white)]",
      destructive: "bg-[var(--color-red)] text-white hover:opacity-90",
    }

    const sizes = {
      sm:  "text-xs px-3 py-1.5",
      md:  "text-sm px-4 py-2",
      lg:  "text-base px-6 py-3",
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
