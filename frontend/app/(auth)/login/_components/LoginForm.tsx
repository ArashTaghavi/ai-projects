"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, Input, PasswordInput } from "@/components/form";

import { useLogin } from "../_hooks/useLogin";
import { useRegister } from "../_hooks/useRegister";
import { loginSchema, type LoginFormValues } from "../_schemas/login.schema";
import { Button } from "@/components/ui";
import { ArrowRight, UserPlus } from "lucide-react";

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

        register.mutate(data, {
            onSuccess() {
                login.mutate(data, {
                    onSuccess: () => {
                        router.push("/");
                    },
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
                    endIcon={<ArrowRight size={17} />}
                >
                    Sign in
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
