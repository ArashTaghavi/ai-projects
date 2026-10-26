"use client";

import { useId, type InputHTMLAttributes } from "react";
import { useController, useFormContext, type FieldPath, type FieldValues } from "react-hook-form";

type InputProps<T extends FieldValues> = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "name" | "defaultValue"
> & {
    name: FieldPath<T>;
    label: string;
};

export default function Input<T extends FieldValues>({
    name,
    label,
    id,
    className = "",
    ...props
}: InputProps<T>) {
    const { control } = useFormContext<T>();

    const {
        field,
        fieldState: { error },
    } = useController({ name, control });

    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className="space-y-2.5">
            <label htmlFor={inputId} className="block text-xs font-medium text-zinc-300">
                {label}
                {error && (
                    <span id={errorId} role="alert" className="mx-2 text-xs text-red-300">
                        {error.message}
                    </span>
                )}
            </label>

            <input
                {...props}
                {...field}
                id={inputId}
                value={field.value ?? ""}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={[
                    "h-12 w-full rounded-xl border bg-[#0b0b10] px-4 text-sm text-zinc-100 transition outline-none placeholder:text-zinc-600 disabled:opacity-50",
                    error
                        ? "border-red-400/60 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                        : "border-white/10 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10",
                    className,
                ].join(" ")}
            />
        </div>
    );
}
