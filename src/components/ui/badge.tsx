import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "src/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Enhanced modern badge variants inspired by the provided design
        modern_success: 
          "border-transparent bg-emerald-100 text-emerald-700 shadow-sm hover:shadow-md px-3 py-1.5 rounded-lg font-medium",
        modern_warning: 
          "border-transparent bg-amber-100 text-amber-700 shadow-sm hover:shadow-md px-3 py-1.5 rounded-lg font-medium",
        modern_info: 
          "border-transparent bg-blue-100 text-blue-700 shadow-sm hover:shadow-md px-3 py-1.5 rounded-lg font-medium",
        modern_danger: 
          "border-transparent bg-red-100 text-red-700 shadow-sm hover:shadow-md px-3 py-1.5 rounded-lg font-medium",
        modern_neutral: 
          "border-transparent bg-gray-100 text-gray-700 shadow-sm hover:shadow-md px-3 py-1.5 rounded-lg font-medium",
        modern_teal: 
          "border-transparent bg-teal-100 text-teal-700 shadow-sm hover:shadow-md px-3 py-1.5 rounded-lg font-medium",
        modern_purple: 
          "border-transparent bg-purple-100 text-purple-700 shadow-sm hover:shadow-md px-3 py-1.5 rounded-lg font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
