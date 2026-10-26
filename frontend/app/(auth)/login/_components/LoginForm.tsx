"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, Input, PasswordInput } from "@/components/form";

import { useLogin } from "../_hooks/useLogin";
import { useRegister } from "../_hooks/useRegister";
import { loginSchema, type LoginFormValues } from "../_schemas/login.schema";

export default function LoginForm() {
    const router = useRouter();

    const login = useLogin();
    const register = useRegister();

    const isPending = login.isPending || register.isPending;

    const methods = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onLogin = (data: LoginFormValues) => {
        register.reset();
        login.reset();

        login.mutate(data, {
            onSuccess: () => {
                router.push("/");
            },
        });
    };

    const onRegister = (data: LoginFormValues) => {
        login.reset();
        register.reset();

        register.mutate(data);
    };

    return (
        <Form
            methods={methods}
            error={login.error || register.error}
            onSubmit={onLogin}
            isPending={isPending}
            className="mt-9 space-y-6"
        >
            <Input<LoginFormValues>
                name="username"
                label="Username"
                placeholder="Username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                dir="ltr"
                disabled={isPending}
            />

            <PasswordInput<LoginFormValues>
                name="password"
                label="Password"
                placeholder="Password"
                disabled={isPending}
            />

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-violet-300/20 bg-violet-600 text-sm font-medium text-white disabled:opacity-60"
                >
                    {login.isPending ? "Signing in..." : "Sign in"}
                </button>

                <button
                    type="button"
                    onClick={methods.handleSubmit(onRegister)}
                    disabled={isPending}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-violet-300/20 bg-violet-600 text-sm font-medium text-white disabled:opacity-60"
                >
                    {register.isPending ? "Signing up..." : "Sign up"}
                </button>
            </div>
        </Form>
    );
}
