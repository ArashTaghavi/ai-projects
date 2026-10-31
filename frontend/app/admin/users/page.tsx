"use client";

import { useState } from "react";
import Image from "next/image";
import { RefreshCw, UsersRound } from "lucide-react";

import { ActionButton, DeleteAction, Button, Table, type TableColumn } from "@/components/ui";
import type { UserResponse } from "@/services/admin/user.service";

import AdminPage from "../_components/layout/AdminPage";

import { useUsers, useDeleteUser } from "./_hooks";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
});

function UserAvatar({ user }: { user: UserResponse }) {
    const [failedSource, setFailedSource] = useState<string | null>(null);
    const source = user.avatar?.trim();
    const validSource =
        source &&
        ((source.startsWith("/") && !source.startsWith("//")) || /^https?:\/\//i.test(source));

    return (
        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ui-border bg-white/5 text-sm font-medium text-violet-200">
            {validSource && failedSource !== source ? (
                <Image
                    src={source}
                    alt={`${user.username}'s avatar`}
                    width={32}
                    height={32}
                    unoptimized
                    className="size-full object-cover"
                    onError={() => setFailedSource(source)}
                />
            ) : (
                <span aria-label={`${user.username}'s initials`}>
                    {user.username.slice(0, 2).toUpperCase()}
                </span>
            )}
        </span>
    );
}

const columns: TableColumn<UserResponse>[] = [
    {
        id: "id",
        header: "ID",
        headerClassName: "w-24",
        cellClassName: "font-mono text-xs text-ui-secondary",
        cell: (user) => `#${user.id}`,
    },
    {
        id: "avatar",
        header: "Avatar",
        headerClassName: "w-24",
        cell: (user) => <UserAvatar user={user} />,
    },
    {
        id: "username",
        header: "Username",
        rowHeader: true,
        cellClassName: "break-all",
        cell: (user) => user.username,
    },
    {
        id: "first_name",
        header: "First name",
        cell: (user) => user.first_name,
    },
    {
        id: "last_name",
        header: "Last name",
        cell: (user) => user.last_name,
    },
    {
        id: "email",
        header: "Email",
        cell: (user) =>
            user.email?.trim() ? (
                <a
                    href={`mailto:${user.email}`}
                    className="break-all transition hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-violet-400"
                >
                    {user.email}
                </a>
            ) : null,
    },
    {
        id: "created_at",
        header: "Created at (UTC)",
        cellClassName: "whitespace-nowrap tabular-nums",
        cell: (user) => {
            if (!user.created_at?.trim()) return null;
            const date = new Date(user.created_at);
            return Number.isNaN(date.getTime()) ? null : (
                <time dateTime={date.toISOString()}>{dateFormatter.format(date)}</time>
            );
        },
    },
];

export default function Users() {
    const { data, isPending, isError, isFetching, refetch } = useUsers();
    const deleteUser = useDeleteUser();
    const tableColumns: TableColumn<UserResponse>[] = [
        ...columns,
        {
            id: "actions",
            header: "Actions",
            headerClassName: "w-24",
            cell: (user) => (
                <ActionButton mode="dropdown">
                    <DeleteAction
                        tooltip={`Delete`}
                        loading={deleteUser.isPending && deleteUser.variables === user.id}
                        disabled={deleteUser.isPending}
                        message={`Delete user "${user.username}"? This cannot be undone.`}
                        onConfirm={() => deleteUser.mutateAsync(user.id)}
                    />
                    <DeleteAction
                        tooltip={`Delete`}
                        loading={deleteUser.isPending && deleteUser.variables === user.id}
                        disabled={deleteUser.isPending}
                        message={`Delete user "${user.username}"? This cannot be undone.`}
                        onConfirm={() => deleteUser.mutateAsync(user.id)}
                    />
                    <DeleteAction
                        tooltip={`Delete`}
                        loading={deleteUser.isPending && deleteUser.variables === user.id}
                        disabled={deleteUser.isPending}
                        message={`Delete user "${user.username}"? This cannot be undone.`}
                        onConfirm={() => deleteUser.mutateAsync(user.id)}
                    />
                </ActionButton>
            ),
        },
    ];
    const users = data?.data ?? [];

    return (
        <AdminPage
            title="Users"
            description="Browse your workspace members."
            icon={<UsersRound className="size-5" />}
            actions={
                <Button
                    variant="secondary"
                    onClick={() => void refetch()}
                    loading={isFetching}
                    startIcon={<RefreshCw className="size-4" aria-hidden="true" />}
                >
                    Refresh
                </Button>
            }
        >
            {deleteUser.isError && (
                <p
                    role="alert"
                    className="border-b border-red-400/15 bg-red-400/5 px-6 py-4 text-sm text-red-300"
                >
                    {deleteUser.error.message || "Failed to delete user. Please try again."}
                </p>
            )}
            <Table
                data={users}
                columns={tableColumns}
                getRowKey={(user) => user.id}
                caption="Workspace users with ID, avatar, username, first name, last name, email and creation date"
                loading={isPending}
                tableClassName="min-w-[1000px]"
                error={
                    isError ? (
                        <div className="space-y-3">
                            <p className="text-sm text-red-300">
                                Failed to load users. Please try again.
                            </p>
                            <Button
                                variant="secondary"
                                loading={isFetching}
                                onClick={() => void refetch()}
                            >
                                Try again
                            </Button>
                        </div>
                    ) : undefined
                }
                emptyState={
                    <>
                        <UsersRound
                            className="mx-auto mb-3 size-8 text-ui-muted"
                            aria-hidden="true"
                        />
                        <p className="font-medium text-zinc-200">No users yet</p>
                        <p className="mt-1 text-ui-secondary">
                            Users will appear here once they register.
                        </p>
                    </>
                }
            />
        </AdminPage>
    );
}
