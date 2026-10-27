"use client";

import { useState } from "react";
import {
    Activity,
    ArrowUpRight,
    CheckCheck,
    Clock3,
    Cpu,
    Database,
    HardDrive,
    LayoutDashboard,
    MemoryStick,
    Rocket,
    Server,
    ShieldCheck,
    TriangleAlert,
    UsersRound,
} from "lucide-react";
import {
    AreaChart,
    Button,
    Panel,
    ResourceMeter,
    StatCard,
    StatusBadge,
    Table,
    type TableColumn,
} from "@/components/ui";
import AdminPage from "./layout/AdminPage";
import { activity, jobs, services, traffic, type TrafficRange } from "../_data/overview";
import { useServerMetrics } from "../_hooks/useServerMetrics";
import { formatUptime } from "../_schemas/server-metrics";

const serviceColumns: TableColumn<(typeof services)[number]>[] = [
    {
        id: "name",
        header: "Service",
        rowHeader: true,
        cell: (service) => (
            <div>
                <p className="text-xs">{service.name}</p>
                <p className="mt-1 text-[10px] font-normal text-zinc-500">{service.detail}</p>
            </div>
        ),
    },
    {
        id: "status",
        header: "Status",
        cell: (service) => <StatusBadge tone={service.tone}>{service.status}</StatusBadge>,
    },
    {
        id: "latency",
        header: "Latency",
        cellClassName: "font-mono text-xs",
        cell: (service) => service.latency,
    },
    {
        id: "uptime",
        header: "Uptime",
        cellClassName: "font-mono text-xs",
        cell: (service) => service.uptime,
    },
];

const eventIcons = { backup: Database, warning: TriangleAlert, deploy: Rocket, users: UsersRound };

export default function OverviewDashboard() {
    const [range, setRange] = useState<TrafficRange>("24h");
    const chart = traffic[range];
    const { metrics, receivedAt, status, isConnected, reconnect, error, invalidPayload } =
        useServerMetrics();
    const completeResources =
        metrics?.cpu_usage !== undefined &&
        metrics?.memory_usage !== undefined &&
        metrics?.disk_usage !== undefined &&
        metrics?.uptime_seconds !== undefined;
    const resourceTone = metrics && isConnected ? "success" : metrics ? "warning" : "neutral";
    const resourceStatus = metrics
        ? isConnected
            ? completeResources
                ? "Live resources"
                : "Live + sample"
            : "Last received"
        : "Demo resources";

    return (
        <AdminPage
            title="Overview"
            description="A quick look at your infrastructure and workspace."
            icon={<LayoutDashboard className="size-5" />}
            actions={
                <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-500">Sample snapshot · 14:00 UTC</span>
                    <StatusBadge>Demo data</StatusBadge>
                </div>
            }
        >
            <div className="space-y-5 p-4 sm:p-5 lg:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
                    <div className="space-y-1" role="status">
                        <p className="text-xs text-zinc-300">
                            {isConnected
                                ? metrics
                                    ? "Receiving server metrics"
                                    : "Socket connected. Waiting for server.metrics..."
                                : status === "reconnecting"
                                  ? "Reconnecting to the monitoring socket..."
                                  : status === "closed" || status === "error"
                                    ? "Monitoring socket is offline"
                                    : "Connecting to the monitoring socket..."}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                            {receivedAt
                                ? `Last received: ${new Date(receivedAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC. Metrics not yet received and other panels use demo data.`
                                : "Sample data stays visible until the backend sends the first valid metrics event."}
                        </p>
                        {invalidPayload && (
                            <p className="text-[11px] text-amber-300">
                                Invalid server.metrics payload ignored. Waiting for valid data.
                            </p>
                        )}
                        {error && <p className="text-[11px] text-amber-300">{error}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge tone={isConnected ? "success" : "neutral"}>
                            {isConnected ? "Socket connected" : status}
                        </StatusBadge>
                        {(status === "closed" || status === "error") && (
                            <Button size="sm" variant="secondary" onClick={reconnect}>
                                Reconnect
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3">
                    <p className="flex items-center gap-2 text-xs text-zinc-300">
                        <span className="size-1.5 rounded-full bg-amber-300" aria-hidden="true" />
                        Infrastructure operational · AI inference needs attention
                    </p>
                    <span className="text-[10px] text-amber-300/80">1 service degraded</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Total requests · 24h"
                        value="284,902"
                        icon={<Activity />}
                        trend={{ label: "+12.8%", positive: true }}
                        detail="vs. previous day"
                    />
                    <StatCard
                        label="Average response · 24h"
                        value={
                            <>
                                142 <span className="text-sm font-normal text-zinc-500">ms</span>
                            </>
                        }
                        icon={<Clock3 />}
                        trend={{ label: "18 ms faster", positive: true }}
                        detail="vs. previous day"
                    />
                    <StatCard
                        label="Active users · 24h"
                        value="1,284"
                        icon={<UsersRound />}
                        trend={{ label: "+8.2%", positive: true }}
                        detail="vs. previous day"
                    />
                    <StatCard
                        label="Failed requests · 24h"
                        value="0.24%"
                        icon={<ShieldCheck />}
                        trend={{ label: "+0.06 pp", positive: false }}
                        detail="vs. previous day"
                    />
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
                    <Panel
                        title="Request traffic"
                        description="Sample request rate over time"
                        action={
                            <div
                                role="group"
                                aria-label="Traffic time range"
                                className="flex gap-1 rounded-lg border border-white/10 p-1"
                            >
                                {(Object.keys(traffic) as TrafficRange[]).map((period) => (
                                    <button
                                        key={period}
                                        type="button"
                                        aria-pressed={range === period}
                                        onClick={() => setRange(period)}
                                        className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] transition focus-visible:outline-2 focus-visible:outline-violet-400 ${range === period ? "bg-violet-400/15 text-violet-200" : "text-zinc-500 hover:text-zinc-200"}`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        }
                        contentClassName="p-4 sm:p-5"
                    >
                        <div className="mb-6 flex items-end justify-between gap-3">
                            <div>
                                <p className="text-2xl font-semibold tracking-tight tabular-nums">
                                    {chart.requests}
                                </p>
                                <p className="mt-1 text-[11px] text-zinc-500">
                                    requests in selected period
                                </p>
                            </div>
                            <span className="flex items-center gap-1 text-[11px] text-violet-300">
                                <ArrowUpRight size={13} />
                                {chart.average}
                            </span>
                        </div>
                        <AreaChart
                            values={chart.values}
                            labels={chart.labels}
                            label={`Sample requests per minute over ${range}`}
                        />
                    </Panel>

                    <Panel
                        title="Server resources"
                        description={
                            metrics
                                ? (metrics.hostname ?? "Connected server")
                                : "production-01 · Frankfurt (sample)"
                        }
                        action={
                            <div className="flex items-center gap-2">
                                <Server size={15} className="text-zinc-500" aria-hidden="true" />
                                <StatusBadge tone={resourceTone}>{resourceStatus}</StatusBadge>
                            </div>
                        }
                        contentClassName="space-y-6 p-4 sm:p-5"
                    >
                        <ResourceMeter
                            label="CPU usage"
                            value={metrics?.cpu_usage ?? 34}
                            detail={
                                metrics?.cpu_usage !== undefined
                                    ? "Server-reported CPU utilization"
                                    : "Sample CPU utilization"
                            }
                            icon={<Cpu />}
                        />
                        <ResourceMeter
                            label="Memory"
                            value={metrics?.memory_usage ?? 62}
                            detail={
                                metrics?.memory_usage !== undefined
                                    ? "Server-reported memory utilization"
                                    : "Sample memory utilization"
                            }
                            icon={<MemoryStick />}
                        />
                        <ResourceMeter
                            label="Disk storage"
                            value={metrics?.disk_usage ?? 78}
                            detail={
                                metrics?.disk_usage !== undefined
                                    ? "Server-reported disk utilization"
                                    : "Sample disk utilization"
                            }
                            icon={<HardDrive />}
                        />
                        <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px]">
                            <span className="text-zinc-500">Server uptime</span>
                            <span className="font-mono text-zinc-300">
                                {metrics?.uptime_seconds !== undefined
                                    ? formatUptime(metrics.uptime_seconds)
                                    : "24d 16h 32m (sample)"}
                            </span>
                        </div>
                    </Panel>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
                    <Panel
                        title="Service health"
                        description="Availability and response times"
                        action={<StatusBadge tone="success">4 of 5 healthy</StatusBadge>}
                    >
                        <Table
                            data={services}
                            columns={serviceColumns}
                            getRowKey={(service) => service.id}
                            caption="Sample service status, latency and uptime"
                            tableClassName="min-w-[480px]"
                        />
                    </Panel>
                    <Panel
                        title="Background jobs"
                        description="Sample worker queue"
                        action={<StatusBadge tone="neutral">12 active</StatusBadge>}
                        contentClassName="space-y-5 p-4 sm:p-5"
                    >
                        {jobs.map((job) => (
                            <div key={job.label}>
                                <div className="mb-2 flex justify-between gap-2 text-xs">
                                    <span className="text-zinc-300">{job.label}</span>
                                    <span className="text-zinc-400">
                                        <span className="font-mono text-zinc-200">{job.value}</span>{" "}
                                        {job.detail}
                                    </span>
                                </div>
                                <div
                                    className="h-1 overflow-hidden rounded-full bg-white/[0.06]"
                                    aria-hidden="true"
                                >
                                    <div
                                        className="h-full rounded-full bg-violet-400/60"
                                        style={{ width: `${job.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 border-t border-white/[0.06] pt-4 text-[11px] text-emerald-300">
                            <CheckCheck size={14} aria-hidden="true" />
                            1,842 jobs completed today
                        </div>
                    </Panel>
                </div>

                <Panel
                    title="Recent activity"
                    description="Infrastructure and workspace events"
                    action={<span className="text-[10px] text-zinc-500">Sample events</span>}
                >
                    <ul className="grid divide-y divide-white/[0.06] lg:grid-cols-2 lg:divide-y-0">
                        {activity.map((event) => {
                            const Icon = eventIcons[event.type];
                            return (
                                <li key={event.id} className="flex items-start gap-3 p-4 sm:p-5">
                                    <span
                                        className={`mt-0.5 rounded-lg border p-2 ${event.type === "warning" ? "border-amber-400/15 bg-amber-400/5 text-amber-300" : "border-white/10 bg-white/5 text-zinc-400"}`}
                                    >
                                        <Icon size={14} aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-xs font-medium text-zinc-200">
                                                {event.title}
                                            </p>
                                            <span className="text-[10px] text-zinc-500">
                                                {event.time}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                                            {event.detail}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </Panel>
            </div>
        </AdminPage>
    );
}
