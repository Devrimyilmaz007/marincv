import { HTMLAttributes, ReactNode } from "react";

/* ── Types ──────────────────────────────────────────────────────────────── */
type CardElevation = "flat" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: CardElevation;
  hover?: boolean;
  children: ReactNode;
}

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/* ── Style Maps ─────────────────────────────────────────────────────────── */
const elevationStyles: Record<CardElevation, string> = {
  flat: "border border-border",
  sm:   "shadow-sm border border-border/60",
  md:   "shadow-md border border-border/40",
  lg:   "shadow-lg border border-border/20",
};

/* ── Sub-components ─────────────────────────────────────────────────────── */
export function CardHeader({ className = "", children, ...props }: CardSectionProps) {
  return (
    <div className={`px-6 pt-6 pb-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }: CardSectionProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: CardSectionProps) {
  return (
    <div className={`px-6 pb-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ── Main Card ──────────────────────────────────────────────────────────── */
function Card({
  elevation = "sm",
  hover = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "bg-surface rounded-lg overflow-hidden",
        elevationStyles[elevation],
        hover
          ? "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
