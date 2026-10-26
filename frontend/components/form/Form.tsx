"use client";

import { useEffect, type ReactNode } from "react";
import { FormProvider, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";

import { ApiError } from "@/lib/http-client";

type FormProps<T extends FieldValues> = {
    methods: UseFormReturn<T>;
    error?: Error | null;
    onSubmit: (data: T) => void;
    children: ReactNode;
    className?: string;
    isPending?: boolean;
};

export default function Form<T extends FieldValues>({
    methods,
    error,
    onSubmit,
    children,
    className,
    isPending,
}: FormProps<T>) {
    const { setError, handleSubmit } = methods;

    useEffect(() => {
        if (!(error instanceof ApiError)) {
            return;
        }

        Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field as Path<T>, {
                type: "server",
                message:
                    messages[0] === "auth.invalid_credentials"
                        ? "Incorrect username or password."
                        : messages[0],
            });
        });
    }, [error, setError]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} aria-busy={isPending} className={className}>
                {children}
            </form>
        </FormProvider>
    );
}
