"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, Input, PasswordInput } from "@/components/form";

import { useLogin } from "../_hooks/useLogin";
import { useRegister } from "../_hooks/useRegister";
import { loginSchema, type LoginFormValues } from "../_schemas/login.schema";
import { Button } from "@/components/ui";
import { ArrowRight, Check, UserPlus } from "lucide-react";

export default function LoginForm({
    onAuthenticated,
    authenticated = false,
}: {
    onAuthenticated: () => void;
    authenticated?: boolean;
}) {
    const login = useLogin();
    const register = useRegister();

    const isPending = login.isPending || register.isPending || authenticated;

    const methods = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onLogin = (data: LoginFormValues) => {
        if (isPending) return;
        register.reset();
        login.reset();

        login.mutate(data, {
            onSuccess: onAuthenticated,
        });
    };

    const onRegister = (data: LoginFormValues) => {
        if (isPending) return;
        login.reset();
        register.reset();

        register.mutate(data, {
            onSuccess() {
                login.mutate(data, {
                    onSuccess: onAuthenticated,
                });
            },
        });
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
                <Button
                    type="submit"
                    loading={login.isPending}
                    disabled={isPending}
                    fullWidth
                    endIcon={authenticated ? <Check size={17} /> : <ArrowRight size={17} />}
                >
                    {authenticated ? "Signed in" : "Sign in"}
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={methods.handleSubmit(onRegister)}
                    loading={register.isPending}
                    disabled={isPending}
                    fullWidth
                    endIcon={<UserPlus size={17} />}
                >
                    Sign up
                </Button>
            </div>
        </Form>
    );
}
