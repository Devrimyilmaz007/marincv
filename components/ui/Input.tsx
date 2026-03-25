import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

/* ── Component ──────────────────────────────────────────────────────────── */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefixIcon,
      suffixIcon,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-base"
          >
            {label}
            {props.required && (
              <span className="text-accent ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {prefixIcon && (
            <span className="absolute left-3 text-text-muted pointer-events-none flex items-center">
              {prefixIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                  ? `${inputId}-hint`
                  : undefined
            }
            className={[
              "w-full rounded-md border bg-surface text-text-base text-sm",
              "placeholder:text-text-muted",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
              error
                ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                : "border-border hover:border-primary/40",
              prefixIcon ? "pl-10" : "pl-3.5",
              suffixIcon ? "pr-10" : "pr-3.5",
              "py-2.5",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {suffixIcon && (
            <span className="absolute right-3 text-text-muted pointer-events-none flex items-center">
              {suffixIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-red-500 flex items-center gap-1"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
