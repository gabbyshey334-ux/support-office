import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-0.5 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700",
        admin: "bg-purple-100 text-purple-700",
        approved: "bg-green-100 text-green-700",
        pending: "bg-amber-100 text-amber-700",
        rejected: "bg-red-100 text-red-700",
        blue: "bg-blue-100 text-blue-700",
        outline: "border border-slate-200 text-slate-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
