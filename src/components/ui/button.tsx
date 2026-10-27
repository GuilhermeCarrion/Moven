"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--mv-brand)] text-white shadow-[0_10px_24px_-12px_var(--mv-brand)] hover:brightness-110",
        secondary:
          "border border-[var(--mv-line)] bg-[var(--mv-surface)] text-[var(--mv-text)] hover:bg-[var(--mv-brand-50)]",
        outline:
          "border border-[var(--mv-line)] bg-transparent text-[var(--mv-text)] hover:bg-[var(--mv-brand-50)]",
        ghost: "text-[var(--mv-text-soft)] hover:bg-[var(--mv-brand-50)] hover:text-[var(--mv-text)]",
        destructive: "bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-300",
        link: "text-[var(--mv-brand-700)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 text-[15px]",
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "size-9",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
