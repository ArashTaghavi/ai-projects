"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "@/lib/http-client";
import { loginSchema, type LoginFormValues } from "../_schemas/login.schema";
import { useLogin } from "../_hooks/useLogin";
import EyeIcon from "./EyeIcon";

export default function LoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const { mutate, isPending, error, reset } = useLogin();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        reset();

        mutate(data, {
            onSuccess: () => {
                router.push("/");
            },
            onError: (error) => {
                if (!(error instanceof ApiError)) {
                    return;
                }

                Object.entries(error.errors).forEach(([field, messages]) => {
                    if (field === "username" || field === "password") {
                        setError(field, {
                            type: "server",
                            message:
                                messages[0] === "auth.invalid_credentials"
                                    ? "Incorrect username or password."
                                    : messages[0],
                        });
                    }
                });
            },
        });
    };

    const errorMessage =
        error instanceof ApiError && Object.keys(error.errors).length > 0
            ? null
            : error
              ? "Unable to sign in. Please try again."
              : null;

    return (
        <form onSubmit={handleSubmit(onSubmit)} aria-busy={isPending} className="mt-9 space-y-6">
            <div className="space-y-2.5">
                <label htmlFor="username" className="block text-xs font-medium text-zinc-300">
                    Username
                </label>

                <input
                    id="username"
                    type="text"
                    dir="ltr"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    disabled={isPending}
                    placeholder="Username"
                    aria-invalid={!!errors.username}
                    {...register("username")}
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0b10] px-4 text-sm text-zinc-100 transition outline-none placeholder:text-zinc-600 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                />

                {errors.username && (
                    <p role="alert" className="text-xs text-red-300">
                        {errors.username.message}
                    </p>
                )}
            </div>

            <div className="space-y-2.5">
                <label htmlFor="password" className="block text-xs font-medium text-zinc-300">
                    Password
                </label>

                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        dir="ltr"
                        autoComplete="current-password"
                        disabled={isPending}
                        placeholder="Password"
                        aria-invalid={!!errors.password}
                        {...register("password")}
                        className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0b10] pr-12 pl-4 text-sm text-zinc-100 transition outline-none placeholder:text-zinc-600 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-50"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        aria-controls="password"
                        className="absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-lg text-zinc-600 transition hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                        <EyeIcon hidden={showPassword} />
                    </button>
                </div>

                {errors.password && (
                    <p role="alert" className="text-xs text-red-300">
                        {errors.password.message}
                    </p>
                )}
            </div>

            {errorMessage && (
                <p
                    role="alert"
                    className="rounded-xl border border-red-400/15 bg-red-400/5 px-3 py-2 text-xs leading-6 text-red-300"
                >
                    {errorMessage}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-violet-300/20 bg-violet-600 text-sm font-medium text-white shadow-[0_4px_24px_-8px_#7c3aed80] transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-wait disabled:opacity-60"
            >
                {isPending ? (
                    <>
                        <span
                            aria-hidden="true"
                            className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
                        />
                        Signing in…
                    </>
                ) : (
                    <>
                        Sign in
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 12h16m-6-6 6 6-6 6" />
                        </svg>
                    </>
                )}
            </button>
        </form>
    );
}
