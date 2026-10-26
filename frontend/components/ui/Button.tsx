"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    loading?: boolean;
    fullWidth?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
    primary: "border-violet-300/20 bg-violet-600 text-white hover:bg-violet-500",
    secondary: "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10",
    danger: "border-red-400/20 bg-red-600 text-white hover:bg-red-500",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            type = "button",
            variant = "primary",
            loading = false,
            disabled = false,
            fullWidth = false,
            startIcon,
            endIcon,
            className = "",
            ...props
        },
        ref,
    ) => {
        return (
            <button
                {...props}
                ref={ref}
                type={type}
                disabled={disabled || loading}
                aria-busy={loading}
                className={[
                    "inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border px-5 text-sm font-medium transition",
                    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400",
                    "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                    variants[variant],
                    fullWidth && "w-full",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {loading ? (
                    <LoaderCircle
                        size={18}
                        className="animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                    />
                ) : (
                    startIcon
                )}

                {children}

                {!loading && endIcon}
            </button>
        );
    },
);

Button.displayName = "Button";

export default Button;
