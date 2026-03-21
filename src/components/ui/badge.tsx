import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "destructive"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:     "bg-[var(--color-accent)] text-white",
    secondary:   "bg-[var(--color-card)] text-[var(--color-muted)]",
    outline:     "border border-[var(--color-divider)] text-[var(--color-muted)] bg-transparent",
    success:     "bg-[var(--color-green)]/20 text-[var(--color-green)] border border-[var(--color-green)]/30",
    destructive: "bg-[var(--color-red)]/20 text-[var(--color-red)] border border-[var(--color-red)]/30",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
